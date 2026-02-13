# 📋 Product Requirements Document (PRD)
## WhatsApp Multi-Device Bot

---

| Field | Value |
|---|---|
| **Product Name** | WhatsAppBotMultiDevice |
| **Version** | 1.0 |
| **Date** | February 2026 |
| **Document Type** | Product Requirements Document |

---

## 1. Executive Summary

WhatsAppBotMultiDevice is a self-hosted, multi-purpose WhatsApp automation bot built on Node.js. It uses the Baileys multi-device library to connect to WhatsApp without requiring a business account or official API access.

The bot serves three audiences: regular users who want utilities like media downloading and AI chat, group administrators who need moderation tools, and the bot owner who manages configuration and operations.

---

## 2. Problem Statement

WhatsApp lacks native tools for:
- Downloading media from YouTube, Instagram, and other platforms directly in chat
- Intelligent AI-powered conversational assistance
- Automated group moderation (warnings, anti-spam, anti-link)
- Entertainment utilities (stickers, memes, TTS)

This bot solves all of these inside WhatsApp — the platform where users already spend significant time — without requiring them to switch apps.

---

## 3. Goals & Objectives

- Deliver a self-hosted, feature-rich WhatsApp automation bot accessible via simple prefix commands
- Enable non-technical users to interact using commands like `-yt`, `-ban`, `-ai`
- Provide group admins with powerful, reliable moderation tools
- Integrate AI (Gemini/OpenAI) for intelligent, context-aware responses
- Persist all state, sessions, and user data reliably via MongoDB
- Ensure the bot is resilient — auto-reconnecting on failures, handling errors gracefully

---

## 4. User Personas

### 4.1 End User (General Public)
- **Who:** Regular WhatsApp user in a group or DM with the bot
- **Goals:** Download YouTube videos, create stickers, get jokes, chat with AI
- **Pain Points:** Has to switch apps to download media or generate stickers
- **Commands Used:** `-yt`, `-sticker`, `-ai`, `-meme`, `-tts`

### 4.2 Group Admin
- **Who:** Community manager running a WhatsApp group
- **Goals:** Moderate members, set rules, automate welcomes, tag everyone
- **Pain Points:** Manual moderation is slow; WhatsApp has no native warn/ban system
- **Commands Used:** `-ban`, `-warn`, `-tagall`, `-welcome`, `-chat`

### 4.3 Bot Owner (Operator/Developer)
- **Who:** The person who hosts and maintains the bot
- **Goals:** Configure bot, broadcast messages, manage credentials, monitor health
- **Pain Points:** Needs owner-only control over bot operations
- **Commands Used:** `-broadcast`, `-block`, `-unblock`

---

## 5. Feature Requirements

### 5.1 F1 — Media Downloader

| ID | Feature | Priority | Notes |
|---|---|---|---|
| F1.1 | YouTube video download `-yt`, `-vs` | **High** | Select best format under 50MB |
| F1.2 | YouTube audio download `-song`, `-mp3` | **High** | Send as audio message |
| F1.3 | Instagram posts, reels, stories `-insta`, `-idp` | **High** | Via snapsave-downloader |
| F1.4 | Generic URL media download | Medium | Fallback for other platforms |
| F1.5 | Auto-compress large videos before sending | Medium | Use ffmpeg if over 50MB |
| F1.6 | Download progress indicator via emoji reaction | Low | UX enhancement |

### 5.2 F2 — AI & Utilities

| ID | Feature | Priority | Notes |
|---|---|---|---|
| F2.1 | Gemini AI chat `-ai` | **High** | Primary AI provider |
| F2.2 | OpenAI fallback integration | Medium | Fallback if Gemini fails |
| F2.3 | Sticker creation from image/video `-sticker` | **High** | Convert to .webp |
| F2.4 | Steal sticker with metadata `-steal` | Medium | Re-tag with bot metadata |
| F2.5 | Text-to-Speech `-tts` | Medium | Send as voice note |
| F2.6 | Song lyrics `-l` | Low | Via lyrics API |
| F2.7 | AI image generation `-imagine` | Low | **Proposed Enhancement** |
| F2.8 | URL/article summarizer `-summarize` | Low | **Proposed Enhancement** |

### 5.3 F3 — Group Management

| ID | Feature | Priority | Notes |
|---|---|---|---|
| F3.1 | Kick/ban member `-ban @user` | **High** | Bot must be admin |
| F3.2 | Promote/demote admin | **High** | Owner/admin only |
| F3.3 | Tag all members `-tagall` | **High** | Single message with all mentions |
| F3.4 | Warn user `-warn @user [reason]` | **High** | Persist count in MongoDB |
| F3.5 | Auto-kick at max warning threshold | Medium | Default: 3 warns |
| F3.6 | Custom welcome message `-welcome [msg]` | Medium | Stored in Group schema |
| F3.7 | Rename group `-rename <name>` | Medium | Admin only |
| F3.8 | Toggle AI chat mode `-chat on/off` | Medium | Per-group setting |
| F3.9 | Anti-link filter | Medium | **Proposed Enhancement** |
| F3.10 | Anti-spam rate limiting | Medium | **Proposed Enhancement** |
| F3.11 | Scheduled group announcements | Low | **Proposed Enhancement** |

### 5.4 F4 — Fun & Entertainment

| ID | Feature | Priority | Notes |
|---|---|---|---|
| F4.1 | Random meme `-meme` | Medium | Via public meme API |
| F4.2 | Random joke `-joke` | Low | Via joke API |
| F4.3 | Anime quote `-anime` | Low | Via anime quotes API |
| F4.4 | Polls `-poll` | Low | **Proposed Enhancement** |
| F4.5 | Trivia game `-trivia` | Low | **Proposed Enhancement** |

### 5.5 F5 — Core Bot Infrastructure

| ID | Feature | Priority | Notes |
|---|---|---|---|
| F5.1 | QR Code login via terminal and browser | **High** | `localhost:8000` fallback |
| F5.2 | MongoDB session persistence | **High** | Survive restarts |
| F5.3 | Prefix-based command routing | **High** | Configurable via `.env` |
| F5.4 | Owner-only command tier | **High** | Verified by JID |
| F5.5 | Rate limiting per user | Medium | Prevent abuse |
| F5.6 | Command cooldowns | Medium | Per-command cooldown config |
| F5.7 | `-help` command listing all commands | Medium | Auto-generated from registry |
| F5.8 | HTTP dashboard for health and logs | Low | **Proposed Enhancement** |

---

## 6. Proposed Enhancements

These features go beyond the original scope and are recommended for future sprints:

### 6.1 Plugin / Hot-Load Architecture
Allow new command modules to be loaded at runtime without restarting the bot. A developer drops a `.js` file into the `commands/` folder and it auto-registers via a file watcher. This dramatically reduces deployment friction.

### 6.2 Web Admin Dashboard
A simple admin panel served by Express — built in React or plain HTML — that lets the bot owner manage groups, view real-time logs, toggle settings, and monitor active sessions without touching the code or terminal.

### 6.3 AI Context Memory
Store the last 10 messages per chat (user or group) in MongoDB. When the user runs `-ai` or has chat mode enabled, send this history as context to Gemini so it can maintain coherent multi-turn conversations.

### 6.4 Anti-Abuse System
Track command usage per user. If a user sends more than N commands within a time window, automatically temp-ban them from using the bot. Store ban expiry in MongoDB.

### 6.5 Broadcast Manager
An owner-only command (`-broadcast`) that sends a message to all groups the bot is a member of, or to all saved DM contacts. Supports templating with group name substitution.

### 6.6 Cron Scheduler
Allow group admins to schedule announcements via a command: `-schedule 09:00 Good morning everyone!`. Jobs stored in MongoDB, executed by a node-cron worker.

### 6.7 Multi-Session Support
Run multiple WhatsApp numbers from a single deployment. Each session gets its own Baileys socket and MongoDB entry. Useful for scaling across many groups or operating different bots simultaneously.

### 6.8 TypeScript Migration
Migrate the codebase from JavaScript to TypeScript. Benefits include: type safety, better IDE autocomplete, catch errors at compile time, and improved long-term maintainability. Migrate incrementally module by module.

---

## 7. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Uptime** | Auto-reconnect on connection drops with exponential back-off |
| **Latency** | Non-media command responses delivered in under 3 seconds |
| **Security** | `.env` never committed to version control; secrets via env vars only |
| **Scalability** | MongoDB Atlas compatible for cloud scaling |
| **Logging** | All commands, errors, and events logged with timestamps |
| **Media** | All downloaded files capped at 50MB; auto-cleanup of temp files |
| **Reliability** | `unhandledRejection` and `uncaughtException` caught at process level |

---

## 8. Out of Scope (v1.0)

- WhatsApp Business API integration
- Payment processing
- Native mobile/desktop app
- Multi-language UI (bot responses are English only)
- End-to-end encrypted message storage

---

## 9. Success Metrics

| Metric | Target |
|---|---|
| Bot uptime per week | > 95% |
| Command response time (non-media) | < 3 seconds |
| Successful media downloads | > 90% success rate |
| Auto-reconnect recovery time | < 30 seconds |

---

*Document Version: 1.0 | Status: Draft*
