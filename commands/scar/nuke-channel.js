const Discord = require('discord.js');
const commando = require('discord.js-commando');

const { color } = require('../../config.json');

module.exports = class NukeChannelCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'nuke-channel',
      aliases: ['nuke'],
      memberName: 'nuke-channel',
      group: 'scar',
      description: 'Alle Nachrichten löschen',
      guildOnly: true,
      userPermissions: ['MANAGE_CHANNELS', 'MANAGE_MESSAGES']
    });
  }

  async run(message) {
    message.channel.send('**NUKE INCOMING!**');
    let channel = message.guild.channels.cache.get(message.channel.id);
    var position = channel.position;

    channel.clone().then((channel2) => {
      channel2.setPosition(position);
      channel.delete({ timeout: 1500 });
      const embed = new Discord.MessageEmbed()
        .setTitle(`**BOOM!**`)
        .setImage(`https://media.giphy.com/media/XUFPGrX5Zis6Y/giphy.gif`)
        .setColor(color);

      channel2.send(embed).then((m) => m.delete({ timeout: 20000 }));
    });
  }
};
