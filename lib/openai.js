const OpenAI = require('openai');
const logger = require('./logger');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const askOpenAI = async (chatId, userMessage) => {
    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: userMessage }],
            model: 'gpt-3.5-turbo',
        });
        return completion.choices[0].message.content;
    } catch (err) {
        logger.error('OpenAI Error:', err);
        throw err;
    }
};

module.exports = { askOpenAI };
