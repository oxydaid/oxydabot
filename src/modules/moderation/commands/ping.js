// /src/modules/moderation/commands/ping.js

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Mengecek latensi bot.'),
    
    async execute(interaction) {
        
        // --- PERBAIKAN (Ganti fetchReply) ---
        // 1. Balas dulu
        await interaction.reply({ content: 'Menghitung...' });
        
        // 2. Fetch balasan setelah dikirim
        const sent = await interaction.fetchReply();
        // ------------------------------------

        const apiLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const wsPing = interaction.client.ws.ping;

        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🏓 Pong!')
            .setDescription(`Berikut adalah kecepatan bot saat ini:`)
            .addFields(
                { name: 'Latensi API', value: `**${apiLatency}ms**`, inline: true },
                { name: 'WebSocket Ping', value: `**${wsPing}ms**`, inline: true }
            );

        // Edit balasan
        await interaction.editReply({ content: null, embeds: [embed] });
    },
};