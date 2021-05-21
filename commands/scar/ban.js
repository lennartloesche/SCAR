const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class BanCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ban',
      aliases: ['ban-member', 'ban-hammer'],
      memberName: 'ban',
      group: 'scar',
      description: 'Bannt eine Person',
      guildOnly: true,
      userPermissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
      clientPermissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
      args: [
        {
          key: 'userToBan',
          prompt: 'Bitte tagge die Person (@Name) oder benutze seine ID.',
          type: 'string'
        },
        {
          key: 'reason',
          prompt: 'Nenne einen Grund.',
          type: 'string'
        },
        {
          key: 'daysDelete',
          prompt:
            'Wie viele Nachrichten möchtest du vor wie vielen Tagen löschen (vom Benutzer)?',
          type: 'integer',
          validate: function validate(daysDelete) {
            return daysDelete < 8 && daysDelete > 0;
          }
        }
      ]
    });
  }

  async run(message, { userToBan, reason, daysDelete }) {
    const extractNumber = /\d+/g;
    const userToBanID = userToBan.match(extractNumber)[0];
    const user =
      message.mentions.members.first() ||
      (await message.guild.members.fetch(userToBanID));
    if (user == undefined)
      return message.channel.send(':x: Bitte nenne eine Person.');
    user
      .ban({ days: daysDelete, reason: reason })
      .then(() => {
        const banEmbed = new MessageEmbed()
          .addField('Gebannt:', userToBan)
          .addField('Grund', reason)
          .setColor('#c72810');
        message.channel.send(banEmbed);
      })
      .catch((err) => {
        message.say(
          ':x: Fehler, wahrscheinlich habe ich keine Berechtigungen um diese Person zu bannen!'
        );
        return console.error(err);
      });
  }
};
