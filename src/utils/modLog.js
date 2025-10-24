// /src/utils/modLog.js

const GuildSetting = require('../database/models/GuildSetting');

/**
 * Mengirim embed ke channel mod-log yang telah diatur
 * @param {import('discord.js').CommandInteraction} interaction - Interaksi command
 * @param {import('discord.js').EmbedBuilder} embed - Embed yang akan dikirim
 */
async function sendModLog(interaction, embed) {
    try {
        // 1. Cari pengaturan untuk guild ini
        const setting = await GuildSetting.findOne({ 
            where: { guildId: interaction.guild.id } 
        });

        // 2. Cek jika channel log sudah di-set
        if (setting && setting.modLogChannelId) {
            // 3. Ambil channel-nya
            const logChannel = await interaction.guild.channels.fetch(setting.modLogChannelId);

            // 4. Kirim jika channel ada dan bot punya izin
            if (logChannel && logChannel.isTextBased()) {
                await logChannel.send({ embeds: [embed] });
            }
        }
    } catch (error) {
        // Sembunyikan error (misal: channel dihapus, bot di-kick, dll)
        console.warn(`[ModLog] Gagal mengirim log ke guild ${interaction.guild.id}:`, error.message);
    }
}

module.exports = { sendModLog };