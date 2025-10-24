// /project-bot-discord/src/handlers/moduleHandler.js

const fs = require('fs');
const path = require('path');
const loadCommands = require('./commandHandler');
const loadEvents = require('./eventHandler');

module.exports = (client) => {
    // Tentukan path ke folder modules
    const modulesPath = path.join(__dirname, '../modules');
    
    // Baca semua folder di dalam 'modules'
    const moduleFolders = fs.readdirSync(modulesPath, { withFileTypes: true })
                             .filter(dirent => dirent.isDirectory())
                             .map(dirent => dirent.name);

    console.log(`\x1b[35m[Module Loader] Menemukan ${moduleFolders.length} modul...`);

    for (const moduleName of moduleFolders) {
        const modulePath = path.join(modulesPath, moduleName);

        // Coba load module.json (info addon)
        try {
            const moduleConfigPath = path.join(modulePath, 'module.json');
            if (fs.existsSync(moduleConfigPath)) {
                const moduleConfig = require(moduleConfigPath);
                client.modules.set(moduleName, moduleConfig);
                console.log(`[Module Loader] ✅ Modul '${moduleName}' (v${moduleConfig.version}) dimuat.\x1b[0m`);
            } else {
                console.log(`[Module Loader] ✅ Modul '${moduleName}' dimuat (tanpa module.json).\x1b[0m`);
            }
        } catch (e) {
            console.warn(`[Module Loader] ⚠️ Gagal memuat module.json untuk ${moduleName}:`, e);
        }

        // Panggil handler lain untuk memuat command & event dari modul ini
        loadCommands(client, modulePath, moduleName);
        loadEvents(client, modulePath, moduleName);
    }
};