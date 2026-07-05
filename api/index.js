const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const SECRET_KEY = 'cozy_stitches_secret_key_2026';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

// Pastikan folder upload ada (gunakan /tmp jika di Vercel karena filesystem read-only)
const isVercel = process.env.VERCEL || process.env.NOW_BUILD;
const uploadDir = isVercel ? '/tmp' : path.join(__dirname, '..', 'assets', 'uploads');
if (!isVercel && !fs.existsSync(uploadDir)) {
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

// GET semua produk (publik) - termasuk gallery_images dari tabel product_gallery
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

        const { data: products, error: prodErr } = await query;
        if (prodErr) return res.status(500).json({ error: 'Database error' });

        // Ambil gallery untuk semua produk sekaligus
        const productIds = products.map(p => p.id);
        let galleryData = [];
        if (productIds.length > 0) {
            const { data: gal } = await supabase
                .from('product_gallery')
                .select('*')
                .in('product_id', productIds);
            galleryData = gal || [];
        }

        const productsWithGallery = products.map(p => ({
            ...p,
            gallery_images: galleryData.filter(g => g.product_id === p.id).map(g => g.image_url),
            includes: p.includes || []
        }));

        res.json(productsWithGallery);
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

// GET semua produk (admin: termasuk yang nonaktif) - termasuk gallery_images dari tabel product_gallery
app.get('/api/admin/products', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { data: products, error: prodErr } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (prodErr) return res.status(500).json({ error: 'Database error' });

        const productIds = products.map(p => p.id);
        let galleryData = [];
        if (productIds.length > 0) {
            const { data: gal } = await supabase
                .from('product_gallery')
                .select('*')
                .in('product_id', productIds);
            galleryData = gal || [];
        }

        const productsWithGallery = products.map(p => ({
            ...p,
            gallery_images: galleryData.filter(g => g.product_id === p.id).map(g => g.image_url),
            includes: p.includes || []
        }));

        res.json(productsWithGallery);
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

        const { data: gallery } = await supabase
            .from('product_gallery')
            .select('image_url')
            .eq('product_id', req.params.id);

        res.json({
            ...row,
            gallery_images: (gallery || []).map(g => g.image_url),
            includes: row.includes || []
        });
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

// POST tambah produk baru (admin)
app.post('/api/products', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { name, category, description, price, hpp, weight, stock, image, gallery_images, includes, active } = req.body;
        if (!name || !category) return res.status(400).json({ error: 'Nama dan kategori wajib diisi' });

        const { data: newProduct, error: prodErr } = await supabase
            .from('products')
            .insert({
                name,
                category,
                description: description || '',
                price: price || 0,
                hpp: hpp || 0,
                weight: weight || 0,
                stock: stock || 0,
                image: image || '',
                includes: includes || [],
                active: active !== undefined ? active : 1
            })
            .select('id')
            .single();

        if (prodErr) return res.status(500).json({ error: 'Database error' });

        const productId = newProduct.id;

        // Insert gallery images ke tabel product_gallery
        if (Array.isArray(gallery_images) && gallery_images.length > 0) {
            const galleryInserts = gallery_images.map(url => ({
                product_id: productId,
                image_url: url,
                storage_path: url,
                created_at: new Date().toISOString()
            }));
            await supabase.from('product_gallery').insert(galleryInserts);
        }

        res.status(201).json({ message: 'Produk berhasil ditambahkan', id: productId });
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

// PUT edit produk (admin)
app.put('/api/products/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { name, category, description, price, hpp, weight, stock, image, gallery_images, includes, active } = req.body;
        if (!name || !category) return res.status(400).json({ error: 'Nama dan kategori wajib diisi' });

        const { data, error } = await supabase
            .from('products')
            .update({
                name,
                category,
                description: description || '',
                price: price || 0,
                hpp: hpp || 0,
                weight: weight || 0,
                stock: stock || 0,
                image: image || '',
                includes: includes || [],
                active: active !== undefined ? active : 1
            })
            .eq('id', req.params.id)
            .select('id');

        if (error) return res.status(500).json({ error: 'Database error' });
        if (!data || data.length === 0) return res.status(404).json({ error: 'Produk tidak ditemukan' });

        // Update gallery: hapus semua yang lama, masukkan yang baru
        await supabase.from('product_gallery').delete().eq('product_id', req.params.id);

        if (Array.isArray(gallery_images) && gallery_images.length > 0) {
            const galleryInserts = gallery_images.map(url => ({
                product_id: req.params.id,
                image_url: url,
                storage_path: url,
                created_at: new Date().toISOString()
            }));
            await supabase.from('product_gallery').insert(galleryInserts);
        }

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
// UPLOAD ROUTE (single)
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/upload', verifyToken, requireAdmin, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Tidak ada file yang diupload' });
    }
    const imagePath = 'assets/uploads/' + req.file.filename;
    res.json({ imagePath });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GALLERY ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET gallery images by product ID
app.get('/api/products/:id/gallery', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('product_gallery')
            .select('id, image_url, storage_path, created_at')
            .eq('product_id', req.params.id)
            .order('created_at', { ascending: true });
        if (error) return res.status(500).json({ error: 'Database error' });
        res.json(data || []);
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

// POST upload multiple gallery images
app.post('/api/products/:id/gallery', verifyToken, requireAdmin, upload.array('images'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Tidak ada file yang diupload' });
        }
        const productId = req.params.id;
        const inserts = req.files.map(file => ({
            product_id: productId,
            image_url: 'assets/uploads/' + file.filename,
            storage_path: 'assets/uploads/' + file.filename,
            created_at: new Date().toISOString()
        }));
        const { data, error } = await supabase.from('product_gallery').insert(inserts);
        if (error) return res.status(500).json({ error: 'Database error' });
        res.status(201).json({ message: 'Gallery images uploaded', images: data });
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE single gallery image
app.delete('/api/products/gallery/:galleryId', verifyToken, requireAdmin, async (req, res) => {
    try {
        const galleryId = req.params.galleryId;
        // Ambil record untuk mengetahui storage_path
        const { data: record, error: fetchErr } = await supabase
            .from('product_gallery')
            .select('storage_path')
            .eq('id', galleryId)
            .single();
        if (fetchErr || !record) return res.status(404).json({ error: 'Gallery image not found' });

        // Hapus file dari storage (filesystem lokal)
        const filePath = path.join(__dirname, '..', record.storage_path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Hapus record dari database
        const { error: delErr } = await supabase
            .from('product_gallery')
            .delete()
            .eq('id', galleryId);
        if (delErr) return res.status(500).json({ error: 'Database error' });

        res.json({ message: 'Gallery image deleted' });
    } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ORDERS & PAYMENT ROUTES (Fase 3 & Fase 4)
// ═══════════════════════════════════════════════════════════════════════════════

// POST buat order baru (checkout)
app.post('/api/orders', verifyToken, async (req, res) => {
    console.log("=== BACKEND: CHECKOUT DIMULAI ===");
    console.log("URL Supabase:", supabase.supabaseUrl);
    console.log("Anon Key Terbaca:", !!supabase.supabaseKey);
    console.log("Payload diterima:", req.body);
    
    try {
        const { customerName, customerPhone, customerAddress, customerEmail, notes, items, paymentMethod } = req.body;
        if (!customerName || !customerPhone || !customerAddress || !items || !Array.isArray(items) || items.length === 0) {
            console.log("Validasi gagal: Data tidak lengkap");
            return res.status(400).json({ error: 'Data penerima dan item belanja wajib diisi' });
        }

        // Ambil semua produk untuk validasi stok dan harga
        const productIds = items.map(item => item.productId);
        const { data: products, error: prodErr } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds);

        if (prodErr) {
            console.error("Error mengambil produk dari Supabase:");
            console.error("Code:", prodErr.code);
            console.error("Message:", prodErr.message);
            console.error("Details:", prodErr.details);
            return res.status(500).json({ error: 'Database error saat mengambil produk' });
        }

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
        console.log("Mencoba insert order ke Supabase...");
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

        if (orderErr) {
            console.error("Insert order gagal:");
            console.error("Code:", orderErr.code);
            console.error("Message:", orderErr.message);
            console.error("Details:", orderErr.details);
            return res.status(500).json({ error: 'Database error saat membuat order' });
        }
        const orderId = orderData.id;
        console.log("Insert order berhasil! ID:", orderId);

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
    } catch(e) { 
        console.error("=== BACKEND ERROR CHECKOUT ===");
        console.error(e);
        console.error(e.message);
        console.error(e.stack);
        res.status(500).json({ error: 'Server error' }); 
    }
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
        const { count: consumerCount } = await supabase
            .from('users')
            .select('id', { count: 'exact', head: true })
            .eq('role', 'consumer');
        stats.totalConsumers = consumerCount || 0;

        // Total products & stock
        const { data: allProducts } = await supabase
            .from('products')
            .select('*');
        
        stats.totalProducts = allProducts ? allProducts.length : 0;
        stats.totalStock = allProducts ? allProducts.reduce((sum, p) => sum + (p.stock || 0), 0) : 0;
        
        // Nilai Persediaan = Sum of (stock * hpp)
        stats.inventoryValue = allProducts ? allProducts.reduce((sum, p) => sum + ((p.stock || 0) * (p.hpp || 0)), 0) : 0;

        // Low stock products (e.g., stock <= 5)
        stats.lowStock = allProducts ? allProducts.filter(p => p.stock > 0 && p.stock <= 5).length : 0;

        // Out of stock
        stats.outOfStock = allProducts ? allProducts.filter(p => p.stock === 0).length : 0;

        // Fetch all order items for paid/completed orders to calculate HPP and Profit
        // First get the orders
        const { data: successfulOrders } = await supabase
            .from('orders')
            .select('id, total_amount, created_at, customer_name, status')
            .in('status', ['paid', 'confirmed', 'shipped', 'completed']);
            
        stats.totalOrders = successfulOrders ? successfulOrders.length : 0;
        stats.totalSales = successfulOrders ? successfulOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0) : 0;
        
        // Default values for HPP and Profit if we can't calculate perfectly
        let totalHppSold = 0;
        
        if (successfulOrders && successfulOrders.length > 0) {
            const orderIds = successfulOrders.map(o => o.id);
            const { data: orderItems } = await supabase
                .from('order_items')
                .select('product_id, quantity, price')
                .in('order_id', orderIds);
                
            if (orderItems && allProducts) {
                orderItems.forEach(item => {
                    const product = allProducts.find(p => p.id === item.product_id);
                    const itemHpp = product ? (product.hpp || 0) : 0;
                    totalHppSold += (itemHpp * item.quantity);
                });
            }
        }
        
        stats.totalHppSold = totalHppSold;
        stats.totalProfit = stats.totalSales - totalHppSold;

        // Pending orders
        const { count: pendingCount } = await supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'pending');
        stats.pendingOrders = pendingCount || 0;

        // Paid orders
        const { count: paidCount } = await supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'paid');
        stats.paidOrders = paidCount || 0;
        
        // Recent orders (last 5)
        const { data: recentOrders } = await supabase
            .from('orders')
            .select('id, customer_name, total_amount, status, created_at')
            .order('created_at', { ascending: false })
            .limit(5);
        stats.recentOrders = recentOrders || [];
        
        // Recent products (last 5)
        stats.recentProducts = allProducts 
            ? allProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)
            : [];
            
        // Low stock products list
        stats.lowStockProducts = allProducts
            ? allProducts.filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock).slice(0, 5)
            : [];

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

module.exports = app;
