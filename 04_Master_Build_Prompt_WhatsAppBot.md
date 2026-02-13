# 🚀 Master Build Prompt
## WhatsApp Multi-Device Bot — Complete AI Build Instruction

---

| Field | Value |
|---|---|
| **Document Type** | Master Build Prompt |
| **Purpose** | Single prompt to hand to an AI assistant to build the entire bot end-to-end |
| **Version** | 1.0 |

---

## HOW TO USE THIS DOCUMENT

1. Copy the **System Prompt** below and paste it into the "System" or "Custom Instructions" field of your AI assistant
2. Then copy the **Master Build Prompt** and send it as your first message
3. Follow the step-by-step approach — ask the AI to build one module at a time
4. If the AI gets stuck or drifts, re-paste the System Prompt to re-anchor it

---

## ─── SYSTEM PROMPT ───────────────────────────────────────────

```
You are an expert Node.js developer specializing in WhatsApp bot development 
using the Baileys library. You write clean, modular, well-commented JavaScript (ES2022).

ALWAYS FOLLOW THESE RULES:
- Use @whiskeysockets/baileys for all WhatsApp connectivity
- Every command exports: { name, aliases, description, usage, permission, cooldown, execute }
- execute signature: async (sock, msg, args) => {}
- Permission values: 'public' | 'group-admin' | 'owner'
- Command registry: auto-loads from commands/ subdirectories — no hardcoding in router
- All state persisted to MongoDB via Mongoose — no in-memory state for critical data
- Every command + every sock call wrapped in try/catch
- User-friendly error messages sent back to chat on failure
- Logger format: [ISO_TIMESTAMP][LEVEL] message (levels: INFO/WARN/ERROR/DEBUG)
- Media: finally block for temp file cleanup, reject files > MAX_FILE_SIZE_MB
- AI memory: load+save last 10 messages per chatId in MongoDB ChatHistory
- Group commands: check bot has admin rights before executing moderation
- Reconnect: exponential back-off [1s, 2s, 4s, 8s, 16s, 30s, 60s], reset on connect
- async/await throughout, const/let only, JSDoc on all exported functions
- Never hardcode secrets — all config via process.env + dotenv
```

---

## ─── MASTER BUILD PROMPT ─────────────────────────────────────

```
Build a fully functional, production-ready WhatsApp multi-device bot in Node.js.

Follow the system prompt rules strictly throughout.

═══════════════════════════════════════════════
TECH STACK
═══════════════════════════════════════════════

Runtime:       Node.js v18+ LTS
WhatsApp:      @whiskeysockets/baileys (multi-device)
Database:      MongoDB + Mongoose
AI Primary:    @google/generative-ai (Gemini)
AI Fallback:   openai SDK
YouTube:       @distube/ytdl-core
Instagram:     snapsave-downloader
Media:         ffmpeg-static, fluent-ffmpeg, sharp, canvas
Server:        express
Config:        dotenv
Process Mgr:   pm2

═══════════════════════════════════════════════
COMMANDS TO IMPLEMENT
═══════════════════════════════════════════════

── PUBLIC (all users) ─────────────────────────

  -yt <url>
    Download YouTube video (best format, max 50MB)
    Send as WhatsApp video message

  -song <url>  /  -mp3 <url>
    Download YouTube audio only
    Send as WhatsApp audio message

  -insta <url>
    Download Instagram post, reel, or story
    Auto-detect and send as correct media type

  -sticker
    Convert quoted/attached image or video to .webp sticker
    Image: sharp, 512x512
    Video: ffmpeg animated webp, max 1MB, max 10s

  -steal
    Re-package quoted sticker with bot metadata
    Pack: "MyBot Stickers", Author: "WhatsApp Bot"

  -tts <text>
    Convert text to speech, send as voice note

  -l <song name>
    Fetch and send song lyrics (truncate at 4000 chars)

  -meme
    Fetch random meme from meme-api.com, send as image

  -joke
    Fetch safe-mode joke from jokeapi.dev, send as text

  -anime
    Fetch anime quote from animechan.io, send as text

  -ai <text>
    Send text to Gemini AI (with MongoDB chat memory)
    Fall back to OpenAI if Gemini fails

  -help
    Auto-generate command list from registry
    Grouped by permission level, formatted text message

── GROUP ADMIN (admin only) ───────────────────

  -ban @user
    Remove tagged user from group
    Check bot has admin rights first

  -warn @user [reason]
    Add warning to user in MongoDB (User.warns++)
    Reply with current warn count: "⚠️ 2/3 warnings"
    Auto-kick when warns >= Group.maxWarns (default: 3)

  -tagall
    Mention all group participants in one message

  -welcome [message]
    Save welcome message to Group schema (@user = placeholder)

  -rename <n>
    Change group subject via sock.groupUpdateSubject()

  -chat on/off
    Toggle Group.chatEnabled for AI chat mode

── OWNER ONLY ─────────────────────────────────

  -broadcast <message>
    Send message to all groups (500ms delay between sends)
    Reply to owner with group count

  -block <jid>
    Block a contact

  -unblock <jid>
    Unblock a contact

═══════════════════════════════════════════════
ENVIRONMENT VARIABLES
═══════════════════════════════════════════════

PREFIX=-
MY_NUMBER=91XXXXXXXXXX@s.whatsapp.net
MONGODB_KEY=mongodb+srv://...
GEMINI_API_KEY=...
OPENAI_API_KEY=...
PORT=8000
SESSION_ID=whatsapp-session-1
MAX_FILE_SIZE_MB=50
MAX_VIDEO_DURATION=600

═══════════════════════════════════════════════
MONGODB SCHEMAS
═══════════════════════════════════════════════

User:        { jid, name, warns, warnReasons[], isBanned, banExpiry, lastSeen, commandCount }
Group:       { id, name, welcomeMessage, goodbyeMessage, isAntiLink, isAntiSpam, chatEnabled, maxWarns, admins[] }
Session:     { sessionId, data (Mixed), updatedAt }
ChatHistory: { chatId, messages[{role, content, timestamp}], updatedAt }
             (messages capped at last 10 entries)

═══════════════════════════════════════════════
PROJECT STRUCTURE
═══════════════════════════════════════════════

WhatsAppBotMultiDevice/
├── index.js                 ← Express + bot start
├── connection.js            ← Baileys socket, QR, reconnect
├── ecosystem.config.js      ← pm2 config
├── .env.example
├── .gitignore
├── package.json
├── README.md
│
├── commands/
│   ├── index.js             ← Registry auto-loader
│   ├── public/
│   │   ├── media.js
│   │   ├── ai.js
│   │   ├── sticker.js
│   │   ├── fun.js
│   │   └── utility.js
│   ├── group/
│   │   ├── moderation.js
│   │   └── settings.js
│   └── owner/
│       ├── broadcast.js
│       └── maintenance.js
│
├── functions/
│   ├── messageHandler.js
│   ├── commandRouter.js
│   └── groupEvents.js
│
├── lib/
│   ├── database.js
│   ├── gemini.js
│   ├── openai.js
│   ├── downloader.js
│   ├── sticker.js
│   ├── logger.js
│   └── utils.js
│
└── models/
    ├── User.js
    ├── Group.js
    ├── Session.js
    └── ChatHistory.js

═══════════════════════════════════════════════
KEY TECHNICAL REQUIREMENTS
═══════════════════════════════════════════════

1. QR CODE
   - Print to terminal during first login
   - Store QR data string in memory
   - Serve at Express GET /qr as an HTML page with QR rendered via qrcode.js CDN

2. SESSION PERSISTENCE
   - Save Baileys auth state to MongoDB Session model on every creds.update event
   - Load from MongoDB on startup
   - If no session found: start fresh (show QR)

3. RECONNECT
   - On connection close: log disconnect reason
   - Wait with exponential back-off before reconnecting
   - Delays: [1000, 2000, 4000, 8000, 16000, 30000, 60000] ms
   - Reset retry counter on successful reconnect

4. COMMAND COOLDOWNS
   - Track last use in-memory Map: key = "jid:commandName"
   - If within cooldown window: reply with remaining time, do not execute

5. WELCOME/GOODBYE MESSAGES
   - Listen to group-participants.update events
   - On 'add': send Group.welcomeMessage (replace @user with JID mention)
   - On 'remove': send Group.goodbyeMessage (same substitution)

6. MEDIA DOWNLOAD PIPELINE
   - React to user's message with ⏳ emoji before starting
   - Download to /tmp/bot_<uuid>.<ext>
   - Validate file size after download
   - Use ffmpeg to compress if slightly over limit
   - Always delete temp files in finally block
   - React with ✅ or ❌ when complete

7. AI CHAT MODE
   - When Group.chatEnabled = true, all non-command messages in that group
     are forwarded to Gemini with chat history context
   - History stored in ChatHistory model, trimmed to 10 messages

═══════════════════════════════════════════════
BUILD ORDER — DO IT IN THIS SEQUENCE
═══════════════════════════════════════════════

Step 1: Scaffold
  → package.json (all deps), .env.example, .gitignore, ecosystem.config.js
  → lib/logger.js
  → lib/database.js + all models/

Step 2: Connection
  → connection.js (socket + QR + reconnect + session save/load)
  → index.js (Express routes + call startBot)

Step 3: Routing
  → commands/index.js (registry auto-loader)
  → functions/messageHandler.js
  → functions/commandRouter.js

Step 4: Public Commands
  → lib/downloader.js + commands/public/media.js
  → lib/sticker.js + commands/public/sticker.js
  → lib/gemini.js + lib/openai.js + commands/public/ai.js
  → commands/public/fun.js
  → commands/public/utility.js

Step 5: Group Commands
  → commands/group/moderation.js
  → commands/group/settings.js
  → functions/groupEvents.js

Step 6: Owner Commands
  → commands/owner/broadcast.js
  → commands/owner/maintenance.js

Step 7: Finalize
  → README.md (full setup guide + command reference)
  → Final review and integration test

═══════════════════════════════════════════════
ERROR HANDLING CHECKLIST
═══════════════════════════════════════════════

Every command must handle:
  ✓ Missing required argument → send usage instructions
  ✓ Insufficient permissions → send clear error message  
  ✓ Bot not admin (group commands) → send "I need admin rights" message
  ✓ Media too large → send "File too large" message
  ✓ API failure (AI, lyrics, meme) → send "Service unavailable, try again"
  ✓ Invalid URL → send "Please provide a valid URL"
  ✓ Network timeout → send "Request timed out, try again"
  ✓ Temp file cleanup → ALWAYS in finally block

═══════════════════════════════════════════════
START BUILDING — BEGIN WITH STEP 1
═══════════════════════════════════════════════
Start with Step 1: Generate package.json, .env.example, .gitignore, 
ecosystem.config.js, lib/logger.js, lib/database.js, and all Mongoose models.
Then wait for my confirmation before proceeding to Step 2.
```

---

## ─── FOLLOW-UP PROMPTS ───────────────────────────────────────

Use these after the initial build to enhance and debug:

### Fix a specific command
```
The -[commandName] command has an issue: [describe the problem].
Here is the current code:
[paste code]
Fix it following the system prompt rules.
```

### Add a new command
```
Add a new command to the bot following all system prompt rules:

Command: -[name]
Aliases: [list]
Description: [what it does]
Permission: [public / group-admin / owner]
Cooldown: [seconds]
Behavior: [detailed description of what it should do]

Add it to the appropriate commands/ subfolder.
Update the README command table.
```

### Add the Anti-Link filter (Enhancement)
```
Implement the anti-link filter feature for groups:

- Add isAntiLink boolean to Group schema (already exists)
- Add -antilink on/off command (group admin only) to toggle it
- In messageHandler.js: if Group.isAntiLink is true, check every message 
  for URLs using a regex. If a URL is detected and the sender is NOT a 
  group admin: delete the message and warn the user (-warn behavior).
- Reply in group: "🔗 Links are not allowed in this group, @user."
```

### Add Scheduler (Enhancement)
```
Implement a scheduled announcements feature:

Dependencies: node-cron

New command: -schedule <time_24h> <message>
  Example: -schedule 09:00 Good morning everyone!
  Permission: group-admin
  Behavior: Save a cron job entry to MongoDB (new Schedule model)
  At the scheduled time each day, send the message to that group.

New model: Schedule { groupId, time (HH:MM), message, createdBy, isActive }

In index.js: On startup, load all active Schedule documents and register 
cron jobs for each one.
```

### Add Web Dashboard (Enhancement)
```
Add a basic web admin dashboard served by Express.

Route: GET /dashboard (serve an HTML page)
Features:
1. Show bot connection status (connected / reconnecting)
2. List all groups the bot is in (from sock.groupFetchAllParticipating())
3. For each group: show member count, chatEnabled status, antiLink status
4. Button to toggle chatEnabled / antiLink per group (POST /api/group/:id/toggle)
5. Show last 20 log lines (store in memory ring buffer of 20 entries in logger.js)
6. Basic auth protection: compare Authorization header against DASHBOARD_PASSWORD env var

Use vanilla HTML + TailwindCSS CDN. No React, keep it a single HTML file.
```

---

*Document Version: 1.0 | Status: Ready to Use*
