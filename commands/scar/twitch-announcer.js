const { Command } = require('discord.js-commando');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const db = require('quick.db');
const TwitchAPI = require('../../resources/twitch/twitch-api.js');
const probe = require('probe-image-size');
const Canvas = require('canvas');
const {
  twitchClientID,
  twitchClientSecret,
  prefix
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
    var currentMsgStatus;
    var currentGame;
    var embedID;

    //Error Missing DB
    if (DBInfo == undefined)
      return message
        .say(
          'Es wurden keine Einstellungen gefunden! Bitte führe ```+twitch-announcer-settings``` aus.'
        )
        .then((m) => m.delete({ timeout: 15000 }));

    //Get Twitch Ready for Response Embeds
    const scope = 'user:read:email';
    let access_token; // Token is only valid for 24 Hours (needed to repeat this in Ticker Sections)
    let streamInfo;
    let gameInfo;
    try {
      access_token = await TwitchAPI.getToken(
        twitchClientID,
        twitchClientSecret,
        scope
      );
    } catch (e) {
      clearInterval(Ticker);
      return;
    }

    try {
      var user = await TwitchAPI.getUserInfo(
        access_token,
        twitchClientID,
        `${DBInfo.name}`
      );
    } catch (e) {
      clearInterval(Ticker);
      return;
    }

    //Enable Embed
    const enabledEmbed = new MessageEmbed()
      .setAuthor(
        message.member.guild.name + ' Einstellungen',
        `https://www.pikpng.com/pngl/b/45-455766_twitch-community-twitch-logo-png-transparent-clipart.png`,
        'https://twitch.tv/' + user.data[0].display_name
      )
      .setTitle(`:white_check_mark: Twitch Announcer aktiviert!`)
      .setColor('#c72810')
      .setThumbnail(user.data[0].profile_image_url)
      .addField('Nachricht', `${DBInfo.botSay}`)
      .addField(`Streamer`, `${DBInfo.name}`, true)
      .addField(`Channel`, `${DBInfo.channel}`, true)
      .addField('👥 Zuschauer:', user.data[0].view_count, true)
      .setFooter(DBInfo.savedName, DBInfo.savedAvatar)
      .setTimestamp(DBInfo.date);

    //Disable Embed
    const disabledEmbed = new MessageEmbed()
      .setAuthor(
        message.member.guild.name + ' Einstellungen',
        `https://www.pikpng.com/pngl/b/45-455766_twitch-community-twitch-logo-png-transparent-clipart.png`,
        'https://twitch.tv/' + user.data[0].display_name
      )
      .setTitle(`:x: Twitch Announcer deaktiviert!`)
      .setColor('#c72810')
      .setThumbnail(user.data[0].profile_image_url)
      .addField('Nachricht', `${DBInfo.botSay}`)
      .addField(`Streamer`, `${DBInfo.name}`, true)
      .addField(`Channel`, `${DBInfo.channel}`, true)
      .addField('👥 Zuschauer:', user.data[0].view_count, true)
      .setFooter(DBInfo.savedName, DBInfo.savedAvatar)
      .setTimestamp(DBInfo.date);

    //Check embed trigger
    if (textFiltered == 'check') {
      if (currentMsgStatus == 'disable')
        message.say(disabledEmbed).then((m) => m.delete({ timeout: 15000 }));
      else {
        return message
          .say(enabledEmbed)
          .then((m) => m.delete({ timeout: 15000 }));
      }
      return;
    }
    //Disable Set
    if (textFiltered == 'disable') {
      currentMsgStatus = 'disable';
      message.say(disabledEmbed).then((m) => m.delete({ timeout: 15000 }));
    }

    //Enable Set
    if (textFiltered == 'enable') {
      currentMsgStatus = 'enable';
      message.say(enabledEmbed).then((m) => m.delete({ timeout: 15000 }));

      //Ticker Section (Loop)
      var Ticker = setInterval(async function () {
        if (currentMsgStatus == 'disable') {
          clearInterval(Ticker);
          return;
        }

        let announcedChannel = message.guild.channels.cache.find(
          (channel) => channel.id == DBInfo.channelID
        );
        try {
          access_token = await TwitchAPI.getToken(
            twitchClientID,
            twitchClientSecret,
            scope
          );
        } catch (e) {
          clearInterval(Ticker);
          return;
        }

        try {
          user = await TwitchAPI.getUserInfo(
            access_token,
            twitchClientID,
            `${DBInfo.name}`
          );
        } catch (e) {
          clearInterval(Ticker);
          return;
        }

        var user_id = user.data[0].id;
        try {
          streamInfo = await TwitchAPI.getStream(
            access_token,
            twitchClientID,
            user_id
          );
        } catch (e) {
          clearInterval(Ticker);
          return;
        }

        //Offline Status Set
        if (!streamInfo.data[0] && currentMsgStatus == 'sent') {
          currentMsgStatus = 'offline';
        }
        //Online Status set
        if (
          currentMsgStatus != 'sent' &&
          streamInfo.data[0] &&
          currentMsgStatus != 'disable'
        ) {
          currentMsgStatus = 'online';
        }

        //Online Trigger
        if (currentMsgStatus == 'online') {
          currentGame = streamInfo.data[0].game_name;

          try {
            gameInfo = await TwitchAPI.getGames(
              access_token,
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
            clearInterval(Ticker);
            return;
          }

          //Online Embed
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
            .setColor('#c72810')
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

          //Online Send
          try {
            if (DBInfo.botSay.toLowerCase() != 'none') {
              await announcedChannel.send(onlineEmbed);
              embedID = announcedChannel.lastMessage.id;
            } else {
              await announcedChannel.send(onlineEmbed);
              embedID = announcedChannel.lastMessage.id;
            }
          } catch (error) {
            message
              .say(':x: Ich konnte keine Nachricht in den Textkanal schreiben')
              .then((m) => m.delete({ timeout: 15000 }));
            console.log(error);
            clearInterval(Ticker);
            return;
          }
          currentMsgStatus = 'sent';
        }

        //Offline Trigger
        if (currentMsgStatus == 'offline') {
          currentMsgStatus = 'end';
          const offlineEmbed = new MessageEmbed()
            .setAuthor(
              `${user.data[0].display_name} ist offline!`,
              user.data[0].profile_image_url,
              'https://twitch.tv/' + user.data[0].display_name
            )
            .setTitle(
              user.data[0].display_name + ' hat ' + currentGame + ' gestreamt'
            )
            .setColor('#c72810')
            .setTimestamp()
            .setFooter(
              'Stream beendet',
              'https://www.pikpng.com/pngl/b/45-455766_twitch-community-twitch-logo-png-transparent-clipart.png'
            )
            .setThumbnail('attachment://box_art.png');

          // Incase the there is no Profile Discription
          if (!user.data[0].description == '')
            offlineEmbed
              .addField('Profilbeschreibung:', user.data[0].description)

              .addField('👥 Profilaufrufe:', user.data[0].view_count, true);

          //Offline Edit
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
            message
              .say(':x: Ich konnte die Nachricht nicht bearbeiten')
              .then((m) => m.delete({ timeout: 15000 }));
            console.log(error);
            clearInterval(Ticker);
            return;
          }
        }
      }, DBInfo.timer * 60000); //setInterval() is in MS and needs to be converted to minutes
    }
  }
};
