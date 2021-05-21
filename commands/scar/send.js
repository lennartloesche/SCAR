const { Command } = require('discord.js-commando');

module.exports = class SendCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'send',
      memberName: 'send',
      group: 'scar',
      description: 'Sendet eine Nachricht',
      guildOnly: true,
      userPermissions: ['MANAGE_MESSAGES'],
      clientPermissions: ['MANAGE_MESSAGES'],
      args: [
        {
          key: 'text',
          prompt: ':microphone2: Was soll ich sagen?',
          type: 'string'
        }
      ]
    });
  }

  run(message, { text }) {
    message.delete();
    return message.say(text);
  }
};
