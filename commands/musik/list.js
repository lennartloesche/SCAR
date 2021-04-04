const { Command } = require('discord.js-commando');
const Pagination = require('discord-paginationembed');

module.exports = class ListCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'list',
      aliases: ['next-songs', 'q'],
      group: 'musik',
      memberName: 'list',
      guildOnly: true,
      description: 'Anzeige der Songs in der Warteschlange'
    });
  }

  run(message) {
    if (message.guild.musicData.queue.length == 0)
      return message.say(':x: Kein Song ist gerade in der Warteschlange!');
    const queueClone = message.guild.musicData.queue;
    const queueEmbed = new Pagination.FieldsEmbed()
      .setArray(queueClone)
      .setAuthorizedUsers([message.author.id])
      .setChannel(message.channel)
      .setElementsPerPage(10)
      .formatField('# - Song', function(e) {
        return `**${queueClone.indexOf(e) + 1}**: ${e.title}`;
      });

    queueEmbed.embed.setColor('#c72810').setTitle('Warteschlange');
    queueEmbed.build();
  }
};
