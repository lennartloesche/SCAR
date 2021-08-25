const { Command } = require('discord.js-commando');
const Discord = require('discord.js');
const DIG = require('discord-image-generation');

module.exports = class TriggeredCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'triggered',
      aliases: ['trigger'],
      memberName: 'triggered',
      group: 'utility',
      description: 'Triggered Gif',
      guildOnly: false
    });
  }

  async run(message) {
    let user;
    if (message.mentions.users.first()) {
      user = message.mentions.users.first();
    } else {
      user = message.author;
    }

    let avatar = await user.displayAvatarURL({ dynamic: false, format: 'png' });
    let image = await new DIG.Triggered().getImage(avatar);
    let attach = new Discord.MessageAttachment(image, 'triggered.gif');
    return message.channel.send(attach);
  }
};
