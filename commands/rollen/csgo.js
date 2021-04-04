const { MessageEmbed } = require('discord.js');
const { Command } = require('discord.js-commando');

const config = require("../../config.json");

module.exports = class CSGOCommand extends Command {
	constructor(client) {
	  super(client, {
		name: 'csgo',
		memberName: 'csgo',
		group: 'rollen',
		description: "CSGO Rolle",
		guildOnly: true,
		hidden: true
	  });
	}
	async run(message) {
		message.delete()
			var csgo = config.csgo
			let role = message.guild.roles.cache.find(role => role.name === `${csgo}`);
			let member = message.member
		  
			if(message.member.roles.cache.some(role => role.name === `${csgo}`)) {
			  member.roles.remove(role)
			  var embed = new MessageEmbed()
			  .setDescription(`**❯ ${csgo} entfernt ✘**`)
			  .setColor("RED");
			  message.channel.send(embed).then(m => m.delete({timeout: 10000}))
			}
			else {
			  member.roles.add(role)
			  var embed = new MessageEmbed()
			  .setDescription(`**❯ ${csgo} hinzugefügt ✓**`)
			  .setColor("GREEN");
			message.channel.send(embed).then(m => m.delete({timeout: 10000}))
			}
		}}