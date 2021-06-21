const { Command } = require('discord.js-commando');
const Discord = require('discord.js');

module.exports = class KissCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'kiss',
      memberName: 'kiss',
      group: 'utility',
      description: 'Küssen!',
      guildOnly: true
    });
  }
  async run(message, args) {
    const user = message.mentions.users.first();
    const name = message.author.username;

    message.delete();

    if (!user) {
      message
        .say('Bitte gebe eine Person an!')
        .then((m) => m.delete({ timeout: 15000 }));
      return;
    }
    let gifs = [
      'https://i.imgur.com/sGVgr74.gif',
      'https://i.imgur.com/TItLfqh.gif',
      'https://i.imgur.com/IgGumrf.gif',
      'https://i.imgur.com/e0ep0v3.gif',
      'https://i.imgur.com/So3TIVK.gif'
    ];
    let pick = gifs[Math.floor(Math.random() * gifs.length)];

    let embed = new Discord.MessageEmbed();
    embed.setColor('#c72810');
    embed.setImage(pick);

    if (message.author === user) return;

    if (args[0]) {
      embed.setImage(pick);
      embed.setTitle(`${name} **küsst** ${user.username} | **mwah mwah <3**`);
    }

    message.say(embed).then((m) => m.delete({ timeout: 120000 }));
  }
};
