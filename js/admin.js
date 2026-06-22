const API = 'http://localhost:3000';
let deleteTargetId = null;

// ─── Guard: Cek admin auth ─────────────────────────────────────────────────────
(function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'admin') {
        alert('Akses ditolak. Silakan login sebagai Admin terlebih dahulu.');
        window.location.href = '/';
    } else {
        const username = localStorage.getItem('username') || 'Admin';
        document.getElementById('adminName').textContent = username;
        document.getElementById('adminNameHeader').textContent = username;
    }
})();

// ─── Helper: Auth Header ───────────────────────────────────────────────────────
function authHeader() {
    return { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' };
}

// ─── Helper: Format Rupiah ─────────────────────────────────────────────────────
function formatRupiah(angka) {
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
}

// ─── Helper: Upload Gambar ───────────────────────────────────────────────────
async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, // No Content-Type header for FormData!
        body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal mengupload gambar');
    return data.imagePath;
}

// ─── Helper: Toast Notification ───────────────────────────────────────────────
function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toastIcon');
    const msgEl = document.getElementById('toastMsg');
    msgEl.textContent = msg;
    icon.className = type === 'success'
        ? 'fas fa-check-circle text-green-500 text-xl'
        : 'fas fa-times-circle text-red-500 text-xl';
    toast.className = toast.className.replace('border-coklatMuda', type === 'success' ? 'border-coklatMuda' : 'border-red-400');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}

// ─── Navigasi Section ─────────────────────────────────────────────────────────
function showSection(name) {
    ['dashboard', 'products', 'users', 'orders'].forEach(s => {
        document.getElementById(`section-${s}`).classList.add('hidden');
        document.getElementById(`nav-${s}`).classList.remove('active');
    });
    document.getElementById(`section-${name}`).classList.remove('hidden');
    document.getElementById(`nav-${name}`).classList.add('active');

    const titles = { dashboard: 'Dashboard', products: 'Manajemen Produk', users: 'Data Pengguna', orders: 'Manajemen Pesanan' };
    document.getElementById('pageTitle').textContent = titles[name];

    if (name === 'products') loadProducts();
    if (name === 'users') loadUsers();
    if (name === 'orders') loadAdminOrders();
    if (name === 'dashboard') loadStats();
}

// ─── Load Statistik ───────────────────────────────────────────────────────────
async function loadStats() {
    try {
        const res = await fetch(`${API}/api/admin/stats`, { headers: authHeader() });
        if (res.status === 401 || res.status === 403) return handleUnauth();
        const data = await res.json();
        document.getElementById('statProducts').textContent = data.totalProducts ?? '—';
        document.getElementById('statStock').textContent = data.totalStock ?? '—';
        document.getElementById('statConsumers').textContent = data.totalConsumers ?? '—';
        document.getElementById('statOutStock').textContent = data.outOfStock ?? '—';
        document.getElementById('statOrders').textContent = data.totalOrders ?? '—';
    } catch(e) {
        console.error('Gagal memuat stats:', e);
    }
}

// ─── Load Produk ──────────────────────────────────────────────────────────────
async function loadProducts() {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-12 text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Memuat...</td></tr>`;

    try {
        const res = await fetch(`${API}/api/admin/products`, { headers: authHeader() });
        if (res.status === 401 || res.status === 403) return handleUnauth();
        const products = await res.json();

        if (!products.length) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-12 text-gray-400">Belum ada produk. Klik "Tambah Produk" untuk mulai.</td></tr>`;
            return;
        }

        tbody.innerHTML = products.map(p => `
            <tr class="table-row border-b border-gray-50 transition">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-xl overflow-hidden bg-cream flex-shrink-0 border border-gray-100">
                            <img src="${p.image}" alt="${p.name}" class="w-full h-full object-contain p-1" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><text y=%2230%22 font-size=%2224%22>🧶</text></svg>'">
                        </div>
                        <div>
                            <div class="font-semibold text-gray-800 text-sm">${p.name}</div>
                            <div class="text-xs text-gray-400">ID: ${p.id}</div>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-4">
                    <span class="text-xs font-semibold bg-amber-50 text-amber-700 px-2 py-1 rounded-lg">${p.category}</span>
                </td>
                <td class="px-4 py-4 text-sm font-semibold text-gray-700">${formatRupiah(p.price)}</td>
                <td class="px-4 py-4">
                    <span class="text-sm font-bold ${p.stock === 0 ? 'text-red-500' : 'text-gray-700'}">${p.stock}</span>
                    ${p.stock === 0 ? '<span class="ml-1 text-xs text-red-400">(Habis)</span>' : ''}
                </td>
                <td class="px-4 py-4">
                    <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${p.active ? 'badge-active' : 'badge-inactive'}">
                        ${p.active ? '✓ Aktif' : '✗ Nonaktif'}
                    </span>
                </td>
                <td class="px-4 py-4">
                    <div class="flex gap-2">
                        <button onclick='editProduct(${JSON.stringify(p)})' class="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-100 transition" title="Edit">
                            <i class="fas fa-pen text-xs"></i>
                        </button>
                        <button onclick="openDeleteModal(${p.id}, '${p.name.replace(/'/g, "\\'")}')" class="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100 transition" title="Hapus">
                            <i class="fas fa-trash text-xs"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch(e) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-12 text-red-400">Gagal memuat data produk.</td></tr>`;
    }
}

// ─── Load Users ───────────────────────────────────────────────────────────────
async function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = `<tr><td colspan="4" class="text-center py-12 text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Memuat...</td></tr>`;

    try {
        const res = await fetch(`${API}/api/admin/users`, { headers: authHeader() });
        const users = await res.json();

        tbody.innerHTML = users.map(u => `
            <tr class="table-row border-b border-gray-50">
                <td class="px-6 py-4 text-sm text-gray-500">#${u.id}</td>
                <td class="px-4 py-4">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full ${u.role === 'admin' ? 'bg-amber-100' : 'bg-blue-100'} flex items-center justify-center">
                            <i class="fas ${u.role === 'admin' ? 'fa-user-shield text-amber-600' : 'fa-user text-blue-500'} text-xs"></i>
                        </div>
                        <span class="text-sm font-semibold text-gray-700">${u.username}</span>
                    </div>
                </td>
                <td class="px-4 py-4">
                    <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'badge-admin' : 'badge-consumer'}">
                        ${u.role === 'admin' ? '👑 Admin' : '👤 Konsumen'}
                    </span>
                </td>
                <td class="px-4 py-4 text-sm text-gray-500">${new Date(u.created_at).toLocaleDateString('id-ID', { year:'numeric', month:'short', day:'numeric' })}</td>
            </tr>
        `).join('');
    } catch(e) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-12 text-red-400">Gagal memuat data pengguna.</td></tr>`;
    }
}

// ─── CRUD Produk ──────────────────────────────────────────────────────────────
function openProductModal(product = null) {
    document.getElementById('productModal').classList.remove('hidden');
    document.getElementById('productForm').reset();
    document.getElementById('editProductId').value = '';
    document.getElementById('modalProductTitle').textContent = 'Tambah Produk';
    document.getElementById('productSubmitBtn').textContent = 'Simpan Produk';
    document.getElementById('pActive').checked = true;
    
    document.getElementById('pImage').value = '';
    document.getElementById('pGallery').value = '[]';
    document.getElementById('pImagePreview').textContent = 'Belum ada gambar';
    document.getElementById('pGalleryPreview').textContent = 'Belum ada foto galeri';
}

function editProduct(p) {
    openProductModal(p);
    document.getElementById('modalProductTitle').textContent = 'Edit Produk';
    document.getElementById('productSubmitBtn').textContent = 'Update Produk';
    document.getElementById('editProductId').value = p.id;
    document.getElementById('pName').value = p.name;
    document.getElementById('pCategory').value = p.category;
    document.getElementById('pDescription').value = p.description || '';
    document.getElementById('pPrice').value = p.price || 0;
    document.getElementById('pStock').value = p.stock || 0;
    document.getElementById('pImage').value = p.image || '';
    document.getElementById('pImagePreview').textContent = p.image || 'Belum ada gambar';
    
    const galArr = Array.isArray(p.gallery_images) ? p.gallery_images : [];
    document.getElementById('pGallery').value = JSON.stringify(galArr);
    document.getElementById('pGalleryPreview').textContent = galArr.length > 0 ? galArr.join(', ') : 'Belum ada foto galeri';

    document.getElementById('pIncludes').value = Array.isArray(p.includes) ? p.includes.join('\n') : '';
    document.getElementById('pActive').checked = p.active === 1;
}

function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
}

document.getElementById('productModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('productModal')) closeProductModal();
});

document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editProductId').value;
    const isEdit = !!id;

    const btn = document.getElementById('productSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'Menyimpan...';

    try {
        let mainImagePath = document.getElementById('pImage').value.trim();
        const mainImageFile = document.getElementById('pImageFile').files[0];
        if (mainImageFile) {
            btn.textContent = 'Mengupload Gambar Utama...';
            mainImagePath = await uploadImage(mainImageFile);
        }

        let galleryArr = JSON.parse(document.getElementById('pGallery').value || '[]');
        const galleryFiles = document.getElementById('pGalleryFiles').files;
        if (galleryFiles.length > 0) {
            btn.textContent = `Mengupload ${galleryFiles.length} Foto Galeri...`;
            for (let i = 0; i < galleryFiles.length; i++) {
                const uploadedPath = await uploadImage(galleryFiles[i]);
                galleryArr.push(uploadedPath);
            }
        }

        const includesRaw = document.getElementById('pIncludes').value;
        const includesArr = includesRaw.split('\n').map(s => s.trim()).filter(s => s.length > 0);

        const payload = {
            name: document.getElementById('pName').value.trim(),
            category: document.getElementById('pCategory').value,
            description: document.getElementById('pDescription').value.trim(),
            price: parseInt(document.getElementById('pPrice').value) || 0,
            stock: parseInt(document.getElementById('pStock').value) || 0,
            image: mainImagePath,
            gallery_images: galleryArr,
            includes: includesArr,
            active: document.getElementById('pActive').checked ? 1 : 0
        };

        btn.textContent = 'Menyimpan Data...';
        const url = isEdit ? `${API}/api/products/${id}` : `${API}/api/products`;
        const method = isEdit ? 'PUT' : 'POST';
        const res = await fetch(url, { method, headers: authHeader(), body: JSON.stringify(payload) });
        const data = await res.json();

        if (res.ok) {
            showToast(isEdit ? '✅ Produk berhasil diupdate!' : '✅ Produk berhasil ditambahkan!');
            closeProductModal();
            loadProducts();
            loadStats();
        } else {
            showToast(data.error || 'Gagal menyimpan produk', 'error');
        }
    } catch(e) {
        showToast('Tidak dapat terhubung ke server', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = isEdit ? 'Update Produk' : 'Simpan Produk';
    }
});

// ─── Hapus Produk ─────────────────────────────────────────────────────────────
function openDeleteModal(id, name) {
    deleteTargetId = id;
    document.getElementById('deleteProductName').textContent = name;
    document.getElementById('deleteModal').classList.remove('hidden');
}

function closeDeleteModal() {
    deleteTargetId = null;
    document.getElementById('deleteModal').classList.add('hidden');
}

document.getElementById('deleteModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('deleteModal')) closeDeleteModal();
});

async function confirmDelete() {
    if (!deleteTargetId) return;
    try {
        const res = await fetch(`${API}/api/products/${deleteTargetId}`, { method: 'DELETE', headers: authHeader() });
        const data = await res.json();
        if (res.ok) {
            showToast('🗑️ Produk berhasil dihapus!');
            closeDeleteModal();
            loadProducts();
            loadStats();
        } else {
            showToast(data.error || 'Gagal menghapus', 'error');
        }
    } catch(e) {
        showToast('Tidak dapat terhubung ke server', 'error');
    }
}

// ─── Load Pesanan (Admin) ─────────────────────────────────────────────────────
async function loadAdminOrders() {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-12 text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Memuat pesanan...</td></tr>`;

    try {
        const filter = document.getElementById('orderStatusFilter')?.value || '';
        const url = filter ? `${API}/api/admin/orders?status=${filter}` : `${API}/api/admin/orders`;
        const res = await fetch(url, { headers: authHeader() });
        if (res.status === 401 || res.status === 403) return handleUnauth();
        const orders = await res.json();

        if (!orders.length) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-12 text-gray-400">Belum ada pesanan.</td></tr>`;
            return;
        }

        tbody.innerHTML = orders.map(o => {
            const statusConfig = getAdminStatusConfig(o.status);
            const date = new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            return `
                <tr class="table-row border-b border-gray-50 transition">
                    <td class="px-6 py-4 text-sm font-bold text-gray-700">#${o.id}</td>
                    <td class="px-4 py-4">
                        <div class="text-sm font-semibold text-gray-700">${o.customer_name}</div>
                        <div class="text-xs text-gray-400">${o.customer_phone}</div>
                    </td>
                    <td class="px-4 py-4 text-sm font-bold text-gray-700">${formatRupiah(o.total_amount)}</td>
                    <td class="px-4 py-4">
                        <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${statusConfig.class}">
                            <i class="${statusConfig.icon} mr-1"></i>${statusConfig.label}
                        </span>
                    </td>
                    <td class="px-4 py-4 text-sm text-gray-500">${date}</td>
                    <td class="px-4 py-4">
                        <div class="flex gap-2">
                            <button onclick="viewOrderDetail(${o.id})" class="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-100 transition" title="Lihat Detail">
                                <i class="fas fa-eye text-xs"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch(e) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-12 text-red-400">Gagal memuat data pesanan.</td></tr>`;
    }
}

function getAdminStatusConfig(status) {
    const configs = {
        'pending':   { label: 'Menunggu Pembayaran', icon: 'fas fa-clock', class: 'bg-yellow-100 text-yellow-700' },
        'paid':      { label: 'Bukti Dikirim',        icon: 'fas fa-file-invoice', class: 'bg-blue-100 text-blue-700' },
        'confirmed': { label: 'Dikonfirmasi',          icon: 'fas fa-check-circle', class: 'bg-green-100 text-green-700' },
        'shipped':   { label: 'Dikirim',               icon: 'fas fa-shipping-fast', class: 'bg-purple-100 text-purple-700' },
        'completed': { label: 'Selesai',               icon: 'fas fa-flag-checkered', class: 'bg-gray-100 text-gray-700' },
        'cancelled': { label: 'Dibatalkan',            icon: 'fas fa-times-circle', class: 'bg-red-100 text-red-700' }
    };
    return configs[status] || { label: status, icon: 'fas fa-question', class: 'bg-gray-100 text-gray-600' };
}

// ─── View Order Detail ────────────────────────────────────────────────────────
async function viewOrderDetail(orderId) {
    const modal = document.getElementById('orderDetailModal');
    const content = document.getElementById('orderDetailContent');
    const actions = document.getElementById('orderDetailActions');
    const idEl = document.getElementById('orderDetailId');

    modal.classList.remove('hidden');
    idEl.textContent = `#${orderId}`;
    content.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-2xl text-coklatMuda"></i></div>';
    actions.innerHTML = '';

    try {
        const res = await fetch(`${API}/api/orders/${orderId}`, { headers: authHeader() });
        if (res.status === 401 || res.status === 403) return handleUnauth();
        const order = await res.json();

        if (!order || order.error) {
            content.innerHTML = '<div class="text-center py-8 text-red-400">Pesanan tidak ditemukan.</div>';
            return;
        }

        const statusConfig = getAdminStatusConfig(order.status);
        const date = new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        let itemsHtml = '';
        if (order.items && order.items.length > 0) {
            itemsHtml = order.items.map(item => `
                <div class="flex items-center gap-3 bg-cream rounded-xl p-3">
                    <img src="${item.image || 'assets/logo produk.JPG'}" alt="${item.product_name}" class="w-12 h-12 object-cover rounded-lg border border-coklatMuda/20" onerror="this.src='assets/logo produk.JPG'">
                    <div class="flex-1">
                        <p class="font-semibold text-coklatTua text-sm">${item.product_name}</p>
                        <p class="text-xs text-gray-500">${formatRupiah(item.price)} x ${item.quantity}</p>
                    </div>
                    <p class="font-bold text-coklatTua text-sm">${formatRupiah(item.price * item.quantity)}</p>
                </div>
            `).join('');
        }

        let paymentHtml = '';
        if (order.payment_proof) {
            paymentHtml = `
                <div class="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h4 class="font-bold text-green-700 mb-2"><i class="fas fa-receipt mr-1"></i> Bukti Pembayaran</h4>
                    <div class="flex items-center gap-3 text-sm">
                        <p><span class="font-semibold">Bank:</span> ${order.bank_name || '-'}</p>
                        <p><span class="font-semibold">Atas Nama:</span> ${order.account_name || '-'}</p>
                    </div>
                    <a href="${API}${order.payment_proof}" target="_blank" class="inline-block mt-2 text-sm text-blue-600 hover:underline font-semibold">
                        <i class="fas fa-image mr-1"></i>Lihat Bukti Transfer
                    </a>
                </div>
            `;
        }

        content.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-cream rounded-xl p-4">
                    <h4 class="font-bold text-coklatTua mb-2"><i class="fas fa-user mr-1"></i> Pelanggan</h4>
                    <p class="text-sm text-gray-700 font-semibold">${order.customer_name}</p>
                    <p class="text-sm text-gray-500">${order.customer_phone}</p>
                    ${order.customer_email ? `<p class="text-sm text-gray-500">${order.customer_email}</p>` : ''}
                </div>
                <div class="bg-cream rounded-xl p-4">
                    <h4 class="font-bold text-coklatTua mb-2"><i class="fas fa-map-marker-alt mr-1"></i> Alamat</h4>
                    <p class="text-sm text-gray-700">${order.customer_address}</p>
                </div>
            </div>
            <div class="bg-cream rounded-xl p-4">
                <h4 class="font-bold text-coklatTua mb-2"><i class="fas fa-box mr-1"></i> Item Pesanan</h4>
                <div class="space-y-2">${itemsHtml}</div>
                <div class="mt-3 pt-3 border-t border-coklatMuda/20 flex justify-between items-center">
                    <span class="font-bold text-gray-700">Total</span>
                    <span class="font-bold text-coklatTua text-lg">${formatRupiah(order.total_amount)}</span>
                </div>
            </div>
            ${paymentHtml}
            ${order.notes ? `
                <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <h4 class="font-bold text-yellow-700 mb-1"><i class="fas fa-sticky-note mr-1"></i> Catatan</h4>
                    <p class="text-sm text-gray-700">${order.notes}</p>
                </div>
            ` : ''}
            <div class="flex items-center justify-between text-sm text-gray-500">
                <span><i class="fas fa-calendar mr-1"></i>${date}</span>
                <span class="font-semibold px-3 py-1 rounded-full ${statusConfig.class}">${statusConfig.label}</span>
            </div>
        `;

        // Action buttons based on status
        let actionButtons = '';
        switch (order.status) {
            case 'paid':
                actionButtons = `
                    <button onclick="updateOrderStatus(${orderId}, 'confirmed')" class="flex-1 bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition text-sm flex items-center justify-center gap-2">
                        <i class="fas fa-check-circle"></i> Konfirmasi Pembayaran
                    </button>
                    <button onclick="updateOrderStatus(${orderId}, 'cancelled')" class="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition text-sm flex items-center justify-center gap-2">
                        <i class="fas fa-times-circle"></i> Tolak
                    </button>
                `;
                break;
            case 'confirmed':
                actionButtons = `
                    <button onclick="updateOrderStatus(${orderId}, 'shipped')" class="flex-1 bg-purple-500 text-white font-bold py-3 rounded-xl hover:bg-purple-600 transition text-sm flex items-center justify-center gap-2">
                        <i class="fas fa-shipping-fast"></i> Tandai Dikirim
                    </button>
                `;
                break;
            case 'shipped':
                actionButtons = `
                    <button onclick="updateOrderStatus(${orderId}, 'completed')" class="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition text-sm flex items-center justify-center gap-2">
                        <i class="fas fa-flag-checkered"></i> Tandai Selesai
                    </button>
                `;
                break;
            case 'pending':
                actionButtons = `
                    <button onclick="updateOrderStatus(${orderId}, 'cancelled')" class="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition text-sm flex items-center justify-center gap-2">
                        <i class="fas fa-times-circle"></i> Batalkan Pesanan
                    </button>
                `;
                break;
        }
        actions.innerHTML = actionButtons;

    } catch(e) {
        content.innerHTML = '<div class="text-center py-8 text-red-400">Gagal memuat detail pesanan.</div>';
    }
}

function closeOrderDetail() {
    document.getElementById('orderDetailModal').classList.add('hidden');
}

document.getElementById('orderDetailModal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('orderDetailModal')) closeOrderDetail();
});

// ─── Update Order Status ──────────────────────────────────────────────────────
async function updateOrderStatus(orderId, newStatus) {
    const statusLabels = {
        'confirmed': 'mengkonfirmasi',
        'shipped': 'menandai dikirim',
        'completed': 'menandai selesai',
        'cancelled': 'membatalkan'
    };
    const label = statusLabels[newStatus] || newStatus;

    if (!confirm(`Yakin ingin ${label} pesanan #${orderId}?`)) return;

    try {
        const res = await fetch(`${API}/api/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: authHeader(),
            body: JSON.stringify({ status: newStatus })
        });
        const data = await res.json();

        if (res.ok) {
            showToast(`✅ Pesanan #${orderId} berhasil ${label}!`);
            closeOrderDetail();
            loadAdminOrders();
            loadStats();
        } else {
            showToast(data.error || 'Gagal mengupdate status', 'error');
        }
    } catch(e) {
        showToast('Tidak dapat terhubung ke server', 'error');
    }
}

// ─── Logout ───────────────────────────────────────────────────────────────────
function adminLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location.href = '/';
}

// ─── Unauthorized Handler ──────────────────────────────────────────────────────
function handleUnauth() {
    alert('Sesi habis. Silakan login kembali.');
    adminLogout();
}

// ─── Init: Muat Stats saat pertama ────────────────────────────────────────────
loadStats();
