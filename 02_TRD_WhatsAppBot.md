# ⚙️ Technical Requirements Document (TRD)
## WhatsApp Multi-Device Bot

---

| Field | Value |
|---|---|
| **Product Name** | WhatsAppBotMultiDevice |
| **Version** | 1.0 |
| **Date** | February 2026 |
| **Document Type** | Technical Requirements Document |

---

## 1. System Architecture

### 1.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER (WhatsApp App)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │  WebSocket (Baileys)
┌──────────────────────────▼──────────────────────────────────┐
│                   connection.js                             │
│         (Socket Management, QR Login, Reconnect)           │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│               functions/messageHandler.js                   │
│        (Parse incoming messages, identify commands)         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│               functions/commandRouter.js                    │
│    (Registry lookup, permission check, rate limiting)       │
└───────┬──────────────────┬───────────────────┬─────────────┘
        │                  │                   │
┌───────▼───────┐  ┌───────▼───────┐  ┌────────▼──────┐
│ commands/     │  │ commands/     │  │ commands/     │
│ public/       │  │ group/        │  │ owner/        │
└───────┬───────┘  └───────┬───────┘  └────────┬──────┘
        │                  │                   │
┌───────▼───────────────────▼───────────────────▼──────────┐
│                        lib/                              │
│   gemini.js | downloader.js | sticker.js | utils.js     │
└───────────────────────────┬──────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────┐
│                     MongoDB                              │
│         (users, groups, sessions, warns, chat history)  │
└──────────────────────────────────────────────────────────┘
```

### 1.2 Express Web Server (Parallel)

```
Express Server (index.js)
├── GET /          → Status page
├── GET /qr        → QR code display for WhatsApp login
└── GET /health    → Health check endpoint (uptime, connection status)
```

---

## 2. Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Runtime | Node.js | v18+ LTS | Application runtime |
| WhatsApp | `@whiskeysockets/baileys` | Latest | WhatsApp multi-device connectivity |
| Database | MongoDB | Atlas / v6+ | Data persistence |
| ORM | Mongoose | v7+ | Schema modeling and queries |
| Web Server | Express.js | v4+ | QR code serving, health checks |
| Media | ffmpeg | Latest | Video/audio conversion |
| Media | sharp | Latest | Image processing, webp conversion |
| Media | canvas | Latest | Image compositing |
| AI Primary | `@google/generative-ai` | Latest | Gemini AI integration |
| AI Fallback | `openai` | Latest | OpenAI GPT fallback |
| YouTube | `@distube/ytdl-core` | Latest | YouTube media downloading |
| Instagram | `snapsave-downloader` | Latest | Instagram media downloading |
| Config | dotenv | Latest | Environment variable loading |
| Process Mgr | pm2 | Latest | Production process management |

---

## 3. Project Structure

```
WhatsAppBotMultiDevice/
│
├── index.js                        # Entry point: starts Express + initializes bot
├── connection.js                   # Baileys socket, QR code, reconnect logic
├── ecosystem.config.js             # pm2 configuration
├── .env                            # Secrets (NEVER commit this)
├── .env.example                    # Template for .env
├── .gitignore
├── package.json
├── README.md
│
├── commands/
│   ├── index.js                    # Command registry loader (auto-loads all modules)
│   │
│   ├── public/                     # Available to all users
│   │   ├── media.js                # -yt, -vs, -song, -mp3, -insta, -idp
│   │   ├── ai.js                   # -ai, -imagine (proposed)
│   │   ├── sticker.js              # -sticker, -steal
│   │   ├── fun.js                  # -meme, -joke, -anime
│   │   └── utility.js              # -tts, -l, -help
│   │
│   ├── group/                      # Group admin only
│   │   ├── moderation.js           # -ban, -warn, -tagall, -promote, -demote
│   │   ├── settings.js             # -welcome, -rename, -chat
│   │   └── info.js                 # -groupinfo, -members
│   │
│   └── owner/                      # Bot owner only (verified by JID)
│       ├── broadcast.js            # -broadcast
│       └── maintenance.js          # -block, -unblock, -restart
│
├── functions/
│   ├── messageHandler.js           # Parses all incoming messages
│   ├── commandRouter.js            # Routes parsed commands to handlers
│   ├── groupEvents.js              # Handles join/leave/promote/demote events
│   └── reconnect.js                # Exponential back-off reconnect logic
│
├── lib/
│   ├── database.js                 # MongoDB connection + helper functions
│   ├── gemini.js                   # Gemini AI API wrapper
│   ├── openai.js                   # OpenAI API wrapper (fallback)
│   ├── downloader.js               # YouTube + Instagram download helpers
│   ├── sticker.js                  # Image/video → .webp sticker conversion
│   ├── logger.js                   # Timestamped logger utility
│   └── utils.js                    # General helpers (formatters, validators, JID parser)
│
├── models/
│   ├── User.js                     # User schema (warns, bans, stats)
│   ├── Group.js                    # Group settings schema
│   ├── Session.js                  # Baileys auth session schema
│   └── ChatHistory.js              # AI conversation history schema
│
└── public/
    └── index.html                  # QR code display page (served by Express)
```

---

## 4. Database Schemas

### 4.1 User Schema
```js
// models/User.js
{
  jid:          { type: String, required: true, unique: true },  // WhatsApp JID
  name:         { type: String },
  warns:        { type: Number, default: 0 },
  warnReasons:  [{ reason: String, date: Date }],
  isBanned:     { type: Boolean, default: false },
  banExpiry:    { type: Date, default: null },                   // null = permanent
  lastSeen:     { type: Date },
  commandCount: { type: Number, default: 0 },
  createdAt:    { type: Date, default: Date.now }
}
```

### 4.2 Group Schema
```js
// models/Group.js
{
  id:             { type: String, required: true, unique: true }, // Group JID
  name:           { type: String },
  welcomeMessage: { type: String, default: 'Welcome to the group, @user!' },
  goodbyeMessage: { type: String, default: 'Goodbye, @user!' },
  isAntiLink:     { type: Boolean, default: false },
  isAntiSpam:     { type: Boolean, default: false },
  chatEnabled:    { type: Boolean, default: false },             // AI chat mode
  maxWarns:       { type: Number, default: 3 },
  admins:         [String],
  updatedAt:      { type: Date, default: Date.now }
}
```

### 4.3 Session Schema
```js
// models/Session.js
{
  sessionId:  { type: String, required: true, unique: true },
  data:       { type: mongoose.Schema.Types.Mixed },             // Baileys auth state
  updatedAt:  { type: Date, default: Date.now }
}
```

### 4.4 Chat History Schema (AI Memory)
```js
// models/ChatHistory.js
{
  chatId:    { type: String, required: true, unique: true },     // JID (user or group)
  messages:  [{
    role:      { type: String, enum: ['user', 'model'] },
    content:   { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  updatedAt: { type: Date, default: Date.now }
}
// Capped at last 10 messages per chat
```

---

## 5. Command Module Structure

Every command module exports an array of command objects following this interface:

```js
// Example: commands/public/utility.js
module.exports = [
  {
    name: 'tts',
    aliases: ['texttospeech'],
    description: 'Convert text to a voice note',
    usage: '-tts Hello world',
    permission: 'public',          // 'public' | 'group-admin' | 'owner'
    cooldown: 5,                   // seconds
    execute: async (sock, msg, args) => {
      // Command logic here
    }
  }
]
```

---

## 6. Command Routing Flow

```
1. Message received via Baileys event listener
2. messageHandler.js checks:
   a. Is sender the bot itself?  → Ignore
   b. Does message start with PREFIX? → Continue
   c. No prefix + chatEnabled for this chat? → Forward to Gemini
3. Parse: commandName = text.slice(PREFIX.length).split(' ')[0].toLowerCase()
4. commandRouter.js looks up commandName in registry (checks name + aliases)
5. Permission check:
   - 'public'       → Always allowed
   - 'group-admin'  → Check if sender JID is in group admins array
   - 'owner'        → Check if sender JID === MY_NUMBER from .env
6. Cooldown check: Has user used this command within cooldown period?
7. Execute command handler with (sock, msg, args)
8. On error: catch, log, send user-friendly error message to chat
```

---

## 7. Connection & Reconnect Logic

```js
// Exponential back-off reconnect
const RETRY_INTERVALS = [1000, 2000, 4000, 8000, 16000, 30000, 60000]

async function connect(retryCount = 0) {
  try {
    const sock = makeWASocket({ ... })
    sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
      if (connection === 'close') {
        const delay = RETRY_INTERVALS[Math.min(retryCount, RETRY_INTERVALS.length - 1)]
        setTimeout(() => connect(retryCount + 1), delay)
      }
      if (connection === 'open') {
        retryCount = 0  // Reset on successful connect
      }
    })
  } catch (err) {
    logger.error('Connection failed:', err)
  }
}
```

---

## 8. Media Download Flow

```
User: -yt https://youtube.com/watch?v=xxxxx

1. Validate URL format (regex check)
2. Call ytdl-core getInfo() to fetch video metadata
3. Check video duration — reject if > 10 minutes (configurable)
4. Select best format under 50MB
5. Send "⏳ Downloading..." reaction to user's message
6. Stream download to temp file: /tmp/yt_<timestamp>.<ext>
7. Check file size — if > 50MB, attempt ffmpeg compression
8. If still too large, send error: "❌ File too large to send via WhatsApp (max 50MB)"
9. Send file via sock.sendMessage() with correct mimetype
10. Delete temp file (always, even on error — use finally block)
```

---

## 9. AI Chat Flow

```
User (chat mode ON): "What is the capital of France?"

1. messageHandler detects no prefix + chatEnabled = true for this chatId
2. Load last 10 messages from ChatHistory collection for this chatId
3. Append current user message to history array
4. Send full history to Gemini via gemini.js wrapper
5. Receive response text from Gemini
6. Append model response to ChatHistory (trim to last 10 messages)
7. Save updated ChatHistory to MongoDB
8. Send response text back to WhatsApp chat
```

---

## 10. Environment Variables

```env
# Bot Configuration
PREFIX=-                                      # Command prefix character
MY_NUMBER=91XXXXXXXXXX@s.whatsapp.net         # Bot owner's WhatsApp JID

# Database
MONGODB_KEY=mongodb+srv://user:pass@cluster   # MongoDB connection string

# AI
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here       # Optional fallback

# Server
PORT=8000                                     # Express server port

# Session
SESSION_ID=whatsapp-session-1                 # Unique ID for this bot session

# Media Limits
MAX_FILE_SIZE_MB=50                           # Max media file size in MB
MAX_VIDEO_DURATION=600                        # Max video duration in seconds
```

---

## 11. Error Handling Strategy

| Error Type | Handling |
|---|---|
| Invalid command args | Send usage instructions back to chat |
| Missing permissions | Send clear permission denied message |
| Media too large | Send file size error; clean up temp file |
| API failure (Gemini) | Retry once; fall back to OpenAI; send generic error |
| MongoDB connection lost | Log error; attempt reconnect; commands that need DB respond with "try again" |
| Baileys socket closed | Trigger exponential back-off reconnect |
| Unhandled rejection | Log + alert owner via DM (proposed) |
| Temp file not deleted | Wrap all file ops in `finally` block for guaranteed cleanup |

---

## 12. Security Considerations

- `.env` file is in `.gitignore` — never committed
- Owner commands verified by exact JID match against `MY_NUMBER` env var
- No user input is ever passed directly to shell commands
- All MongoDB queries use Mongoose (parameterized — no injection risk)
- Rate limiting per user prevents command flooding
- Sessions stored in MongoDB (not plaintext files)

---

## 13. Deployment

### Local Development
```bash
npm install
cp .env.example .env
# Fill in .env values
npm start
```

### Production (pm2)
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### ecosystem.config.js
```js
module.exports = {
  apps: [{
    name: 'whatsapp-bot',
    script: 'index.js',
    watch: false,
    max_memory_restart: '500M',
    env: { NODE_ENV: 'production' }
  }]
}
```

---

*Document Version: 1.0 | Status: Draft*
