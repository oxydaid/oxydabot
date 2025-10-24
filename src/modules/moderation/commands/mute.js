// /src/modules/moderation/commands/mute.js

const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, MessageFlags } = require('discord.js');

// Batas timeout maksimum Discord adalah 28 hari
const MAX_TIMEOUT_MS = 28 * 24 * 60 * 60 * 1000;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Memberikan timeout (mute) kepada member.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Member yang akan di-mute')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('durasi') // Durasi dalam MENIT
                .setDescription('Durasi mute dalam MENIT')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Alasan mute')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers), // Izin untuk timeout

    async execute(interaction) {
        const targetUser = interaction.options.getUser('target');
        const durationMinutes = interaction.options.getInteger('durasi');
        const reason = interaction.options.getString('reason') || 'Tidak ada alasan diberikan';
        
        const targetMember = await interaction.guild.members.fetch(targetUser.id);
        const durationMs = durationMinutes * 60 * 1000; // Konversi menit ke milidetik

        // --- Validasi ---
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: '❌ Anda tidak punya izin untuk me-mute member.', flags: [MessageFlags.Ephemeral] });
        }
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: '❌ Saya tidak punya izin untuk me-mute member.', flags: [MessageFlags.Ephemeral] });
        }
        if (!targetMember.moderatable) {
            return interaction.reply({ content: '❌ Saya tidak bisa me-mute member ini (Role lebih tinggi/Owner).', flags: [MessageFlags.Ephemeral] });
        }
        if (durationMs > MAX_TIMEOUT_MS) {
            return interaction.reply({ content: '❌ Durasi mute tidak bisa lebih dari 28 hari.', flags: [MessageFlags.Ephemeral] });
        }
        if (durationMs <= 0) {
            return interaction.reply({ content: '❌ Durasi harus lebih dari 0 menit.', flags: [MessageFlags.Ephemeral] });
        }

        // --- Eksekusi ---
        try {
            await targetMember.timeout(durationMs, reason);

            const embed = new EmbedBuilder()
                .setColor(0x5865F2) // Biru Discord
                .setTitle('Member di-Mute (Timeout)')
                .setDescription(`**${targetUser.tag}** telah di-mute selama **${durationMinutes} menit**.`)
                .addFields(
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Alasan', value: reason, inline: true }
                )
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });

            // (Opsional) Kirim DM ke user
            try {
                await targetUser.send(`Anda di-mute di server **${interaction.guild.name}** selama ${durationMinutes} menit. Alasan: *${reason}*`);
            } catch (dmError) {
                console.warn(`[Mute] Gagal kirim DM ke ${targetUser.tag}.`);
            }

        } catch (error) {
            console.error('[Mute] Error:', error);
            await interaction.reply({ content: 'Terjadi error saat me-mute member.', flags: [MessageFlags.Ephemeral] });
        }
    },
};