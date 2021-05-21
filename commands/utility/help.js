const { Command } = require('discord.js-commando');

module.exports = class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      memberName: 'help',
      group: 'utility',
      description: 'Help',
      guildOnly: false
    });
  }

  async run(message) {
    message.delete();
    message
      .say(
        'Befehle können nachgeschaut werden auf: https://grauerdavid.de/scarcommands/'
      )
      .then((m) => m.delete({ timeout: 30000 }));
  }
};
