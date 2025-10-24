// /src/handlers/apiHandler.js

const fs = require('fs');
const path = require('path');

/**
 * Memuat rute API dari semua modul dan mendaftarkannya ke Express app
 * @param {import('express').Application} app - Instance Express app
 * @param {import('discord.js').Client} client - Instance Discord client
 */
module.exports = (app, client) => {
    const modulesPath = path.join(__dirname, '../modules');
    const moduleFolders = fs.readdirSync(modulesPath)
                            .filter(file => fs.statSync(path.join(modulesPath, file)).isDirectory());

    console.log('\x1b[34m[API Loader] Memulai pencarian rute API modular...\x1b[0m');
    
    for (const moduleName of moduleFolders) {
        const apiFolderPath = path.join(modulesPath, moduleName, 'api');
        
        // Cek jika modul ini punya folder /api
        if (fs.existsSync(apiFolderPath)) {
            const routeFiles = fs.readdirSync(apiFolderPath).filter(file => file.endsWith('.js'));
            
            for (const file of routeFiles) {
                const routePath = path.join(apiFolderPath, file);
                try {
                    // Muat file rute (yang mengekspor fungsi)
                    const routeFunction = require(routePath);
                    
                    if (typeof routeFunction === 'function') {
                        // Jalankan fungsi, berikan 'client' (untuk akses Vault)
                        const router = routeFunction(client);
                        
                        // Gunakan nama modul sebagai base path
                        // e.g., /api/economy
                        app.use(`/api/${moduleName}`, router);
                        console.log(`\x1b[34m[API Loader] ✅ Rute untuk modul '${moduleName}' dimuat (dari ${file}).\x1b[0m`);
                    } else {
                        console.warn(`\x1b[32m[API Loader] ⚠️ Gagal memuat rute ${routePath}. File harus mengekspor fungsi.\x1b[0m`);
                    }
                } catch (error) {
                     console.error(`[API Loader] ❌ Error saat memuat rute ${routePath}:`, error);
                }
            }
        }
    }
};