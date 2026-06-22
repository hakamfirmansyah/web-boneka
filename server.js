// ═══════════════════════════════════════════════════════════════════════════════
// LOCAL DEVELOPMENT SERVER
// File ini hanya digunakan untuk menjalankan server lokal (npm start).
// Di Vercel, api/index.js digunakan langsung sebagai serverless function.
// ═══════════════════════════════════════════════════════════════════════════════

const app = require('./api/index');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Server berjalan di http://localhost:${PORT}`);
    console.log(`📌 Admin: username=admin, password=admin123`);
});