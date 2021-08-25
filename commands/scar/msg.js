const { Command } = require('discord.js-commando');
const Discord = require('discord.js');
const config = require('../../config.json');

const { color } = require('../../config.json');

module.exports = class MsgCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'msg',
      memberName: 'msg',
      group: 'scar',
      description: 'Sendet eine Nachricht per DM',
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],
      clientPermissions: ['ADMINISTRATOR']
    });
  }

  async run(message) {
    let args = message.content.slice(config.prefix.length).split(' ');
    let cont = args.shift().toLowerCase();
    let dUser =
      message.guild.member(message.mentions.users.first()) ||
      message.guild.members.cache.get(args[0]);

    var embed = new Discord.MessageEmbed()
      .setDescription('**❯ Fehlender Tag! | Verwende +msg @Name (Text) ✘**')
      .setColor(color);
    if (!dUser) return message.channel.send(embed);

    let dMessage = args.join(' ').slice(22);

    var embed = new Discord.MessageEmbed()
      .setDescription('**❯ Fehlende Nachricht ✘**')
      .setColor(color);
    if (dMessage.length < 1) return message.channel.send(embed);

    dUser.send(`${dMessage}`);

    var embed = new Discord.MessageEmbed()
      .setDescription('**❯ Erfolgreich gesendet ✓**')
      .setColor(color);
    message.channel.send(embed).then((m) => m.delete({ timeout: 2000 }));
    message.delete();
  }
};
