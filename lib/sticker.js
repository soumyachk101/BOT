const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { Crypto } = require('@whiskeysockets/baileys');

const tempDir = path.join(__dirname, '../temp');

/**
 * Converts image to WebP sticker.
 * @param {Buffer} buffer - Image buffer.
 * @returns {Promise<string>} File path to webp.
 */
const imageToSticker = async (buffer) => {
    const filePath = path.join(tempDir, `sticker_${uuidv4()}.webp`);
    await sharp(buffer)
        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ quality: 80 })
        .toFile(filePath);
    return filePath;
};

/**
 * Converts video to animated WebP sticker.
 * @param {string} videoPath - Path to video file.
 * @returns {Promise<string>} File path to webp.
 */
const videoToSticker = async (videoPath) => {
    return new Promise((resolve, reject) => {
        const outputPath = path.join(tempDir, `sticker_${uuidv4()}.webp`);
        ffmpeg(videoPath)
            .inputOptions(['-t 10']) // max 10s
            .complexFilter([
                'fps=15',
                'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1'
            ])
            .outputOptions([
                '-vcodec', 'libwebp',
                '-loop', '0',
                '-preset', 'default',
                '-an',
                '-vsync', '0',
                '-s', '512x512'
            ])
            .save(outputPath)
            .on('end', () => resolve(outputPath))
            .on('error', (err) => reject(err));
    });
};

module.exports = {
    imageToSticker,
    videoToSticker
};
