const fs = require('fs');
const path = require('path');
const logger = require('../lib/logger');

// Command registry map
const commands = new Map();

const loadCommands = () => {
    const commandsDir = __dirname;
    const categories = fs.readdirSync(commandsDir).filter(file =>
        fs.statSync(path.join(commandsDir, file)).isDirectory()
    );

    commands.clear();

    categories.forEach(category => {
        const categoryPath = path.join(commandsDir, category);
        const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

        commandFiles.forEach(file => {
            try {
                const commandModule = require(path.join(categoryPath, file));
                // Expecting export to be an array of commands
                if (Array.isArray(commandModule)) {
                    commandModule.forEach(cmd => {
                        if (cmd.name && cmd.execute) {
                            commands.set(cmd.name, { ...cmd, category });
                            // Register aliases
                            if (cmd.aliases && Array.isArray(cmd.aliases)) {
                                cmd.aliases.forEach(alias => {
                                    commands.set(alias, { ...cmd, category, isAlias: true, originalName: cmd.name });
                                });
                            }
                        }
                    });
                }
            } catch (err) {
                logger.error(`Failed to load commands from ${category}/${file}:`, err.message);
            }
        });
    });

    logger.info(`Loaded ${commands.size} commands (including aliases)`);
    return commands;
};

module.exports = {
    loadCommands,
    commands
};
