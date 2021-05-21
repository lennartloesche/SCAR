const { MessageEmbed } = require('discord.js');
const { Command } = require('discord.js-commando');

const config = require('../../config.json');

module.exports = class R6Command extends Command {
  constructor(client) {
    super(client, {
      name: 'r6',
      memberName: 'r6',
      group: 'rollen',
      description: 'R6 Rolle',
      guildOnly: true,
      hidden: true
    });
  }
  async run(message) {
    message.delete();
    var r6 = config.r6;
    let role = message.guild.roles.cache.find((role) => role.name === `${r6}`);
    let member = message.member;

    if (message.member.roles.cache.some((role) => role.name === `${r6}`)) {
      member.roles.remove(role);
      var embed = new MessageEmbed()
        .setDescription(`**❯ ${r6} entfernt ✘**`)
        .setColor('RED');
      message.channel.send(embed).then((m) => m.delete({ timeout: 10000 }));
    } else {
      member.roles.add(role);
      var embed = new MessageEmbed()
        .setDescription(`**❯ ${r6} hinzugefügt ✓**`)
        .setColor('GREEN');
      message.channel.send(embed).then((m) => m.delete({ timeout: 10000 }));
    }
  }
};
