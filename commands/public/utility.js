const fs = require('fs');
const path = require('path');
const logger = require('../../lib/logger');
const { commands } = require('../index'); // Correct import for command registry

module.exports = [
    {
        name: 'tts',
        aliases: ['speak'],
        description: 'Text to Speech',
        usage: '-tts <text>',
        permission: 'public',
        cooldown: 5,
        execute: async (sock, msg, args) => {
            const text = args.join(' ');
            if (!text) {
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Provide text to speak.' }, { quoted: msg });
                return;
            }

            try {
                // Using a simple Google TTS endpoint (unofficial but common for bots)
                // Or many npm packages use this URL pattern
                const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;

                await sock.sendMessage(msg.key.remoteJid, {
                    audio: { url: url },
                    mimetype: 'audio/mpeg',
                    ptt: true // Send as voice note
                }, { quoted: msg });
            } catch (err) {
                logger.error('TTS Error:', err);
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to generate audio.' }, { quoted: msg });
            }
        }
    },
    {
        name: 'lyrics',
        aliases: ['l'],
        description: 'Get song lyrics',
        usage: '-lyrics <song name>',
        permission: 'public',
        cooldown: 10,
        execute: async (sock, msg, args) => {
            const songPrompt = args.join(' ');
            if (!songPrompt) {
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Provide a song name.' }, { quoted: msg });
                return;
            }

            try {
                const res = await fetch(`https://api.lyrics.ovh/v1/Artist/Song`); // Placeholder, real API needs search usually 
                // lyrics.ovh requires Artist/Title structure: https://api.lyrics.ovh/v1/Coldplay/Adventure of a Lifetime
                // Since we only get "song name", we'd need a search API first.
                // Given constraint of no extra keys, we might try a search-wrapper API or skip since lyrics.ovh simple endpoint is strict.
                // Let's assume user provides "Artist - Song" or fail gracefully.
                // OR use a different open API.
                // For now, let's implement a dummy response saying "API Requires Artist/Song format" if simple fetch fails, or use a better API if known.

                // Let's try to be smart: -l Artist - Song
                const parts = songPrompt.split('-');
                if (parts.length < 2) {
                    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Please use format: -l Artist - Song Name' }, { quoted: msg });
                    return;
                }

                const artist = parts[0].trim();
                const song = parts[1].trim();

                const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`);
                const data = await response.json();

                if (data.lyrics) {
                    await sock.sendMessage(msg.key.remoteJid, { text: `📜 *${artist} - ${song}*\n\n${data.lyrics.substring(0, 4000)}` }, { quoted: msg });
                } else {
                    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Lyrics not found.' }, { quoted: msg });
                }

            } catch (err) {
                logger.error('Lyrics Error:', err);
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to fetch lyrics.' }, { quoted: msg });
            }
        }
    },
    {
        name: 'help',
        aliases: ['menu'],
        description: 'Show command list',
        permission: 'public',
        cooldown: 5,
        execute: async (sock, msg, args) => {
            let helpText = '*🤖 WhatsApp Bot Commands*\n\n';

            // Group by permission
            const categories = { 'public': [], 'group-admin': [], 'owner': [] };

            // commands is a Map
            commands.forEach((cmd) => {
                if (cmd.isAlias) return; // Skip aliases in main list
                const category = cmd.permission || 'public';
                if (categories[category]) {
                    categories[category].push(cmd);
                }
            });

            const formatCmd = (cmd) => `  • *${process.env.PREFIX || '-'}${cmd.name}*: ${cmd.description}`;

            helpText += '*📢 Public Commands*\n';
            helpText += categories['public'].map(formatCmd).join('\n');

            helpText += '\n\n*🛡️ Group Admin*\n';
            helpText += categories['group-admin'].map(formatCmd).join('\n');

            helpText += '\n\n*👑 Owner*\n';
            helpText += categories['owner'].map(formatCmd).join('\n');

            await sock.sendMessage(msg.key.remoteJid, { text: helpText }, { quoted: msg });
        }
    }
];
