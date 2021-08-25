const { Command } = require('discord.js-commando');
const fetch = require('node-fetch');

module.exports = class ScreenshotCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ss',
      aliases: ['screenshot'],
      memberName: 'ss',
      group: 'utility',
      description: 'Screenshot von einer Website machen',
      guildOnly: false
    });
  }

  async run(message, args) {
    message.delete();
    const urls = args;
    if (!urls)
      return message
        .say(`Bitte gebe einen Link an!`)
        .then((m) => m.delete({ timeout: 5000 }));
    if (urls.length < 8)
      return message
        .say(':x: Die URL ist zu kurz! - 8 Zeichen mindestens.')
        .then((m) => m.delete({ timeout: 9000 }));

    const site = /^(https?:\/\/)/i.test(urls) ? urls : `http://${urls}`;
    try {
      const { body } = await fetch(
        `https://image.thum.io/get/width/1920/crop/675/noanimate/${site}`
      );

      return message.say(`Hier ist ein Screenshot von der Seite`, {
        files: [{ attachment: body, name: 'Screenshot.png' }]
      });
    } catch (err) {
      if (err.status === 404)
        return message
          .say('Keine Ergebnisse gefunden, gibt es die URL?')
          .then((m) => m.delete({ timeout: 14000 }));
      return message
        .say(`Fehler: \`${err.message}\`. Bitte versuche es später!`)
        .then((m) => m.delete({ timeout: 13000 }));
    }
  }
};
