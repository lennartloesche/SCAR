const { MessageEmbed } = require('discord.js');
const { Command } = require('discord.js-commando');

const config = require("../../config.json");

module.exports = class RLCommand extends Command {
	constructor(client) {
	  super(client, {
		name: 'rl',
		memberName: 'rl',
		group: 'rollen',
		description: "Rocket League Rolle",
		guildOnly: true,
		hidden: true
	  });
	}
	async run(message) {
		message.delete()
		var rl = config.rl
		let role = message.guild.roles.cache.find(role => role.name === `${rl}`);
		let member = message.member
	  
		if(message.member.roles.cache.some(role => role.name === `${rl}`)) {
		  member.roles.remove(role)
		  var embed = new MessageEmbed()
		  .setDescription(`**❯ ${rl} entfernt ✘**`)
		  .setColor("RED");
		  message.channel.send(embed).then(m => m.delete({timeout: 10000}))
		}
		else {
		  member.roles.add(role)
		  var embed = new MessageEmbed()
		  .setDescription(`**❯ ${rl} hinzugefügt ✓**`)
		  .setColor("GREEN");
		  message.channel.send(embed).then(m => m.delete({timeout: 10000}))
		}
	  }}