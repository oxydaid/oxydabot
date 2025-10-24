// /project-bot-discord/src/database/connect.js

const { Sequelize } = require('sequelize');
// Kita 'keluar' dua folder (../..) untuk mencapai file config.js di root
const config = require('../../config'); 

// Inisialisasi koneksi Sequelize
const sequelize = new Sequelize(
    config.database.name,
    config.database.user,
    config.database.password,
    {
        host: config.database.host,
        port: config.database.port,
        dialect: 'mysql', // Memberitahu Sequelize kita pakai MySQL
        logging: false, // Nonaktifkan logging query SQL di console
    }
);

// Fungsi untuk mengetes koneksi
async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log('✅ Koneksi ke database MySQL (Sequelize) berhasil.');
        await sequelize.sync({ alter: true }); 
        console.log('✅ Model database disinkronkan.');
    } catch (error) {
        console.error('❌ Gagal koneksi ke database:', error);
        process.exit(1); // Hentikan bot jika database gagal konek
    }
}

// Ekspor koneksi (sequelize) dan fungsi tes (connectDB)
module.exports = { sequelize, connectDB };