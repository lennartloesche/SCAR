const { Command } = require('discord.js-commando');

module.exports = class RepeatCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'repeat',
      group: 'musik',
      memberName: 'repeat',
      guildOnly: true,
      description: 'Songwiederholung aktivieren/deaktivieren'
    });
  }

  run(message) {
    if (!message.guild.musicData.isPlaying) {
      return message.say(':x: Kein Song spielt gerade!');
    } else if (
      message.member.voice.channel.id !== message.guild.me.voice.channel.id
    ) {
      message.reply(
        `Du musst in dem gleichen Sprachkanal sein, wie der Bot, um ihn zu nutzen!`
      );
      return;
    }

    if (message.guild.musicData.loopSong) {
      message.guild.musicData.loopSong = false;
      message.channel.send(
        `**${message.guild.musicData.nowPlaying.title}** wird nicht mehr im Repeat gespielt :repeat: `
      );
    } else {
      message.guild.musicData.loopSong = true;
      message.channel.send(
        `**${message.guild.musicData.nowPlaying.title}** wird im Repeat gespielt :repeat: `
      );
    }
  }
};
