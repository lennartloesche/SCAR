const { Command } = require('discord.js-commando');
const Discord = require('discord.js');

module.exports = class RestartCommand extends Command {
	constructor(client) {
	  super(client, {
		name: 'restart',
		memberName: 'restart',
		group: 'utility',
		description: "Bot restarten",
		ownerOnly: true,
		guildOnly: false
	  });
	}

	async run() {
	process.exit()
}}