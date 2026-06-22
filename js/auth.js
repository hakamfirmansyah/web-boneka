document.addEventListener('DOMContentLoaded', () => {
    const desktopLoginBtn = document.getElementById('desktopLoginBtn');
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    const authModal = document.getElementById('authModal');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    const authForm = document.getElementById('authForm');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authMessage = document.getElementById('authMessage');
    const authTabsContainer = document.getElementById('authTabsContainer');
    const loggedInView = document.getElementById('loggedInView');
    const welcomeUserText = document.getElementById('welcomeUserText');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminPanelBtn = document.getElementById('adminPanelBtn');

    let isLoginMode = true;

    // ─── Cek Status Login ─────────────────────────────────────────────────────
    function checkLoginStatus() {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        const role = localStorage.getItem('role');

        if (token && username) {
            // Update tombol navbar
            const displayText = role === 'admin' ? '👑 Admin' : `👤 ${username}`;
            desktopLoginBtn.textContent = displayText;
            mobileLoginBtn.textContent = displayText;

            // Sembunyikan form & tab, tampilkan view login
            authForm.classList.add('hidden');
            authTabsContainer.classList.add('hidden');
            loggedInView.classList.remove('hidden');
            loggedInView.classList.add('flex');

            // Tampilkan nama & role
            const roleLabel = role === 'admin'
                ? '<span class="text-xs bg-coklatTua text-putih px-2 py-1 rounded-full ml-2">Admin</span>'
                : '<span class="text-xs bg-coklatMuda text-putih px-2 py-1 rounded-full ml-2">Konsumen</span>';

            welcomeUserText.innerHTML = `Halo, <strong>${username}</strong>! ${roleLabel}`;

            // Tampilkan tombol Admin Panel jika role admin
            if (adminPanelBtn) {
                if (role === 'admin') {
                    adminPanelBtn.classList.remove('hidden');
                } else {
                    adminPanelBtn.classList.add('hidden');
                }
            }

            // Tampilkan tombol Riwayat Pesanan untuk konsumen
            let orderHistoryBtn = document.getElementById('orderHistoryBtn');
            if (!orderHistoryBtn) {
                orderHistoryBtn = document.createElement('button');
                orderHistoryBtn.id = 'orderHistoryBtn';
                orderHistoryBtn.className = 'w-full bg-coklatMuda text-putih font-bold py-3 rounded-xl text-center hover:bg-coklatTua transition';
                orderHistoryBtn.innerHTML = '<i class="fas fa-history mr-2"></i>Riwayat Pesanan';
                orderHistoryBtn.addEventListener('click', () => {
                    authModal.classList.add('hidden');
                    document.body.style.overflow = 'auto';
                    if (typeof loadOrderHistory === 'function') loadOrderHistory();
                });
                // Insert before logout button
                logoutBtn.parentNode.insertBefore(orderHistoryBtn, logoutBtn);
            }
            if (role === 'admin') {
                orderHistoryBtn.classList.add('hidden');
            } else {
                orderHistoryBtn.classList.remove('hidden');
            }
        } else {
            desktopLoginBtn.textContent = 'Login';
            mobileLoginBtn.textContent = 'Login';
            authForm.classList.remove('hidden');
            authTabsContainer.classList.remove('hidden');
            loggedInView.classList.add('hidden');
            loggedInView.classList.remove('flex');
        }
    }

    checkLoginStatus();

    // ─── Buka Modal ───────────────────────────────────────────────────────────
    const openModal = (e) => {
        e.preventDefault();
        authMessage.classList.add('hidden');
        authModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        checkLoginStatus();
    };

    desktopLoginBtn.addEventListener('click', openModal);
    mobileLoginBtn.addEventListener('click', openModal);

    // ─── Tutup Modal ──────────────────────────────────────────────────────────
    closeAuthModal.addEventListener('click', () => {
        authModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    });

    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    });

    // ─── Tab Switching ────────────────────────────────────────────────────────
    tabLogin.addEventListener('click', () => {
        isLoginMode = true;
        tabLogin.classList.remove('text-gray-400', 'border-transparent');
        tabLogin.classList.add('text-coklatTua', 'border-coklatTua');
        tabRegister.classList.remove('text-coklatTua', 'border-coklatTua');
        tabRegister.classList.add('text-gray-400', 'border-transparent');
        authSubmitBtn.textContent = 'Login';
        authMessage.classList.add('hidden');
    });

    tabRegister.addEventListener('click', () => {
        isLoginMode = false;
        tabRegister.classList.remove('text-gray-400', 'border-transparent');
        tabRegister.classList.add('text-coklatTua', 'border-coklatTua');
        tabLogin.classList.remove('text-coklatTua', 'border-coklatTua');
        tabLogin.classList.add('text-gray-400', 'border-transparent');
        authSubmitBtn.textContent = 'Daftar';
        authMessage.classList.add('hidden');
    });

    // ─── Logout ───────────────────────────────────────────────────────────────
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        localStorage.removeItem('rar_cart');
        // Remove order history button on logout
        const ohBtn = document.getElementById('orderHistoryBtn');
        if (ohBtn) ohBtn.remove();
        checkLoginStatus();
        if (typeof updateCartBadge === 'function') {
            cart = [];
            updateCartBadge();
        }
        showMessage('Berhasil logout!', 'success');
    });

    // ─── Submit Form ──────────────────────────────────────────────────────────
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('authUsername').value.trim();
        const password = document.getElementById('authPassword').value;
        const endpoint = isLoginMode ? '/api/login' : '/api/register';

        authSubmitBtn.disabled = true;
        authSubmitBtn.textContent = 'Loading...';

        try {
            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                if (isLoginMode) {
                    // Simpan token, username, DAN ROLE ke localStorage
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('username', data.username);
                    localStorage.setItem('role', data.role);

                    showMessage(data.role === 'admin'
                        ? '👑 Selamat datang, Admin!'
                        : `✅ Login berhasil! Halo, ${data.username}!`, 'success');

                    setTimeout(() => {
                        checkLoginStatus();
                    }, 1000);
                } else {
                    showMessage('✅ Registrasi berhasil! Silakan login.', 'success');
                    setTimeout(() => tabLogin.click(), 1500);
                }
            } else {
                showMessage(data.error || 'Terjadi kesalahan.', 'error');
            }
        } catch (error) {
            showMessage('❌ Tidak dapat terhubung ke server. Pastikan server sudah berjalan.', 'error');
        } finally {
            authSubmitBtn.disabled = false;
            authSubmitBtn.textContent = isLoginMode ? 'Login' : 'Daftar';
        }
    });

    // ─── Helper: Tampilkan Pesan ──────────────────────────────────────────────
    function showMessage(text, type) {
        authMessage.textContent = text;
        authMessage.className = `text-sm text-center font-semibold mt-2 ${
            type === 'success' ? 'text-green-600' : 'text-red-500'
        }`;
        authMessage.classList.remove('hidden');
    }
});
