const gemini = require('../../lib/gemini');
const openai = require('../../lib/openai');
const logger = require('../../lib/logger');
const Group = require('../../models/Group');

module.exports = [
    {
        name: 'ai',
        aliases: ['gemini', 'gpt'],
        description: 'Chat with AI',
        usage: '-ai <text>',
        permission: 'public',
        cooldown: 5,
        execute: async (sock, msg, args) => {
            const text = args.join(' ');
            if (!text) {
                await sock.sendMessage(msg.key.remoteJid, { text: '❓ ERROR: What do you want to ask?' }, { quoted: msg });
                return;
            }

            await sock.sendMessage(msg.key.remoteJid, { react: { text: "🧠", key: msg.key } });

            try {
                // Try Gemini
                const response = await gemini.askGemini(msg.key.remoteJid, text);
                await sock.sendMessage(msg.key.remoteJid, { text: response }, { quoted: msg });
            } catch (err) {
                logger.warn('Gemini failed, trying OpenAI...', err.message);
                try {
                    // Fallback to OpenAI
                    const response = await openai.askOpenAI(msg.key.remoteJid, text);
                    await sock.sendMessage(msg.key.remoteJid, { text: response }, { quoted: msg });
                } catch (err2) {
                    logger.error('All AI APIs failed:', err2);
                    await sock.sendMessage(msg.key.remoteJid, { text: '❌ AI services are currently unavailable.' }, { quoted: msg });
                }
            }
        }
    },
    {
        name: 'chatmode',
        aliases: ['chat'],
        description: 'Toggle AI chat mode for this group',
        usage: '-chatmode on/off',
        permission: 'group-admin',
        cooldown: 5,
        execute: async (sock, msg, args) => {
            if (!args[0] || !['on', 'off'].includes(args[0].toLowerCase())) {
                await sock.sendMessage(msg.key.remoteJid, { text: 'usage: -chatmode on/off' }, { quoted: msg });
                return;
            }

            const enable = args[0].toLowerCase() === 'on';

            try {
                await Group.findOneAndUpdate(
                    { id: msg.key.remoteJid },
                    { $set: { chatEnabled: enable } },
                    { upsert: true, new: true }
                );
                await sock.sendMessage(msg.key.remoteJid, { text: `✅ AI Chat Mode ${enable ? 'ENABLED' : 'DISABLED'}` }, { quoted: msg });
            } catch (err) {
                logger.error('ChatMode Error:', err);
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Database error.' }, { quoted: msg });
            }
        }
    }
];
