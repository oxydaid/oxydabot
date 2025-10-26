// /src/utils/updateChecker.js

const fetch = require('node-fetch');
const path = require('path');
const config = require('../../config');
// const { logError } = require('./errorLogger'); // Ganti console.error jika sudah ada
// Import versi dari package.json
const { version: localVersion } = require('../../package.json');

// --- KONFIGURASI GITHUB (WAJIB DIGANTI!) ---
const GITHUB_USERNAME = 'oxydaid';
const GITHUB_REPO = 'oxydabot';
// ---------------------------------------------

const GITHUB_RELEASES_API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/releases/latest`;

/**
 * Mengambil data rilis terbaru dari GitHub.
 */
async function fetchLatestRelease() {
    try {
        const response = await fetch(GITHUB_RELEASES_API_URL, {
            headers: { 'Accept': 'application/vnd.github.v3+json' }
        });
        if (response.status === 404) {
            console.warn('[UpdateChecker] Tidak ada rilis yang ditemukan di GitHub.');
            return null;
        }
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${await response.text()}`);
        }
        const data = await response.json();
        // Pastikan tag_name dan body ada
        if (data && data.tag_name && data.body !== null) { // body bisa string kosong
            // Bersihkan 'v' dari tag_name
            data.cleaned_version = data.tag_name.startsWith('v') ? data.tag_name.substring(1) : data.tag_name;
            return data;
        } else {
             console.warn('[UpdateChecker] Data rilis terbaru tidak lengkap.');
            return null;
        }
    } catch (error) {
        console.error('[UpdateChecker] Gagal mengambil rilis terbaru:', error.message);
        // logError(error); // Gunakan jika sudah ada
        return null;
    }
}

/**
 * Membandingkan dua versi semantik (e.g., '1.1.0' vs '1.0.0').
 */
function compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const part1 = parts1[i] || 0;
        const part2 = parts2[i] || 0;
        if (part1 > part2) return 1;
        if (part1 < part2) return -1;
    }
    return 0;
}

/**
 * Fungsi utama checker.
 */
async function checkUpdates(client) {
    console.log(`[UpdateChecker] Mengecek pembaruan... Versi lokal: v${localVersion}`);

    const latestRelease = await fetchLatestRelease();
    if (!latestRelease) return; // Error sudah di-log di fetchLatestRelease

    const remoteVersion = latestRelease.cleaned_version;

    // Bandingkan versi
    if (compareVersions(remoteVersion, localVersion) > 0) {
        console.log(`\x1b[43m[UpdateChecker] 🚀 Pembaruan Tersedia! Lokal: v${localVersion}, Rilis Terbaru: v${remoteVersion} \x1b[0m`);

        // Kirim notifikasi
        if (config.discord.errorLogChannelId) {
            try {
                const channel = await client.channels.fetch(config.discord.errorLogChannelId);
                if (channel && channel.isTextBased()) {
                    // Batasi panjang changelog
                    const changelog = latestRelease.body.length > 1800
                        ? latestRelease.body.substring(0, 1800) + '...\n\n_(Changelog lengkap ada di GitHub)_'
                        : latestRelease.body || '*Tidak ada changelog disediakan.*'; // Fallback jika body kosong

                    await channel.send(
                        `🚀 **Pembaruan Bot Tersedia! (v${remoteVersion})**\n` +
                        `Versi saat ini: \`v${localVersion}\`\n\n` +
                        `**📝 Changelog:**\n${changelog}\n\n` +
                        `Segera lakukan \`git pull\` dan restart bot.`
                    );
                }
            } catch (notifyError) {
                 console.error(`[UpdateChecker] Gagal mengirim notifikasi update: ${notifyError.message}`);
                 // logError(new Error(`Gagal mengirim notifikasi update: ${notifyError.message}`), null, client);
            }
        }
    } else {
        console.log('[UpdateChecker] Bot sudah menggunakan versi terbaru atau sama.');
    }
}

module.exports = { checkUpdates };