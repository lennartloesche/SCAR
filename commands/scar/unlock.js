const commando = require('discord.js-commando');
const Discord = require('discord.js');

module.exports = class UnlockCommand extends commando.Command {
    constructor(...args) {
        super(...args, {
			name: 'unlock',
			memberName: 'unlock',
            group: 'scar',
            usage: '<On> / <Off>',
			description: 'Channel entsperren',
             guildOnly: true,
            userPerms: ['MANAGE_GUILD', 'MANAGE_CHANNELS'],
            botPerms: ['ADMINISTRATOR']
		});
	}

  async run(message) {
        const channel = message.channel;
        if (channel.permissionsFor(message.guild.id).has('SEND_MESSAGES') === true) {
            return message.channel.send({
                embed: {
                    title: `${channel.name} | ${message.guild.name}`,
                    description: `${channel} ist nicht gesperrt.`,
                    color: 'GREEN',
                    timestamp: new Date()
                }
            })
        }

        channel.updateOverwrite(message.guild.id, {
            SEND_MESSAGES: true,
        });
        message.channel.send({
            embed: {
                title: 'Lockerung!',
                description: `${channel} wurde entsperrt von: ${message.author.tag}`,
                color: 'GREEN',
                timestamp: new Date()
            }
        })
    }
}