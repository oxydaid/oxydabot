// /src/database/models/ActiveBan.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connect'); // Path ke file koneksi utama

const ActiveBan = sequelize.define('ActiveBan', {
    guildId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    expiresAt: {
        type: DataTypes.DATE, // Tipe data Tanggal
        allowNull: false,
    },
}, {
    // Buat index agar query database lebih cepat
    indexes: [ 
        { fields: ['guildId', 'userId'], unique: true }, // Seharusnya 1 user = 1 ban aktif per guild
        { fields: ['expiresAt'] } // Penting untuk query pengecekan
    ],
    timestamps: true, // Kita simpan createdAt untuk data
});

module.exports = ActiveBan;