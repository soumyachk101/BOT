# 🤖 AI System Instructions
## WhatsApp Multi-Device Bot — Coding Assistant Guide

---

| Field | Value |
|---|---|
| **Document Type** | AI System Instructions |
| **Purpose** | Paste these instructions as the System Prompt when using any AI coding assistant (Claude, GPT-4, Copilot, etc.) to build this project |
| **Version** | 1.0 |

---

## ✅ SYSTEM PROMPT — COPY THIS EXACTLY

```
You are an expert Node.js developer specializing in WhatsApp bot development 
using the Baileys library (@whiskeysockets/baileys). You write clean, modular, 
well-commented JavaScript (ES2022). You follow best practices for async/await 
error handling, MongoDB/Mongoose schema design, and command-based bot architecture.

CORE RULES — ALWAYS FOLLOW:
1. Use @whiskeysockets/baileys exclusively for all WhatsApp connectivity.
2. Every command module exports an array of command objects with this shape:
   { name, aliases[], description, usage, permission, cooldown, execute }
   where execute is: async (sock, msg, args) => {}
3. Use a command registry pattern — new commands are added by dropping a file 
   into commands/, the registry auto-loads them. Never hardcode command names 
   in the router.
4. Persist ALL state to MongoDB using Mongoose. No in-memory state for things 
   that need to survive restarts (warns, bans, group settings, AI history).
5. Wrap EVERY command execute() and EVERY Baileys socket call in try/catch.
   On error: log it AND send a user-friendly message back to the chat.
6. Never hardcode secrets. All configuration comes from process.env via dotenv.
7. Logger format: [2026-02-13T10:00:00.000Z][INFO] message
   Use levels: INFO, WARN, ERROR, DEBUG
8. Media files: Always use a finally block to clean up temp files, even on error.
   Reject any media over MAX_FILE_SIZE_MB env var (default 50MB).
9. AI (Gemini/OpenAI): Before calling the API, load the last 10 messages for 
   this chatId from MongoDB ChatHistory. Append new messages after receiving 
   the response. Trim history to the last 10 messages before saving.
10. Group commands: ALWAYS check if the bot itself has admin rights in the group 
    before executing moderation actions. If not admin, reply with a clear error.
11. Reconnect logic MUST use exponential back-off:
    delays = [1s, 2s, 4s, 8s, 16s, 30s, 60s]. Reset counter on successful connect.
12. All async operations use async/await — no raw .then()/.catch() chains unless 
    in a context where await cannot be used.
13. Use const/let only, never var.
14. All functions must have JSDoc comments explaining parameters and return values.
```

---

## 📋 TASK-SPECIFIC PROMPTS

Use the prompts below to build specific parts of the bot one at a time.

---

### Prompt T1 — Project Scaffold

```
Using the system prompt rules, create the full project scaffold for the 
WhatsApp bot.

Deliver:
1. package.json with ALL required dependencies:
   @whiskeysockets/baileys, mongoose, express, dotenv, @google/generative-ai,
   openai, @distube/ytdl-core, snapsave-downloader, ffmpeg-static, fluent-ffmpeg, 
   sharp, canvas, pm2 (devDep)

2. .env.example with all variables:
   PREFIX, MY_NUMBER, MONGODB_KEY, GEMINI_API_KEY, OPENAI_API_KEY, 
   PORT, SESSION_ID, MAX_FILE_SIZE_MB, MAX_VIDEO_DURATION

3. .gitignore (node_modules, .env, temp/, auth_info_baileys/, *.log)

4. ecosystem.config.js for pm2

5. lib/logger.js — timestamped logger with INFO/WARN/ERROR/DEBUG levels

6. index.js — starts Express server on PORT, imports and calls startBot() 
   from connection.js. Express routes: GET / (status), GET /qr (QR display), 
   GET /health (connection status JSON)

7. commands/index.js — registry loader that fs.readdirSync's the commands/ 
   subdirectories and builds a Map of commandName → handler
```

---

### Prompt T2 — Connection & Reconnect

```
Build connection.js for the WhatsApp bot.

Requirements:
- Create Baileys socket using makeWASocket with auth state loaded from MongoDB 
  (use the Session model)
- On 'connection.update' event:
  - If QR received: print to terminal AND store for Express /qr endpoint
  - If connection === 'open': log success, reset retry counter
  - If connection === 'close': log reason, trigger reconnect with exponential 
    back-off (delays: 1s, 2s, 4s, 8s, 16s, 30s, 60s)
- On 'creds.update' event: save updated credentials to MongoDB Session model
- Export: startBot(commandRegistry) function that initializes everything 
  and attaches the message handler
- The function should pass the sock and commandRegistry to messageHandler.js

Include full error handling. Use the logger from lib/logger.js.
```

---

### Prompt T3 — Message Handler & Command Router

```
Build functions/messageHandler.js and functions/commandRouter.js.

messageHandler.js:
- Listen to sock.ev.on('messages.upsert')
- Filter out: messages from self, status messages, non-text/non-media messages
- Extract: sender JID, group JID (if applicable), message text, quoted message, 
  attached media type
- Check if message starts with PREFIX (from .env)
  - YES: parse commandName + args array, call commandRouter
  - NO: check if Group.chatEnabled === true for this chatId, if yes forward 
    raw text to Gemini handler

commandRouter.js:
- Accept (sock, msg, commandName, args, registry)
- Look up command in registry by name then aliases
- If not found: silently ignore (no "unknown command" spam)
- Check permission:
  - 'public': pass through
  - 'group-admin': fetch group participant list from Baileys, check if sender 
    is in admins. If not: reply "⛔ This command is for group admins only."
  - 'owner': check sender JID === process.env.MY_NUMBER. If not: reply 
    "⛔ This command is for the bot owner only."
- Check cooldown: use an in-memory Map keyed by `${userJID}:${commandName}`. 
  If within cooldown window: reply "⏳ Please wait Xs before using this command again."
- Execute command.execute(sock, msg, args) wrapped in try/catch
```

---

### Prompt T4 — Media Downloader Commands

```
Build commands/public/media.js for the WhatsApp bot.

Commands to implement:
1. -yt <url>    : Download best YouTube video format under 50MB, send as video message
2. -song <url>  : Download YouTube audio only, send as audio message  
3. -mp3 <url>   : Alias for -song
4. -insta <url> : Download Instagram post/reel/story via snapsave-downloader, 
                  send appropriate media type

For each command:
- Validate URL format with regex before processing
- Send a reaction (⏳) to the user's message to indicate processing
- Download to /tmp/bot_<timestamp>_<random>.<ext>
- Check file size against MAX_FILE_SIZE_MB — if over, attempt ffmpeg compression
- If still over limit after compression: reply "❌ File too large (max 50MB)"
- Send via sock.sendMessage() with correct mimetype
- Use finally block to delete temp file

Also build lib/downloader.js as the shared helper library:
- downloadYouTubeVideo(url, format): returns { filePath, mimeType, fileName }
- downloadYouTubeAudio(url): returns { filePath, mimeType, fileName }
- downloadInstagram(url): returns { filePath, mimeType, fileName }
- compressVideo(inputPath, outputPath, targetSizeMB): returns compressed file path
```

---

### Prompt T5 — Sticker Commands

```
Build commands/public/sticker.js and lib/sticker.js.

Commands:
1. -sticker : Convert quoted/attached image OR video to WhatsApp sticker (.webp)
   - Image: use sharp to convert to 512x512 webp, quality 80
   - Video (under 10 seconds): use fluent-ffmpeg to convert to animated webp 
     under 1MB. Resize to 512x512, strip audio.
   - Send as sticker message type via Baileys

2. -steal : Take a quoted sticker and re-send with custom metadata
   - Pack name: "MyBot Stickers"
   - Author: "WhatsApp Bot"
   - Download the quoted sticker's image data
   - Re-pack with new metadata using sharp + exif injection
   - Send as sticker message

Use finally blocks for all temp file cleanup.
Send "⏳" reaction while processing.
```

---

### Prompt T6 — AI Chat Commands

```
Build commands/public/ai.js and lib/gemini.js and lib/openai.js.

lib/gemini.js:
- Initialize GoogleGenerativeAI with GEMINI_API_KEY
- Export: askGemini(chatId, userMessage) function that:
  1. Loads ChatHistory from MongoDB for chatId
  2. Formats history as Gemini 'contents' array with user/model roles
  3. Appends current userMessage
  4. Calls gemini-1.5-flash model generateContent()
  5. Extracts response text
  6. Appends both user message and model response to ChatHistory
  7. Trims history to last 10 message pairs
  8. Saves to MongoDB
  9. Returns response text
  10. On API error: logs it and throws, do NOT swallow errors

lib/openai.js:
- Fallback if Gemini fails
- Same interface: askOpenAI(chatId, userMessage)

commands/public/ai.js:
- -ai <text> : Chat with Gemini. Try Gemini first, fall back to OpenAI.
  Show typing indicator if possible. Reply with AI response text.
- -chatmode on/off : Toggle chatEnabled in Group schema for the current group.
  (Group admin only — set permission: 'group-admin')
  Reply with "✅ AI chat mode enabled" or "✅ AI chat mode disabled"
```

---

### Prompt T7 — Group Moderation Commands

```
Build commands/group/moderation.js and commands/group/settings.js.

moderation.js — all commands require permission: 'group-admin':

1. -ban @user : 
   - Get target JID from tagged mention or quoted message sender
   - Verify target is not a group admin
   - Call sock.groupParticipantsUpdate(groupJid, [targetJid], 'remove')
   - Log the action

2. -warn @user [reason] :
   - Increment warns count in User MongoDB document for targetJid
   - Add reason to warnReasons array with current date
   - Reply: "⚠️ @user has been warned (2/3). Reason: [reason]"
   - If warns >= Group.maxWarns (default 3): auto-kick the user, reset warns to 0
   - Reply when auto-kicked: "🔴 @user has been removed after reaching max warnings."

3. -tagall :
   - Fetch all participant JIDs from sock.groupMetadata(groupJid).participants
   - Build a message that mentions all of them
   - Send as a single message with the mentions array

settings.js — all commands require permission: 'group-admin':

4. -welcome [message] : Save welcomeMessage to Group schema. 
   Use @user as placeholder for new member name.
   Reply: "✅ Welcome message updated."

5. -rename <n> : 
   - Call sock.groupUpdateSubject(groupJid, newName)
   - Reply: "✅ Group renamed to [newName]"

6. -chat on/off : Toggle chatEnabled in Group schema.
```

---

### Prompt T8 — Fun & Utility Commands

```
Build commands/public/fun.js and commands/public/utility.js.

fun.js:
1. -meme : Fetch a random meme from https://meme-api.com/gimme 
   and send the image with title as caption
2. -joke : Fetch from https://v2.jokeapi.dev/joke/Any?safe-mode 
   and format as a readable message
3. -anime : Fetch from https://animechan.io/api/v1/quotes/random 
   and format as "Quote\n— Character (Anime)"

utility.js:
1. -tts <text> : Convert text to speech audio
   Use Google TTS URL: https://translate.google.com/translate_tts?...
   Download the mp3, send as audio message (ptt: false)

2. -l <song name> : Search for lyrics using lyrics.ovh API or similar free API
   If found: send the lyrics as a text message (truncate at 4000 chars with "...")
   If not found: "❌ Lyrics not found for: [song name]"

3. -help : Auto-generate help text from the command registry
   Group commands by permission level: Public, Group Admin, Owner
   Format: *-commandName* — description\nUsage: -usage
   Send as a formatted text message
```

---

### Prompt T9 — Group Events & Owner Commands

```
Build functions/groupEvents.js and commands/owner/broadcast.js.

groupEvents.js:
- Listen to sock.ev.on('group-participants.update')
- On 'add' (member joined):
  - Load Group settings from MongoDB
  - If welcomeMessage is set: send it to the group, replacing @user with 
    the new member's JID mention
- On 'remove' (member left):
  - If goodbyeMessage is set: send it (same @user substitution)
- On 'promote'/'demote': log the change, update Group.admins in MongoDB

broadcast.js — permission: 'owner':
- -broadcast <message> :
  - Get all group JIDs from sock.groupFetchAllParticipating()
  - Send the message to each group with a 500ms delay between sends 
    (avoid being flagged as spam)
  - Reply to owner: "✅ Broadcast sent to [N] groups."

maintenance.js — permission: 'owner':
- -block <jid> : sock.updateBlockStatus(jid, 'block')
- -unblock <jid> : sock.updateBlockStatus(jid, 'unblock')
```

---

### Prompt T10 — README & Final Assembly

```
Write a comprehensive README.md for the WhatsApp bot project.

Include:
1. Project description and feature overview
2. Prerequisites (Node.js v18+, MongoDB, ffmpeg installed on system)
3. Installation steps:
   - git clone
   - npm install
   - cp .env.example .env and fill in all values
   - npm start
4. QR code scanning instructions (terminal vs browser)
5. Complete command reference table grouped by category:
   | Command | Description | Permission |
6. .env variable reference with descriptions for each
7. pm2 deployment instructions
8. Project structure overview
9. Troubleshooting section:
   - "QR code not showing" 
   - "Bot disconnects frequently"
   - "MongoDB connection failed"
   - "ffmpeg not found"
10. Contributing guide
11. License (MIT)

Make it clear, well-formatted, and beginner-friendly.
```

---

## 🎯 BUILD ORDER CHECKLIST

Follow this order to avoid dependency issues:

- [ ] **T1** — Project scaffold, package.json, logger, index.js
- [ ] **T2** — connection.js (Baileys socket + QR + reconnect)
- [ ] **Database** — lib/database.js + all models/ (User, Group, Session, ChatHistory)
- [ ] **T3** — messageHandler.js + commandRouter.js
- [ ] **T4** — Media commands (YouTube, Instagram)
- [ ] **T5** — Sticker commands
- [ ] **T6** — AI commands (Gemini + memory)
- [ ] **T7** — Group moderation + settings commands
- [ ] **T8** — Fun + utility commands
- [ ] **T9** — Group events + owner commands
- [ ] **T10** — README.md + final review

---

## ⚠️ COMMON MISTAKES TO AVOID

1. **Don't store Baileys auth in files** — always use MongoDB Session model
2. **Don't forget temp file cleanup** — always use `finally` blocks
3. **Don't call sock.sendMessage without try/catch** — connection can drop mid-send
4. **Don't check `msg.key.fromMe` improperly** — Baileys sends events for your own messages too
5. **Don't hardcode the prefix** — always read from `process.env.PREFIX`
6. **Don't block the event loop** — all heavy operations (ffmpeg, downloads) must be async
7. **Don't forget to check bot's own admin status** before group moderation commands
8. **Don't trim ChatHistory before saving** — always trim to last 10 entries to control MongoDB growth

---

*Document Version: 1.0 | Status: Draft*
