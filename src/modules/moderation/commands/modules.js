// /src/modules/moderation/commands/modules.js

const {
    EmbedBuilder,
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    PermissionsBitField,
    MessageFlags // <-- 1. IMPORT MessageFlags
} = require('discord.js');

module.exports = {
    // ... (data command Anda, tidak berubah)
    data: new SlashCommandBuilder()
        .setName('modules')
        .setDescription('Mengelola modul bot.')
        .addSubcommand(subcommand =>
            subcommand
                .setName("list")
                .setDescription("Menampilkan daftar semua modul yang dimuat.")
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

    async execute(interaction) {
        const client = interaction.client;

        if (interaction.options.getSubcommand() === "list") {
            
            const moduleMetadataList = Array.from(client.modules.values());

            if (!moduleMetadataList || moduleMetadataList.length === 0) {
                return interaction.reply({ 
                    content: "Tidak ada modul yang dimuat.", 
                    flags: [MessageFlags.Ephemeral] // <-- 2. GANTI ephemeral
                });
            }

            let page = 0;
            const generateEmbed = (index) => {
                // ... (fungsi generateEmbed Anda, tidak berubah)
                const mod = moduleMetadataList[index];
                return new EmbedBuilder()
                    .setTitle(`🔌 Modul ${index + 1}/${moduleMetadataList.length}`)
                    .addFields(
                        { name: "Name", value: mod.name || "N/A", inline: true },
                        { name: "Version", value: mod.version || "N/A", inline: true },
                        { name: "Author", value: mod.author || "N/A", inline: true },
                        { name: "Description", value: mod.description || "Tidak ada deskripsi.", inline: false },
                    )
                    .setColor(0x8fff00)
                    .setFooter({ text: "Bot Module Manager" })
                    .setTimestamp();
            };

            const row = new ActionRowBuilder()
                // ... (kode komponen tombol Anda, tidak berubah)
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('⬅️ Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next ➡️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(moduleMetadataList.length === 1)
                );

            // --- 3. INI PERBAIKAN UTAMA ---
            // Ganti: const message = await interaction.reply({ ..., fetchReply: true });
            // Menjadi 2 baris ini:
            await interaction.reply({ embeds: [generateEmbed(page)], components: [row] });
            const message = await interaction.fetchReply(); // Fetch setelah dikirim
            // ---------------------------------

            const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

            collector.on('collect', i => {
                if (i.user.id !== interaction.user.id) {
                    // <-- 4. GANTI ephemeral di sini juga
                    return i.reply({ 
                        content: "Anda tidak bisa menggunakan tombol ini.", 
                        flags: [MessageFlags.Ephemeral] 
                    });
                }
                
                // ... (logika collector 'prev' / 'next' Anda, tidak berubah)
                if (i.customId === 'prev') page--;
                if (i.customId === 'next') page++;

                const newRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('prev')
                            .setLabel('⬅️ Previous')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page === 0),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('Next ➡️')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page === moduleMetadataList.length - 1)
                    );
                
                i.update({ embeds: [generateEmbed(page)], components: [newRow] });
            });

            // ... (logika collector 'end' Anda, tidak berubah)
            collector.on('end', () => {
                const disabledRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('prev')
                            .setLabel('⬅️ Previous')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('Next ➡️')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true)
                    );
                message.edit({ components: [disabledRow] });
            });
        }
    },
};