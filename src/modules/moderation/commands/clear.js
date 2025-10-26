// /src/modules/moderation/commands/clear.js

// 1. IMPORT MessageFlags
const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, DiscordAPIError, MessageFlags } = require('discord.js');
const { logError } = require('../../../utils/errorLogger');

module.exports = {
    // ... (data command Anda, tidak berubah)
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Menghapus sejumlah pesan di channel ini.')
        .addIntegerOption(option =>
            option.setName('jumlah')
                .setDescription('Jumlah pesan yang akan dihapus (Maks: 100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

    async execute(interaction) {
        const amount = interaction.options.getInteger('jumlah');

        // --- Validasi (Ganti ephemeral) ---
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ 
                content: '❌ Anda tidak memiliki izin untuk mengelola pesan.', 
                flags: [MessageFlags.Ephemeral] // <-- 2. GANTI
            });
        }
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ 
                content: '❌ Saya tidak memiliki izin untuk mengelola pesan di channel ini.', 
                flags: [MessageFlags.Ephemeral] // <-- 3. GANTI
            });
        }

        try {
            // --- 4. PERBAIKAN UTAMA ---
            // Ganti: await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
            // Menjadi:
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

            const deletedMessages = await interaction.channel.bulkDelete(amount, true);
            
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🧹 Pesan Dibersihkan')
                .setDescription(`Berhasil menghapus **${deletedMessages.size}** pesan.`)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            logError(error, interaction);
            if (error instanceof DiscordAPIError && error.code === 50034) {
                await interaction.editReply({ 
                    content: '❌ Gagal. Saya tidak bisa menghapus pesan yang usianya lebih dari 14 hari.' 
                });
            } else {
                await interaction.editReply({ 
                    content: 'Terjadi error saat mencoba menghapus pesan.' 
                });
            }
        }
    },
};