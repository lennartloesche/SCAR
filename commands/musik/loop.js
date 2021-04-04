const { Command } = require('discord.js-commando');

module.exports = class LoopCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'loop',
      memberName: 'loop',
      aliases: ['loop-queue', 'queue-loop'],
      group: 'musik',
      description: 'Warteschlange wiederholen lassen',
      guildOnly: true,
      args: [
        {
          key: 'numOfTimesToLoop',
          default: 1,
          type: 'integer',
          prompt: 'Wie viele mal willst du die Warteschlange loopen? (Standard ist 1 mal)'
        }
      ]
    });
  }

  run(message) {
    if (!message.guild.musicData.isPlaying) {
      message.say(':x: Kein Song spielt gerade!');
      return;
    } else if (
      message.member.voice.channel.id !== message.guild.me.voice.channel.id
    ) {
      message.reply(
        `:no_entry: Du musst in dem gleichen Sprachkanal sein, wie der Bot, um ihn zu nutzen!`
      );
      return;
    } else if (message.guild.musicData.queue.length == 0) {
      message.say(`:x: Ich kann keine leere Warteschlange loopen!`);
      return;
    } else if (message.guild.musicData.loopSong) {
      message.reply(
        ':x: Du musst den **repeat** Befehl ausschalten, bevor du den **loop** Befehl benutzen kannst'
      );
      return;
    }

    if (message.guild.musicData.loopQueue) {
      message.guild.musicData.loopQueue = false;
      message.channel.send(
        ':repeat: Die Warteschlange spielt nicht mehr im **loop**'
      );
    } else {
      message.guild.musicData.loopQueue = true;
      message.channel.send(':repeat: Die Warteschlange spielt nun im **loop**');
    }
  }
};
