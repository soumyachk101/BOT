const logger = require('../lib/logger');
const { routeCommand } = require('./commandRouter');
const Group = require('../models/Group');

// Helper to check if string contains URL - for future anti-link feature
const hasUrl = (text) => /(https?:\/\/[^\s]+)/g.test(text);

/**
 * Handles incoming messages from Baileys.
 * @param {object} sock - The Baileys socket instance.
 * @param {object} m - The upsert event object.
 * @param {Map} commandRegistry - The command registry.
 */
const messageHandler = async (sock, m, commandRegistry) => {
    const msg = m.messages[0];
    if (!msg || !msg.message) return;
    if (msg.key.fromMe) return; // Ignore self-messages

    try {
        // 1. Extract message text
        // Handle different message types: conversation, extendedTextMessage, imageMessage caption, videoMessage caption
        const messageType = Object.keys(msg.message)[0];
        let body =
            messageType === 'conversation' ? msg.message.conversation :
                messageType === 'extendedTextMessage' ? msg.message.extendedTextMessage.text :
                    messageType === 'imageMessage' ? msg.message.imageMessage.caption :
                        messageType === 'videoMessage' ? msg.message.videoMessage.caption :
                            '';

        if (!body) return; // Non-text message or type we don't handle text parsing for

        const sender = msg.key.participant || msg.key.remoteJid;
        const isGroup = msg.key.remoteJid.endsWith('@g.us');
        const groupJid = isGroup ? msg.key.remoteJid : null;

        // 2. Check for Prefix
        const prefix = process.env.PREFIX || '-';
        logger.info(`Received message: ${body} | Prefix: ${prefix}`); // DEBUG LOG

        if (body.startsWith(prefix)) {
            // --- COMMAND FLOW ---
            const args = body.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            logger.info(`Command detected: ${commandName}`); // DEBUG LOG

            await routeCommand(sock, msg, commandName, args, commandRegistry);
        } else {
            // --- CHAT / AI FLOW ---
            // If no prefix, check if AI chat is enabled for this group
            // If it's a DM, we might enable AI by default or check User preference (not in scope yet, assuming Group enable only for now per PRD)

            // Per PRD F3.8: Toggle AI chat mode -chat on/off
            // Per PRD 5.3: "check if Group.chatEnabled === true for this chatId"

            if (isGroup) {
                // Optimization: Maybe cache this in memory to avoid DB hit on every message?
                // For now, we query DB as per "Persist all state" rule.
                const groupParams = await Group.findOne({ id: groupJid });
                if (groupParams && groupParams.chatEnabled) {
                    // Forward to Gemini handler (Placeholder for now, Step 4 implements this)
                    // We will implement `askGemini` in Step 4.
                    // For now, just log or do nothing.
                    // logger.debug(`AI Chat triggered for group ${groupJid}`);
                    // await require('../lib/gemini').askGemini(sock, msg, body); // Future integration within try/catch
                }
            }
        }
    } catch (err) {
        logger.error('Error in messageHandler:', err);
    }
};

module.exports = messageHandler;
