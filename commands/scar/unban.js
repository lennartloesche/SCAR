const { Command } = require('discord.js-commando');

module.exports = class UnbanCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'unban',
      memberName: 'unban',
      group: 'scar',
      description: 'Entbannt eine Person',
      guildOnly: true,
      userPermissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
      clientPermissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS']
    });
  }

  async run(message, args) {
    const id = args;
    message.delete();
    if (!id)
      return message
        .say('Bitte gebe eine ID an.')
        .then((m) => m.delete({ timeout: 15000 }));

    const bannedMembers = await message.guild.fetchBans();
    if (!bannedMembers.find((user) => user.user.id === id))
      return message
        .say('Diese Person ist nicht gebannt.')
        .then((m) => m.delete({ timeout: 15000 }));

    message.guild.members.unban(id);
    return message
      .say(`${id} wurde entbannt.`)
      .then((m) => m.delete({ timeout: 15000 }));
  }
};
