// /src/modules/moderation/commands/ban.js

const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Mem-ban member dari server.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Member yang akan di-ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Alasan mengapa member ini di-ban')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'Tidak ada alasan diberikan';
        
        // Ambil objek member (penting untuk cek 'bannable')
        const targetMember = await interaction.guild.members.fetch(targetUser.id);

        // --- Validasi ---

        // 1. Cek izin moderator
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({
                content: '❌ Anda tidak memiliki izin untuk menggunakan command ini.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        // 2. Cek izin bot
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({
                content: '❌ Saya tidak memiliki izin untuk mem-ban member.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        // 3. Cek apakah target bisa di-ban
        if (!targetMember.bannable) {
            return interaction.reply({
                content: '❌ Saya tidak bisa mem-ban member ini. (Mungkin role mereka lebih tinggi atau dia adalah Owner).',
                flags: [MessageFlags.Ephemeral]
            });
        }

        // --- Eksekusi ---

        // (Opsional) Kirim DM ke member yang di-ban
        try {
            await targetUser.send(`Anda telah di-BAN dari server **${interaction.guild.name}** dengan alasan: *${reason}*`);
        } catch (error) {
            console.warn(`[Ban] Gagal mengirim DM ke ${targetUser.tag}. Mungkin DM-nya tertutup.`);
        }

        // Lakukan ban
        try {
            // Kita bisa tambahkan opsi 'deleteMessageSeconds' jika ingin
            await targetMember.ban({ 
                reason: reason,
                deleteMessageSeconds: 60 * 60 * 24 // Hapus pesan 1 hari terakhir (opsional)
            });

            const embed = new EmbedBuilder()
                .setColor(0xE60000) // Merah
                .setTitle('Member di-Ban')
                .setDescription(`**${targetUser.tag}** telah berhasil di-ban.`)
                .addFields(
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Alasan', value: reason, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('[Ban] Error saat mem-ban member:', error);
            await interaction.reply({
                content: 'Terjadi error saat mencoba mem-ban member.',
                flags: [MessageFlags.Ephemeral]
            });
        }
    },
};