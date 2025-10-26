// /src/modules/moderation/commands/tempban.js

const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, MessageFlags } = require('discord.js');
const { sendModLog } = require('../../../utils/modLog'); // <-- 2. Impor modlog
const Warn = require('../models/ActiveBan.js');
const { logError } = require('../../../utils/errorLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tempban')
        .setDescription('Mem-ban member untuk durasi tertentu.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Member yang akan di-ban')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('durasi') // Durasi dalam HARI
                .setDescription('Durasi ban dalam HARI')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Alasan ban')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('target');
        const durationDays = interaction.options.getInteger('durasi');
        const reason = interaction.options.getString('reason') || 'Tidak ada alasan diberikan';
        
        const targetMember = await interaction.guild.members.fetch(targetUser.id);

        // --- Validasi (Sama seperti sebelumnya) ---
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: '❌ Anda tidak punya izin untuk mem-ban.', flags: [MessageFlags.Ephemeral] });
        }
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: '❌ Saya tidak punya izin untuk mem-ban.', flags: [MessageFlags.Ephemeral] });
        }
        if (!targetMember.bannable) {
            return interaction.reply({ content: '❌ Saya tidak bisa mem-ban member ini (Role lebih tinggi/Owner).', flags: [MessageFlags.Ephemeral] });
        }
        if (durationDays <= 0) {
            return interaction.reply({ content: '❌ Durasi harus lebih dari 0 hari.', flags: [MessageFlags.Ephemeral] });
        }
        
        // --- Eksekusi ---
        try {
            // (Opsional) Kirim DM dulu
            try {
                await targetUser.send(`Anda di-ban dari server **${interaction.guild.name}** selama ${durationDays} hari. Alasan: *${reason}*`);
            } catch (dmError) {
                console.warn(`[TempBan] Gagal kirim DM ke ${targetUser.tag}.`);
            }
            
            // 1. Ban member
            await interaction.guild.members.ban(targetUser.id, { 
                reason: reason,
                deleteMessageSeconds: 60 * 60 * 24 // Hapus pesan 1 hari (opsional)
            });

            // 2. Hitung tanggal kedaluwarsa
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + durationDays);

            // 3. Simpan ke database (Upsert = Update jika ada, Insert jika baru)
            await ActiveBan.upsert({
                guildId: interaction.guild.id,
                userId: targetUser.id,
                expiresAt: expiresAt,
            });

            // 4. Buat Embed
            const embed = new EmbedBuilder()
                .setColor(0xE60000) // Merah
                .setTitle('Member di-TempBan')
                .setDescription(`**${targetUser.tag}** (${targetUser.id}) telah di-ban.`)
                .addFields(
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Durasi', value: `${durationDays} hari`, inline: true },
                    { name: 'Alasan', value: reason, inline: false },
                    // Gunakan timestamp Discord agar tampil sesuai timezone user
                    { name: 'Berakhir Pada', value: `<t:${Math.floor(expiresAt.getTime() / 1000)}:F>` } 
                )
                .setThumbnail(targetUser.displayAvatarURL())
                .setTimestamp();

            // 5. Balas ke moderator (pribadi)
            await interaction.reply({ 
                content: `✅ **${targetUser.tag}** telah di-tempban selama ${durationDays} hari.`,
                flags: [MessageFlags.Ephemeral] 
            });
            
            // 6. Kirim ke Mod-Log (publik)
            await sendModLog(interaction, embed);

            // --- TIDAK ADA LAGI blok 'setTimeout' ---

        } catch (error) {
            logError(error, interaction);
            await interaction.reply({ content: 'Terjadi error saat mem-ban member.', flags: [MessageFlags.Ephemeral] });
        }
    },
};