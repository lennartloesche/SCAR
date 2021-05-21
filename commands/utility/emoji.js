const { Command } = require('discord.js-commando');
const Discord = require('discord.js');
const { parse } = require('twemoji-parser');

module.exports = class EmojiCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'emoji',
      aliases: ['e'],
      memberName: 'emoji',
      group: 'utility',
      description: 'Emoji vergrößern',
      guildOnly: false
    });
  }

  async run(message, args) {
    const emoji = args;
    message.delete();
    if (!emoji) return message.channel.send('Bitte sende **ein** Emoji!');

    let custom = Discord.Util.parseEmoji(emoji);
    const embed = new Discord.MessageEmbed()
      .setTitle(`Vergrößerte Version von ${emoji}`)
      .setColor('#c72810');

    if (custom.id) {
      embed.setImage(
        `https://cdn.discordapp.com/emojis/${custom.id}.${
          custom.animated ? 'gif' : 'png'
        }`
      );
      return message.channel.send(embed);
    } else {
      let parsed = parse(emoji, { assetType: 'png' });
      if (!parsed) return message.channel.send('Ungültiges Emoji!');

      embed.setImage(parsed[0].url);
      return message.channel.send(embed);
    }
  }
};
