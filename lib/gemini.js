const { GoogleGenerativeAI } = require('@google/generative-ai');
const ChatHistory = require('../models/ChatHistory');
const logger = require('./logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Ask Gemini with context memory.
 * @param {string} chatId - WhatsApp JID.
 * @param {string} userMessage - User's input.
 * @returns {Promise<string>} AI Response.
 */
const askGemini = async (chatId, userMessage) => {
    try {
        // 1. Load History
        let historyDoc = await ChatHistory.findOne({ chatId });
        if (!historyDoc) {
            historyDoc = new ChatHistory({ chatId, messages: [] });
        }

        // 2. Format history for Gemini
        // Gemini expects [{ role: 'user'|'model', parts: [{ text: '' }] }]
        const historyForGemini = historyDoc.messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const chat = model.startChat({
            history: historyForGemini,
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        // 3. Generate Content
        const result = await chat.sendMessage(userMessage);
        const responseText = result.response.text();

        // 4. Save to DB
        historyDoc.messages.push({ role: 'user', content: userMessage });
        historyDoc.messages.push({ role: 'model', content: responseText });

        // Model hook automatically trims to last 10 pairs via 'pre save' hook defined in schema? 
        // Wait, the schema hook I wrote only triggers on save.
        // Schema hook logic: if (this.messages.length > 10) ... which means 10 individual messages (5 pairs).
        // Prompt said "Trim history to the last 10 messages".
        await historyDoc.save();

        return responseText;
    } catch (err) {
        logger.error('Gemini API Error:', err);
        throw err;
    }
};

module.exports = { askGemini };
