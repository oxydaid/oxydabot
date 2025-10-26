// /project-bot-discord/config.js

// Memuat library dotenv untuk membaca file .env
require('dotenv').config();

module.exports = {
    discord: {
        token: process.env.DISCORD_TOKEN,
        clientId: process.env.CLIENT_ID,
        guildId: process.env.GUILD_ID,
        errorLogChannelId: process.env.ERROR_LOG_CHANNEL_ID
    },
    database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        name: process.env.DB_NAME,
    },
    api: {
        port: process.env.API_PORT || 3000, // Port untuk API dashboard
        key: process.env.API_KEY // Kunci API
    }
};