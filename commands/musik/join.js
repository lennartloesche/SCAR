const { Command } = require('discord.js-commando');

module.exports = class JoinCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'join',
      memberName: 'join',
      aliases: ['summon'],
      group: 'musik',
      guildOnly: true,
      clientPermissions: ['SPEAK', 'CONNECT'],
      description:
        'Sprachkanal betreten'
    });
  }

  async run(message) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.reply(':no_entry: Bitte betrete einen Sprachkanal und versuche es erneut!');
      return;
    }
    if (message.guild.musicData.isPlaying != true) {
      message.reply(':x: Kein Song in der Warteschlange.');
      return;
    }
    try {
      await voiceChannel.join();
      return;
    } catch {
      message.reply(':x Fehler, beim Versuch zu joinen. Bitte überprüfe die Berechtigungen!');
      return;
    }
  }
};
