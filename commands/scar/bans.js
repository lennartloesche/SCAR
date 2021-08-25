const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

const { color } = require('../../config.json');

module.exports = class BansCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'bans',
      memberName: 'bans',
      group: 'scar',
      description: 'Zeigt alle Bans an',
      guildOnly: true,
      userPermissions: ['BAN_MEMBERS'],
      clientPermissions: ['BAN_MEMBERS']
    });
  }

  async run(message, args, profileData) {
    const fetchBans = message.guild.fetchBans();
    const bannedMembers = (await fetchBans)
      .map((member) => `> **${member.user.tag}** | ID: *${member.user.id}*`)
      .join('\n');
    const bansEmbed = new MessageEmbed()
      .setAuthor(
        ` ${message.guild.name} Bans`,
        message.guild.iconURL({ dynamic: true })
      )
      .setDescription(`${bannedMembers}`)
      .setTimestamp()
      .setColor(color);

    const nobans = new MessageEmbed()
      .setAuthor(
        ` ${message.guild.name} Bans`,
        message.guild.iconURL({ dynamic: true })
      )
      .setDescription(`Es sind keine Personen gebannt.`)
      .setTimestamp()
      .setColor(color);

    message.delete();

    if (!bannedMembers) {
      message.say(nobans).then((m) => m.delete({ timeout: 9000 }));
    } else message.channel.send(bansEmbed);
  }
};
