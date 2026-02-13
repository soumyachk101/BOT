const logger = require('../../lib/logger');
const { exec } = require('child_process');

module.exports = [
    {
        name: 'restart',
        aliases: ['reboot'],
        description: 'Restart the bot',
        permission: 'owner',
        cooldown: 0,
        execute: async (sock, msg, args) => {
            await sock.sendMessage(msg.key.remoteJid, { text: '🔄 Restarting...' }, { quoted: msg });

            // If running with PM2, process.exit(0) will restart it.
            // If running with node, it will stop (unless monitored).
            // Assuming PM2 or nodemon in dev.
            setTimeout(() => {
                process.exit(0);
            }, 1000);
        }
    },
    {
        name: 'shutdown',
        aliases: ['stop'],
        description: 'Stop the bot',
        permission: 'owner',
        cooldown: 0,
        execute: async (sock, msg, args) => {
            await sock.sendMessage(msg.key.remoteJid, { text: '🔌 Shutting down...' }, { quoted: msg });
            setTimeout(() => {
                process.exit(1); // Exit with error code to potentially stop PM2 loop if configured to stop on error frequently? 
                // Actually PM2 resets on any exit. To stop, user needs to run 'pm2 stop'. 
                // This command effectively just kills current instance.
            }, 1000);
        }
    },
    {
        name: 'eval',
        aliases: ['>'],
        description: 'Execute JavaScript code',
        usage: '-eval <code>',
        permission: 'owner',
        cooldown: 0,
        execute: async (sock, msg, args) => {
            const code = args.join(' ');
            if (!code) return;

            try {
                // eslint-disable-next-line no-eval
                let result = eval(code);

                if (result instanceof Promise) {
                    result = await result;
                }

                if (typeof result !== 'string') {
                    result = require('util').inspect(result, { depth: 0 });
                }

                await sock.sendMessage(msg.key.remoteJid, { text: result }, { quoted: msg });
            } catch (err) {
                await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }, { quoted: msg });
            }
        }
    },
    {
        name: 'join',
        aliases: [],
        description: 'Join a group via link',
        usage: '-join <link>',
        permission: 'owner',
        cooldown: 0,
        execute: async (sock, msg, args) => {
            const link = args[0];
            if (!link || !link.includes('chat.whatsapp.com')) {
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Invalid link.' }, { quoted: msg });
                return;
            }

            try {
                const code = link.split('chat.whatsapp.com/')[1];
                await sock.groupAcceptInvite(code);
                await sock.sendMessage(msg.key.remoteJid, { text: '✅ Joined group.' }, { quoted: msg });
            } catch (err) {
                logger.error('Join Error:', err);
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to join. Maybe I am banned or link is revoked.' }, { quoted: msg });
            }
        }
    }
];
