// /project-bot-discord/src/handlers/eventHandler.js

const fs = require('fs');
const path = require('path');

module.exports = (client, modulePath, moduleName) => {
    const eventsPath = path.join(modulePath, 'events');

    // Cek jika folder 'events' ada
    if (!fs.existsSync(eventsPath)) {
        return; // Modul ini mungkin tidak punya event listener kustom
    }

    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        // Validasi struktur event (harus ada 'name' dan 'execute')
        if ('name' in event && 'execute' in event) {
            
            // Tentukan apakah event 'once' (sekali) atau 'on' (selalu)
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
            // console.log(`[Evt Handler] Event '${event.name}' (dari modul ${moduleName}) dimuat.`);
        } else {
            console.warn(`\x1b[32m[Evt Handler] ⚠️ Event di ${filePath} GAGAL dimuat. Kekurangan 'name' atau 'execute'.\x1b[0m`);
        }
    }
};