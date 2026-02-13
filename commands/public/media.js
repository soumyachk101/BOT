const downloader = require('../../lib/downloader');
const fs = require('fs');
const logger = require('../../lib/logger');

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '50');

module.exports = [
    {
        name: 'yt',
        aliases: ['video', 'youtube'],
        description: 'Download YouTube video',
        usage: '-yt <url>',
        permission: 'public',
        cooldown: 10,
        execute: async (sock, msg, args) => {
            if (!args[0]) {
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Please provide a YouTube URL.' }, { quoted: msg });
                return;
            }

            await sock.sendMessage(msg.key.remoteJid, { react: { text: "⏳", key: msg.key } });

            let result = null;
            try {
                result = await downloader.downloadYouTubeVideo(args[0]);

                const stats = fs.statSync(result.filePath);
                const fileSizeMB = stats.size / (1024 * 1024);

                if (fileSizeMB > MAX_FILE_SIZE_MB) {
                    // Attempt compression logic could go here, or just fail for v1
                    await sock.sendMessage(msg.key.remoteJid, { text: `❌ Video is too large (${fileSizeMB.toFixed(2)}MB). Max: ${MAX_FILE_SIZE_MB}MB.` }, { quoted: msg });
                    return;
                }

                await sock.sendMessage(msg.key.remoteJid, {
                    video: { url: result.filePath },
                    caption: 'Here is your video! 🎥',
                    mimetype: result.mimeType
                }, { quoted: msg });

                await sock.sendMessage(msg.key.remoteJid, { react: { text: "✅", key: msg.key } });

            } catch (err) {
                logger.error('YT Command Error:', err);
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to download video. Please check the URL and try again.' }, { quoted: msg });
                await sock.sendMessage(msg.key.remoteJid, { react: { text: "❌", key: msg.key } });
            } finally {
                if (result && result.filePath && fs.existsSync(result.filePath)) {
                    fs.unlinkSync(result.filePath);
                }
            }
        }
    },
    {
        name: 'song',
        aliases: ['mp3', 'music'],
        description: 'Download YouTube audio',
        usage: '-song <url>',
        permission: 'public',
        cooldown: 10,
        execute: async (sock, msg, args) => {
            if (!args[0]) {
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Please provide a YouTube URL.' }, { quoted: msg });
                return;
            }

            await sock.sendMessage(msg.key.remoteJid, { react: { text: "⏳", key: msg.key } });

            let result = null;
            try {
                result = await downloader.downloadYouTubeAudio(args[0]);

                const stats = fs.statSync(result.filePath);
                if (stats.size / (1024 * 1024) > MAX_FILE_SIZE_MB) {
                    await sock.sendMessage(msg.key.remoteJid, { text: `❌ Audio is too large. Max: ${MAX_FILE_SIZE_MB}MB.` }, { quoted: msg });
                    return;
                }

                await sock.sendMessage(msg.key.remoteJid, {
                    audio: { url: result.filePath },
                    mimetype: 'audio/mpeg',
                    ptt: false // Send as audio file, not voice note
                }, { quoted: msg });

                await sock.sendMessage(msg.key.remoteJid, { react: { text: "✅", key: msg.key } });

            } catch (err) {
                logger.error('Song Command Error:', err);
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to download audio. Please check the URL and try again.' }, { quoted: msg });
                await sock.sendMessage(msg.key.remoteJid, { react: { text: "❌", key: msg.key } });
            } finally {
                if (result && result.filePath && fs.existsSync(result.filePath)) {
                    fs.unlinkSync(result.filePath);
                }
            }
        }
    },
    {
        name: 'insta',
        aliases: ['ig', 'instagram'],
        description: 'Download Instagram media',
        usage: '-insta <url>',
        permission: 'public',
        cooldown: 10,
        execute: async (sock, msg, args) => {
            if (!args[0]) {
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Please provide an Instagram URL.' }, { quoted: msg });
                return;
            }

            await sock.sendMessage(msg.key.remoteJid, { react: { text: "⏳", key: msg.key } });

            let result = null;
            try {
                result = await downloader.downloadInstagram(args[0]);

                // Send based on type
                if (result.mimeType.startsWith('video')) {
                    await sock.sendMessage(msg.key.remoteJid, {
                        video: { url: result.filePath },
                        caption: 'Downloaded from Instagram',
                        mimetype: result.mimeType
                    }, { quoted: msg });
                } else {
                    await sock.sendMessage(msg.key.remoteJid, {
                        image: { url: result.filePath },
                        caption: 'Downloaded from Instagram',
                        mimetype: result.mimeType
                    }, { quoted: msg });
                }

                await sock.sendMessage(msg.key.remoteJid, { react: { text: "✅", key: msg.key } });

            } catch (err) {
                logger.error('Insta Command Error:', err);
                await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to download Instagram media. Make sure the account is public.' }, { quoted: msg });
                await sock.sendMessage(msg.key.remoteJid, { react: { text: "❌", key: msg.key } });
            } finally {
                if (result && result.filePath && fs.existsSync(result.filePath)) {
                    fs.unlinkSync(result.filePath);
                }
            }
        }
    }
];
