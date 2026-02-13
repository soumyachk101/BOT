const Group = require('../models/Group');
const logger = require('../lib/logger');

const groupEvents = async (sock, update) => {
    // update: { id, participants, action }
    const { id, participants, action } = update;

    try {
        const group = await Group.findOne({ id });
        if (!group) return; // No custom settings? We could check default but let's stick to only configured groups.

        if (action === 'add') {
            if (group.welcomeMessage) {
                for (const participant of participants) {
                    const text = group.welcomeMessage.replace('@user', `@${participant.split('@')[0]}`);
                    await sock.sendMessage(id, { text, mentions: [participant] });
                }
            }
        } else if (action === 'remove') {
            if (group.goodbyeMessage) {
                for (const participant of participants) {
                    const text = group.goodbyeMessage.replace('@user', `@${participant.split('@')[0]}`);
                    await sock.sendMessage(id, { text, mentions: [participant] });
                }
            }
        }
    } catch (err) {
        logger.error('Group Event Error:', err);
    }
};

module.exports = groupEvents;
