const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const db = require('quick.db');
const TwitchAPI = require('../../resources/twitch/twitch-api.js');
const {
  twitchClientID,
  twitchClientSecret,
  prefix
} = require('../../config.json');

// Skips loading if not found in config.json
if (!twitchClientID || !twitchClientSecret) return;

module.exports = class TwitchAnnouncerSettingsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'twitch-announcer-settings',
      memberName: 'twitch-announcer-settings',
      aliases: [
        'twitchannouncesetting',
        'tasetting',
        'tasettings',
        'twitch-announcer-config',
        'twitchannouncerconfig',
        'taconfig'
      ],
      group: 'scar',
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],
      clientPermissions: ['MANAGE_MESSAGES', 'MENTION_EVERYONE'],
      examples: [
        '(Basic Setup)',
        '`' +
          `${prefix}twitch-announcer-settings streamer-name  text-channel-name` +
          '`',
        '(Optional Timer)',
        '`' + `${prefix}tasettings bacon-fixation general 3` + '`',
        `(Optional Message)`,
        '`' +
          `${prefix}tasettings bacon-fixation general 2 "Check out my stream"` +
          '`',
        '(Optional No Message)',
        '`' + `${prefix}tasettings bacon-fixation <channel-name> 2 none` + '`'
      ],
      description: 'Settings for the Twitch Announcer.',
      args: [
        {
          key: 'textRaw',
          prompt: 'Wie heißt der Streamer?',
          type: 'string'
        },
        {
          key: 'streamChannel',
          prompt:
            'In welchen Channel willst du, dass ich die Nachricht schreibe? (Nur den Namen ohne #)',
          type: 'string'
        },
        {
          key: 'timer',
          prompt:
            '(Optional) Wie oft möchtest du, das ich das checke? (1 bis 60 Minuten)',
          type: 'integer',
          default: 2,
          validate: function validate(timer) {
            return timer <= 60 && timer >= 0;
          }
        },
        {
          key: 'sayMsg',
          prompt:
            '(Optional) Change the default message that comes before the notification.',
          default: '᲼᲼᲼᲼᲼᲼',
          type: 'string',
          validate: function validateInput(sayMsg) {
            return sayMsg.length > 0;
          }
        }
      ]
    });
  }

  async run(message, { textRaw, streamChannel, timer, sayMsg }) {
    //Tests if Bot has the ability to alter messages
    try {
      await message.delete();
    } catch {
      message
        .say(
          `:no_entry: Ich benötige die Berechtigung, Nachrichten zu verwalten`
        )
        .then((m) => m.delete({ timeout: 15000 }));
      return;
    }

    //Twitch Section
    const textFiltered = textRaw.replace(/https\:\/\/twitch.tv\//g, '');
    try {
      var user = await TwitchAPI.getUserInfo(
        TwitchAPI.access_token,
        twitchClientID,
        textFiltered
      );
    } catch (e) {
      return;
    }

    //Saving to DB 1 Set
    var Twitch_DB = new db.table('Twitch_DB');
    Twitch_DB.set(`${message.guild.id}.twitchAnnouncer`, {
      botSay: sayMsg,
      name: user.data[0].display_name,
      channelID: streamChannel.id,
      channel: streamChannel.name,
      timer: timer,
      savedName: message.member.displayName,
      savedAvatar: message.author.displayAvatarURL(),
      date: Date.now()
    });

    const embed = new MessageEmbed()
      .setAuthor(
        message.member.guild.name + ' Einstellungen',
        `https://www.pikpng.com/pngl/b/45-455766_twitch-community-twitch-logo-png-transparent-clipart.png`,
        'https://twitch.tv/' + user.data[0].display_name
      )
      .setURL('https://twitch.tv/' + user.data[0].display_name)
      .setTitle(`Einstellungen wurden gespeichert!`)
      .setDescription(
        'Vergiss nicht ```+twitch-announcer enable``` auszuführen, um es zu starten!'
      )
      .setColor('#c72810')
      .setThumbnail(user.data[0].profile_image_url)
      .addField(`Streamer`, user.data[0].display_name, true)
      .addField(`Channel`, streamChannel.name, true)
      .addField('👥 Profilaufrufe:', user.data[0].view_count, true)
      .setFooter(message.member.displayName, message.author.displayAvatarURL())
      .setTimestamp();

    //Send Response
    message.channel.send(embed);
  }
};
