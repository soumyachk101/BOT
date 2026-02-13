# 📦 WhatsApp Multi-Device Bot — Document Index

This folder contains all planning and prompt documents for the WhatsApp Bot project.

---

## 📄 Document Overview

| File | Type | Purpose |
|---|---|---|
| `01_PRD_WhatsAppBot.md` | Product Requirements | What to build — features, priorities, user personas, proposed enhancements |
| `02_TRD_WhatsAppBot.md` | Technical Requirements | How to build it — architecture, schemas, file structure, flows |
| `03_AI_Instructions_WhatsAppBot.md` | AI System Prompt | Rules and task-specific prompts for an AI coding assistant |
| `04_Master_Build_Prompt_WhatsAppBot.md` | Master Prompt | Single comprehensive prompt to build the entire bot end-to-end |

---

## 🚀 Quick Start Guide

### To build with an AI coding assistant:

1. **Read the PRD** (`01_PRD_WhatsAppBot.md`) to understand the full scope
2. **Read the TRD** (`02_TRD_WhatsAppBot.md`) for architecture decisions
3. **Open your AI assistant** (Claude, ChatGPT, Copilot, etc.)
4. **Paste the System Prompt** from `03_AI_Instructions_WhatsAppBot.md` into the system/custom instructions field
5. **Send the Master Build Prompt** from `04_Master_Build_Prompt_WhatsAppBot.md` as your first message
6. **Follow the build order** — let the AI complete one step at a time

### Build Order
```
Step 1 → Scaffold + Logger + Database Models
Step 2 → Connection (Baileys, QR, Reconnect)
Step 3 → Message Handler + Command Router
Step 4 → Public Commands (Media, AI, Sticker, Fun, Utility)
Step 5 → Group Commands (Moderation, Settings, Events)
Step 6 → Owner Commands (Broadcast, Maintenance)
Step 7 → README + Final Assembly
```

---

## 💡 Proposed Enhancements (for Future Sprints)

These are recommended features not in the v1.0 scope — prompts for these are in `03_AI_Instructions_WhatsAppBot.md`:

- **Anti-Link Filter** — Auto-delete links in groups
- **Web Admin Dashboard** — Browser-based management panel
- **Cron Scheduler** — Scheduled group announcements
- **Plugin Hot-Loading** — Add commands without restart
- **Multi-Session Support** — Run multiple bot numbers
- **TypeScript Migration** — For long-term maintainability

---

*Generated: February 2026*
