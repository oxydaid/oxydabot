// /src/modules/userinfo/commands/userinfo.js

const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const moment = require('moment'); // Untuk format tanggal yang lebih baik
require('moment/locale/id'); // Aktifkan locale Indonesia
moment.locale('id'); // Set locale default

// --- Helper untuk memformat daftar role ---
function formatRoles(member) {
    const roles = member.roles.cache
        .filter(role => role.id !== member.guild.id) // Filter role @everyone
        .sort((a, b) => b.position - a.position) // Urutkan dari tertinggi
        .map(role => role.toString()); // Ubah jadi mention <@&ID>

    let roleString = roles.join(', ');
    if (roleString.length > 1020) { // Batasi panjang field embed
        roleString = roles.slice(0, 15).join(', ') + '...'; // Tampilkan sebagian
    }
    return roles.length > 0 ? roleString : 'Tidak ada';
}

// --- Helper untuk mendapatkan status ---
function getStatusEmoji(status) {
    switch (status) {
        case 'online': return '🟢 Online';
        case 'idle': return '🌙 Idle';
        case 'dnd': return '⛔ Do Not Disturb';
        case 'offline': return '⚫ Offline';
        default: return '❓ Tidak Diketahui';
    }
}

// --- Helper untuk badges (lebih kompleks) ---
// Sumber flag: https://discord-api-types.dev/api/discord-api-types-v10/enum/UserFlags
const USER_FLAGS = {
    Staff: 'Discord Staff',
    Partner: 'Partnered Server Owner',
    Hypesquad: 'HypeSquad Events',
    BugHunterLevel1: 'Bug Hunter (Level 1)',
    BugHunterLevel2: 'Bug Hunter (Level 2)',
    HypeSquadOnlineHouse1: 'HypeSquad Bravery',
    HypeSquadOnlineHouse2: 'HypeSquad Brilliance',
    HypeSquadOnlineHouse3: 'HypeSquad Balance',
    PremiumEarlySupporter: 'Early Supporter',
    TeamPseudoUser: 'Team User', // Jarang
    VerifiedBot: 'Verified Bot',
    VerifiedDeveloper: 'Early Verified Bot Developer',
    CertifiedModerator: 'Discord Certified Moderator',
    BotHTTPInteractions: 'Bot uses interactions', // Jarang
    ActiveDeveloper: 'Active Developer',
};

async function getUserBadges(user) {
    // Perlu fetch ulang untuk mendapatkan flags terbaru
    await user.fetch(true);
    const flags = user.flags.toArray();
    return flags.map(flag => USER_FLAGS[flag] || flag).join(', ') || 'Tidak ada';
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Menampilkan informasi tentang pengguna.')
        // Opsi target (opsional)
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Pengguna yang ingin dilihat infonya (kosongkan untuk diri sendiri).')
                .setRequired(false))
        // Opsi tipe info (server atau account)
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Jenis informasi yang ingin dilihat (default: server).')
                .setRequired(false)
                .addChoices(
                    { name: 'Info Server Ini', value: 'server' },
                    { name: 'Info Akun Global', value: 'account' }
                )),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('target') || interaction.user;
        const infoType = interaction.options.getString('type') || 'server'; // Default 'server'

        await interaction.deferReply();

        try {
            if (infoType === 'server') {
                // --- INFO SERVER ---
                const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

                if (!targetMember) {
                    return interaction.editReply({ content: '❌ Pengguna tersebut tidak ditemukan di server ini.', flags: [MessageFlags.Ephemeral] });
                }

                const serverEmbed = new EmbedBuilder()
                    .setColor(targetMember.displayHexColor === '#000000' ? '#99aab5' : targetMember.displayHexColor) // Warna dari role tertinggi
                    .setAuthor({ name: targetMember.user.tag, iconURL: targetMember.user.displayAvatarURL() })
                    .setThumbnail(targetMember.user.displayAvatarURL({ dynamic: true, size: 256 }))
                    .setTitle(`Informasi Server untuk ${targetMember.displayName}`)
                    .addFields(
                        { name: '👤 Username', value: targetMember.user.tag, inline: true },
                        { name: '🆔 ID', value: targetMember.id, inline: true },
                        { name: '🏷️ Nickname', value: targetMember.nickname || 'Tidak ada', inline: true },

                        { name: '🗓️ Bergabung Server', value: moment(targetMember.joinedTimestamp).format('LLLL') + `\n(${moment(targetMember.joinedTimestamp).fromNow()})`, inline: false },
                        { name: `🎭 Roles (${targetMember.roles.cache.size - 1})`, value: formatRoles(targetMember), inline: false }, // -1 untuk @everyone

                        { name: '✨ Booster Sejak', value: targetMember.premiumSince ? moment(targetMember.premiumSinceTimestamp).format('LL') : 'Tidak boost', inline: true },
                        { name: '🚦 Status', value: getStatusEmoji(targetMember.presence?.status || 'offline'), inline: true }, // Ambil status dari presence
                        // Tambah info akun dibuat juga
                        { name: '🎂 Akun Dibuat', value: moment(targetMember.user.createdTimestamp).format('LL') + `\n(${moment(targetMember.user.createdTimestamp).fromNow()})`, inline: true },
                    )
                    .setFooter({ text: `Diminta oleh ${interaction.user.tag}`})
                    .setTimestamp();

                // Tambahkan aktivitas jika ada
                if (targetMember.presence?.activities?.[0]) {
                     const activity = targetMember.presence.activities[0];
                     serverEmbed.addFields({ name: '🎮 Aktivitas', value: `${activity.type === 0 ? 'Bermain' : activity.type === 2 ? 'Mendengarkan' : activity.type === 3 ? 'Menonton' : 'Streaming'} **${activity.name}**`, inline: false });
                }


                await interaction.editReply({ embeds: [serverEmbed] });

            } else if (infoType === 'account') {
                // --- INFO AKUN GLOBAL ---
                // Fetch ulang user untuk data terbaru (terutama flags/badges)
                const user = await targetUser.fetch(true);

                const accountEmbed = new EmbedBuilder()
                    .setColor(user.accentColor || '#99aab5') // Warna aksen profil
                    .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
                    .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
                    .setTitle(`Informasi Akun ${user.username}`)
                     // Banner profile jika ada
                    .setImage(user.bannerURL({ dynamic: true, size: 512 }))
                    .addFields(
                        { name: '👤 Username & Tag', value: user.tag, inline: true },
                        { name: '🆔 ID', value: user.id, inline: true },
                        { name: '🤖 Bot?', value: user.bot ? 'Ya' : 'Bukan', inline: true },

                        { name: '🎂 Akun Dibuat', value: moment(user.createdTimestamp).format('LLLL') + `\n(${moment(user.createdTimestamp).fromNow()})`, inline: false },
                        { name: '🎖️ Lencana (Badges)', value: await getUserBadges(user), inline: false },
                    )
                    .setFooter({ text: `Diminta oleh ${interaction.user.tag}`})
                    .setTimestamp();

                await interaction.editReply({ embeds: [accountEmbed] });
            }

        } catch (error) {
            console.error('[UserInfo] Error:', error); // Ganti dengan logError
            await interaction.editReply({ content: 'Gagal mengambil informasi pengguna.', flags: [MessageFlags.Ephemeral] });
        }
    },
};