const { Command } = require('discord.js-commando');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const db = require('quick.db');
const TwitchAPI = require('../../resources/twitch/twitch-api.js');
const probe = require('probe-image-size');
const Canvas = require('canvas');
const {
  twitchClientID,
  twitchClientSecret,
  prefix,
  color
} = require('../../config.json');

// Skips loading if not found in config.json
if (!twitchClientID || !twitchClientSecret) return;

module.exports = class TwitchAnnouncerCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'twitch-announcer',
      memberName: 'twitch-announcer',
      aliases: ['twitchannouncer', 'twitchannounce', 'ta'],
      group: 'scar',
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],
      clientPermissions: ['MANAGE_MESSAGES', 'MENTION_EVERYONE'],
      examples: [
        '```' + `${prefix}twitch-announcer enable`,
        `${prefix}twitch-announcer disable`,
        `${prefix}ta check` + '```'
      ],
      description: 'Enable, Disable oder Check den Twitch Announcer',
      args: [
        {
          key: 'textRaw',
          prompt: '**Enable**, **Disable** oder **Check**?',
          type: 'string',
          oneOf: ['enable', 'disable', 'check']
        }
      ]
    });
  }

  async run(message, { textRaw }) {
    // Grab DataBase 1 get
    var Twitch_DB = new db.table('Twitch_DB');
    const DBInfo = Twitch_DB.get(`${message.guild.id}.twitchAnnouncer`);

    var textFiltered = textRaw.toLowerCase();
    var embedID;
    let currentGame;

    // Error Missing DB
    if (DBInfo == undefined) {
      message
        .say(
          'Es wurden keine Einstellungen gefunden! Bitte führe ```+twitch-announcer-settings``` aus'
        )
        .then((m) => m.delete({ timeout: 15000 }));
      return;
    }

    try {
      var user = await TwitchAPI.getUserInfo(
        TwitchAPI.access_token,
        twitchClientID,
        `${DBInfo.name}`
      );
    } catch (e) {
      message.say(':x: ' + e).then((m) => m.delete({ timeout: 15000 }));
      return;
    }

    // Enable Embed
    const enabledEmbed = new MessageEmbed()
      .setAuthor(
        message.member.guild.name + ' Einstellungen',
        `https://www.pikpng.com/pngl/b/45-455766_twitch-community-twitch-logo-png-transparent-clipart.png`,
        'https://twitch.tv/' + user.data[0].display_name
      )
      .setTitle(`:white_check_mark: Twitch Announcer aktiviert!`)
      .setColor(color)
      .setThumbnail(user.data[0].profile_image_url)
      .addField(`Streamer`, `${DBInfo.name}`, true)
      .addField(`Channel`, `${DBInfo.channel}`, true)
      .addField('👥 Profilaufrufe:', user.data[0].view_count, true)
      .setFooter(DBInfo.savedName, DBInfo.savedAvatar)
      .setTimestamp(DBInfo.date);

    // Disable Embed
    const disabledEmbed = new MessageEmbed()
      .setAuthor(
        message.member.guild.name + ' Einstellungen',
        `https://www.pikpng.com/pngl/b/45-455766_twitch-community-twitch-logo-png-transparent-clipart.png`,
        'https://twitch.tv/' + user.data[0].display_name
      )
      .setTitle(`:x: Twitch Announcer deaktiviert!`)
      .setColor(color)
      .setThumbnail(user.data[0].profile_image_url)
      .addField(`Streamer`, `${DBInfo.name}`, true)
      .addField(`Channel`, `${DBInfo.channel}`, true)
      .addField('👥 Profilaufrufe:', user.data[0].view_count, true)
      .setFooter(DBInfo.savedName, DBInfo.savedAvatar)
      .setTimestamp(DBInfo.date);

    // Check Twitch Announcer Status
    if (textFiltered == 'check') {
      if (message.guild.twitchData.isRunning) {
        message.say(enabledEmbed).then((m) => m.delete({ timeout: 15000 }));
      } else {
        message.say(disabledEmbed).then((m) => m.delete({ timeout: 15000 }));
      }
      return;
    }

    // Enable Twitch Announcer
    if (textFiltered == 'enable') {
      if (message.guild.twitchData.isRunning == false) {
        var failedAttempts = 0;
        message.guild.twitchData.isRunning = true;
        message.guild.twitchData.Interval = setInterval(async function () {
          const announcedChannel = message.guild.channels.cache.find(
            (channel) => channel.id == DBInfo.channelID
          );

          try {
            var streamInfo = await TwitchAPI.getStream(
              TwitchAPI.access_token,
              twitchClientID,
              user.data[0].id
            );
          } catch (e) {
            ++failedAttempts;
            if (failedAttempts == 5) {
              message.guild.twitchData.isRunning = false;
              message.guild.twitchData.Interval = clearInterval(
                message.guild.twitchData.Interval
              );
            }
            return;
          }

          // Set Status to Offline
          if (
            !streamInfo.data[0] &&
            message.guild.twitchData.embedStatus == 'sent'
          ) {
            message.guild.twitchData.embedStatus = 'offline';
          }
          // Set Status To Online
          if (
            message.guild.twitchData.embedStatus != 'sent' &&
            streamInfo.data[0]
          ) {
            message.guild.twitchData.embedStatus = 'online';
          }

          // Online Status
          if (message.guild.twitchData.embedStatus == 'online') {
            currentGame = streamInfo.data[0].game_name;

            try {
              user = await TwitchAPI.getUserInfo(
                TwitchAPI.access_token,
                twitchClientID,
                `${DBInfo.name}`
              );
            } catch (e) {
              ++failedAttempts;
              if (failedAttempts == 5) {
                message.guild.twitchData.isRunning = false;
                message.guild.twitchData.Interval = clearInterval(
                  message.guild.twitchData.Interval
                );
              }
              return;
            }

            try {
              var gameInfo = await TwitchAPI.getGames(
                TwitchAPI.access_token,
                twitchClientID,
                streamInfo.data[0].game_id
              );

              var result = await probe(
                gameInfo.data[0].box_art_url.replace(/-{width}x{height}/g, '')
              );
              var canvas = Canvas.createCanvas(result.width, result.height);
              var ctx = canvas.getContext('2d');
              // Since the image takes time to load, you should await it
              var background = await Canvas.loadImage(
                gameInfo.data[0].box_art_url.replace(/-{width}x{height}/g, '')
              );
              // This uses the canvas dimensions to stretch the image onto the entire canvas
              ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
              // Use helpful Attachment class structure to process the file for you
              var attachment = new MessageAttachment(
                canvas.toBuffer(),
                'box_art.png'
              );
            } catch (e) {
              ++failedAttempts;
              if (failedAttempts == 5) {
                message.guild.twitchData.isRunning = false;
                message.guild.twitchData.Interval = clearInterval(
                  message.guild.twitchData.Interval
                );
              }
              return;
            }

            // Online Embed
            const onlineEmbed = new MessageEmbed()
              .setAuthor(
                `${user.data[0].display_name} ist online!`,
                user.data[0].profile_image_url,
                'https://twitch.tv/' + user.data[0].display_name
              )
              .setURL('https://twitch.tv/' + user.data[0].display_name)
              .setTitle(user.data[0].display_name + ' streamt ' + currentGame)
              .addField('Streamtitel:', streamInfo.data[0].title)
              .addField('🎮 Spiel:', streamInfo.data[0].game_name, true)
              .addField('👥 Zuschauer:', streamInfo.data[0].viewer_count, true)
              .setColor(color)
              .setFooter(
                'Stream gestartet',
                'https://www.pikpng.com/pngl/b/45-455766_twitch-community-twitch-logo-png-transparent-clipart.png'
              )
              .setImage(
                streamInfo.data[0].thumbnail_url
                  .replace(/{width}x{height}/g, '1920x1080')
                  .concat('?r=' + Math.floor(Math.random() * 10000 + 1))
              )
              .setTimestamp(streamInfo.data[0].started_at)
              .attachFiles(attachment)
              .setThumbnail('attachment://box_art.png');

            // Online Send
            try {
              if (DBInfo.botSay.toLowerCase() != 'none') {
                await announcedChannel.send(onlineEmbed).then((result) => {
                  embedID = result.id;
                });
              } else {
                await announcedChannel.send(onlineEmbed).then((result) => {
                  embedID = result.id;
                });
              }
            } catch (error) {
              ++failedAttempts;
              if (failedAttempts == 5) {
                message.say(
                  ':x: Ich konnte keine Nachricht in den Textkanal schreiben'
                );
                console.log(error);
                message.guild.twitchData.isRunning = false;
                message.guild.twitchData.Interval = clearInterval(
                  message.guild.twitchData.Interval
                );
              }
              return;
            }
            // Change Embed Status
            message.guild.twitchData.embedStatus = 'sent';
          }

          // Offline Status
          if (message.guild.twitchData.embedStatus == 'offline') {
            try {
              user = await TwitchAPI.getUserInfo(
                TwitchAPI.access_token,
                twitchClientID,
                `${DBInfo.name}`
              );
            } catch (e) {
              ++failedAttempts;
              if (failedAttempts == 5) {
                message.guild.twitchData.isRunning = false;
                message.guild.twitchData.Interval = clearInterval(
                  message.guild.twitchData.Interval
                );
              }
              return;
            }

            const offlineEmbed = new MessageEmbed()
              .setAuthor(
                `${user.data[0].display_name} ist offline!`,
                user.data[0].profile_image_url,
                'https://twitch.tv/' + user.data[0].display_name
              )
              .setTitle(
                user.data[0].display_name + ' hat ' + currentGame + ' gestreamt'
              )
              .setColor(color)
              .setTimestamp()
              .setFooter(
                'Stream beendet',
                'https://www.pikpng.com/pngl/b/45-455766_twitch-community-twitch-logo-png-transparent-clipart.png'
              )
              .setThumbnail('attachment://box_art.png');

            // Incase the there is no Profile Description
            if (!user.data[0].description == '') {
              offlineEmbed.addField(
                'Profilbeschreibung:',
                user.data[0].description
              );
            }
            offlineEmbed.addField(
              '👥 Profilaufrufe:',
              user.data[0].view_count,
              true
            );

            // Offline Edit
            try {
              await announcedChannel.messages
                .fetch({
                  around: embedID,
                  limit: 1
                })
                .then((msg) => {
                  const fetchedMsg = msg.first();
                  fetchedMsg
                    .edit(offlineEmbed)
                    .then((m) => m.delete({ timeout: 600000 }));
                });
            } catch (error) {
              ++failedAttempts;
              if (failedAttempts == 5) {
                message.say(':x: Ich konnte die Nachricht nicht bearbeiten');
                console.log(error);
                message.guild.twitchData.isRunning = false;
                message.guild.twitchData.Interval = clearInterval(
                  message.guild.twitchData.Interval
                );
              }
              return;
            }

            message.guild.twitchData.embedStatus = 'end';
          }

          failedAttempts = 0;
        }, DBInfo.timer * 60000);
      }
      message.channel.send(enabledEmbed);
      return;
    }

    // Disable Twitch Announcer
    if (textFiltered == 'disable') {
      message.guild.twitchData.isRunning = false;
      message.guild.twitchData.Interval = clearInterval(
        message.guild.twitchData.Interval
      );
      message.channel.send(disabledEmbed);
      return;
    }
  }
};
