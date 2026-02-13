# 🤖 WhatsApp Multi-Device Bot

A feature-rich, self-hosted WhatsApp bot built with **Baileys**, **Node.js**, and **MongoDB**. Supports multi-device connection (MD), AI chat (Gemini/OpenAI), media downloading, group moderation, and more.

## ✨ Features

- **📱 Multi-Device Support**: No phone connection required after initial scan.
- **🧠 AI Powered**: Chat with Gemini or OpenAI directly in WhatsApp (`-ai`, `-chatmode`).
- **📥 Media Downloader**: Download YouTube videos/audio (`-yt`, `-song`) and Instagram media (`-insta`).
- **🖼️ Sticker Tools**: Convert images/videos to stickers (`-sticker`) and steal stickers (`-steal`).
- **🛡️ Group Administration**: Ban, warn, tag all, welcome/goodbye messages.
- **💾 Persistence**: Session and credential storage in MongoDB (no local file dependency for auth).
- **📝 Logging**: Detailed logs for debugging.

## 🛠️ Prerequisites

- **Node.js** (v18 or higher recommended)
- **MongoDB** (Cloud Atlas or local)
- **ffmpeg** (Required for media processing and stickers)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd whatsapp-bot-multi-device
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Fill in your details:
     ```env
     PREFIX=-
     MY_NUMBER=91XXXXXXXXXX@s.whatsapp.net
     SESSION_ID=whatsapp-session-1
     MONGODB_KEY=your_mongodb_connection_string
     GEMINI_API_KEY=your_gemini_key
     OPENAI_API_KEY=your_openai_key (optional)
     MAX_FILE_SIZE_MB=50
     ```

4. **Start the Bot**
   ```bash
   npm start
   ```
   Or for development (auto-restart):
   ```bash
   npm run dev
   ```

5. **Scan QR Code**
   - The QR code will be printed in the terminal.
   - You can also view it at `http://localhost:8000/qr`.
   - Scan it with your WhatsApp (Linked Devices).

## 📚 Command List

### 📢 Public
- `-help` / `-menu`: Show all commands.
- `-yt <url>`: Download YouTube video.
- `-song <url>`: Download YouTube audio.
- `-insta <url>`: Download Instagram media.
- `-sticker` / `-s`: Create sticker from image/video.
- `-steal`: Steal a sticker.
- `-ai <text>`: Ask AI.
- `-meme`: Get a random meme.
- `-joke`: Get a random joke.
- `-anime`: Get an anime quote.
- `-tts <text>`: Text to speech.
- `-l <song>`: Get lyrics.

### 🛡️ Group Admin
- `-ban @user`: Remove user.
- `-warn @user`: Warn user.
- `-tagall`: Tag everyone.
- `-welcome <msg>`: Set welcome message.
- `-rename <name>`: Rename group.
- `-chat on/off`: Toggle AI chat mode for group.

### 👑 Owner
- `-broadcast <msg>`: Broadcast to all groups.
- `-restart`: Restart bot.
- `-shutdown`: Stop bot.
- `-join <link>`: Join group.
- `-eval <code>`: Execute JS.

## 📂 Project Structure

- `commands/`: Command handlers categorized by folder.
- `functions/`: Core message processing logic.
- `lib/`: Utilities (database, logger, downloader, etc.).
- `models/`: Mongoose schemas.
- `connection.js`: Baileys socket and auth logic.
- `index.js`: Entry point and Express server.

## 📄 License

ISC
