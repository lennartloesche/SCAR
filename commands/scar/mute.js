const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

const { color } = require('../../config.json');

module.exports = class MuteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'mute',
      memberName: 'mute',
      group: 'scar',
      description: 'Mutet eine Person',
      guildOnly: true,
      userPermissions: ['MUTE_MEMBERS'],
      clientPermissions: ['MUTE_MEMBERS'],
      args: [
        {
          key: 'userToMute',
          prompt: 'Bitte tagge die Person (@Name) oder benutze seine ID.',
          type: 'member'
        },
        {
          key: 'reason',
          prompt: 'Nenne einen Grund?',
          type: 'string',
          default: `Kein Grund angegeben`
        }
      ]
    });
  }
  async run(message, { userToMute, reason }) {
    const mutedRole = message.guild.roles.cache.find(
      (role) => role.name === 'Kanal » Mute'
    );
    if (!mutedRole) {
      try {
        mutedRole = await message.guild.roles.create({
          name: 'Kanal » Mute',
          color: color,
          permissions: []
        });
        message.guild.channels.cache.forEach(async (channel) => {
          await channel.overwritePermissions(mutedRole, {
            SEND_MESSAGES: false,
            ADD_REACTIONS: false
          });
        });
      } catch (e) {
        console.log(e.stack);
      }
    }
    const user = userToMute;
    if (!user) return message.channel.send(':x: Bitte nenne eine Person.');
    user.roles
      .add(mutedRole)
      .then(() => {
        message.delete();
        const muteEmbed = new MessageEmbed()
          .addField('Gemutet:', user)
          .addField('Grund:', reason)
          .setFooter(`Gemutet von ${message.author.tag}`)
          .setColor(color);
        message.channel
          .send(muteEmbed)
          .then((m) => m.delete({ timeout: 120000 }));
      })
      .catch((err) => {
        message.say(':x: Fehler, beim muten der Person.');
        return console.error(err);
      });
  }
};
