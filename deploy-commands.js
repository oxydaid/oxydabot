// /project-bot-discord/deploy-commands.js

const { REST, Routes } = require('discord.js');
const config = require('./config');
const fs = require('fs');
const path = require('path');

// Array untuk menampung data JSON semua command
const commands = [];

// Path ke folder modules
const modulesPath = path.join(__dirname, 'src', 'modules');
const moduleFolders = fs.readdirSync(modulesPath).filter(
    file => fs.statSync(path.join(modulesPath, file)).isDirectory()
);

console.log('[Deploy] Mulai membaca command dari semua modul...');

// Loop semua folder modul
for (const moduleName of moduleFolders) {
    const commandsPath = path.join(modulesPath, moduleName, 'commands');

    // Cek jika folder 'commands' ada
    if (!fs.existsSync(commandsPath)) continue;

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    // Loop semua file command di dalam modul
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            // Ambil data JSON dari command
            commands.push(command.data.toJSON());
            console.log(`[Deploy]   > Command '${command.data.name}' (dari modul ${moduleName}) siap didaftarkan.`);
        } else {
            console.warn(`[Deploy] ⚠️ Command di ${filePath} GAGAL dimuat (kekurangan 'data' atau 'execute').`);
        }
    }
}

// Inisialisasi modul REST untuk mendaftar
const rest = new REST({ version: '10' }).setToken(config.discord.token);

// Proses pendaftaran
(async () => {
    try {
        console.log(`[Deploy] Mendaftarkan ${commands.length} slash command...`);

        // Mendaftarkan command (hanya ke 1 server/guildId untuk tes)
        // Ini jauh lebih cepat daripada mendaftar global
        const data = await rest.put(
            Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
            { body: commands },
        );

        console.log(`[Deploy] ✅ Berhasil mendaftarkan ${data.length} command ke server (Guild ID: ${config.discord.guildId}).`);
    } catch (error) {
        console.error('[Deploy] ❌ Gagal mendaftarkan command:', error);
    }
})();