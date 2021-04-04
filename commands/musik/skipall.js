const { Command } = require('discord.js-commando');

module.exports = class SkipAllCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'skipall',
      aliases: ['skip-all'],
      memberName: 'skipall',
      group: 'musik',
      description: 'Alle Songs in der Warteschlange überspringen',
      guildOnly: true
    });
  }

  run(message) {
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.reply(
        ':no_entry: Bitte betrete einen Sprachkanal und versuche es erneut!'
      );

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      return message.reply(':x: Kein Song spielt gerade!');
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      message.reply(
        `:no_entry: Du musst in dem gleichen Sprachkanal sein, wie der Bot, um ihn zu nutzen!`
      );
      return;
    }
    if (!message.guild.musicData.queue)
      return message.say(':x: Es befindet sich kein Song in der Warteschlange!');
    message.guild.musicData.queue.length = 0; // clear queue
    message.guild.musicData.loopSong = false;
    message.guild.musicData.loopQueue = false;
    message.guild.musicData.songDispatcher.end();
    return;
  }
};
