// /src/modules/moderation/commands/warn.js

const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, MessageFlags } = require('discord.js');
const Warn = require('../models/Warn.js'); // Impor model database kita
const { sendModLog } = require('../../../utils/modLog'); // Impor utility modLog

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Memberikan peringatan (warning) kepada member.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Member yang akan di-warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Alasan warning')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'Tidak ada alasan diberikan';
        
        // --- Validasi ---
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: '❌ Anda tidak punya izin untuk memberi peringatan.', flags: [MessageFlags.Ephemeral] });
        }
        
        // --- Eksekusi ---
        try {
            // 1. Simpan ke Database
            await Warn.create({
                guildId: interaction.guild.id,
                userId: targetUser.id,
                moderatorId: interaction.user.id,
                reason: reason,
            });

            // 2. Buat Embed untuk Log
            const embed = new EmbedBuilder()
                .setColor(0xFFA500) // Oranye
                .setTitle('Member Diberi Peringatan')
                .setDescription(`**${targetUser.tag}** (${targetUser.id}) telah diberi peringatan.`)
                .addFields(
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Alasan', value: reason, inline: false }
                )
                .setThumbnail(targetUser.displayAvatarURL())
                .setTimestamp();
            
            // 3. Balas ke Moderator (Pesan Pribadi/Ephemeral)
            await interaction.reply({ 
                content: `✅ Peringatan untuk **${targetUser.tag}** telah dicatat.`, 
                flags: [MessageFlags.Ephemeral] 
            });

            // 4. Kirim ke Channel Mod-Log (Pesan Publik)
            await sendModLog(interaction, embed);

            // 5. (Opsional) Kirim DM ke user
            try {
                await targetUser.send(`Anda mendapat peringatan di server **${interaction.guild.name}**. Alasan: *${reason}*`);
            } catch (dmError) {
                console.warn(`[Warn] Gagal kirim DM ke ${targetUser.tag}.`);
            }

        } catch (error) {
            console.error('[Warn] Error:', error);
            await interaction.reply({ content: 'Terjadi error saat menyimpan peringatan ke database.', flags: [MessageFlags.Ephemeral] });
        }
    },
};