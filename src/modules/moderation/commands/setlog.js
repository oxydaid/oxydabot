// /src/modules/moderation/commands/setlog.js

const { SlashCommandBuilder, PermissionsBitField, ChannelType, EmbedBuilder, MessageFlags } = require('discord.js');
const GuildSetting = require('../../../database/models/GuildSetting'); // Path ke model

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-log-channel')
        .setDescription('Mengatur channel untuk log moderasi.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel teks untuk mengirim log')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText) // Hanya channel teks
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator), // Hanya admin

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');

        try {
            // Simpan ke database (Upsert = Update or Insert)
            await GuildSetting.upsert({
                guildId: interaction.guild.id,
                modLogChannelId: channel.id,
            });

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setDescription(`✅ Channel log moderasi telah diatur ke ${channel}.`);
            
            await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });

        } catch (error) {
            console.error("[SetLog] Error:", error);
            await interaction.reply({ content: 'Gagal menyimpan pengaturan.', flags: [MessageFlags.Ephemeral] });
        }
    },
};