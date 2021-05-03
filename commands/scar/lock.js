const commando = require('discord.js-commando');
const Discord = require('discord.js');

module.exports = class LockCommand extends commando.Command {
    constructor(...args) {
        super(...args, {
			name: 'lock',
			aliases: ['lockdown'],
			memberName: 'lock',
            group: 'scar',
            usage: '<On>',
			description: 'Channel sperren',
             guildOnly: true,
            userPerms: ['MANAGE_GUILD', 'MANAGE_CHANNELS'],
            botPerms: ['ADMINISTRATOR']
		});
	}

  async run(message) {
        const channel = message.channel;
        if (channel.permissionsFor(message.guild.id).has('SEND_MESSAGES') === false) {
            return message.channel.send({
                embed: {
                    title: `${channel.name} | ${message.guild.name}`,
                    description: `${channel} wurde bereits gesperrt!`,
                    color: '#c72810',
                    timestamp: new Date()
                }
            })
        }

        channel.updateOverwrite(message.guild.id, {
            SEND_MESSAGES: false,
        });
        message.channel.send({
            embed: {
                title: `Lockdown! | ${message.guild.name}`,
                description: `${channel} wurde gesperrt von: ${message.author.tag}`,
                color: '#c72810',
                timestamp: new Date()
            }
        })
    }
}