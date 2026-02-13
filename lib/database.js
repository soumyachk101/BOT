/**
 * Database connection helper
 */
const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
    try {
        const dbURI = process.env.MONGODB_KEY;
        if (!dbURI) {
            throw new Error('MONGODB_KEY is not defined in .env');
        }

        await mongoose.connect(dbURI);
        logger.info('✅ API Connected to Database');
    } catch (err) {
        logger.error('❌ Failed to connect to Database:', err.message);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
