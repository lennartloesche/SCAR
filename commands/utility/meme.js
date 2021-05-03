const { Command } = require('discord.js-commando');
const got = require('got');
const Discord = require('discord.js')

module.exports = class MemeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'meme',
			aliases: ['reddit', 'r'],
			memberName: 'meme',
            group: 'utility',
			description: 'Meme von Reddit',
      guildOnly: false
		});
	}

    async run(message) {

        const embed = new Discord.MessageEmbed()
        got('https://www.reddit.com/r/ich_iel+GermanMemes+kreiswichs+dankmemes/random/.json').then(response => {
        let content = JSON.parse(response.body);
        let permalink = content[0].data.children[0].data.permalink;
        let memeUrl = `https://reddit.com${permalink}`;
        let memeImage = content[0].data.children[0].data.url;
        let memeTitle = content[0].data.children[0].data.title;
        let memeUpvotes = content[0].data.children[0].data.ups;
        let memeDownvotes = content[0].data.children[0].data.downs;
        let memeNumComments = content[0].data.children[0].data.num_comments;
        embed.setTitle(`${memeTitle}`)
        embed.setURL(`${memeUrl}`)
        embed.setImage(memeImage)
        embed.setColor('#c72810')
        embed.setFooter(`👍 ${memeUpvotes} 👎 ${memeDownvotes}`)
        message.channel.send(embed);
    })
}
}