const { Command } = require('discord.js-commando');
const { Calculator } = require('weky');

module.exports = class TaschenrechnerCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'taschenrechner',
      aliases: ['calc', 'calculator', 'rechner'],
      memberName: 'taschenrechner',
      group: 'utility',
      description: 'Taschenrechner mit Buttons',
      guildOnly: false
    });
  }

  async run(message) {
    message.delete();
    await Calculator(message);
  }
};
