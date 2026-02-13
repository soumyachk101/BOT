const logger = require('../../lib/logger');

module.exports = [
    {
        name: 'broadcast',
        aliases: ['bc', 'bcgc'],
        description: 'Broadcast message to all groups',
        usage: '-broadcast <message>',
        permission: 'owner',
        cooldown: 0,
        execute: async (sock, msg, args) => {
            const message = args.join(' ');
            if (!message) {
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Please provide a message to broadcast.' }, { quoted: msg });
                return;
            }

            await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Broadcasting...' }, { quoted: msg });

            try {
                const groups = await sock.groupFetchAllParticipating();
                const groupIds = Object.keys(groups);

                let count = 0;
                for (const jid of groupIds) {
                    try {
                        await sock.sendMessage(jid, {
                            text: `📢 *BROADCAST*\n\n${message}`
                        });
                        count++;
                        // Basic delay to avoid rate limits
                        await new Promise(r => setTimeout(r, 500));
                    } catch (e) {
                        logger.warn(`Failed to broadcast to ${jid}`);
                    }
                }

                await sock.sendMessage(msg.key.remoteJid, { text: `✅ Broadcast sent to ${count} groups.` }, { quoted: msg });

            } catch (err) {
                logger.error('Broadcast Error:', err);
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Broadcast failed.' }, { quoted: msg });
            }
        }
    }
];
