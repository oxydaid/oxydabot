// /src/modules/moderation/models/Warn.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../database/connect'); // Sesuaikan path ke connect.js

const Warn = sequelize.define('Warn', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    guildId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    moderatorId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true, // Otomatis menambah createdAt dan updatedAt
});

module.exports = Warn;