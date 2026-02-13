const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
    chatId: {
        type: String,
        required: true,
        unique: true
    },
    messages: [{
        role: {
            type: String,
            enum: ['user', 'model'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Helper to keep only the last 10 messages
chatHistorySchema.pre('save', function (next) {
    if (this.messages.length > 10) {
        this.messages = this.messages.slice(this.messages.length - 10);
    }
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
