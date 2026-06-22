// ═══════════════════════════════════════════════════════════════════════════════
// CART.JS — Keranjang Belanja, Checkout, Pembayaran (Fase 3 & 4)
// ═══════════════════════════════════════════════════════════════════════════════

const API_BASE = 'http://localhost:3000';

// ─── State Keranjang (Tersimpan di localStorage) ─────────────────────────────
let cart = JSON.parse(localStorage.getItem('rar_cart') || '[]');

// ─── Helper: Format Harga ─────────────────────────────────────────────────────
function formatRupiah(amount) {
    return 'Rp' + Number(amount).toLocaleString('id-ID');
}

// ─── Simpan Keranjang ke localStorage ────────────────────────────────────────
function saveCart() {
    localStorage.setItem('rar_cart', JSON.stringify(cart));
    updateCartBadge();
}

// ─── Hitung Total Item di Keranjang ──────────────────────────────────────────
function getCartItemCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// ─── Hitung Total Harga ───────────────────────────────────────────────────────
function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// ─── Update Badge Keranjang di Navbar ────────────────────────────────────────
function updateCartBadge() {
    const count = getCartItemCount();
    const badges = [
        document.getElementById('desktopCartCount'),
        document.getElementById('mobileCartCount'),
        document.getElementById('mobileMenuCartCount')
    ];
    badges.forEach(badge => {
        if (!badge) return;
        badge.textContent = count;
        if (count > 0) {
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    });
}

// ─── Tambah Produk ke Keranjang ───────────────────────────────────────────────
function addToCart(product, quantity = 1) {
    const token = localStorage.getItem('token');
    if (!token) {
        // Arahkan user login
        showToast('Silakan login terlebih dahulu untuk menambahkan ke keranjang!', 'warning');
        document.getElementById('authModal')?.classList.remove('hidden');
        return;
    }

    const existingIndex = cart.findIndex(item => item.productId === product.id);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            stock: product.stock,
            quantity: quantity
        });
    }
    saveCart();
    showToast(`${product.name} ditambahkan ke keranjang!`, 'success');
    openCart();
}

// ─── Hapus Item dari Keranjang ────────────────────────────────────────────────
function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    saveCart();
    renderCartItems();
}

// ─── Update Quantity Item ─────────────────────────────────────────────────────
function updateCartQuantity(productId, newQty) {
    const idx = cart.findIndex(item => item.productId === productId);
    if (idx === -1) return;
    if (newQty <= 0) {
        removeFromCart(productId);
    } else if (newQty > cart[idx].stock) {
        showToast(`Stok tersedia hanya ${cart[idx].stock}`, 'warning');
    } else {
        cart[idx].quantity = newQty;
        saveCart();
        renderCartItems();
    }
}

// ─── Render Daftar Item di Sidebar Keranjang ──────────────────────────────────
function renderCartItems() {
    const list = document.getElementById('cartItemsList');
    const totalEl = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (!list) return;

    if (cart.length === 0) {
        list.innerHTML = `
            <div class="text-center text-gray-400 py-16">
                <i class="fas fa-shopping-basket text-5xl mb-4"></i>
                <p>Keranjang belanja kosong</p>
            </div>`;
        if (totalEl) totalEl.textContent = 'Rp0';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    list.innerHTML = cart.map(item => `
        <div class="flex items-center gap-3 border-b border-coklatMuda/20 pb-4 mb-4">
            <img src="${item.image || 'assets/logo produk.JPG'}" alt="${item.name}"
                 class="w-16 h-16 object-cover rounded-xl border border-coklatMuda/20 flex-shrink-0"
                 onerror="this.src='assets/logo produk.JPG'">
            <div class="flex-1 min-w-0">
                <p class="font-semibold text-coklatTua text-sm truncate">${item.name}</p>
                <p class="text-coklatMuda font-bold text-sm">${formatRupiah(item.price)}</p>
                <div class="flex items-center gap-2 mt-2">
                    <button onclick="updateCartQuantity(${item.productId}, ${item.quantity - 1})"
                            class="w-7 h-7 bg-cream rounded-full flex items-center justify-center text-coklatTua hover:bg-coklatMuda hover:text-putih transition font-bold">
                        <i class="fas fa-minus text-xs"></i>
                    </button>
                    <span class="font-bold text-coklatTua w-6 text-center">${item.quantity}</span>
                    <button onclick="updateCartQuantity(${item.productId}, ${item.quantity + 1})"
                            class="w-7 h-7 bg-cream rounded-full flex items-center justify-center text-coklatTua hover:bg-coklatMuda hover:text-putih transition font-bold">
                        <i class="fas fa-plus text-xs"></i>
                    </button>
                    <button onclick="removeFromCart(${item.productId})"
                            class="ml-auto text-red-400 hover:text-red-600 transition">
                        <i class="fas fa-trash text-sm"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    const total = getCartTotal();
    if (totalEl) totalEl.textContent = formatRupiah(total);
    if (checkoutBtn) checkoutBtn.disabled = false;
}

// ─── Buka / Tutup Sidebar Keranjang ──────────────────────────────────────────
function openCart() {
    const sidebar = document.getElementById('cartSidebar');
    const panel = document.getElementById('cartPanel');
    if (!sidebar || !panel) return;

    renderCartItems();
    sidebar.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    // Animasi slide in
    setTimeout(() => {
        panel.style.transform = 'translateX(0)';
    }, 10);
}

function closeCart() {
    const sidebar = document.getElementById('cartSidebar');
    const panel = document.getElementById('cartPanel');
    if (!sidebar || !panel) return;

    panel.style.transform = 'translateX(100%)';
    setTimeout(() => {
        sidebar.classList.add('hidden');
        document.body.style.overflow = '';
    }, 300);
}

// ─── Buka Modal Checkout ──────────────────────────────────────────────────────
function openCheckout() {
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('Silakan login terlebih dahulu!', 'warning');
        document.getElementById('authModal')?.classList.remove('hidden');
        return;
    }
    if (cart.length === 0) {
        showToast('Keranjang kosong!', 'warning');
        return;
    }

    // Isi ringkasan pesanan di modal checkout
    const itemsList = document.getElementById('checkoutItemsList');
    const totalEl = document.getElementById('checkoutTotal');

    if (itemsList) {
        itemsList.innerHTML = cart.map(item => `
            <div class="flex justify-between items-center">
                <span class="text-gray-700">${item.name} <span class="text-coklatMuda">x${item.quantity}</span></span>
                <span class="font-semibold text-coklatTua">${formatRupiah(item.price * item.quantity)}</span>
            </div>
        `).join('');
    }
    if (totalEl) totalEl.textContent = formatRupiah(getCartTotal());

    closeCart();
    document.getElementById('checkoutModal')?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// ─── Submit Checkout / Buat Order ────────────────────────────────────────────
async function submitCheckout(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('Silakan login terlebih dahulu!', 'warning');
        return;
    }

    const customerName = document.getElementById('custName')?.value.trim();
    const customerPhone = document.getElementById('custPhone')?.value.trim();
    const customerAddress = document.getElementById('custAddress')?.value.trim();
    const customerEmail = document.getElementById('custEmail')?.value.trim();
    const notes = document.getElementById('custNotes')?.value.trim();

    if (!customerName || !customerPhone || !customerAddress) {
        showToast('Nama, telepon, dan alamat wajib diisi!', 'error');
        return;
    }

    const placeBtn = document.getElementById('placeOrderBtn');
    if (placeBtn) {
        placeBtn.disabled = true;
        placeBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Memproses...';
    }

    try {
        const items = cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity
        }));

        const res = await fetch(`${API_BASE}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                customerName, customerPhone, customerAddress, customerEmail, notes,
                items,
                paymentMethod: 'bank_transfer'
            })
        });

        const data = await res.json();

        if (!res.ok) {
            showToast(data.error || 'Gagal membuat pesanan', 'error');
            return;
        }

        // Order berhasil
        cart = [];
        saveCart();
        document.getElementById('checkoutModal')?.classList.add('hidden');
        document.body.style.overflow = '';
        document.getElementById('checkoutForm')?.reset();

        // Tampilkan konfirmasi & arahkan ke upload bukti
        showOrderSuccessPrompt(data.orderId, data.totalAmount);

    } catch (err) {
        console.error(err);
        showToast('Terjadi kesalahan koneksi. Coba lagi.', 'error');
    } finally {
        if (placeBtn) {
            placeBtn.disabled = false;
            placeBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Buat Pesanan';
        }
    }
}

// ─── Prompt Konfirmasi Setelah Order Berhasil ─────────────────────────────────
function showOrderSuccessPrompt(orderId, totalAmount) {
    // Buat overlay sementara
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-60 z-[90] flex items-center justify-center p-4';
    overlay.innerHTML = `
        <div class="bg-putih rounded-3xl max-w-md w-full p-8 text-center shadow-2xl">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-check-circle text-4xl text-green-500"></i>
            </div>
            <h3 class="text-2xl font-bold text-coklatTua mb-2">Pesanan Berhasil Dibuat!</h3>
            <p class="text-gray-500 mb-1">Order #${orderId}</p>
            <p class="text-coklatTua font-bold text-xl mb-4">${formatRupiah(totalAmount)}</p>
            <p class="text-gray-600 text-sm mb-6">
                Silakan lakukan pembayaran via transfer bank dan upload bukti transfer untuk konfirmasi pesanan Anda.
            </p>
            <div class="flex flex-col gap-3">
                <button onclick="openPaymentModal(${orderId}, ${totalAmount}); this.closest('.fixed').remove();"
                        class="w-full bg-green-600 text-putih font-bold py-3 rounded-xl hover:bg-green-700 transition">
                    <i class="fas fa-upload mr-2"></i>Upload Bukti Transfer Sekarang
                </button>
                <button onclick="this.closest('.fixed').remove(); loadOrderHistory();"
                        class="w-full border-2 border-coklatTua text-coklatTua font-bold py-3 rounded-xl hover:bg-coklatTua hover:text-putih transition">
                    <i class="fas fa-history mr-2"></i>Lihat Riwayat Pesanan
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

// ─── Buka Modal Upload Bukti Pembayaran ───────────────────────────────────────
function openPaymentModal(orderId, totalAmount) {
    document.getElementById('paymentOrderId').textContent = orderId;
    document.getElementById('paymentOrderTotal').textContent = formatRupiah(totalAmount);
    document.getElementById('paymentModal')?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Simpan orderId aktif di dataset
    document.getElementById('paymentForm').dataset.orderId = orderId;

    // Reset form
    document.getElementById('paymentForm')?.reset();
    document.getElementById('payProofPreview')?.classList.add('hidden');
}

// ─── Preview Foto Bukti Transfer ──────────────────────────────────────────────
function previewPaymentProof(input) {
    const preview = document.getElementById('payProofPreview');
    const img = document.getElementById('payProofImg');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            img.src = e.target.result;
            preview?.classList.remove('hidden');
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// ─── Submit Bukti Pembayaran ──────────────────────────────────────────────────
async function submitPayment(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    const orderId = document.getElementById('paymentForm').dataset.orderId;
    const bankName = document.getElementById('payBankName')?.value.trim();
    const accountName = document.getElementById('payAccountName')?.value.trim();
    const proofFile = document.getElementById('payProofFile')?.files[0];

    if (!bankName || !accountName || !proofFile) {
        showToast('Semua field wajib diisi!', 'error');
        return;
    }

    const submitBtn = document.getElementById('submitPaymentBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Mengirim...';
    }

    try {
        const formData = new FormData();
        formData.append('bankName', bankName);
        formData.append('accountName', accountName);
        formData.append('payment_proof', proofFile);

        const res = await fetch(`${API_BASE}/api/orders/${orderId}/payment`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await res.json();

        if (!res.ok) {
            showToast(data.error || 'Gagal mengirim bukti transfer', 'error');
            return;
        }

        document.getElementById('paymentModal')?.classList.add('hidden');
        document.body.style.overflow = '';
        showToast('Bukti transfer berhasil dikirim! Admin akan memverifikasi pembayaran Anda.', 'success');

    } catch (err) {
        console.error(err);
        showToast('Terjadi kesalahan koneksi. Coba lagi.', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-upload mr-2"></i>Kirim Bukti Transfer';
        }
    }
}

// ─── Muat Riwayat Pesanan Konsumen ────────────────────────────────────────────
async function loadOrderHistory() {
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('Silakan login terlebih dahulu!', 'warning');
        return;
    }

    const modal = document.getElementById('orderHistoryModal');
    const list = document.getElementById('orderHistoryList');
    if (!modal || !list) return;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    list.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-2xl text-coklatMuda"></i></div>';

    try {
        const res = await fetch(`${API_BASE}/api/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const orders = await res.json();

        if (!res.ok || !Array.isArray(orders) || orders.length === 0) {
            list.innerHTML = `
                <div class="text-center text-gray-400 py-8">
                    <i class="fas fa-box-open text-4xl mb-3"></i>
                    <p>Belum ada pesanan</p>
                </div>`;
            return;
        }

        list.innerHTML = orders.map(order => {
            const statusConfig = getStatusConfig(order.status);
            const date = new Date(order.created_at).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric'
            });

            return `
                <div class="bg-cream rounded-2xl p-5 border border-coklatMuda/20">
                    <div class="flex flex-wrap justify-between items-start gap-2 mb-3">
                        <div>
                            <p class="font-bold text-coklatTua">Order #${order.id}</p>
                            <p class="text-xs text-gray-400">${date}</p>
                        </div>
                        <div class="flex flex-col items-end gap-1">
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusConfig.class}">
                                <i class="${statusConfig.icon} mr-1"></i>${statusConfig.label}
                            </span>
                            <span class="font-bold text-coklatTua">${formatRupiah(order.total_amount)}</span>
                        </div>
                    </div>
                    <div class="text-sm text-gray-600 space-y-1 mb-3">
                        <p><i class="fas fa-user w-4 text-coklatMuda mr-1"></i>${order.customer_name}</p>
                        <p><i class="fas fa-phone w-4 text-coklatMuda mr-1"></i>${order.customer_phone}</p>
                        <p><i class="fas fa-map-marker-alt w-4 text-coklatMuda mr-1"></i>${order.customer_address}</p>
                    </div>
                    ${order.status === 'pending' ? `
                        <button onclick="openPaymentModal(${order.id}, ${order.total_amount})"
                                class="w-full bg-green-600 text-putih font-bold py-2 rounded-xl hover:bg-green-700 transition text-sm">
                            <i class="fas fa-upload mr-2"></i>Upload Bukti Transfer
                        </button>
                    ` : ''}
                    ${order.status === 'paid' ? `
                        <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-700">
                            <i class="fas fa-clock mr-1"></i>Menunggu verifikasi admin
                        </div>
                    ` : ''}
                    ${order.status === 'confirmed' ? `
                        <div class="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
                            <i class="fas fa-check-circle mr-1"></i>Pembayaran telah dikonfirmasi. Pesanan sedang diproses.
                        </div>
                    ` : ''}
                    ${order.status === 'shipped' ? `
                        <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
                            <i class="fas fa-shipping-fast mr-1"></i>Pesanan sedang dalam pengiriman.
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error(err);
        list.innerHTML = '<div class="text-center text-red-400 py-8">Gagal memuat riwayat pesanan</div>';
    }
}

// ─── Config Status Pesanan ────────────────────────────────────────────────────
function getStatusConfig(status) {
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

// ─── Toast Notification ───────────────────────────────────────────────────────
function showToast(message, type = 'info') {
    const existing = document.getElementById('cartToast');
    if (existing) existing.remove();

    const colorMap = {
        success: 'bg-green-600',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-coklatTua'
    };

    const toast = document.createElement('div');
    toast.id = 'cartToast';
    toast.className = `fixed bottom-6 right-6 z-[100] ${colorMap[type] || colorMap.info} text-white px-6 py-4 rounded-2xl shadow-2xl font-semibold text-sm max-w-sm flex items-center gap-3 transform translate-y-4 opacity-0 transition-all duration-300`;

    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    toast.innerHTML = `<i class="${iconMap[type] || iconMap.info}"></i><span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 10);

    setTimeout(() => {
        toast.style.transform = 'translateY(1rem)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ═══════════════════════════════════════════════════════════════════════════════
// INISIALISASI EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();

    // Tombol-tombol buka keranjang
    document.getElementById('desktopCartBtn')?.addEventListener('click', openCart);
    document.getElementById('mobile-cart-btn')?.addEventListener('click', openCart);
    document.getElementById('mobileCartBtnMenu')?.addEventListener('click', (e) => {
        e.preventDefault();
        openCart();
        document.getElementById('mobile-menu')?.classList.add('hidden');
    });

    // Tombol tutup keranjang
    document.getElementById('closeCartBtn')?.addEventListener('click', closeCart);
    document.getElementById('cartOverlay')?.addEventListener('click', closeCart);

    // Tombol checkout
    document.getElementById('checkoutBtn')?.addEventListener('click', openCheckout);

    // Tutup modal checkout
    document.getElementById('closeCheckoutModal')?.addEventListener('click', () => {
        document.getElementById('checkoutModal')?.classList.add('hidden');
        document.body.style.overflow = '';
    });

    // Form checkout submit
    document.getElementById('checkoutForm')?.addEventListener('submit', submitCheckout);

    // Tutup modal payment
    document.getElementById('closePaymentModal')?.addEventListener('click', () => {
        document.getElementById('paymentModal')?.classList.add('hidden');
        document.body.style.overflow = '';
    });

    // Form payment submit
    document.getElementById('paymentForm')?.addEventListener('submit', submitPayment);

    // Preview foto bukti transfer saat file dipilih
    document.getElementById('payProofFile')?.addEventListener('change', function() {
        previewPaymentProof(this);
    });

    // Tutup modal order history
    document.getElementById('closeOrderHistory')?.addEventListener('click', () => {
        document.getElementById('orderHistoryModal')?.classList.add('hidden');
        document.body.style.overflow = '';
    });

    // ESC key menutup modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
            ['checkoutModal', 'paymentModal', 'orderHistoryModal'].forEach(id => {
                document.getElementById(id)?.classList.add('hidden');
            });
            document.body.style.overflow = '';
        }
    });
});