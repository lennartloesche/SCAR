const { Command } = require('discord.js-commando');
const got = require('got');
const Discord = require('discord.js');

const { color } = require('../../config.json');

module.exports = class MemeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'meme',
      aliases: ['reddit', 'r'],
      memberName: 'meme',
      group: 'utility',
      description: 'Meme von Reddit',
      guildOnly: false,
      throttling: {
        usages: 1,
        duration: 8
      }
    });
  }

  async run(message) {
    message.delete();
    const embed = new Discord.MessageEmbed();
    got(
      'https://www.reddit.com/r/ich_iel+GermanMemes+kreiswichs+dankmemes/random/.json'
    ).then((response) => {
      let content = JSON.parse(response.body);
      let permalink = content[0].data.children[0].data.permalink;
      let memeUrl = `https://reddit.com${permalink}`;
      let memeImage = content[0].data.children[0].data.url;
      let memeTitle = content[0].data.children[0].data.title;
      let memeUpvotes = content[0].data.children[0].data.ups;
      let memeDownvotes = content[0].data.children[0].data.downs;
      embed.setTitle(`${memeTitle}`);
      embed.setURL(`${memeUrl}`);
      embed.setImage(memeImage);
      embed.setColor(color);
      embed.setFooter(`👍 ${memeUpvotes} 👎 ${memeDownvotes}`);
      message.channel.send(embed);
    });
  }
};
