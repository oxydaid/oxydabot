# 🤖 OxydaBot - Bot Discord Modular

![Project Status: In Development](https://img.shields.io/badge/status-in_development-yellowgreen.svg)
![Discord.js](https://img.shields.io/badge/Discord.js-v14-5865F2?logo=discord&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18.x+-339933?logo=node.js&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-v6-52B0E7?logo=sequelize&logoColor=white)

Ini adalah *base code* untuk bot Discord serba guna (multi-purpose) yang dibangun dengan Node.js dan Discord.js v14. Arsitektur utamanya dirancang agar **100% modular**, memungkinkan penambahan atau pengurangan fitur (seperti "plugin") tanpa mengganggu kode inti.

---

## ✨ Fitur Utama

Bot ini dibangun dengan *handler* dinamis yang secara otomatis memuat:
* `commands` (Perintah Slash)
* `events` (Event listener seperti `ready` atau `interactionCreate`)
* `models` (Model database Sequelize)
* `api` (Endpoint API Express modular)

Modul yang sudah terpasang saat ini:

### 🛡️ Modul Moderasi
Satu set lengkap alat moderasi untuk menjaga server.
* `/kick`, `/ban`, `/tempban` (dengan database, aman dari restart)
* `/mute` (Timeout bawaan Discord)
* `/warn` (Tercatat di database MySQL)
* `/clear` (Hapus pesan massal)
* `/set-log-channel` (Mencatat semua tindakan moderasi ke channel khusus)

---

## 🛠️ Tumpukan Teknologi (Tech Stack)

* **Runtime:** [Node.js](https://nodejs.org/)
* **Library Bot:** [Discord.js v14](https://discord.js.org/)
* **Database:** [MySQL](https://www.mysql.com/)
* **ORM:** [Sequelize v6](https://sequelize.org/) (Untuk mengelola database)
* **API Server:** [Express.js](https://expressjs.com/)
* **Utilitas:** [Nodemon](https://nodemon.io/) (Untuk auto-reload saat development)

---

## 🚀 Instalasi dan Persiapan

Panduan untuk menjalankan bot ini di lingkungan lokal atau server.

### 1. Prasyarat
* [Node.js](https://nodejs.org/en/download/) (v18 atau lebih baru)
* Server Database MySQL

### 2. Kloning Repositori
```bash
git clone https://github.com/oxydaid/oxydabot.git
cd oxydabot
```

### 3. Instalasi Dependensi
```Bash
npm install
```

### 4. Konfigurasi Lingkungan (.env)
Salin file .env.example dan ganti namanya menjadi .env.
```Bash
cp .env.example .env
```

Kemudian, buka file .env dan isi semua variabel yang diperlukan:

```TOML
# --- Kredensial Bot Discord ---
DISCORD_TOKEN=TokenBotAndaDiSini
CLIENT_ID=ClientIDBotAndaDiSini
GUILD_ID=ServerIDUntukTestingAndaDiSini

# --- Kredensial Database MySQL ---
# (Ini adalah database untuk BOT)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=password_database_anda
DB_NAME=nama_database_bot_anda

# --- Pengaturan API (untuk Dashboard Laravel) ---
API_PORT=3000
API_KEY=KunciApiRahasiaSuperPanjangUntukLaravelAnda
```
---

## 🚀 Menjalankan Bot

### 1. Deploy Slash Commands
**PENTING:** Setiap kali Anda menambah atau mengedit definisi (opsi atau nama) command baru, Anda harus menjalankan skrip ini satu kali:
```Bash
node deploy-commands.js
```

### 2. Menjalankan Bot (Mode Development)
Mode ini menggunakan nodemon dan akan otomatis me-restart bot setiap kali Anda menyimpan perubahan file.
```Bash
npm run dev
```

### 3. Menjalankan Bot (Mode Produksi)
Mode ini menggunakan node standar, lebih ringan dan cocok untuk VPS.
```Bash
npm start
```

---

## 📜 License

This project is licensed under the **MIT License**.
*(Anda bisa menggantinya dengan lisensi lain jika diinginkan, tapi MIT adalah standar yang baik untuk memulai).*

---

## ☎️ Contact & Support

Punya pertanyaan, menemukan bug, atau butuh bantuan?

* **GitHub Issues:** Cara terbaik untuk melaporkan bug atau meminta fitur baru adalah dengan [membuka issue](https://github.com/oxydaid/oxydabot/issues) di repositori ini.
* **Discord:** [Oxyda Store](https://discord.gg/bKmj3x6t83)
* **Email:** `oxydaid@gmail.com`
