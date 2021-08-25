const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

const { color } = require('../../config.json');

module.exports = class ClearCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'clear',
      aliases: ['delete-messages', 'bulk-delete', 'purge', 'prune'],
      description: 'Löscht bis zu 99 Nachrichten',
      memberName: 'clear',
      group: 'scar',
      guildOnly: true,
      userPermissions: ['MANAGE_CHANNELS', 'MANAGE_MESSAGES'],
      args: [
        {
          key: 'deleteCount',
          prompt: 'Wie viele Nachrichten möchtest du löschen? (1-99)',
          type: 'integer',
          validate: (deleteCount) => deleteCount < 100 && deleteCount > 0
        }
      ]
    });
  }
  run(message, { deleteCount }) {
    message.channel.bulkDelete(deleteCount);
    const embed = new MessageEmbed()
      .setTitle(`Löschung`)
      .setDescription(`Erfolgreich **${deleteCount} Nachrichten** gelöscht`)
      .setColor(color)
      .setFooter(
        `Ausgeführt von: ${message.author.tag}`,
        `${message.author.displayAvatarURL()}`
      )
      .setTimestamp();
    message.say(embed).then((m) => m.delete({ timeout: 9000 }));
  }
};
