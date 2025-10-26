// /src/modules/moderation/commands/kick.js

const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, MessageFlags } = require('discord.js');
const { logError } = require('../../../utils/errorLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Mengeluarkan (kick) member dari server.')
        // Opsi 1: Siapa yang akan di-kick
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Member yang akan di-kick')
                .setRequired(true))
        // Opsi 2: Alasan kick (opsional)
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Alasan mengapa member ini di-kick')
                .setRequired(false))
        // Secara default, hanya admin yang bisa lihat command ini
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers),

    async execute(interaction) {
        // Ambil data dari opsi command
        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'Tidak ada alasan diberikan';

        // Ambil objek 'member' dari user yang ditarget
        const targetMember = await interaction.guild.members.fetch(targetUser.id);

        // --- Validasi ---

        // 1. Cek izin moderator (user yang menjalankan command)
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({
                content: '❌ Anda tidak memiliki izin untuk menggunakan command ini.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        // 2. Cek izin bot
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({
                content: '❌ Saya tidak memiliki izin untuk meng-kick member.',
                flags: [MessageFlags.Ephemeral]
            });
        }

        // 3. Cek apakah target bisa di-kick (Misal: role bot di bawah target, atau target adalah Owner)
        if (!targetMember.kickable) {
            return interaction.reply({
                content: '❌ Saya tidak bisa meng-kick member ini. (Mungkin role mereka lebih tinggi atau dia adalah Owner).',
                flags: [MessageFlags.Ephemeral]
            });
        }

        // --- Eksekusi ---

        // (Opsional) Kirim DM ke member yang di-kick
        try {
            await targetUser.send(`Anda telah di-kick dari server **${interaction.guild.name}** dengan alasan: *${reason}*`);
        } catch (error) {
            console.warn(`[Kick] Gagal mengirim DM ke ${targetUser.tag}. Mungkin DM-nya tertutup.`);
        }

        // Lakukan kick
        try {
            await targetMember.kick(reason);

            const embed = new EmbedBuilder()
                .setColor(0xFFB800) // Kuning
                .setTitle('Member di-Kick')
                .setDescription(`**${targetUser.tag}** telah berhasil di-kick.`)
                .addFields(
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Alasan', value: reason, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            logError(error, interaction);
            await interaction.reply({
                content: 'Terjadi error saat mencoba meng-kick member.',
                flags: [MessageFlags.Ephemeral]
            });
        }
    },
};