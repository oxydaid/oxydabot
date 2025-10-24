// /src/database/models/GuildSetting.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../connect'); // Path ke file koneksi utama

const GuildSetting = sequelize.define('GuildSetting', {
    guildId: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    modLogChannelId: {
        type: DataTypes.STRING,
        allowNull: true, // Bisa kosong jika belum di-set
    },
}, {
    timestamps: false, // Tidak perlu createdAt/updatedAt untuk ini
});

module.exports = GuildSetting;