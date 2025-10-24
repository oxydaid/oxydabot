// /src/api/server.js

const express = require('express');
const config = require('../../config'); // config.js di root
const app = express();
app.use(express.json()); // Middleware untuk membaca JSON body

// Impor handler API baru kita
const apiHandler = require('../handlers/apiHandler');

// --- Middleware Otentikasi API Key (Tetap sama) ---
const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key']; // Kita akan pakai header 'X-API-Key'
    
    if (apiKey && apiKey === config.api.key) {
        next(); // Kunci cocok, lanjutkan ke rute
    } else {
        res.status(401).json({ error: 'Unauthorized: API Key salah atau tidak ada.' });
    }
};

// Fungsi untuk inisialisasi server
function startServer(client) {
    
    // Terapkan middleware auth ke semua rute di bawah /api/
    app.use('/api', apiKeyAuth);

    // --- PERUBAHAN UTAMA ---
    // Panggil apiHandler untuk memuat semua rute dari modul
    // Berikan 'app' (Express) dan 'client' (Discord)
    apiHandler(app, client);
    // -----------------------

    // Rute tes (opsional, untuk cek API online)
    app.get('/api/test', (req, res) => {
        res.json({ message: 'API Bot modular online dan terotentikasi!' });
    });

    app.listen(config.api.port, () => {
        console.log(`🌐 API Server modular berjalan di port ${config.api.port}`);
    });
}

module.exports = { startServer };