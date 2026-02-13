const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String
    },
    welcomeMessage: {
        type: String,
        default: 'Welcome to the group, @user!'
    },
    goodbyeMessage: {
        type: String,
        default: 'Goodbye, @user!'
    },
    isAntiLink: {
        type: Boolean,
        default: false
    },
    isAntiSpam: {
        type: Boolean,
        default: false
    },
    chatEnabled: {
        type: Boolean,
        default: false
    },
    maxWarns: {
        type: Number,
        default: 3
    },
    admins: [{
        type: String
    }],
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Group', groupSchema);
