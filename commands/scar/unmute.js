const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

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
      .setColor('#c72810');
    if (!tomute)
      return message.channel
        .send(embed)
        .then((m) => m.delete({ timeout: 9000 }));

    var embed = new MessageEmbed()
      .setDescription('**❯ Fehlende Berechtigungen ✘**')
      .setColor('#c72810');
    if (tomute.hasPermission('MUTE_MEMBERS'))
      return message.channel
        .send(embed)
        .then((m) => m.delete({ timeout: 9000 }));
    let muterole = message.guild.roles.cache.find(
      (muterole) => muterole.name === 'Kanal » Mute'
    );

    var embed = new MessageEmbed()
      .setDescription('**❯ Erfolgreich entmutet ✓**')
      .setColor('#c72810');
    tomute.roles.remove(muterole.id);
    message.channel.send(embed).then((m) => m.delete({ timeout: 9000 }));
  }
};
