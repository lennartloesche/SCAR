const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const Youtube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const { getData } = require('spotify-url-info');
const { youtubeAPI, color } = require('../../config.json');
let {
  playLiveStreams,
  playVideosLongerThan1Hour,
  maxQueueLength,
  AutomaticallyShuffleYouTubePlaylists,
  LeaveTimeOut,
  MaxResponseTime,
  deleteOldPlayMessage
} = require('../../options.json');
const db = require('quick.db');
const Pagination = require('discord-paginationembed');

const youtube = new Youtube(youtubeAPI);
// Check If Options are Valid
if (typeof playLiveStreams !== 'boolean') playLiveStreams = true;
if (typeof maxQueueLength !== 'number' || maxQueueLength < 1) {
  maxQueueLength = 1000;
}
if (typeof LeaveTimeOut !== 'number') {
  LeaveTimeOut = 90;
}
if (typeof MaxResponseTime !== 'number') {
  MaxResponseTime = 30;
}
if (typeof AutomaticallyShuffleYouTubePlaylists !== 'boolean') {
  AutomaticallyShuffleYouTubePlaylists = false;
}
if (typeof playVideosLongerThan1Hour !== 'boolean') {
  playVideosLongerThan1Hour = true;
}
if (typeof deleteOldPlayMessage !== 'boolean') {
  deleteOldPlayMessage = false;
}

// If the Options are outside of min or max then use the closest number
LeaveTimeOut = LeaveTimeOut > 600 ? 600 : LeaveTimeOut &&
  LeaveTimeOut < 2 ? 1 : LeaveTimeOut; // prettier-ignore

MaxResponseTime = MaxResponseTime > 150 ? 150 : MaxResponseTime &&
  MaxResponseTime < 5 ? 5 : MaxResponseTime; // prettier-ignore
module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      aliases: ['play-song', 'add', 'p'],
      memberName: 'play',
      group: 'musik',
      description: 'Song abspielen von YouTube',
      guildOnly: true,
      clientPermissions: [
        'SPEAK',
        'CONNECT',
        'SEND_MESSAGES',
        'MANAGE_MESSAGES'
      ],
      throttling: {
        usages: 2,
        duration: 5
      },
      args: [
        {
          key: 'query',
          prompt:
            ':notes: Welchen Song oder welche Playlist möchtest du dir anhören?',
          type: 'string',
          validate: function (query) {
            return query.length > 0 && query.length < 200;
          }
        }
      ]
    });
  }

  async run(message, { query }) {
    // Make sure that only users present in a voice channel can use 'play'
    if (!message.member.voice.channel) {
      message.say('Bitte betrete einen Sprachkanal und versuche es erneut!');
      return;
    }
    // Make sure there isn't a 'music-trivia' running
    if (message.guild.triviaData.isTriviaRunning) {
      message.say(':x: Please try after the trivia has ended!');
      return;
    }

    //Parse query to check for flags

    var splitQuery = query.split(' ');
    var shuffleFlag = splitQuery[splitQuery.length - 1] === '-s';
    var reverseFlag = splitQuery[splitQuery.length - 1] === '-r';
    var nextFlag = splitQuery[splitQuery.length - 1] === '-n';
    var jumpFlag = splitQuery[splitQuery.length - 1] === '-j';

    if (shuffleFlag || reverseFlag || nextFlag || jumpFlag) splitQuery.pop();
    query = splitQuery.join(' ');

    // Check if the query is actually a saved playlist name

    if (db.get(message.member.id) !== null) {
      const playlistsArray = db.get(message.member.id).savedPlaylists;
      const found = playlistsArray.find((playlist) => playlist.name === query);

      // Found a playlist with a name matching the query and it's not empty
      if (found && playlistsArray[playlistsArray.indexOf(found)].urls.length) {
        const fields = [
          {
            name: ':arrow_forward: Playlist',
            value: '1. Gespeicherte Playlist wiedergeben'
          },
          {
            name: ':twisted_rightwards_arrows: Shuffle Playlist',
            value: '2. Shuffle & spiele Gespeicherte Playlist ab'
          },
          {
            name: 'YouTube',
            value: '3. Auf YouTube suchen'
          },
          {
            name: ':x: Abbruch',
            value: '4. Abbrechen'
          }
        ];

        let hasHistoryField = false;
        const index = String(Number(query) - 1);
        if (
          Number(query) &&
          typeof message.guild.musicData.queueHistory[index] !== 'undefined'
        ) {
          hasHistoryField = true;
          fields.unshift({
            name: ':arrow_backward: Zuvor gespielter Song',
            value: `0. Spiel '${message.guild.musicData.queueHistory[index].title}'`
          });
        }

        const clarificationEmbed = new MessageEmbed()
          .setColor(color)
          .setTitle('Wähle aus.')
          .addFields(fields)
          .setDescription(
            `Du hast eine Playlist namens **${query}**, wolltest du die Playlist suchen oder **${query}** auf Youtube wiedergeben?`
          )
          .setFooter('Suche aus, indem du eine Nummer von 1 bis 3 schreibst.');

        const ClarificationEmbedMessage = await message.channel.send(
          clarificationEmbed
        );

        // Wait for a proper response on the clarification embed
        message.channel
          .awaitMessages(
            (msg) => ['0', '1', '2', '3', '4'].includes(msg.content),
            {
              max: 1,
              time: MaxResponseTime * 1000,
              errors: ['time']
            }
          )
          .then(async function onProperResponse(response) {
            response = response.first().content;
            if (ClarificationEmbedMessage)
              ClarificationEmbedMessage.delete().catch(console.error);

            switch (response) {
              case '0':
                if (!hasHistoryField) break;
                if (!message.guild.musicData.isPlaying) {
                  message.guild.musicData.queue.unshift(
                    message.guild.musicData.queueHistory[index]
                  );
                  playSong(message.guild.musicData.queue, message);
                  break;
                }
                if (nextFlag || jumpFlag) {
                  message.guild.musicData.queue.unshift(
                    message.guild.musicData.queueHistory[index]
                  );
                  if (jumpFlag && message.guild.musicData.songDispatcher) {
                    message.guild.musicData.loopSong = false;
                    message.guild.musicData.songDispatcher.end();
                  }
                } else {
                  message.guild.musicData.queue.push(
                    message.guild.musicData.queueHistory[index]
                  );
                }
                message.say(
                  `'${message.guild.musicData.queueHistory[index].title}' wurde zur Warteschlange hinzugefügt!`
                );

                break;
              // 1: Play the saved playlist
              case '1':
                playlistsArray[playlistsArray.indexOf(found)].urls.map((song) =>
                  message.guild.musicData.queue.push(song)
                );

                if (message.guild.musicData.isPlaying) {
                  // Send a message indicating that the playlist was added to the queue
                  interactiveEmbed(message)
                    .addField(
                      'Playlist',
                      `**${query}** hinzugefügt ${
                        playlistsArray[playlistsArray.indexOf(found)].urls
                          .length
                      } Songs.`
                    )
                    .build();
                } else {
                  message.guild.musicData.isPlaying = true;
                  playSong(message.guild.musicData.queue, message);
                }
                break;
              // 2: Play the shuffled saved playlist
              case '2':
                shuffleArray(
                  playlistsArray[playlistsArray.indexOf(found)].urls
                ).map((song) => message.guild.musicData.queue.push(song));

                if (message.guild.musicData.isPlaying) {
                  // Send a message indicating that the playlist was added to the queue
                  interactiveEmbed(message)
                    .addField(
                      'Playlist',
                      `**${query}** hinzugefügt ${
                        playlistsArray[playlistsArray.indexOf(found)].urls
                          .length
                      } Songs.`
                    )
                    .build();
                } else {
                  message.guild.musicData.isPlaying = true;
                  playSong(message.guild.musicData.queue, message);
                }
                break;
              // 3: Search for the query on YouTube
              case '3':
                await searchYoutube(
                  query,
                  message,
                  message.member.voice.channel
                );
                break;
              // 4: Cancel
              case '4':
                break;
            }
          })
          .catch(function onResponseError() {
            if (ClarificationEmbedMessage)
              ClarificationEmbedMessage.delete().catch(console.error);
            return;
          });
        return;
      }
    }

    // check if the user wants to play a song from the history queue
    if (Number(query)) {
      const index = String(Number(query) - 1);
      // continue if there's no index matching the query on the history queue
      if (typeof message.guild.musicData.queueHistory[index] === 'undefined') {
        return;
      }
      const clarificationEmbed = new MessageEmbed()
        .setColor(color)
        .setTitle('Wähle aus.')
        .setDescription(`Wolltest du einen Song aus der Warteschlange spielen?`)
        .addField(
          `:arrow_forward: Warteschlange`,
          `1. Spiele Songnummer ${query}`
        )
        .addField(`YouTube`, `2. Suche '${query}' auf YouTube`)
        .addField(':x: Abbruch', '3. Abbrechen')
        .setFooter('Suche aus, indem du eine Nummer von 1 bis 3 schreibst.');
      const ClarificationEmbedMessage = await message.channel.send(
        clarificationEmbed
      );

      // Wait for a proper response on the clarification embed
      message.channel
        .awaitMessages((msg) => ['1', '2', '3'].includes(msg.content), {
          max: 1,
          time: MaxResponseTime * 1000,
          errors: ['time']
        })
        .then(async function onProperResponse(response) {
          response = response.first().content;
          if (ClarificationEmbedMessage)
            ClarificationEmbedMessage.delete().catch(console.error);

          switch (response) {
            // 1: Play a song from the history queue
            case '1':
              if (!message.guild.musicData.isPlaying) {
                message.guild.musicData.queue.unshift(
                  message.guild.musicData.queueHistory[index]
                );
                playSong(message.guild.musicData.queue, message);
                break;
              }
              if (nextFlag || jumpFlag) {
                message.guild.musicData.queue.unshift(
                  message.guild.musicData.queueHistory[index]
                );
                if (jumpFlag && message.guild.musicData.songDispatcher) {
                  message.guild.musicData.loopSong = false;
                  message.guild.musicData.songDispatcher.end();
                }
              } else {
                message.guild.musicData.queue.push(
                  message.guild.musicData.queueHistory[index]
                );
              }
              message.say(
                `'${message.guild.musicData.queueHistory[index].title}' wurde zur Warteschlange hinzugefügt!`
              );
              break;
            // 2: Search for the query on YouTube
            case '2':
              await searchYoutube(query, message, message.member.voice.channel);
              break;
            // 3: Cancel
            case '3':
              break;
          }
        });
      return;
    }

    if (isSpotifyURL(query)) {
      getData(query)
        .then(async (data) => {
          // 'tracks' property only exists on a playlist data object
          if (data.tracks) {
            // handle playlist
            const spotifyPlaylistItems = data.tracks.items;
            const processingMessage = await message.channel.send(
              'Playlist wird geladen...'
            );
            for (let i = 0; i < spotifyPlaylistItems.length; i++) {
              const artistsAndName = concatSongNameAndArtists(
                spotifyPlaylistItems[i].track
              );
              const ytResult = await ytsr(artistsAndName, { limit: 1 });
              const video = {
                title: ytResult.items[0].title,
                url: ytResult.items[0].url,
                thumbnails: {
                  high: {
                    url: `https://i.ytimg.com/vi/${ytResult.items[0].id}/hqdefault.jpg`
                  }
                },
                // the true value is used to differentiate this duration from the rawDuration recieved from the YT API
                duration: [ytResult.items[0].duration, true]
              };
              if (nextFlag || jumpFlag) {
                flagLogic(message, video, jumpFlag);
              } else {
                message.guild.musicData.queue.push(
                  constructSongObj(
                    video,
                    message.member.voice.channel,
                    message.member.user
                  )
                );
              }
            }
            processingMessage.edit('Playlist geladen!');
            if (
              !message.guild.musicData.isPlaying ||
              typeof message.guild.musicData.isPlaying == 'undefined'
            ) {
              message.guild.musicData.isPlaying = true;
              playSong(message.guild.musicData.queue, message);
              return;
            }
            return;
          }
          // single track
          else {
            const artistsAndName = concatSongNameAndArtists(data);
            // Search on YT
            const ytResult = await ytsr(artistsAndName, { limit: 1 });
            const video = {
              title: ytResult.items[0].title,
              url: ytResult.items[0].url,
              thumbnails: {
                high: {
                  url: `https://i.ytimg.com/vi/${ytResult.items[0].id}/hqdefault.jpg`
                }
              },
              // the true value is used to differentiate this duration from the rawDuration recieved from the YT API
              duration: [ytResult.items[0].duration, true]
            };
            if (nextFlag || jumpFlag) {
              flagLogic(message, video, jumpFlag);
            } else {
              message.guild.musicData.queue.push(
                constructSongObj(
                  video,
                  message.member.voice.channel,
                  message.member.user
                )
              );
            }
            if (
              !message.guild.musicData.isPlaying ||
              typeof message.guild.musicData.isPlaying == 'undefined'
            ) {
              message.guild.musicData.isPlaying = true;
              playSong(message.guild.musicData.queue, message);
              return;
            }
          }
        })
        .catch((error) => {
          console.error(error);
          message.say(`Ich konnte deine Anfrage nicht finden.`);
        });
      return;
    }

    if (isYouTubePlaylistURL(query)) {
      const playlist = await youtube.getPlaylist(query);
      if (!playlist)
        return message.say(':x: Playlist ist privat oder existiert nicht!');

      let videosArr = await playlist.getVideos();
      if (!videosArr)
        return message.say(':x: Es gab ein Problem beim Abrufen der Playlist.');

      if (AutomaticallyShuffleYouTubePlaylists || shuffleFlag) {
        videosArr = shuffleArray(videosArr);
      }

      if (reverseFlag) {
        videosArr = videosArr.reverse();
      }

      if (message.guild.musicData.queue.length >= maxQueueLength)
        return message.say(
          'Die Warteschlange ist voll, bitte füge später neue Songs hinzu.'
        );
      videosArr = videosArr.splice(
        0,
        maxQueueLength - message.guild.musicData.queue.length
      );

      //variable to know how many songs were skipped because of privacyStatus
      var skipAmount = 0;

      await videosArr.reduce(async (memo, video, key) => {
        await memo;
        // don't process private videos
        if (
          video.raw.status.privacyStatus == 'private' ||
          video.raw.status.privacyStatus == 'privacyStatusUnspecified'
        ) {
          skipAmount++;
          return;
        }

        try {
          const fetchedVideo = await video.fetch();
          if (nextFlag || jumpFlag) {
            message.guild.musicData.queue.splice(
              key - skipAmount,
              0,
              constructSongObj(
                fetchedVideo,
                message.member.voice.channel,
                message.member.user
              )
            );
          } else {
            message.guild.musicData.queue.push(
              constructSongObj(
                fetchedVideo,
                message.member.voice.channel,
                message.member.user
              )
            );
          }
        } catch (err) {
          return console.error(err);
        }
      }, undefined);
      if (jumpFlag && message.guild.musicData.songDispatcher) {
        message.guild.musicData.loopSong = false;
        message.guild.musicData.songDispatcher.end();
      }
      if (!message.guild.musicData.isPlaying) {
        message.guild.musicData.isPlaying = true;
        playSong(message.guild.musicData.queue, message);
        return;
      } else {
        interactiveEmbed(message)
          .addField(
            'Playlist hinzugefügt:',
            `[${playlist.title}](${playlist.url})`
          )
          .build();
        return;
      }
    }

    if (isYouTubeVideoURL(query)) {
      const id = query
        .replace(/(>|<)/gi, '')
        .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)[2]
        .split(/[^0-9a-z_\-]/i)[0];

      const timestampRegex = /t=([^#&\n\r]+)/g;
      let timestamp = timestampRegex.exec(query);
      if (!timestamp) {
        timestamp = 0;
      } else {
        timestamp = timestamp[1];
        if (timestamp.endsWith('s')) {
          timestamp = timestamp.substring(0, timestamp.indexOf('s'));
        }
        if (!Number(timestamp)) timestamp = 0;
      }
      timestamp = Number(timestamp);

      const video = await youtube.getVideoByID(id).catch(function () {
        message.say(
          ':x: Es gab ein Problem bei dem Song, den du angegeben hast!'
        );
      });
      if (!video) return;

      if (
        video.raw.snippet.liveBroadcastContent === 'live' &&
        !playLiveStreams
      ) {
        message.say('Livestreams sind ausgeschaltet');
        return;
      }

      if (video.duration.hours !== 0 && !playVideosLongerThan1Hour) {
        message.say(
          'Videos, die länger als 1 Stunde sind, kann ich nicht abspielen! Wenn du Songs abspielen willst, die länger als 1 Stunde sind, dann kontaktiere David'
        );
        return;
      }

      if (message.guild.musicData.queue.length > maxQueueLength) {
        message.say(
          `Die Warteschlange hat das Limit von ${maxQueueLength} erreicht, bitte warte etwas, bis du wieder Songs hinzufügst`
        );
        return;
      }
      if (nextFlag || jumpFlag) {
        flagLogic(message, video, jumpFlag);
      } else {
        message.guild.musicData.queue.push(
          constructSongObj(
            video,
            message.member.voice.channel,
            message.member.user,
            timestamp
          )
        );
      }

      if (
        !message.guild.musicData.isPlaying ||
        typeof message.guild.musicData.isPlaying == 'undefined'
      ) {
        message.guild.musicData.isPlaying = true;
        playSong(message.guild.musicData.queue, message);
        return;
      }

      interactiveEmbed(message)
        .addField(
          'Zur Warteschlange hinzugefügt:',
          `[${video.title}](${video.url})`
        )
        .build();
      return;
    }

    // If user provided a song/video name
    await searchYoutube(
      query,
      message,
      message.member.voice.channel,
      nextFlag,
      jumpFlag
    );
  }
};

var playSong = (queue, message) => {
  if (queue[0].voiceChannel == undefined) {
    // happens when loading a saved playlist
    queue[0].voiceChannel = message.member.voice.channel;
  }
  if (message.guild.me.voice.channel !== null) {
    if (message.guild.me.voice.channel.id !== queue[0].voiceChannel.id) {
      queue[0].voiceChannel = message.guild.me.voice.channel;
    }
  }
  queue[0].voiceChannel
    .join()
    .then(function (connection) {
      const dispatcher = connection
        .play(
          ytdl(queue[0].url, {
            filter: 'audio',
            quality: 'highestaudio',
            highWaterMark: 1 << 25
          }),
          {
            seek: queue[0].timestamp
          }
        )
        .on('start', function () {
          message.guild.musicData.songDispatcher = dispatcher;
          // Volume Settings
          if (!db.get(`${message.guild.id}.serverSettings.volume`)) {
            dispatcher.setVolume(message.guild.musicData.volume);
          } else {
            dispatcher.setVolume(
              db.get(`${message.guild.id}.serverSettings.volume`)
            );
          }

          message.guild.musicData.isPreviousTrack = false;

          message.guild.musicData.nowPlaying = queue[0];
          queue.shift();
          // Main Message
          interactiveEmbed(message).build();
        })
        .on('finish', function () {
          // Save the volume when the song ends
          db.set(
            `${message.member.guild.id}.serverSettings.volume`,
            message.guild.musicData.songDispatcher.volume
          );

          if (!message.guild.musicData.isPreviousTrack) {
            message.guild.musicData.queueHistory.unshift(
              message.guild.musicData.nowPlaying
            );
          }

          if (message.guild.musicData.queueHistory.length > 1000) {
            // limit the history queue at 1000 elements
            message.guild.musicData.queueHistory.pop();
          }

          queue = message.guild.musicData.queue;
          if (message.guild.musicData.loopSong) {
            queue.unshift(message.guild.musicData.nowPlaying);
          } else if (message.guild.musicData.loopQueue) {
            queue.push(message.guild.musicData.nowPlaying);
          }
          if (queue.length >= 1) {
            playSong(queue, message);
            return;
          } else {
            message.guild.musicData.isPlaying = false;
            message.guild.musicData.nowPlaying = null;
            message.guild.musicData.songDispatcher = null;
            if (
              message.guild.me.voice.channel &&
              message.guild.musicData.skipTimer
            ) {
              message.guild.me.voice.channel.leave();
              message.guild.musicData.skipTimer = false;
              return;
            }
            if (message.guild.me.voice.channel) {
              if (LeaveTimeOut > 0) {
                setTimeout(function onTimeOut() {
                  if (
                    message.guild.musicData.isPlaying == false &&
                    message.guild.me.voice.channel
                  ) {
                    message.guild.me.voice.channel.leave();
                    message.channel
                      .send(
                        'Aufgrund von Inaktivität habe ich den Channel verlassen.'
                      )
                      .then((m) => m.delete({ timeout: 10000 }));
                  }
                }, LeaveTimeOut * 1000);
              }
            }
          }
        })
        .on('error', function (e) {
          message.say(
            'Ich kann den Song nicht abspielen, bitte wähle einen anderen!'
          );
          console.error(e);
          if (queue.length > 1) {
            queue.shift();
            playSong(queue, message);
            return;
          }
          message.guild.resetMusicDataOnError();
          if (message.guild.me.voice.channel) {
            message.guild.me.voice.channel.leave();
          }
          return;
        });
    })
    .catch(function (error) {
      message.say(
        ':no_entry: Ich habe keine Berechtigung den Sprachkanal zu betreten!'
      );
      console.error(error);
      message.guild.resetMusicDataOnError();
      if (message.guild.me.voice.channel) {
        message.guild.me.voice.channel.leave();
      }
      return;
    });
};

var playbackBar = (data) => {
  if (data.nowPlaying.duration === 'Live Stream') return '';
  const formatTime = compose(timeString, millisecondsToTimeObj);

  const passedTimeInMS = data.songDispatcher.streamTime;
  const songLengthFormatted = timeString(data.nowPlaying.rawDuration);
  const songLengthInMS = rawDurationToMilliseconds(data.nowPlaying.rawDuration);

  const playback = Array(11).fill('▬');
  playback[Math.floor((passedTimeInMS / songLengthInMS) * 11)] =
    ':musical_note:';

  return `${formatTime(passedTimeInMS)} ${playback.join(
    ''
  )} ${songLengthFormatted}`;
};

var searchYoutube = async (
  query,
  message,
  voiceChannel,
  nextFlag,
  jumpFlag
) => {
  const videos = await youtube.searchVideos(query, 5).catch(async function () {
    await message.say(
      'Es gab ein Problem bei dem Song, den du angegeben hast!'
    );
    return;
  });
  if (!videos) {
    message.say(
      `Ich hatte Probleme beim Finden der Eingabe, versuche es mal spezifischer.`
    );
    return;
  }
  if (videos.length < 5) {
    message.say(
      `Ich hatte Probleme beim Finden der Eingabe, versuche es mal spezifischer.`
    );
    return;
  }
  const vidNameArr = [];
  for (let i = 0; i < videos.length; i++) {
    vidNameArr.push(
      `${i + 1}: [${videos[i].title
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")}](${videos[i].shortURL})`
    );
  }
  vidNameArr.push('cancel');
  const embed = createResultsEmbed(vidNameArr, videos[0]);
  var songEmbed = await message.channel.send({ embed });
  message.channel
    .awaitMessages(
      function (msg) {
        return (msg.content > 0 && msg.content < 6) || msg.content === 'cancel';
      },
      {
        max: 1,
        time: MaxResponseTime * 1000,
        errors: ['time']
      }
    )
    .then(function (response) {
      const videoIndex = parseInt(response.first().content);
      if (response.first().content === 'cancel') {
        songEmbed.delete();
        return;
      }
      youtube
        .getVideoByID(videos[videoIndex - 1].id)
        .then(function (video) {
          if (
            video.raw.snippet.liveBroadcastContent === 'live' &&
            !playLiveStreams
          ) {
            songEmbed.delete();
            message.say('Livestreams sind ausgeschaltet!');
            return;
          }

          if (video.duration.hours !== 0 && !playVideosLongerThan1Hour) {
            songEmbed.delete();
            message.say(
              'Videos, die länger als 1 Stunde sind, kann ich nicht abspielen! Wenn du Songs abspielen willst, die länger als 1 Stunde sind, dann kontaktiere David'
            );
            return;
          }

          if (message.guild.musicData.queue.length > maxQueueLength) {
            songEmbed.delete();
            message.say(
              `Die Warteschlange hat das Limit von ${maxQueueLength} erreicht, bitte warte etwas, bis du wieder Songs hinzufügst`
            );
            return;
          }
          if (nextFlag || jumpFlag) {
            message.guild.musicData.queue.unshift(
              constructSongObj(video, voiceChannel, message.member.user)
            );
            if (jumpFlag && message.guild.musicData.songDispatcher) {
              message.guild.musicData.loopSong = false;
              message.guild.musicData.songDispatcher.end();
            }
          } else {
            message.guild.musicData.queue.push(
              constructSongObj(video, voiceChannel, message.member.user)
            );
          }
          if (message.guild.musicData.isPlaying == false) {
            message.guild.musicData.isPlaying = true;
            if (songEmbed) {
              songEmbed.delete();
            }
            playSong(message.guild.musicData.queue, message);
          } else if (message.guild.musicData.isPlaying == true) {
            if (songEmbed) {
              songEmbed.delete();
            }
            // Added song to queue message (search)
            interactiveEmbed(message)
              .addField(
                'Zur Warteschlange hinzugefügt:',
                `[${video.title}](${video.url})`
              )
              .build();
            return;
          }
        })
        .catch(function () {
          if (songEmbed) {
            songEmbed.delete();
          }
          message
            .say(
              'Ein Fehler ist beim Abruf der Video ID aufgetreten. Bitte versuche es erneut.'
            )
            .then((m) => m.delete({ timeout: 30000 }));
          return;
        });
    })
    .catch(function () {
      if (songEmbed) {
        songEmbed.delete();
      }
      message.say(
        'Bitte versuche es erneut und gebe eine Nummer zwischen 1 und 5 an.'
      );
      return;
    });
};

var interactiveEmbed = (message) => {
  // Builds Member ID array for buttons
  //const rawMembers = Object.fromEntries(message.member.voice.channel.members);
  const rawMembers = Object.fromEntries(
    message.member.voice.channel
      ? message.member.voice.channel.members
      : message.guild.musicData.nowPlaying.voiceChannel.members
  );
  const memberArray = [Object.keys(rawMembers)];

  const songTitle = `[${message.guild.musicData.nowPlaying.title}](${message.guild.musicData.nowPlaying.url})\n`;

  const baseEmbed = new MessageEmbed()
    .setThumbnail(message.guild.musicData.nowPlaying.thumbnail)
    .setColor(color)
    .addField(
      'Länge',
      ':stopwatch: ' + message.guild.musicData.nowPlaying.duration,
      true
    )
    .addField(
      'Lautstärke',
      ':loud_sound: ' +
        (message.guild.musicData.songDispatcher.volume * 100).toFixed(0) +
        '%',
      true
    )
    .setFooter(
      `Anfrage von ${message.guild.musicData.nowPlaying.memberDisplayName}`,
      message.guild.musicData.nowPlaying.memberAvatar
    );

  const videoEmbed = new Pagination.Embeds()
    .setArray([baseEmbed])
    .setAuthorizedUsers(memberArray[0])
    .setDisabledNavigationEmojis(['all'])
    .setChannel(message.channel)
    .setDeleteOnTimeout(deleteOldPlayMessage)
    .setTimeout(buttonTimer(message))
    .setTitle(embedTitle(message))
    .setDescription(songTitle + playbackBar(message.guild.musicData))
    // Reaction Controls
    .setFunctionEmojis({
      // Volume Down Button
      '🔉': function (_, instance) {
        if (!message.guild.musicData.songDispatcher) return;

        instance
          .setDescription(songTitle + playbackBar(message.guild.musicData))
          .setTimeout(buttonTimer(message));

        if (message.guild.musicData.songDispatcher.volume > 0) {
          message.guild.musicData.songDispatcher.setVolume(
            message.guild.musicData.songDispatcher.volume - 0.1
          );
          const embed = instance.array[0];
          embed.fields[1].value =
            ':loud_sound: ' +
            (message.guild.musicData.songDispatcher.volume * 100).toFixed(0) +
            '%';
        }
      },
      // Volume Up Button
      '🔊': function (_, instance) {
        if (!message.guild.musicData.songDispatcher) return;

        instance
          .setDescription(songTitle + playbackBar(message.guild.musicData))
          .setTimeout(buttonTimer(message));

        if (message.guild.musicData.songDispatcher.volume < 2) {
          message.guild.musicData.songDispatcher.setVolume(
            message.guild.musicData.songDispatcher.volume + 0.1
          );
          const embed = instance.array[0];
          embed.fields[1].value =
            ':loud_sound: ' +
            (message.guild.musicData.songDispatcher.volume * 100).toFixed(0) +
            '%';
        }
      }
    });

  // Previous Track Button
  if (message.guild.musicData.queueHistory.length > 0) {
    videoEmbed.addFunctionEmoji('⏮️', function (_, instance) {
      if (!message.guild.musicData.songDispatcher) return;

      instance
        .setDescription(songTitle + playbackBar(message.guild.musicData))
        .setTitle(':track_previous: Vorheriger Song')
        .setTimeout(100);
      message.guild.musicData.queue.unshift(
        message.guild.musicData.queueHistory[0],
        message.guild.musicData.nowPlaying
      );
      message.guild.musicData.queueHistory.shift();
      message.guild.musicData.isPreviousTrack = true;

      if (message.guild.musicData.songDispatcher.paused)
        message.guild.musicData.songDispatcher.resume();
      message.guild.musicData.loopSong = false;
      setTimeout(() => {
        message.guild.musicData.songDispatcher.end();
      }, 100);
    });
  }

  videoEmbed
    .addFunctionEmoji(
      // Stop Button
      '⏹️',
      function (_, instance) {
        if (!message.guild.musicData.songDispatcher) return;

        instance
          .setDescription(songTitle + playbackBar(message.guild.musicData))
          .setTitle(':stop_button: gestoppt')
          .setTimeout(100);

        if (message.guild.musicData.songDispatcher.paused == true) {
          message.guild.musicData.songDispatcher.resume();
          message.guild.musicData.queue.length = 0;
          message.guild.musicData.loopSong = false;
          message.guild.musicData.loopQueue = false;
          message.guild.musicData.skipTimer = true;
          setTimeout(() => {
            message.guild.musicData.songDispatcher.end();
          }, 100);
        } else {
          message.guild.musicData.queue.length = 0;
          message.guild.musicData.skipTimer = true;
          message.guild.musicData.loopSong = false;
          message.guild.musicData.loopQueue = false;
          message.guild.musicData.songDispatcher.end();
        }
        message
          .say(`Ich habe den Channel verlassen.`)
          .then((m) => m.delete({ timeout: 10000 }));
      }
    )
    .addFunctionEmoji(
      // Play/Pause Button
      '⏯️',
      function (_, instance) {
        if (!message.guild.musicData.songDispatcher) return;

        if (message.guild.musicData.songDispatcher.paused == false) {
          message.guild.musicData.songDispatcher.pause();
          instance
            .setDescription(songTitle + playbackBar(message.guild.musicData))
            .setTitle(embedTitle(message))
            .setTimeout(600000);
        } else {
          message.guild.musicData.songDispatcher.resume();

          instance
            .setDescription(songTitle + playbackBar(message.guild.musicData))
            .setTitle(embedTitle(message))
            .setTimeout(buttonTimer(message));
        }
      }
    );

  if (message.guild.musicData.queue.length) {
    const songOrSongs =
      message.guild.musicData.queue.length > 1 ? ' Songs' : ' Song'; // eslint-disable-line
    videoEmbed
      .addField(
        'Warteschlange',
        ':notes: ' + message.guild.musicData.queue.length + songOrSongs,
        true
      )
      .addField(
        'Nächster Song',
        `⏭️ [${message.guild.musicData.queue[0].title}](${message.guild.musicData.queue[0].url})`
      )
      // Next track Button
      .addFunctionEmoji('⏭️', function (_, instance) {
        if (!message.guild.musicData.songDispatcher) return;

        instance
          .setDescription(songTitle + playbackBar(message.guild.musicData))
          .setTitle(':next_track: übersprungen')
          .setTimeout(100);
        if (message.guild.musicData.songDispatcher.paused)
          message.guild.musicData.songDispatcher.resume();
        message.guild.musicData.loopSong = false;
        setTimeout(() => {
          message.guild.musicData.songDispatcher.end();
        }, 100);
      })
      // Repeat One Song Button
      .addFunctionEmoji('🔂', function (_, instance) {
        if (!message.guild.musicData.songDispatcher) return;

        if (message.guild.musicData.loopSong) {
          message.guild.musicData.loopSong = false;
        } else {
          message.guild.musicData.loopQueue = false;
          message.guild.musicData.loopSong = true;
        }
        instance
          .setDescription(songTitle + playbackBar(message.guild.musicData))
          .setTitle(embedTitle(message))
          .setTimeout(buttonTimer(message));
      })
      // Repeat Queue Button
      .addFunctionEmoji('🔁', function (_, instance) {
        if (!message.guild.musicData.songDispatcher) return;

        if (message.guild.musicData.loopQueue)
          message.guild.musicData.loopQueue = false;
        else {
          message.guild.musicData.loopSong = false;
          message.guild.musicData.loopQueue = true;
        }
        instance
          .setDescription(songTitle + playbackBar(message.guild.musicData))
          .setTitle(embedTitle())
          .setTimeout(buttonTimer(message));
      });
  } else {
    // Repeat One Song Button (when queue is 0)
    videoEmbed.addFunctionEmoji('🔂', function (_, instance) {
      if (!message.guild.musicData.songDispatcher) return;

      if (message.guild.musicData.loopSong) {
        message.guild.musicData.loopSong = false;
      } else {
        message.guild.musicData.loopQueue = false;
        message.guild.musicData.loopSong = true;
      }
      instance
        .setDescription(songTitle + playbackBar(message.guild.musicData))
        .setTitle(embedTitle(message))
        .setTimeout(buttonTimer(message));
    });
  }

  // Previous Track Info
  if (message.guild.musicData.queueHistory.length > 0) {
    videoEmbed.addField(
      'Vorheriger Song',
      `⏮️ [${message.guild.musicData.queueHistory[0].title}](${message.guild.musicData.queueHistory[0].url})`
    );
  }
  return videoEmbed;

  function buttonTimer(message) {
    const totalDurationInMS = rawDurationToMilliseconds(
      message.guild.musicData.nowPlaying.rawDuration
        ? message.guild.musicData.nowPlaying.rawDuration
        : message.guild.musicData.songDispatcher.nowPlaying.rawDuration
    );

    const streamTime = message.guild.musicData.streamTime
      ? message.guild.musicData.streamTime
      : message.guild.musicData.songDispatcher.streamTime;
    let timer = totalDurationInMS - streamTime;
    // Allow controls to stay for at least 30 seconds
    if (timer < 30000) timer = 30000;

    // Uncomment below for 5 min maximum timer limit
    // if (timer > 300000) timer = 300000;

    // Live Stream timer
    if (totalDurationInMS == 0) timer = 300000;

    return timer;
  }

  function embedTitle(message) {
    let embedTitle = 'Aktueller Song';
    if (message.guild.musicData.loopQueue)
      embedTitle = 'Warteschlange wird wiederholt';
    if (message.guild.musicData.loopSong) embedTitle += ' wird wiederholt';
    if (message.guild.musicData.songDispatcher.paused) embedTitle = ' pausiert';

    return embedTitle;
  }
};

// side effects function
var flagLogic = (message, video, jumpFlag) => {
  message.guild.musicData.queue.splice(
    0,
    0,
    constructSongObj(video, message.member.voice.channel, message.member.user)
  );
  if (jumpFlag && message.guild.musicData.songDispatcher) {
    message.guild.musicData.loopSong = false;
    message.guild.musicData.songDispatcher.end();
  }
};

/********************************** Helper Functions *****************************/

var compose = (f, g) => (x) => f(g(x));

var isYouTubeVideoURL = (arg) =>
  arg.match(
    /^(http(s)?:\/\/)?(m.)?((w){3}.)?(music.)?youtu(be|.be)?(\.com)?\/.+/
  );

var isYouTubePlaylistURL = (arg) =>
  arg.match(
    /^https?:\/\/(music.)?(www.youtube.com|youtube.com)\/playlist(.*)$/
  );

var isSpotifyURL = (arg) =>
  arg.match(/^(spotify:|https:\/\/[a-z]+\.spotify\.com\/)/);

var shuffleArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// timeString = timeObj => 'HH:MM:SS' // if HH is missing > MM:SS
var timeString = (timeObj) => {
  if (timeObj[1] === true) return timeObj[0];
  return `${timeObj.hours ? timeObj.hours + ':' : ''}${
    timeObj.minutes ? timeObj.minutes : '00'
  }:${
    timeObj.seconds < 10
      ? '0' + timeObj.seconds
      : timeObj.seconds
      ? timeObj.seconds
      : '00'
  }`;
};

var millisecondsToTimeObj = (ms) => ({
  seconds: Math.floor((ms / 1000) % 60),
  minutes: Math.floor((ms / (1000 * 60)) % 60),
  hours: Math.floor((ms / (1000 * 60 * 60)) % 24)
});

var rawDurationToMilliseconds = (obj) =>
  obj.hours * 3600000 + obj.minutes * 60000 + obj.seconds * 1000;

var concatSongNameAndArtists = (data) => {
  // Spotify only
  let artists = '';
  data.artists.forEach(
    (artist) => (artists = artists.concat(' ', artist.name))
  );
  const songName = data.name;
  return `${songName} ${artists}`;
};

var constructSongObj = (video, voiceChannel, user, timestamp) => {
  let duration = timeString(video.duration);
  if (duration === '00:00') duration = 'Live Stream';
  // checks if the user searched for a song using a Spotify URL
  let url =
    video.duration[1] == true
      ? video.url
      : `https://www.youtube.com/watch?v=${video.raw.id}`;
  return {
    url,
    title: video.title,
    rawDuration: video.duration,
    duration,
    timestamp,
    thumbnail: video.thumbnails.high.url,
    voiceChannel,
    memberDisplayName: user.username,
    memberAvatar: user.avatarURL('webp', false, 16)
  };
};

var createResultsEmbed = (namesArray, firstVideo) =>
  new MessageEmbed()
    .setColor(color)
    .setTitle(`Suchergebnisse`)
    .addField('Ergebnis 1', namesArray[0])
    .setURL(firstVideo.url)
    .addField('Ergebnis 2', namesArray[1])
    .addField('Ergebnis 3', namesArray[2])
    .addField('Ergebnis 4', namesArray[3])
    .addField('Ergebnis 5', namesArray[4])
    .setThumbnail(firstVideo.thumbnails.high.url)
    .setFooter('Suche aus, indem du eine Nummer von 1 bis 5 schreibst')
    .addField(':x: Cancel', 'um abzubrechen ');

module.exports.createResponse = interactiveEmbed;
