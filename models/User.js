const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    jid: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String
    },
    warns: {
        type: Number,
        default: 0
    },
    warnReasons: [{
        reason: String,
        date: { type: Date, default: Date.now }
    }],
    isBanned: {
        type: Boolean,
        default: false
    },
    banExpiry: {
        type: Date,
        default: null
    },
    lastSeen: {
        type: Date
    },
    commandCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
