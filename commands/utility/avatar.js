const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

const { color } = require('../../config.json');

module.exports = class AvatarCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'avatar',
      aliases: ['profile-picture', 'profile-pic', 'pfp', 'av'],
      memberName: 'avatar',
      group: 'utility',
      description: 'User Avatar bekommen',
      guildOnly: true,
      args: [
        {
          key: 'user',
          prompt: 'Von welcher Person würdest du gerne den Avatar haben?',
          type: 'user',
          default: function defaultMember(msg) {
            return msg.author;
          }
        }
      ]
    });
  }

  run(message, { user }) {
    const embed = new MessageEmbed()
      .setTitle(user.tag)
      .setDescription(
        `
      Format:
      - [png](${user.displayAvatarURL({
        format: 'png',
        dynamic: true,
        size: 4096
      })})
      - [jpg](${user.displayAvatarURL({
        format: 'jpg',
        dynamic: true,
        size: 4096
      })})
      - [webp](${user.displayAvatarURL({
        format: 'webp',
        dynamic: true,
        size: 4096
      })})
      `
      )
      .setImage(
        user.displayAvatarURL({ format: 'png', dynamic: true, size: 4096 })
      )
      .setColor(color)
      .setFooter(
        `Angefragt von ${message.author.tag}`,
        `${message.author.displayAvatarURL()}`
      )
      .setTimestamp();
    message.embed(embed);
    return;
  }
};
