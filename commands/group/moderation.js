const User = require('../../models/User');
const Group = require('../../models/Group');
const logger = require('../../lib/logger');

// Helper to check if bot is admin
const isBotAdmin = async (sock, groupJid) => {
    const groupMetadata = await sock.groupMetadata(groupJid);
    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const participants = groupMetadata.participants;
    const botParticipant = participants.find(p => p.id === botJid);
    return botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin');
};

module.exports = [
    {
        name: 'ban',
        aliases: ['kick', 'remove'],
        description: 'Remove a user from the group',
        usage: '-ban @user',
        permission: 'group-admin',
        cooldown: 3,
        execute: async (sock, msg, args) => {
            const groupJid = msg.key.remoteJid;

            // Check if bot is admin first
            if (!(await isBotAdmin(sock, groupJid))) {
                await sock.sendMessage(groupJid, { text: '❌ I need to be an admin to perform this action.' }, { quoted: msg });
                return;
            }

            let targetJid = null;
            if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
                targetJid = msg.message.extendedTextMessage.contextInfo.participant;
            }

            if (!targetJid) {
                await sock.sendMessage(groupJid, { text: '❌ Please tag a user or reply to their message.' }, { quoted: msg });
                return;
            }

            try {
                await sock.groupParticipantsUpdate(groupJid, [targetJid], 'remove');
                await sock.sendMessage(groupJid, { text: `✅ User removed.` }, { quoted: msg });
            } catch (err) {
                logger.error('Ban Error:', err);
                await sock.sendMessage(groupJid, { text: '❌ Failed to remove user.' }, { quoted: msg });
            }
        }
    },
    {
        name: 'warn',
        aliases: [],
        description: 'Warn a user',
        usage: '-warn @user [reason]',
        permission: 'group-admin',
        cooldown: 3,
        execute: async (sock, msg, args) => {
            const groupJid = msg.key.remoteJid;

            let targetJid = null;
            if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
                targetJid = msg.message.extendedTextMessage.contextInfo.participant;
            }

            if (!targetJid) {
                await sock.sendMessage(groupJid, { text: '❌ Please tag a user or reply to their message.' }, { quoted: msg });
                return;
            }

            const reason = args.slice(1).join(' ') || 'No reason provided';

            try {
                // Fetch Group settings for maxWarns
                let group = await Group.findOne({ id: groupJid });
                if (!group) {
                    group = new Group({ id: groupJid });
                    await group.save();
                }
                const maxWarns = group.maxWarns || 3;

                // Update User
                let user = await User.findOne({ jid: targetJid });
                if (!user) user = new User({ jid: targetJid });

                user.warns += 1;
                user.warnReasons.push({ reason, date: new Date() });
                await user.save();

                await sock.sendMessage(groupJid, {
                    text: `⚠️ @${targetJid.split('@')[0]} has been warned (${user.warns}/${maxWarns}).\nReason: ${reason}`,
                    mentions: [targetJid]
                }, { quoted: msg });

                if (user.warns >= maxWarns) {
                    // Check bot admin before kick
                    if (!(await isBotAdmin(sock, groupJid))) {
                        await sock.sendMessage(groupJid, { text: '⚠️ User reached max warnings but I cannot kick (not admin).' });
                        return;
                    }

                    await sock.sendMessage(groupJid, { text: `🔴 Max warnings reached. Removing @${targetJid.split('@')[0]}...`, mentions: [targetJid] });
                    await sock.groupParticipantsUpdate(groupJid, [targetJid], 'remove');

                    // Reset warns? Usually yes.
                    user.warns = 0;
                    await user.save();
                }

            } catch (err) {
                logger.error('Warn Error:', err);
                await sock.sendMessage(groupJid, { text: '❌ Failed to warn user.' }, { quoted: msg });
            }
        }
    },
    {
        name: 'tagall',
        aliases: ['everyone'],
        description: 'Tag all members',
        permission: 'group-admin',
        cooldown: 30, // High cooldown to prevent abuse
        execute: async (sock, msg, args) => {
            const groupJid = msg.key.remoteJid;
            try {
                const metadata = await sock.groupMetadata(groupJid);
                const participants = metadata.participants.map(p => p.id);

                let text = '📢 *Everyone*\n\n';
                participants.forEach(p => {
                    text += `@${p.split('@')[0]}\n`;
                });

                await sock.sendMessage(groupJid, { text, mentions: participants }, { quoted: msg });
            } catch (err) {
                logger.error('TagAll Error:', err);
                await sock.sendMessage(groupJid, { text: '❌ Failed to fetch participants.' }, { quoted: msg });
            }
        }
    }
];
