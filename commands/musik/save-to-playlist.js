const { Command } = require('discord.js-commando');
const db = require('quick.db');
const Youtube = require('simple-youtube-api');
const { youtubeAPI } = require('../../config.json');
const youtube = new Youtube(youtubeAPI);

module.exports = class SaveToPlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'save-to-playlist',
      aliases: ['stp', 'save-song', 'add-to-playlist', 'add-song'],
      group: 'musik',
      memberName: 'save-to-playlist',
      guildOnly: true,
      description: 'Einen Song oder eine Playlist in eine gespeicherte Playlist hinzufügen',
      args: [
        {
          key: 'playlist',
          prompt: 'Wie heißt die Playlist in der du den Song speichern willst?',
          type: 'string'
        },
        {
          key: 'url',
          prompt:
            'Welche URL möchtest du in der Playlist speichern? Es kann auch eine Playlist-URL sein',
          type: 'string',
          validate: function validateURL(url) {
            return (
              url.match(
                /^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/
              ) ||
              url.match(
                /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/
              ) ||
              url.match(
                /^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/
              )
            );
          }
        }
      ]
    });
  }

  async run(message, { playlist, url }) {
    const dbUserFetch = db.get(message.member.id);
    if (!dbUserFetch) {
      message.reply('Du hast keine gespeicherten Playlists!');
      return;
    }
    const savedPlaylistsClone = dbUserFetch.savedPlaylists;
    if (savedPlaylistsClone.length == 0) {
      message.reply('Du hast keine gespeicherten Playlists!');
      return;
    }
    let found = false;
    let location;
    for (let i = 0; i < savedPlaylistsClone.length; i++) {
      if (savedPlaylistsClone[i].name == playlist) {
        found = true;
        location = i;
        break;
      }
    }
    if (found) {
      let urlsArrayClone = savedPlaylistsClone[location].urls;
      const processedURL = await SaveToPlaylistCommand.processURL(url, message);
      if (Array.isArray(processedURL)) {
        urlsArrayClone = urlsArrayClone.concat(processedURL);
        savedPlaylistsClone[location].urls = urlsArrayClone;
        message.reply('Die Playlist die du angefragt hast, wurde erfolgreich gespeichert!');
      } else {
        urlsArrayClone.push(processedURL);
        savedPlaylistsClone[location].urls = urlsArrayClone;
        message.reply(
          `Ich habe **${
            savedPlaylistsClone[location].urls[
              savedPlaylistsClone[location].urls.length - 1
            ].title
          }** zu **${playlist}** hinzugefügt`
        );
      }
      db.set(message.member.id, { savedPlaylists: savedPlaylistsClone });
    } else {
      message.reply(`Du hast keine Playlist namens ${playlist}`);
      return;
    }
  }

  static async processURL(url, message) {
    if (
      url.match(/^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/)
    ) {
      const playlist = await youtube.getPlaylist(url).catch(function() {
        message.say(':x: Playlist ist privat oder existiert nicht!');
        return;
      });
      const videosArr = await playlist.getVideos().catch(function() {
        message.say(
          ':x: Es gab ein Problem bei einem Song in der Playlist!'
        );
        return;
      });
      let urlsArr = [];
      for (let i = 0; i < videosArr.length; i++) {
        if (videosArr[i].raw.status.privacyStatus == 'private') {
          continue;
        } else {
          try {
            const video = await videosArr[i].fetch();
            urlsArr.push(
              SaveToPlaylistCommand.constructSongObj(video, message.member.user)
            );
          } catch (err) {
            return console.error(err);
          }
        }
      }
      return urlsArr;
    }
    url = url
      .replace(/(>|<)/gi, '')
      .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    const id = url[2].split(/[^0-9a-z_\-]/i)[0];
    const video = await youtube.getVideoByID(id).catch(function() {
      message.say(':x: Es gab ein Problem bei dem Song, den du angegeben hast!');
      return;
    });
    if (video.raw.snippet.liveBroadcastContent === 'live') {
      message.reply("Ich unterstütze keine Livestreams!");
      return false;
    }
    return SaveToPlaylistCommand.constructSongObj(video, message.member.user);
  }
  static constructSongObj(video, user) {
    let duration = this.formatDuration(video.duration);
    return {
      url: `https://www.youtube.com/watch?v=${video.raw.id}`,
      title: video.title,
      rawDuration: video.duration,
      duration,
      thumbnail: video.thumbnails.high.url,
      memberDisplayName: user.username,
      memberAvatar: user.avatarURL('webp', false, 16)
    };
  }
  static formatDuration(durationObj) {
    const duration = `${durationObj.hours ? (durationObj.hours + ':') : ''}${
      durationObj.minutes ? durationObj.minutes : '00'
    }:${
      (durationObj.seconds < 10)
        ? ('0' + durationObj.seconds)
        : (durationObj.seconds
        ? durationObj.seconds
        : '00')
    }`;
    return duration;
  }
};
