const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class LookupCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'lookup',
      aliases: ['lookup', 'ip', 'whois', 'resolve'],
      memberName: 'lookup',
      group: 'utility',
      description: 'Zusätzliche Infos einer Domain/IP',
      throttling: {
        usages: 45, // 45 queries
        duration: 60 // every 60 seconds
      },
      args: [
        {
          key: 'text',
          prompt: 'Was möchtest du aufdecken? Bitte schreibe eine Domain/IP.',
          type: 'string',
          validate: function (text) {
            return text.length < 50;
          }
        }
      ]
    });
  }

  async run(message, { text }) {
    const resl = text;

    try {
      var res = await fetch(`http://ip-api.com/json/${text}`); // fetch json data from ip-api.com

      // json results
      const json = await res.json();
      function embedResolve() {
        //embed json results
        return new MessageEmbed()
          .setColor('#c72810')
          .setAuthor(
            'IP/Hostname Informationen',
            'https://i.imgur.com/3lIiIv9.png',
            'https://ip-api.com'
          )
          .addFields(
            { name: 'Angabe', value: resl, inline: true },
            { name: 'IP', value: json.query, inline: true },
            { name: '‎', value: '‎', inline: true },
            {
              name: 'Standort',
              value: `${json.city}, ${json.zip}, ${json.regionName}, ${json.country}`,
              inline: false
            },
            { name: 'Organisation', value: `${json.org}‎`, inline: true },
            { name: 'Internetanbieter', value: json.isp, inline: true },
            { name: 'OBO', value: json.as, inline: false }
          )
          .setTimestamp();
      }
      message.channel.send(embedResolve(json.isp));
    } catch (e) {
      console.error(e);
      message.say('Fehler');
      return;
    }
  }
};
