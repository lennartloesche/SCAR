const { Command } = require('discord.js-commando');

module.exports = class LeaveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'leave',
      aliases: ['end', 'stop'],
      group: 'musik',
      memberName: 'leave',
      guildOnly: true,
      description: 'Sprachkanal verlassen'
    });
  }

  run(message) {
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.reply(':no_entry: Bitte betrete einen Sprachkanal und versuche es erneut!');
      return;
    } else if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      if (
        message.guild.musicData.isPlaying == false &&
        message.guild.me.voice.channel
      ) {
        message.guild.me.voice.channel.leave();
      } else {
        message.reply(':x: Kein Song spielt gerade!');
      }
      return;
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      message.reply(
        `:no_entry: Du musst in dem gleichen Sprachkanal sein, wie der Bot, um ihn zu nutzen!`
      );
      return;
    } else if (!message.guild.musicData.queue) {
      message.reply(':x: Kein Song in der Warteschlange');
      return;
    } else if (message.guild.musicData.songDispatcher.paused) {
      message.guild.musicData.songDispatcher.resume();
      message.guild.musicData.queue.length = 0;
      message.guild.musicData.loopSong = false;
      setTimeout(() => {
        message.guild.musicData.songDispatcher.end();
      }, 100);
      return message.say(
        `Ich habe den Sprachkanal verlassen.`
      ).then(m => m.delete({timeout: 10000}));
    } else {
      message.guild.musicData.queue.length = 0;
      message.guild.musicData.skipTimer = true;
      message.guild.musicData.loopSong = false;
      message.guild.musicData.loopQueue = false;
      message.guild.musicData.songDispatcher.end();
      return message.say(
        `Ich habe den Sprachkanal verlassen.`
      ).then(m => m.delete({timeout: 10000}));
    }
  }
};
