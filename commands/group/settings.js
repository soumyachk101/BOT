const Group = require('../../models/Group');
const logger = require('../../lib/logger');

module.exports = [
    {
        name: 'welcome',
        aliases: ['setwelcome'],
        description: 'Set welcome message',
        usage: '-welcome <message> (@user)',
        permission: 'group-admin',
        cooldown: 5,
        execute: async (sock, msg, args) => {
            const message = args.join(' ');
            if (!message) {
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Please provide a welcome message. Use @user for mention.' }, { quoted: msg });
                return;
            }

            try {
                await Group.findOneAndUpdate(
                    { id: msg.key.remoteJid },
                    { $set: { welcomeMessage: message } },
                    { upsert: true, new: true }
                );
                await sock.sendMessage(msg.key.remoteJid, { text: '✅ Welcome message updated.' }, { quoted: msg });
            } catch (err) {
                logger.error('Welcome Set Error:', err);
            }
        }
    },
    {
        name: 'rename',
        aliases: ['setname', 'subject'],
        description: 'Rename group',
        usage: '-rename <new name>',
        permission: 'group-admin',
        cooldown: 10,
        execute: async (sock, msg, args) => {
            const newName = args.join(' ');
            if (!newName) {
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Please provide a new name.' }, { quoted: msg });
                return;
            }

            try {
                await sock.groupUpdateSubject(msg.key.remoteJid, newName);
                await sock.sendMessage(msg.key.remoteJid, { text: `✅ Group renamed to "${newName}"` }, { quoted: msg });
            } catch (err) {
                logger.error('Rename Error:', err);
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to rename group. I might not be an admin.' }, { quoted: msg });
            }
        }
    },
    {
        name: 'chat',
        aliases: ['ai-chat'],
        description: 'Toggle AI chat mode',
        usage: '-chat on/off',
        permission: 'group-admin',
        cooldown: 5,
        execute: async (sock, msg, args) => {
            // Reuse logic from ai.js or just act as alias handler if we imported it, 
            // but simpler to just re-implement DB update since it's 3 lines.
            if (!args[0] || !['on', 'off'].includes(args[0].toLowerCase())) {
                await sock.sendMessage(msg.key.remoteJid, { text: 'usage: -chat on/off' }, { quoted: msg });
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
                logger.error('ChatMode Settings Error:', err);
            }
        }
    }
];
