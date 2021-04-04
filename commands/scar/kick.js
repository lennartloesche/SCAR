const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class KickCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'kick',
      aliases: ['kick-member', 'throw'],
      memberName: 'kick',
      group: 'scar',
      description: 'Kickt eine Person',
      guildOnly: true,
      userPermissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
      clientPermissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
      args: [
        {
          key: 'userToKick',
          prompt:
            'Bitte tagge die Person (@Name) oder benutze seine ID.',
          type: 'string'
        },
        {
          key: 'reason',
          prompt: 'Nenne einen Grund?',
          type: 'string'
        }
      ]
    });
  }

  async run(message, { userToKick, reason }) {
    const extractNumber = /\d+/g;
    const userToKickID = userToKick.match(extractNumber)[0];
    const user =
      message.mentions.members.first() ||
      (await message.guild.members.fetch(userToKickID));
    if (user == undefined)
      return message.channel.send(':x: Bitte nenne eine Person.');
    user
      .kick(reason)
      .then(() => {
        const kickEmbed = new MessageEmbed()
          .addField('Gekickt:', userToKick)
          .addField('Grund:', reason)
          .setColor("#c72810")
        message.channel.send(kickEmbed);
      })
      .catch(err => {
        message.say(
          ':x: Fehler, wahrscheinlich habe ich keine Berechtigungen um diese Person zu kicken!'
        );
        return console.error(err);
      });
  }
};
