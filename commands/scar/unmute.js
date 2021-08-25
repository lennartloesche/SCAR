const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

const { color } = require('../../config.json');

module.exports = class UnmuteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'unmute',
      memberName: 'unmute',
      group: 'scar',
      description: 'Entmutet eine Person',
      guildOnly: true,
      userPermissions: ['MUTE_MEMBERS'],
      clientPermissions: ['MUTE_MEMBERS']
    });
  }

  async run(message) {
    let tomute = message.guild.member(
      message.mentions.users.first() || message.guild.members.cache.get(args[0])
    );
    var embed = new MessageEmbed()
      .setDescription('Bitte gib eine Person an!')
      .setColor(color);
    if (!tomute)
      return message.channel
        .send(embed)
        .then((m) => m.delete({ timeout: 9000 }));

    var embed = new MessageEmbed()
      .setDescription('**❯ Fehlende Berechtigungen ✘**')
      .setColor(color);
    if (tomute.hasPermission('MUTE_MEMBERS'))
      return message.channel
        .send(embed)
        .then((m) => m.delete({ timeout: 9000 }));
    let muterole = message.guild.roles.cache.find(
      (muterole) => muterole.name === 'Kanal » Mute'
    );

    var embed = new MessageEmbed()
      .setDescription('**❯ Erfolgreich entmutet ✓**')
      .setColor(color);
    tomute.roles.remove(muterole.id);
    message.channel.send(embed).then((m) => m.delete({ timeout: 9000 }));
  }
};
