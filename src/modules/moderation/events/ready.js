// /src/modules/moderation/events/ready.js

const { Events } = require('discord.js');
const ActiveBan = require('../models/ActiveBan'); // Path relatif ke model
const { Op } = require('sequelize'); // Impor 'Op' (Operator)

module.exports = {
    // Nama event yang kita dengarkan
    name: Events.ClientReady, 
    
    // 'once: true' berarti event ini HANYA berjalan sekali saat bot login
    once: true, 
    
    // 'client' akan otomatis di-pass oleh eventHandler.js kita
    async execute(client) {
        
        // --- KITA TEMPEL KODENYA DI SINI ---
        
        console.log('[BanChecker] Modul pengecek ban (Moderasi) aktif.');
        setInterval(async () => {
            try {
                // 1. Cari semua ban yang sudah kedaluwarsa
                const expiredBans = await ActiveBan.findAll({
                    where: {
                        expiresAt: { [Op.lt]: new Date() } 
                    }
                });

                if (expiredBans.length === 0) return; 

                console.log(`[BanChecker] Menemukan ${expiredBans.length} ban kedaluwarsa...`);

                // 2. Loop dan proses unban
                for (const ban of expiredBans) {
                    try {
                        const guild = await client.guilds.fetch(ban.guildId);
                        await guild.members.unban(ban.userId, 'Durasi tempban berakhir');
                        console.log(`[BanChecker] ✅ Berhasil unban ${ban.userId} dari guild ${ban.guildId}`);
                        
                        await ban.destroy();
                        
                    } catch (unbanError) {
                        if (unbanError.code === 10026) { // Unknown Ban
                            console.warn(`[BanChecker] Ban untuk ${ban.userId} tidak ditemukan. Menghapus data...`);
                            await ban.destroy(); 
                        } 
                        else if (unbanError.code === 50013) { // Missing Permissions
                             console.error(`[BanChecker] ❌ Gagal unban ${ban.userId}: Bot tidak punya izin 'Ban Members' di guild ${ban.guildId}.`);
                        }
                        else {
                            console.error(`[BanChecker] ❌ Gagal unban ${ban.userId}:`, unbanError.message);
                        }
                    }
                }
            } catch (error) {
                console.error('[BanChecker] Error saat query database:', error);
            }
        }, 60000); // 60000 ms = 1 menit
    },
};