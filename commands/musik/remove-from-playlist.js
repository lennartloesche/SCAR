const { Command } = require('discord.js-commando');
const db = require('quick.db');

module.exports = class SaveToPlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remove-from-playlist',
      aliases: ['delete-song', 'remove-song'],
      group: 'musik',
      memberName: 'remove-from-playlist',
      guildOnly: true,
      description: 'Einen Song löschen von einer gespeicherten Playlist',
      args: [
        {
          key: 'playlist',
          prompt: 'Wie heißt die Playlist, aus der du ein Video löschen möchtest?',
          type: 'string'
        },
        {
          key: 'index',
          prompt:
            'Wie heißt der Song?',
          type: 'string',
          validate: function validateIndex(index) {
            return index > 0;
          }
        }
      ]
    });
  }

  async run(message, { playlist, index }) {
    // check if user has playlists or user is in the db
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
      const urlsArrayClone = savedPlaylistsClone[location].urls;
      if (urlsArrayClone.length == 0) {
        message.reply(`**${playlist}** ist leer!`);
        return;
      }

      if (index > urlsArrayClone.length) {
        message.reply(
          `The index you provided is larger than the playlist's length`
        );
        return;
      }
      const title = urlsArrayClone[index - 1].title;
      urlsArrayClone.splice(index - 1, 1);
      savedPlaylistsClone[location].urls = urlsArrayClone;
      db.set(message.member.id, { savedPlaylists: savedPlaylistsClone });
      message.reply(
        `Ich habe den Song **${title}** von **${savedPlaylistsClone[location].name}** entfernt.`
      );
      return;
    } else {
      message.reply(`Du hast keine Playlist namens **${playlist}**`);
      return;
    }
  }
};
