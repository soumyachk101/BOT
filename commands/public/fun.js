const axios = require('axios'); // Requires axios (or use fetch in Node 18+)
const logger = require('../../lib/logger');

// Using global fetch if available for less dependencies, else axios if installed. 
// Package.json didn't explicitly include axios in prompt T1 request, 
// BUT standard Node 18+ has fetch. Let's use fetch to be safe with deps.

module.exports = [
    {
        name: 'meme',
        aliases: [],
        description: 'Get a random meme',
        permission: 'public',
        cooldown: 5,
        execute: async (sock, msg, args) => {
            try {
                const res = await fetch('https://meme-api.com/gimme');
                const data = await res.json();

                if (data.url) {
                    await sock.sendMessage(msg.key.remoteJid, {
                        image: { url: data.url },
                        caption: data.title
                    }, { quoted: msg });
                } else {
                    throw new Error('No meme found');
                }
            } catch (err) {
                logger.error('Meme Error:', err);
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to fetch meme.' }, { quoted: msg });
            }
        }
    },
    {
        name: 'joke',
        aliases: [],
        description: 'Get a random joke',
        permission: 'public',
        cooldown: 5,
        execute: async (sock, msg, args) => {
            try {
                const res = await fetch('https://v2.jokeapi.dev/joke/Any?safe-mode');
                const data = await res.json();

                let jokeText = '';
                if (data.type === 'single') {
                    jokeText = data.joke;
                } else {
                    jokeText = `${data.setup}\n\n${data.delivery}`;
                }

                await sock.sendMessage(msg.key.remoteJid, { text: jokeText }, { quoted: msg });
            } catch (err) {
                logger.error('Joke Error:', err);
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to fetch joke.' }, { quoted: msg });
            }
        }
    },
    {
        name: 'anime',
        aliases: ['quote'],
        description: 'Get a random anime quote',
        permission: 'public',
        cooldown: 5,
        execute: async (sock, msg, args) => {
            try {
                const res = await fetch('https://animechan.io/api/v1/quotes/random');
                const data = await res.json();
                // Note: animechan availability varies, fallback or check response
                if (data && data.content) {
                    await sock.sendMessage(msg.key.remoteJid, { text: `"${data.content}"\n\n— ${data.character} (${data.anime})` }, { quoted: msg });
                } else {
                    throw new Error('API Error');
                }
            } catch (err) {
                logger.error('Anime Error:', err);
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to fetch quote.' }, { quoted: msg });
            }
        }
    }
];
