const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

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
          validate: deleteCount => deleteCount < 100 && deleteCount > 0
        }
      ]
    });
  }
  run(message, { deleteCount }) {
    message.channel
      .bulkDelete(deleteCount)
      const embed = new MessageEmbed()
      .setTitle(`Löschung`)
      .setDescription(`Erfolgreich **${deleteCount} Nachrichten** gelöscht`)
      .setColor("#c72810")
      .setFooter(`Ausgeführt von: ${message.author.tag}`, `${message.author.displayAvatarURL()}`)
      .setTimestamp()
      message.say(embed).then(m => m.delete({timeout: 9000}))
      .catch(e => {
        console.error(e);
        return message.say(
          ':x: Fehler, beim löschen der Nachrichten!'
        );
      });
  }
};
