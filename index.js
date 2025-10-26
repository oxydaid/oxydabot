// /project-bot-discord/index.js

const { Client, GatewayIntentBits, Collection, Events } = require('discord.js'); 
const config = require('./config');
const { connectDB } = require('./src/database/connect');
const moduleHandler = require('./src/handlers/moduleHandler');
const modelHandler = require('./src/handlers/modelHandler');
const fs = require('fs');
const path = require('path');
const { startServer } = require('./src/api/server');
const { logError } = require('./src/utils/errorLogger');
const { checkUpdates } = require('./src/utils/updateChecker');

// --- Inisialisasi Client Bot ---
// Tentukan 'Intents' (izin) yang dibutuhkan bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // Dibutuhkan jika ada fitur leveling (baca pesan)
    ]
});

// --- Persiapan untuk Handler ---
// Kita buat 'Collection' (seperti Map) untuk menyimpan data
client.commands = new Collection(); // Menyimpan slash commands
client.modules = new Collection(); // Menyimpan info modul
client.settingsCache = new Collection();
module.exports.clientInstance = client;

// --- Event: Bot Siap ---
client.once(Events.ClientReady, async () => { 
    console.log(`\x1b[42m🤖 Bot ${client.user.tag} sudah online!\x1b[0m`);

    client.user.setActivity('Awasi Server', { type: 'WATCHING' });
    startServer(client);

    try {
        await checkUpdates(client);
    } catch (startupCheckError) {
         console.error("[UpdateChecker] Error saat pengecekan awal:", startupCheckError);
    }
    setInterval(async () => {
        try {
            await checkUpdates(client);
        } catch (intervalCheckError) {
             console.error("[UpdateChecker] Error saat pengecekan berkala:", intervalCheckError);
        }
    }, 6 * 60 * 60 * 1000);
});

client.on(Events.InteractionCreate, async interaction => {
    // Hanya proses 'ChatInputCommand' (slash command), abaikan tombol/menu
    if (!interaction.isChatInputCommand()) return;

    // Ambil detail command dari client.commands berdasarkan nama
    const command = client.commands.get(interaction.commandName);

    // Jika command tidak ditemukan
    if (!command) {
        logError(error, interaction);
        await interaction.reply({ 
            content: 'Error: Command ini tidak ditemukan.', 
            ephemeral: true 
        });
        return;
    }

    // Jalankan command
    try {
        await command.execute(interaction);
    } catch (error) {
        logError(error, interaction);
        await interaction.reply({ 
            content: 'Terjadi error saat menjalankan command ini!', 
            ephemeral: true 
        });
    }
});

// --- Fungsi Utama (Async) ---
async function main() {
    try {
        modelHandler(); 
        moduleHandler(client);
        await connectDB();
        await client.login(config.discord.token);

    } catch (error) {
        console.error('❌ Terjadi error saat menjalankan bot:', error);
    }
}

// Jalankan bot
main();