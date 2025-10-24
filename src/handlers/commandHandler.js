// /project-bot-discord/src/handlers/commandHandler.js

const fs = require('fs');
const path = require('path');

module.exports = (client, modulePath, moduleName) => {
    const commandsPath = path.join(modulePath, 'commands');

    // Cek jika folder 'commands' ada di modul ini
    if (!fs.existsSync(commandsPath)) {
        // Modul ini mungkin tidak punya command (misal: hanya event)
        return; 
    }

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        // Validasi struktur command (harus ada 'data' dan 'execute')
        if ('data' in command && 'execute' in command) {
            // Set command ke collection di 'client'
            client.commands.set(command.data.name, command);
            // console.log(`[Cmd Handler] Perintah '${command.data.name}' (dari modul ${moduleName}) dimuat.`);
        } else {
            console.warn(`[Cmd Handler] ⚠️ Perintah di ${filePath} GAGAL dimuat. Kekurangan 'data' atau 'execute'.`);
        }
    }
};