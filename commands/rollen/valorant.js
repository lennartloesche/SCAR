const { MessageEmbed } = require('discord.js');
const { Command } = require('discord.js-commando');

const config = require('../../config.json');

module.exports = class ValorantCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'valorant',
      memberName: 'valorant',
      group: 'rollen',
      description: 'Valorant Rolle',
      guildOnly: true,
      hidden: true
    });
  }
  async run(message) {
    message.delete();
    var valorant = config.valorant;
    let role = message.guild.roles.cache.find(
      (role) => role.name === `${valorant}`
    );
    let member = message.member;

    if (
      message.member.roles.cache.some((role) => role.name === `${valorant}`)
    ) {
      member.roles.remove(role);
      var embed = new MessageEmbed()
        .setDescription(`**❯ ${valorant} entfernt ✘**`)
        .setColor('RED');
      message.channel.send(embed).then((m) => m.delete({ timeout: 10000 }));
    } else {
      member.roles.add(role);
      var embed = new MessageEmbed()
        .setDescription(`**❯ ${valorant} hinzugefügt ✓**`)
        .setColor('GREEN');
      message.channel.send(embed).then((m) => m.delete({ timeout: 10000 }));
    }
  }
};
