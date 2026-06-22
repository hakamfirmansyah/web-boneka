const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'cozy_stitches_secret_key_2026';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Pastikan folder upload ada
const uploadDir = path.join(__dirname, 'assets', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi Multer untuk upload gambar
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'img-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// ─── Middleware: Verifikasi JWT ───────────────────────────────────────────────
function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid or expired token' });
        req.user = decoded;
        next();
    });
}

// ─── Middleware: Hanya Admin ──────────────────────────────────────────────────
function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access only' });
    next();
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username dan password wajib diisi' });
    if (password.length < 6) return res.status(400).json({ error: 'Password minimal 6 karakter' });

    try {
        const hashed = await bcrypt.hash(password, 10);
        const { error } = await supabase
            .from('users')
            .insert({ username, password: hashed, role: 'consumer' });

        if (error) {
            if (error.code === '23505') return res.status(400).json({ error: 'Username sudah digunakan' });
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Registrasi berhasil! Silakan login.' });
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username dan password wajib diisi' });

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !user) return res.status(401).json({ error: 'Username atau password salah' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Username atau password salah' });

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            SECRET_KEY, { expiresIn: '24h' }
        );
        res.json({ message: 'Login berhasil', token, username: user.username, role: user.role });
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/profile', verifyToken, (req, res) => {
    res.json({ id: req.user.id, username: req.user.username, role: req.user.role });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTS ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET semua produk (publik)
app.get('/api/products', async (req, res) => {
    try {
        const { category } = req.query;
        let query = supabase
            .from('products')
            .select('*')
            .eq('active', 1)
            .order('created_at', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query;
        if (error) return res.status(500).json({ error: 'Database error' });

        const products = data.map(r => ({
            ...r,
            gallery_images: r.gallery_images || [],
            includes: r.includes || []
        }));
        res.json(products);
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

// GET semua produk (admin: termasuk yang nonaktif)
app.get('/api/admin/products', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ error: 'Database error' });

        const products = data.map(r => ({
            ...r,
            gallery_images: r.gallery_images || [],
            includes: r.includes || []
        }));
        res.json(products);
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

// GET satu produk by ID (publik)
app.get('/api/products/:id', async (req, res) => {
    try {
        const { data: row, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !row) return res.status(404).json({ error: 'Produk tidak ditemukan' });
        res.json({
            ...row,
            gallery_images: row.gallery_images || [],
            includes: row.includes || []
        });
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

// POST tambah produk baru (admin)
app.post('/api/products', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { name, category, description, price, stock, image, gallery_images, includes, active } = req.body;
        if (!name || !category) return res.status(400).json({ error: 'Nama dan kategori wajib diisi' });

        const { data, error } = await supabase
            .from('products')
            .insert({
                name,
                category,
                description: description || '',
                price: price || 0,
                stock: stock || 0,
                image: image || '',
                gallery_images: gallery_images || [],
                includes: includes || [],
                active: active !== undefined ? active : 1
            })
            .select('id')
            .single();

        if (error) return res.status(500).json({ error: 'Database error' });
        res.status(201).json({ message: 'Produk berhasil ditambahkan', id: data.id });
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

// PUT edit produk (admin)
app.put('/api/products/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { name, category, description, price, stock, image, gallery_images, includes, active } = req.body;
        if (!name || !category) return res.status(400).json({ error: 'Nama dan kategori wajib diisi' });

        const { data, error } = await supabase
            .from('products')
            .update({
                name,
                category,
                description: description || '',
                price: price || 0,
                stock: stock || 0,
                image: image || '',
                gallery_images: gallery_images || [],
                includes: includes || [],
                active: active !== undefined ? active : 1
            })
            .eq('id', req.params.id)
            .select('id');

        if (error) return res.status(500).json({ error: 'Database error' });
        if (!data || data.length === 0) return res.status(404).json({ error: 'Produk tidak ditemukan' });
        res.json({ message: 'Produk berhasil diupdate' });
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE hapus produk (admin)
app.delete('/api/products/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .delete()
            .eq('id', req.params.id)
            .select('id');

        if (error) return res.status(500).json({ error: 'Database error' });
        if (!data || data.length === 0) return res.status(404).json({ error: 'Produk tidak ditemukan' });
        res.json({ message: 'Produk berhasil dihapus' });
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// UPLOAD ROUTE
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/upload', verifyToken, requireAdmin, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Tidak ada file yang diupload' });
    }
    const imagePath = 'assets/uploads/' + req.file.filename;
    res.json({ imagePath });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ORDERS & PAYMENT ROUTES (Fase 3 & Fase 4)
// ═══════════════════════════════════════════════════════════════════════════════

// POST buat order baru (checkout)
app.post('/api/orders', verifyToken, async (req, res) => {
    try {
        const { customerName, customerPhone, customerAddress, customerEmail, notes, items, paymentMethod } = req.body;
        if (!customerName || !customerPhone || !customerAddress || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Data penerima dan item belanja wajib diisi' });
        }

        // Ambil semua produk untuk validasi stok dan harga
        const productIds = items.map(item => item.productId);
        const { data: products, error: prodErr } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds);

        if (prodErr) return res.status(500).json({ error: 'Database error saat mengambil produk' });

        const productMap = {};
        products.forEach(p => { productMap[p.id] = p; });

        // Hitung total dan validasi stok
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const product = productMap[item.productId];
            if (!product) {
                return res.status(400).json({ error: `Produk dengan ID ${item.productId} tidak ditemukan` });
            }
            if (product.active === 0) {
                return res.status(400).json({ error: `Produk ${product.name} sedang tidak aktif` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Stok produk ${product.name} tidak mencukupi (sisa: ${product.stock})` });
            }
            const subtotal = product.price * item.quantity;
            totalAmount += subtotal;
            orderItems.push({
                productId: product.id,
                productName: product.name,
                productImage: product.image,
                price: product.price,
                quantity: item.quantity,
                subtotal: subtotal
            });
        }

        // Insert order
        const { data: orderData, error: orderErr } = await supabase
            .from('orders')
            .insert({
                user_id: req.user.id,
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_address: customerAddress,
                customer_email: customerEmail || '',
                notes: notes || '',
                total_amount: totalAmount,
                payment_method: paymentMethod || 'bank_transfer',
                status: 'pending'
            })
            .select('id')
            .single();

        if (orderErr) return res.status(500).json({ error: 'Database error saat membuat order' });
        const orderId = orderData.id;

        // Insert detail items
        const orderItemsInsert = orderItems.map(item => ({
            order_id: orderId,
            product_id: item.productId,
            product_name: item.productName,
            product_image: item.productImage,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.subtotal
        }));

        const { error: itemsErr } = await supabase
            .from('order_items')
            .insert(orderItemsInsert);

        if (itemsErr) return res.status(500).json({ error: 'Database error saat membuat detail order' });

        // Update stok produk
        for (const item of orderItems) {
            const { error: stockErr } = await supabase
                .from('products')
                .update({ stock: productMap[item.productId].stock - item.quantity })
                .eq('id', item.productId);

            if (stockErr) return res.status(500).json({ error: 'Database error saat memperbarui stok' });
        }

        res.status(201).json({ message: 'Order berhasil dibuat!', orderId, totalAmount });
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

// GET riwayat order milik konsumen sendiri
app.get('/api/orders', verifyToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ error: 'Database error' });
        res.json(data);
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

// GET detail order milik konsumen sendiri / admin
app.get('/api/orders/:id', verifyToken, async (req, res) => {
    try {
        const { data: order, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !order) return res.status(404).json({ error: 'Order tidak ditemukan' });

        // Pastikan order milik pengakses atau pengakses adalah admin
        if (order.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Akses ditolak' });
        }

        // Ambil item order
        const { data: items, error: itemsErr } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', req.params.id);

        if (itemsErr) return res.status(500).json({ error: 'Database error saat mengambil item' });
        res.json({ ...order, items });
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

// POST konfirmasi pembayaran (upload bukti transfer)
app.post('/api/orders/:id/payment', verifyToken, upload.single('payment_proof'), async (req, res) => {
    try {
        const { bankName, accountName } = req.body;
        const orderId = req.params.id;

        if (!req.file) {
            return res.status(400).json({ error: 'Bukti transfer wajib diupload' });
        }
        if (!bankName || !accountName) {
            return res.status(400).json({ error: 'Nama Bank dan Nama Rekening wajib diisi' });
        }

        const proofPath = 'assets/uploads/' + req.file.filename;

        const { data: order, error: orderErr } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderErr || !order) return res.status(404).json({ error: 'Order tidak ditemukan' });

        // Pastikan order milik pengakses
        if (order.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Akses ditolak' });
        }

        const { error: updateErr } = await supabase
            .from('orders')
            .update({
                payment_proof: proofPath,
                bank_name: bankName,
                account_name: accountName,
                status: 'paid'
            })
            .eq('id', orderId);

        if (updateErr) return res.status(500).json({ error: 'Database error saat memperbarui status pembayaran' });
        res.json({ message: 'Bukti transfer berhasil dikirim. Menunggu verifikasi admin.', proofPath });
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET semua order untuk panel admin
app.get('/api/admin/orders', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ error: 'Database error' });
        res.json(data);
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

// PUT update status order & konfirmasi (admin)
app.put('/api/admin/orders/:id/status', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;
        if (!status) return res.status(400).json({ error: 'Status wajib diisi' });

        // Jika status dirubah ke 'cancelled', kita harus mengembalikan stok produk yang dibeli
        if (status === 'cancelled') {
            const { data: orderCheck, error: checkErr } = await supabase
                .from('orders')
                .select('status')
                .eq('id', orderId)
                .single();

            if (checkErr || !orderCheck) return res.status(404).json({ error: 'Order tidak ditemukan' });

            // Jika status sebelumnya sudah cancelled, jangan kembalikan stok lagi
            if (orderCheck.status === 'cancelled') {
                return res.status(400).json({ error: 'Order ini sudah dibatalkan sebelumnya' });
            }

            // Ambil item order
            const { data: items, error: itemsErr } = await supabase
                .from('order_items')
                .select('product_id, quantity')
                .eq('order_id', orderId);

            if (itemsErr) return res.status(500).json({ error: 'Database error' });

            // Update status order
            const updateData = { status };
            const { error: updateErr } = await supabase
                .from('orders')
                .update(updateData)
                .eq('id', orderId);

            if (updateErr) return res.status(500).json({ error: 'Database error saat mengupdate status' });

            // Kembalikan stok
            for (const item of items) {
                // Ambil stok saat ini
                const { data: product } = await supabase
                    .from('products')
                    .select('stock')
                    .eq('id', item.product_id)
                    .single();

                if (product) {
                    await supabase
                        .from('products')
                        .update({ stock: product.stock + item.quantity })
                        .eq('id', item.product_id);
                }
            }

            res.json({ message: 'Order berhasil dibatalkan dan stok dikembalikan.' });
        } else {
            const updateData = { status };
            if (status === 'confirmed') {
                updateData.confirmed_at = new Date().toISOString();
            }

            const { data, error } = await supabase
                .from('orders')
                .update(updateData)
                .eq('id', orderId)
                .select('id');

            if (error) return res.status(500).json({ error: 'Database error' });
            if (!data || data.length === 0) return res.status(404).json({ error: 'Order tidak ditemukan' });
            res.json({ message: `Status order berhasil diperbarui menjadi ${status}` });
        }
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

// GET statistik dashboard
app.get('/api/admin/stats', verifyToken, requireAdmin, async (req, res) => {
    try {
        const stats = {};

        // Total consumers
        const { data: consumers } = await supabase
            .from('users')
            .select('id', { count: 'exact', head: true })
            .eq('role', 'consumer');
        stats.totalConsumers = consumers || 0;

        // Total products & stock
        const { data: activeProducts } = await supabase
            .from('products')
            .select('stock')
            .eq('active', 1);
        stats.totalProducts = activeProducts ? activeProducts.length : 0;
        stats.totalStock = activeProducts ? activeProducts.reduce((sum, p) => sum + (p.stock || 0), 0) : 0;

        // Out of stock
        const { data: outOfStockProducts } = await supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('stock', 0);
        stats.outOfStock = outOfStockProducts || 0;

        // Total orders & sales (paid + confirmed)
        const { data: paidOrders } = await supabase
            .from('orders')
            .select('total_amount')
            .in('status', ['paid', 'confirmed']);
        stats.totalOrders = paidOrders ? paidOrders.length : 0;
        stats.totalSales = paidOrders ? paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0) : 0;

        // Pending orders
        const { data: pendingOrders } = await supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'pending');
        stats.pendingOrders = pendingOrders || 0;

        // Paid orders
        const { data: paidOnlyOrders } = await supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'paid');
        stats.paidOrders = paidOnlyOrders || 0;

        res.json(stats);
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

// GET semua user (admin)
app.get('/api/admin/users', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, username, role, created_at')
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ error: 'Database error' });
        res.json(data);
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

app.listen(PORT, () => {
    console.log(`✅ Server berjalan di http://localhost:${PORT}`);
    console.log(`📌 Admin: username=admin, password=admin123`);
});