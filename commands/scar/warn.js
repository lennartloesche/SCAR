const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class MuteCommand extends Command {
	constructor(client) {
	  super(client, {
		name: 'warn',
		memberName: 'warn',
		group: 'scar',
		description: 'Warnt eine Person',
		guildOnly: true,
		userPermissions: ['MUTE_MEMBERS'],
		clientPermissions: ['MUTE_MEMBERS'],
	async run(message) {
		let mentioned = message.mentions.users.first(); 
	  	if(!mentioned) return message.channel.send(""); 
		let reason = args.slice(1).join(' ') 
		var warningEmbed = new MessageEmbed()
			  .setColor('#c72810')
			  .setTitle("Du wurdest verwarnt!")
			  .addFields({ name: 'Grund', value: reason })
			  .setTimestamp(message.createdAt)
			  .setFooter(client.user.username, client.user.displayAvatarURL())          
			  mentioned.send(warningEmbed);
			  var embed = new MessageEmbed()
			  .setDescription('**❯ Erfolgreich verwarnt ✓**')
			  .setColor("Green");
			  message.channel.send(embed);
			  message.delete();
		  }}
	  )}
};