const { Command } = require('discord.js-commando');
const db = require('quick.db');

module.exports = class DeletePlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'delete-playlist',
      group: 'musik',
      memberName: 'delete-playlist',
      guildOnly: true,
      description: 'Playlist löschen',
      args: [
        {
          key: 'playlistName',
          prompt: 'Welche Playlist möchtest du löschen??',
          type: 'string'
        }
      ]
    });
  }

  run(message, { playlistName }) {
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
      if (savedPlaylistsClone[i].name == playlistName) {
        found = true;
        location = i;
        break;
      }
    }
    if (found) {
      savedPlaylistsClone.splice(location, 1);
      db.set(message.member.id, { savedPlaylists: savedPlaylistsClone });
      message.reply(`Ich habe **${playlistName}** von deinen gespeicherten Playlists entfernt!`);
    } else {
      message.reply(`Du hast keine Playlist mit dem Namen: ${playlistName}`);
    }
  }
};
