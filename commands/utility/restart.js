const { Command } = require('discord.js-commando');
const Discord = require('discord.js');

const { color } = require('../../config.json');

module.exports = class RestartCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'restart',
      memberName: 'restart',
      group: 'utility',
      description: 'Bot restarten',
      ownerOnly: true,
      guildOnly: false
    });
  }

  async run(message) {
    const stop = new Discord.MessageEmbed()
      .setTitle(`Bot Restart!`)
      .setDescription(`Der Bot ist in **5 Sekunden** wieder online!`)
      .setColor(color)
      .setTimestamp();
    message.delete();

    if ((message.author.id = '137259014986792960')) {
      try {
        await message.channel
          .send(stop)
          .then((m) => m.delete({ timeout: 1000 }));
      } finally {
        process.exit();
      }
    }
  }
};
