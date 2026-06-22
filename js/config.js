// ═══════════════════════════════════════════════════════════════════════════════
// KONFIGURASI API - Ubah API_BASE_URL sesuai dengan URL backend yang di-deploy
// ═══════════════════════════════════════════════════════════════════════════════

// Jika backend di-deploy ke Render.com, ganti URL di bawah ini
// Contoh: const API_BASE_URL = 'https://web-boneka-api.onrender.com';
// Jika menjalankan lokal, gunakan: const API_BASE_URL = 'http://localhost:3000';

const API_BASE_URL = (() => {
    // Jika dibuka langsung lewat file:// atau jika portnya bukan 3000 (misalnya Live Server port 5500)
    if (window.location.protocol === 'file:' || 
        ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '3000')) {
        return 'http://localhost:3000';
    }
    // Jika diakses lewat port 3000 (Express lokal) atau diakses di production (Vercel serverless function pada domain yang sama)
    return '';
})();
