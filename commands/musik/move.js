const { Command } = require('discord.js-commando');

module.exports = class MoveSongCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'move',
      memberName: 'move',
      aliases: ['m', 'movesong'],
      description: 'Song in eine andere Position in der Warteschlange packen',
      group: 'musik',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [
        {
          key: 'oldPosition',
          type: 'integer',
          prompt: ':notes: Welche Position hat der Song, den du verschieben möchtest?'
        },
        {
          key: 'newPosition',
          type: 'integer',
          prompt: ':notes: Zu welcher Position möchtest du den Song verschieben?'
        }
      ]
    });
  }
  async run(message, { oldPosition, newPosition }) {
    if (
      oldPosition < 1 ||
      oldPosition > message.guild.musicData.queue.length ||
      newPosition < 1 ||
      newPosition > message.guild.musicData.queue.length ||
      oldPosition == newPosition
    ) {
      message.reply(':x: Gebe eine gültige Position ein!');
      return;
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
      return message.reply(':x: Kein Song spielt gerade!');
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      message.reply(
        `:no_entry: Du musst in dem gleichen Sprachkanal sein, wie der Bot, um ihn zu nutzen!`
      );
      return;
    } else if (message.guild.musicData.loopSong) {
      message.reply(
        ':x: Du musst den **loop** Befehl ausschalten, bevor du den **move** Befehl benutzen kannst.'
      );
      return;
    }

    const songName = message.guild.musicData.queue[oldPosition - 1].title;

    MoveSongCommand.array_move(
      message.guild.musicData.queue,
      oldPosition - 1,
      newPosition - 1
    );

    message.channel.send(`**${songName}** wurde auf die ${newPosition} Position verschoben.`);
  }
  // https://stackoverflow.com/a/5306832/9421002
  static array_move(arr, old_index, new_index) {
    while (old_index < 0) {
      old_index += arr.length;
    }
    while (new_index < 0) {
      new_index += arr.length;
    }
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
  }
};
