// /src/handlers/modelHandler.js

const fs = require('fs');
const path = require('path');

function loadModels(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Jika ini folder, scan di dalamnya (rekursif)
            loadModels(fullPath);
        } else if (file.endsWith('.js')) {
            // Jika ini file model, muat dia
            require(fullPath);
            // console.log(`[Model Loader] Model dimuat: ${file}`);
        }
    }
}

module.exports = () => {
    console.log('\x1b[34m[Model Loader] Memulai pencarian model database...\x1b[0m');
    
    // 1. Muat model "global" (jika ada)
    const globalModelsPath = path.join(__dirname, '../database/models');
    if (fs.existsSync(globalModelsPath)) {
        loadModels(globalModelsPath);
    }

    // 2. Muat model spesifik per-modul
    const modulesPath = path.join(__dirname, '../modules');
    const moduleFolders = fs.readdirSync(modulesPath)
                            .filter(file => fs.statSync(path.join(modulesPath, file)).isDirectory());

    for (const moduleName of moduleFolders) {
        const moduleModelsPath = path.join(modulesPath, moduleName, 'models');
        
        // Cek jika modul ini punya folder /models
        if (fs.existsSync(moduleModelsPath)) {
            loadModels(moduleModelsPath);
        }
    }
    
    console.log('\x1b[34m[Model Loader] Semua model telah ditemukan dan didaftarkan ke Sequelize.\x1b[0m');
};