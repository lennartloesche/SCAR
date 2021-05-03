const { MessageEmbed } = require('discord.js');
const { Command } = require('discord.js-commando');
const fetch = require('node-fetch');

module.exports = class CSGOStatsCommand extends Command {
	constructor(client) {
	  super(client, {
		name: 'csgostats',
		memberName: 'csgostats',
		group: 'stats',
		description: "CSGO Statistiken abrufen",
		guildOnly: false
	  });
	}
	async run(message, args) {
		const Spieler = args;
		const url = `https://public-api.tracker.gg/v2/csgo/standard/profile/steam/${Spieler}`;
		fetch(url, {
		  method: 'GET',
		  headers: {
			'TRN-Api-Key': `c15d418d-fc9f-4906-9c45-da17425d6125`,
			'Accept': 'application/json',
			'Accept-Encoding': 'gzip'
		  }
		})
		.then(res => res.json())
		.then(data => {
		const result = new Array();
		for(let i in data.data.segments[0].stats) {
		  const selectedStat = data.data.segments[0].stats[i];
		  result.push({
			name: selectedStat.displayName,
			value: selectedStat.displayValue,
			inline: true
		  });
		}
		const embed = new MessageEmbed()
		  .setAuthor(`${this.client.user.username} • Statistiken für ${Spieler}`, this.client.user.displayAvatarURL())
		  .setTimestamp(message.createdAt)
		  .setFooter(`${this.client.user.username}`, this.client.user.displayAvatarURL())
		  .setColor("#c72810")
		  .addFields(result);
		message.channel.send(embed);
		})
		.catch(e=> console.log('API Error: ', e));
	  }}