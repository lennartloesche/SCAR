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
    });
  }

  async run(message) {
    const sayMessage = args.join(" ");
    message.delete().catch(O_o => {});
    message.channel.send(sayMessage);
  }}