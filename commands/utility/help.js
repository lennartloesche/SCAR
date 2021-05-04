const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'help',
			memberName: 'help',
            group: 'utility',
			description: 'Help',
      guildOnly: false
		});
	}


	async run(message) {
		message.delete()
		const embed = new MessageEmbed()
		.setTitle(`Hilfe`)
		.setDescription(`Befehle können nachgeschaut werden auf: https://grauerdavid.de/scarcommands/`)
		.setColor("#c72810")
		.setTimestamp()
		message.say(embed).then(m => m.delete({timeout: 20000}))
	}
};
