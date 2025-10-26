// /src/utils/errorLogger.js

const { EmbedBuilder } = require('discord.js');
const config = require('../../config'); // Ambil config global

/**
 * Mengirim detail error ke channel Discord yang ditentukan dan log ke console.
 * @param {Error} error - Objek Error yang tertangkap.
 * @param {import('discord.js').Interaction} [interaction] - (Opsional) Interaksi yang memicu error.
 * @param {import('discord.js').Client} [client] - (Opsional) Instance client bot.
 */
async function logError(error, interaction = null, client = null) {
    // 1. Selalu log ke console sebagai backup
    console.error(`[ERROR] Terjadi error${interaction ? ` saat menjalankan command '${interaction.commandName}'` : ''}:`, error);

    // 2. Cek apakah channel log diatur
    if (!config.discord.errorLogChannelId) {
        console.warn('[ErrorLogger] ERROR_LOG_CHANNEL_ID tidak diatur di .env. Log tidak dikirim ke Discord.');
        return;
    }

    // 3. Buat Embed Error
    const embed = new EmbedBuilder()
        .setColor(0xFF0000) // Merah
        .setTitle('❌ Bot Error Terdeteksi!')
        .setTimestamp();

    // Tambahkan detail error (stack trace jika ada)
    embed.setDescription('```' + (error.stack || error.message).slice(0, 4000) + '```'); // Batasi panjang deskripsi

    // Tambahkan detail interaksi jika tersedia
    if (interaction) {
        embed.addFields(
            { name: 'Command', value: `\`/${interaction.commandName}\``, inline: true },
            { name: 'User', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
            { name: 'Server ID', value: interaction.guild ? interaction.guild.id : 'DM', inline: true },
            { name: 'Channel ID', value: interaction.channel ? interaction.channel.id : 'Unknown', inline: true }
        );
    } else {
        embed.addFields({ name: 'Konteks', value: 'Error terjadi di luar konteks interaksi command.', inline: false });
    }

    // 4. Dapatkan Client & Kirim Log
    try {
        // Coba dapatkan client dari interaction, jika tidak, gunakan yang di-pass,
        // jika tidak ada juga, coba impor dari index (hati-hati circular dependency)
        const botClient = interaction?.client || client || require('../../index').clientInstance; // Kita butuh clientInstance diekspor dari index.js

        if (!botClient) {
            console.error('[ErrorLogger] FATAL: Tidak bisa mendapatkan instance Client Discord.');
            return;
        }

        const channel = await botClient.channels.fetch(config.discord.errorLogChannelId);
        if (channel && channel.isTextBased()) {
            await channel.send({ embeds: [embed] });
        } else {
            console.error(`[ErrorLogger] FATAL: Channel log error (${config.discord.errorLogChannelId}) tidak ditemukan atau bukan channel teks.`);
        }
    } catch (logErr) {
        console.error("[ErrorLogger] FATAL: Gagal mengirim log error ke Discord:", logErr);
    }
}

module.exports = { logError };