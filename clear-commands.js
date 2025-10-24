// /project-bot-discord/clear-commands.js

const { REST, Routes } = require("discord.js");
const config = require("./config"); // Ambil config Anda

// Cek apakah data penting ada
if (
  !config.discord.token ||
  !config.discord.clientId ||
  !config.discord.guildId
) {
  console.error(
    "Error: DISCORD_TOKEN, CLIENT_ID, dan GUILD_ID harus ada di file .env"
  );
  process.exit(1);
}

const rest = new REST({ version: "10" }).setToken(config.discord.token);

(async () => {
  try {
    console.log("Memulai proses pembersihan slash command...");

    // 1. Hapus Command Global (Level Aplikasi)
    // Kirim array kosong ke endpoint 'applicationCommands'
    await rest.put(Routes.applicationCommands(config.discord.clientId), {
      body: [],
    });

    console.log("✅ Berhasil menghapus semua command GLOBAL.");

    // 2. Hapus Command Guild (Level Server Tes)
    // Kirim array kosong ke endpoint 'applicationGuildCommands'
    await rest.put(
      Routes.applicationGuildCommands(
        config.discord.clientId,
        config.discord.guildId
      ),
      { body: [] }
    );

    console.log(
      `✅ Berhasil menghapus semua command GUILD di server ${config.discord.guildId}.`
    );
    console.log("--- Pembersihan Selesai ---");
  } catch (error) {
    console.error("❌ Gagal menghapus command:", error);
  }
})();
