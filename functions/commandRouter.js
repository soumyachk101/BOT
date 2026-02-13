const logger = require('../lib/logger');
require('dotenv').config();

// Cooldown Map: 'jid:commandName' -> timestamp (ms)
const cooldowns = new Map();

/**
 * Routes a parsed command to its handler.
 * @param {object} sock - The Baileys socket instance.
 * @param {object} msg - The full message object.
 * @param {string} commandName - The parsed command name (lowercase).
 * @param {string[]} args - The command arguments.
 * @param {Map} commandRegistry - The loaded command registry.
 */
const routeCommand = async (sock, msg, commandName, args, commandRegistry) => {
    try {
        const sender = msg.key.participant || msg.key.remoteJid;
        const isGroup = msg.key.remoteJid.endsWith('@g.us');
        const groupJid = isGroup ? msg.key.remoteJid : null;

        // 1. Look up command
        const command = commandRegistry.get(commandName);
        if (!command) {
            // Silently ignore unknown commands
            return;
        }

        // 2. Permission Check
        if (command.permission === 'owner') {
            const myNumber = process.env.MY_NUMBER?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            if (sender !== myNumber) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '⛔ This command is for the bot owner only.'
                }, { quoted: msg });
                return;
            }
        } else if (command.permission === 'group-admin') {
            if (!isGroup) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '⛔ This command is for groups only.'
                }, { quoted: msg });
                return;
            }

            // Fetch group metadata to check admins
            const groupMetadata = await sock.groupMetadata(groupJid);
            const admins = groupMetadata.participants
                .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                .map(p => p.id);

            if (!admins.includes(sender)) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: '⛔ This command is for group admins only.'
                }, { quoted: msg });
                return;
            }
        }

        // 3. Cooldown Check
        if (command.cooldown) {
            const parsedSender = sender.replace(/[^0-9]/g, ''); // Use basic number for key
            const cooldownKey = `${parsedSender}:${command.name}`;
            const now = Date.now();
            const lastUsed = cooldowns.get(cooldownKey);
            const cooldownMs = command.cooldown * 1000;

            if (lastUsed && (now - lastUsed) < cooldownMs) {
                const remainingSeconds = Math.ceil((cooldownMs - (now - lastUsed)) / 1000);
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `⏳ Please wait ${remainingSeconds}s before using -${command.name} again.`
                }, { quoted: msg });
                return;
            }

            cooldowns.set(cooldownKey, now);
        }

        // 4. Usage Check (optional, if args are required and none provided)
        // Some commands might handle args check internally, but we can do a basic check if defined?
        // The prompt says "Missing required argument → send usage instructions", usually implemented inside command.
        // We will leave specific arg validation to the command execute function for flexibility.

        // 5. Execute Command
        logger.info(`Executing command: ${commandName} from ${sender}`);
        await command.execute(sock, msg, args);

    } catch (error) {
        logger.error(`Error executing command ${commandName}:`, error);
        await sock.sendMessage(msg.key.remoteJid, {
            text: '❌ An error occurred while executing this command.'
        }, { quoted: msg });
    }
};

module.exports = { routeCommand };
