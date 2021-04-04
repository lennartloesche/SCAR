const { MessageEmbed } = require('discord.js');
const { Command } = require('discord.js-commando');

const config = require("../../config.json");

module.exports = class LOLCommand extends Command {
	constructor(client) {
	  super(client, {
		name: 'lol',
		memberName: 'lol',
		group: 'rollen',
		description: "LoL Rolle",
		guildOnly: true,
		hidden: true
	  });
	}
	async run(message) {
		message.delete()
		var lol = config.lol
		let role = message.guild.roles.cache.find(role => role.name === `${lol}`);
		let member = message.member
	  
		if(message.member.roles.cache.some(role => role.name === `${lol}`)) {
		  member.roles.remove(role)
		  var embed = new MessageEmbed()
		  .setDescription(`**❯ ${lol} entfernt ✘**`)
		  .setColor("RED");
		  message.channel.send(embed).then(m => m.delete({timeout: 10000}))
		}
		else {
		  member.roles.add(role)
		  var embed = new MessageEmbed()
		  .setDescription(`**❯ ${lol} hinzugefügt ✓**`)
		  .setColor("GREEN");
		  message.channel.send(embed).then(m => m.delete({timeout: 10000}))
		}
	  }}