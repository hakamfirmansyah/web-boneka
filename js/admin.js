const API = API_BASE_URL;
let deleteTargetId = null;
let allProductsList = []; // Simpan semua produk untuk pencarian dan filter client-side

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
    const token = localStorage.getItem('token');
    console.log('authHeader token:', token);
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
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
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
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
        
        // Tampilan Card Atas
        document.getElementById('statProducts').textContent = data.totalProducts ?? '0';
        document.getElementById('statStock').textContent = data.totalStock ?? '0';
        document.getElementById('statOrders').textContent = data.totalOrders ?? '0';
        document.getElementById('statConsumers').textContent = data.totalConsumers ?? '0';
        
        // Tampilan Finansial & Persediaan
        document.getElementById('statSales').textContent = formatRupiah(data.totalSales ?? 0);
        document.getElementById('statHpp').textContent = formatRupiah(data.totalHppSold ?? 0);
        document.getElementById('statProfit').textContent = formatRupiah(data.totalProfit ?? 0);
        document.getElementById('statInventory').textContent = formatRupiah(data.inventoryValue ?? 0);
        
        // Warning Card (Low Stock)
        const lowStockCount = (data.lowStock ?? 0) + (data.outOfStock ?? 0);
        const lowStockEl = document.getElementById('statLowStock');
        lowStockEl.textContent = lowStockCount;
        if (lowStockCount > 0) {
            lowStockEl.parentElement.classList.add('bg-red-50/50', 'border', 'border-red-200');
        } else {
            lowStockEl.parentElement.classList.remove('bg-red-50/50', 'border', 'border-red-200');
        }

        // Tampilkan Recent Orders
        const recentOrdersBody = document.getElementById('recentOrdersBody');
        if (!data.recentOrders || data.recentOrders.length === 0) {
            recentOrdersBody.innerHTML = `<tr><td class="text-center py-8 text-gray-400">Tidak ada pesanan baru.</td></tr>`;
        } else {
            recentOrdersBody.innerHTML = data.recentOrders.map(o => {
                const date = new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                const statusConfig = getAdminStatusConfig(o.status);
                return `
                    <tr class="hover:bg-gray-50 border-b border-gray-100 transition cursor-pointer" onclick="showSection('orders'); viewOrderDetail(${o.id})">
                        <td class="px-4 py-3 font-semibold text-gray-700">#${o.id}</td>
                        <td class="px-2 py-3 text-gray-600 truncate max-w-[120px]">${o.customer_name}</td>
                        <td class="px-2 py-3 font-bold text-gray-700">${formatRupiah(o.total_amount)}</td>
                        <td class="px-2 py-3 text-right">
                            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusConfig.class}">${statusConfig.label}</span>
                        </td>
                        <td class="px-4 py-3 text-right text-xs text-gray-400">${date}</td>
                    </tr>
                `;
            }).join('');
        }

        // Tampilkan Low Stock Products
        const lowStockProductsBody = document.getElementById('lowStockProductsBody');
        if (!data.lowStockProducts || data.lowStockProducts.length === 0) {
            lowStockProductsBody.innerHTML = `<tr><td class="text-center py-8 text-gray-400">Stok semua produk aman!</td></tr>`;
        } else {
            lowStockProductsBody.innerHTML = data.lowStockProducts.map(p => `
                <tr class="hover:bg-gray-50 border-b border-gray-100 transition cursor-pointer" onclick="showSection('products'); editProduct(${p.id})">
                    <td class="px-4 py-3 flex items-center gap-2">
                        <img src="${p.image || 'assets/logo produk.JPG'}" class="w-8 h-8 rounded-lg object-cover border border-gray-100" onerror="this.src='assets/logo produk.JPG'">
                        <span class="font-semibold text-gray-700 truncate max-w-[150px]">${p.name}</span>
                    </td>
                    <td class="px-2 py-3">
                        <span class="text-xs font-semibold bg-amber-50 text-amber-700 px-2 py-1 rounded">${p.category}</span>
                    </td>
                    <td class="px-4 py-3 text-right font-bold ${p.stock === 0 ? 'text-red-600' : 'text-orange-500'}">
                        ${p.stock} ${p.stock === 0 ? '(Habis)' : 'Pcs'}
                    </td>
                </tr>
            `).join('');
        }
    } catch(e) {
        console.error('Gagal memuat stats:', e);
    }
}

// Helper untuk hitung profit otomatis di modal form
function calculateProfit() {
    const price = parseInt(document.getElementById('pPrice').value) || 0;
    const hpp = parseInt(document.getElementById('pHpp').value) || 0;
    const profit = price - hpp;
    const margin = price > 0 ? Math.round((profit / price) * 100) : 0;
    
    document.getElementById('calcProfit').textContent = formatRupiah(profit);
    document.getElementById('calcMargin').textContent = `${margin}%`;
}

// ─── Load & Render & Filter Produk ──────────────────────────────────────────
async function loadProducts() {
    try {
        const res = await fetch(`${API}/api/admin/products`, { headers: authHeader() });
        if (res.status === 401 || res.status === 403) return handleUnauth();
        allProductsList = await res.json();
        filterProducts();
    } catch(e) {
        document.getElementById('productsTableBody').innerHTML = `<tr><td colspan="7" class="text-center py-12 text-red-400">Gagal memuat data produk.</td></tr>`;
    }
}

function filterProducts() {
    const tbody = document.getElementById('productsTableBody');
    const searchVal = document.getElementById('searchProduct').value.toLowerCase().trim();
    const categoryVal = document.getElementById('filterCategory').value;
    const statusVal = document.getElementById('filterStatus').value;
    const sortVal = document.getElementById('sortProducts').value;

    let filtered = [...allProductsList];

    // Filter Search
    if (searchVal) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchVal) || String(p.id).includes(searchVal));
    }

    // Filter Kategori
    if (categoryVal) {
        filtered = filtered.filter(p => p.category === categoryVal);
    }

    // Filter Status
    if (statusVal !== "") {
        filtered = filtered.filter(p => String(p.active) === statusVal);
    }

    // Sorting
    if (sortVal === "newest") {
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else if (sortVal === "price_asc") {
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortVal === "price_desc") {
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortVal === "stock_asc") {
        filtered.sort((a, b) => (a.stock || 0) - (b.stock || 0));
    } else if (sortVal === "stock_desc") {
        filtered.sort((a, b) => (b.stock || 0) - (a.stock || 0));
    }

    renderProductsTable(filtered);
}

function renderProductsTable(products) {
    const tbody = document.getElementById('productsTableBody');
    
    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-12 text-gray-400"><i class="fas fa-box-open text-3xl mb-2 block text-gray-300"></i>Produk tidak ditemukan atau kosong.</td></tr>`;
        return;
    }

    tbody.innerHTML = products.map(p => {
        const hpp = typeof p.hpp === 'number' ? p.hpp : 0;
        const profit = p.price - hpp;
        const margin = p.price > 0 ? Math.round((profit / p.price) * 100) : 0;
        return `
            <tr class="table-row border-b border-gray-50 transition">
                <td class="px-4 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-xl overflow-hidden bg-cream flex-shrink-0 border border-gray-100">
                            <img src="${p.image || 'assets/logo produk.JPG'}" alt="${p.name}" class="w-full h-full object-cover" onerror="this.src='assets/logo produk.JPG'">
                        </div>
                        <div>
                            <div class="font-semibold text-gray-800 text-sm">${p.name}</div>
                            <div class="flex gap-2 items-center mt-1">
                                <span class="text-[10px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">${p.category}</span>
                                ${p.weight ? `<span class="text-[10px] text-gray-400"><i class="fas fa-weight-hanging mr-1"></i>${p.weight}g</span>` : ''}
                            </div>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-4 text-right text-sm text-gray-500 font-medium">${formatRupiah(hpp)}</td>
                <td class="px-4 py-4 text-right text-sm font-semibold text-gray-800">${formatRupiah(p.price)}</td>
                <td class="px-4 py-4 text-right">
                    <div class="text-sm font-bold text-emerald-600">${formatRupiah(profit)}</div>
                    <div class="text-[10px] font-medium text-gray-400">Margin: ${margin}%</div>
                </td>
                <td class="px-4 py-4 text-center">
                    <span class="text-sm font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-gray-700'}">${p.stock}</span>
                    ${p.stock === 0 ? '<span class="block text-[10px] text-red-400 font-bold">(Habis)</span>' : p.stock <= 5 ? '<span class="block text-[10px] text-red-400 font-semibold">(Limit)</span>' : ''}
                </td>
                <td class="px-4 py-4 text-center">
                    <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${p.active ? 'badge-active' : 'badge-inactive'}">
                        ${p.active ? '✓ Aktif' : '✗ Nonaktif'}
                    </span>
                </td>
                <td class="px-4 py-4 text-center">
                    <div class="flex gap-2 justify-center">
                        <button onclick='editProduct(${p.id})' class="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-100 transition" title="Edit">
                            <i class="fas fa-pen text-xs"></i>
                        </button>
                        <button onclick="openDeleteModal(${p.id}, '${p.name.replace(/'/g, "\\'")}')" class="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100 transition" title="Hapus">
                            <i class="fas fa-trash text-xs"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
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

// ─── Manajemen State Galeri ───────────────────────────────────────────────────
let existingGalleryUrls = []; // Array of URL strings for existing images
let newGalleryFiles = [];     // Array of File objects for newly selected images

function renderExistingGallery() {
    const container = document.getElementById('existingGalleryContainer');
    container.innerHTML = '';
    
    if (existingGalleryUrls.length === 0) {
        container.innerHTML = '<p id="galleryEmptyMsg" class="col-span-full text-xs text-gray-400 italic">Belum ada foto galeri sebelumnya.</p>';
        return;
    }

    existingGalleryUrls.forEach((url, idx) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'relative group aspect-square';
        
        const img = document.createElement('img');
        img.src = url;
        img.className = 'w-full h-full object-cover rounded-xl border-2 border-gray-100 shadow-sm';
        
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-600 transition shadow opacity-0 group-hover:opacity-100';
        delBtn.innerHTML = '<i class="fas fa-times"></i>';
        delBtn.onclick = () => {
            existingGalleryUrls.splice(idx, 1);
            renderExistingGallery();
        };

        wrapper.appendChild(img);
        wrapper.appendChild(delBtn);
        container.appendChild(wrapper);
    });
}

function renderNewGalleryPreview() {
    const container = document.getElementById('galleryNewPreview');
    container.innerHTML = '';

    newGalleryFiles.forEach((file, idx) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'relative group aspect-square';
        
        const reader = new FileReader();
        reader.onload = ev => {
            const img = document.createElement('img');
            img.src = ev.target.result;
            img.className = 'w-full h-full object-cover rounded-xl border-2 border-dashed border-coklatMuda opacity-80';
            
            const badge = document.createElement('span');
            badge.className = 'absolute bottom-1 left-1 bg-coklatMuda text-white text-[9px] px-1.5 py-0.5 rounded font-bold';
            badge.textContent = 'Baru';

            const delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.className = 'absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-600 transition shadow opacity-0 group-hover:opacity-100';
            delBtn.innerHTML = '<i class="fas fa-times"></i>';
            delBtn.onclick = () => {
                newGalleryFiles.splice(idx, 1);
                renderNewGalleryPreview();
            };

            wrapper.appendChild(img);
            wrapper.appendChild(badge);
            wrapper.appendChild(delBtn);
        };
        reader.readAsDataURL(file);
        container.appendChild(wrapper);
    });
}

document.getElementById('pGalleryFiles').addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    newGalleryFiles = [...newGalleryFiles, ...files];
    document.getElementById('pGalleryFiles').value = ''; // Reset input
    renderNewGalleryPreview();
});

// Manajemen Gambar Utama
function renderMainImage() {
    const imgVal = document.getElementById('pImage').value;
    const previewDiv = document.getElementById('mainImagePreview');
    const previewImg = document.getElementById('mainImagePreviewImg');
    
    if (imgVal) {
        previewImg.src = imgVal;
        previewDiv.classList.remove('hidden');
    } else {
        previewDiv.classList.add('hidden');
    }
}

function removeMainImage() {
    document.getElementById('pImage').value = '';
    document.getElementById('pImageFile').value = '';
    renderMainImage();
}

document.getElementById('pImageFile').addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = ev => {
            document.getElementById('pImage').value = ev.target.result; // Temporary base64 for preview
            renderMainImage();
        };
        reader.readAsDataURL(e.target.files[0]);
    }
});

// ─── CRUD Produk ──────────────────────────────────────────────────────────────
function openProductModal(product = null) {
    document.getElementById('productModal').classList.remove('hidden');
    document.getElementById('productForm').reset();
    document.getElementById('editProductId').value = '';
    document.getElementById('modalProductTitle').textContent = 'Tambah Produk';
    document.getElementById('productSubmitBtn').textContent = 'Simpan Produk';
    document.getElementById('pActive').checked = true;
    
    document.getElementById('pImage').value = '';
    document.getElementById('pImageFile').value = '';
    renderMainImage();
    
    existingGalleryUrls = [];
    newGalleryFiles = [];
    renderExistingGallery();
    renderNewGalleryPreview();
    
    document.getElementById('galleryUploadProgress').classList.add('hidden');
    
    // Reset Form Kalkulasi
    document.getElementById('pHpp').value = '';
    document.getElementById('pWeight').value = '';
    calculateProfit();
}

async function editProduct(p) {
    // Jika parameter yang dikirim adalah ID (number/string), fetch product detail from API
    if (typeof p === 'number' || typeof p === 'string') {
        try {
            const res = await fetch(`${API}/api/products/${p}`, { headers: authHeader() });
            const prod = await res.json();
            if (!res.ok) return;
            p = prod;
        } catch (e) {
            console.error('Gagal fetch produk untuk edit:', e);
            return;
        }
    }
    
    openProductModal(p);
    document.getElementById('modalProductTitle').textContent = 'Edit Produk';
    document.getElementById('productSubmitBtn').textContent = 'Update Produk';
    document.getElementById('editProductId').value = p.id;
    document.getElementById('pName').value = p.name;
    document.getElementById('pCategory').value = p.category;
    document.getElementById('pDescription').value = p.description || '';
    document.getElementById('pPrice').value = p.price || 0;
    document.getElementById('pHpp').value = p.hpp || 0;
    document.getElementById('pWeight').value = p.weight || '';
    document.getElementById('pStock').value = p.stock || 0;
    
    // Main image
    document.getElementById('pImage').value = p.image || '';
    renderMainImage();
    
    // Gallery
    existingGalleryUrls = Array.isArray(p.gallery_images) ? [...p.gallery_images] : [];
    renderExistingGallery();

    document.getElementById('pIncludes').value = Array.isArray(p.includes) ? p.includes.join('\n') : '';
    document.getElementById('pActive').checked = p.active === 1;
    
    calculateProfit();
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
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Menyimpan...';

    try {
        let mainImagePath = document.getElementById('pImage').value;
        const mainImageFile = document.getElementById('pImageFile').files[0];
        
        // Cek jika pImage berisi base64 (artinya file baru dipilih tapi belum diupload)
        // Jika mainImageFile ada, upload dulu.
        if (mainImageFile) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Upload Gambar Utama...';
            mainImagePath = await uploadImage(mainImageFile);
        } else if (mainImagePath && mainImagePath.startsWith('data:')) {
            // Edge case: input file changed but then deleted? Should not happen if removeMainImage clears it.
            mainImagePath = '';
        }

        // Upload new gallery files with progress
        let uploadedGalleryUrls = [];
        if (newGalleryFiles.length > 0) {
            const progressContainer = document.getElementById('galleryUploadProgress');
            const progressBar = document.getElementById('galleryProgressBar');
            const progressText = document.getElementById('galleryProgressText');
            
            progressContainer.classList.remove('hidden');
            
            for (let i = 0; i < newGalleryFiles.length; i++) {
                progressText.textContent = `Mengupload galeri ${i+1} dari ${newGalleryFiles.length}...`;
                const percentage = Math.round((i / newGalleryFiles.length) * 100);
                progressBar.style.width = `${percentage}%`;
                
                const uploadedPath = await uploadImage(newGalleryFiles[i]);
                uploadedGalleryUrls.push(uploadedPath);
            }
            progressBar.style.width = '100%';
            progressText.textContent = 'Upload galeri selesai!';
        }

        // Gabungkan galeri lama dan baru
        let finalGallery = [...existingGalleryUrls, ...uploadedGalleryUrls];

        // Fallback: Jika tidak ada main image tapi ada galeri, pakai galeri pertama
        if (!mainImagePath && finalGallery.length > 0) {
            mainImagePath = finalGallery[0];
        }

        const includesRaw = document.getElementById('pIncludes').value;
        const includesArr = includesRaw.split('\n').map(s => s.trim()).filter(s => s.length > 0);

        const payload = {
            name: document.getElementById('pName').value.trim(),
            category: document.getElementById('pCategory').value,
            description: document.getElementById('pDescription').value.trim(),
            price: parseInt(document.getElementById('pPrice').value) || 0,
            hpp: parseInt(document.getElementById('pHpp').value) || 0,
            weight: parseInt(document.getElementById('pWeight').value) || 0,
            stock: parseInt(document.getElementById('pStock').value) || 0,
            image: mainImagePath,
            gallery_images: finalGallery,
            includes: includesArr,
            active: document.getElementById('pActive').checked ? 1 : 0
        };

        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Menyimpan Data...';
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
        document.getElementById('galleryUploadProgress').classList.add('hidden');
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

    OrderModalManager.detailScrollTop = 0; // reset scroll on new open
    OrderModalManager.showDetail();
    
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
            let proofUrl = order.payment_proof;
            if (!proofUrl.startsWith('http')) {
                const baseUrl = API.endsWith('/') ? API : API + '/';
                const path = proofUrl.startsWith('/') ? proofUrl.substring(1) : proofUrl;
                proofUrl = baseUrl + path;
                if (baseUrl === '/') proofUrl = '/' + path; // if API is ''
            }
            paymentHtml = `
                <div class="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h4 class="font-bold text-green-700 mb-2"><i class="fas fa-receipt mr-1"></i> Bukti Pembayaran</h4>
                        <div class="flex flex-col gap-1 text-sm">
                            <p><span class="font-semibold text-gray-700">Bank:</span> ${order.bank_name || '-'}</p>
                            <p><span class="font-semibold text-gray-700">Atas Nama:</span> ${order.account_name || '-'}</p>
                        </div>
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <div onclick="openPaymentProofModal('${proofUrl}')" class="relative group cursor-pointer w-20 h-20 rounded-lg overflow-hidden border-2 border-green-200 hover:border-green-500 transition shadow-sm">
                            <img src="${proofUrl}" alt="Thumbnail Bukti" class="w-full h-full object-cover">
                            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                <i class="fas fa-search-plus text-white text-sm"></i>
                            </div>
                        </div>
                        <span class="text-xs text-gray-500 font-medium">Klik untuk memperbesar</span>
                    </div>
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

// ─── Order Modal Flow Manager ──────────────────────────────────────────────────
const OrderModalManager = {
    detailModalOpen: false,
    previewModalOpen: false,
    detailScrollTop: 0,
    
    fadeIn: function(modal, onComplete) {
        if (!modal) return;
        modal.classList.remove('hidden');
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.2s ease-in-out';
        void modal.offsetWidth; // Reflow
        modal.style.opacity = '1';
        if (onComplete) setTimeout(onComplete, 200);
    },
    
    fadeOut: function(modal, onComplete) {
        if (!modal) return;
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.classList.add('hidden');
            if (onComplete) onComplete();
        }, 200);
    },

    showDetail: function() {
        this.detailModalOpen = true;
        const modal = document.getElementById('orderDetailModal');
        const scrollContainer = modal.firstElementChild;
        this.fadeIn(modal, () => {
            if (scrollContainer && this.detailScrollTop > 0) {
                scrollContainer.scrollTop = this.detailScrollTop;
            }
        });
    },
    
    hideDetailTemporarily: function() {
        const modal = document.getElementById('orderDetailModal');
        const scrollContainer = modal.firstElementChild;
        if (scrollContainer) {
            this.detailScrollTop = scrollContainer.scrollTop;
        }
        this.fadeOut(modal);
    },
    
    closeDetail: function() {
        this.detailModalOpen = false;
        const modal = document.getElementById('orderDetailModal');
        this.fadeOut(modal);
    },
    
    showPreview: function() {
        this.previewModalOpen = true;
        const modal = document.getElementById('paymentProofModal');
        this.fadeIn(modal);
    },
    
    closePreview: function() {
        this.previewModalOpen = false;
        const modal = document.getElementById('paymentProofModal');
        this.fadeOut(modal, () => {
            // Restore detail modal after preview fully fades out if detailModalOpen is still true
            if (this.detailModalOpen) {
                this.showDetail();
            }
        });
    }
};

// Handle ESC Key for Modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const previewModal = document.getElementById('paymentProofModal');
        const detailModal = document.getElementById('orderDetailModal');
        
        if (previewModal && !previewModal.classList.contains('hidden')) {
            closePaymentProofModal();
        } else if (detailModal && !detailModal.classList.contains('hidden')) {
            closeOrderDetail();
        }
    }
});

function closeOrderDetail() {
    OrderModalManager.closeDetail();
}

document.getElementById('orderDetailModal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('orderDetailModal')) closeOrderDetail();
});

// Modal Bukti Pembayaran functions
function openPaymentProofModal(imgUrl) {
    const modal = document.getElementById('paymentProofModal');
    const img = document.getElementById('paymentProofImage');
    const downloadBtn = document.getElementById('downloadPaymentProofBtn');
    
    if (!modal || !img || !downloadBtn) return;

    // Sembunyikan detail pesanan sementara
    OrderModalManager.hideDetailTemporarily();
    
    // Create or find a loader container inside the modal image area
    let loader = document.getElementById('paymentProofLoader');
    if (!loader) {
        loader = document.createElement('div');
        loader = Object.assign(loader, {
            id: 'paymentProofLoader',
            className: 'flex flex-col items-center justify-center p-8 text-gray-500'
        });
        loader.innerHTML = `
            <i class="fas fa-spinner fa-spin text-3xl text-coklatMuda mb-2"></i>
            <span class="text-sm font-medium">Memuat Bukti Pembayaran...</span>
        `;
        img.parentNode.insertBefore(loader, img);
    }
    
    // Hide image and show loader
    img.classList.add('hidden');
    loader.classList.remove('hidden');
    
    // Reset any error message
    let errorMsg = document.getElementById('paymentProofError');
    if (errorMsg) errorMsg.classList.add('hidden');
    
    downloadBtn.href = imgUrl;
    
    // On load success
    img.onload = function() {
        loader.classList.add('hidden');
        img.classList.remove('hidden');
    };
    
    // On load error
    img.onerror = function() {
        loader.classList.add('hidden');
        img.classList.add('hidden');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg = Object.assign(errorMsg, {
                id: 'paymentProofError',
                className: 'flex flex-col items-center justify-center p-8 text-red-500 text-center'
            });
            errorMsg.innerHTML = `
                <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
                <span class="text-sm font-semibold">Gagal memuat gambar bukti transfer.</span>
                <span class="text-xs text-gray-400 mt-1">Kemungkinan file tidak ditemukan atau server bermasalah.</span>
            `;
            img.parentNode.insertBefore(errorMsg, img);
        } else {
            errorMsg.classList.remove('hidden');
        }
    };
    
    img.src = imgUrl;
    OrderModalManager.showPreview();
}

function closePaymentProofModal() {
    OrderModalManager.closePreview();
}

// Add click listener outside to close payment proof modal
document.getElementById('paymentProofModal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('paymentProofModal')) closePaymentProofModal();
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