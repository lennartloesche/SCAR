const { Command } = require('discord.js-commando');

module.exports = class RemoveSongCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remove',
      memberName: 'remove',
      group: 'musik',
      description: 'Einen bestimmten Song durch die Songnummer aus der Warteschlange entfernen',
      guildOnly: true,
      args: [
        {
          key: 'songNumber',
          prompt:
            ':wastebasket: Welche Songnummer möchtest du entfernen von der Warteschlange?',
          type: 'integer'
        }
      ]
    });
  }
  run(message, { songNumber }) {
    if (songNumber < 1 || songNumber >= message.guild.musicData.queue.length) {
      return message.reply(':x: Bitte gebe eine gültige Songnummer ein!');
    }
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.reply(':no_entry: Bitte betrete einen Sprachkanal und versuche es erneut!');
      return;
    }

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      message.reply(':x: Kein Song spielt gerade!');
      return;
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      message.reply(
        `:no_entry: Du musst in dem gleichen Sprachkanal sein, wie der Bot, um ihn zu nutzen!`
      );
      return;
    }

    message.guild.musicData.queue.splice(songNumber - 1, 1);
    message.say(`:wastebasket: Songnummer ${songNumber} wurde von der Warteschlange gelöscht!`);
  }
};
