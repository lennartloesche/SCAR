const { Command } = require('discord.js-commando');
const db = require('quick.db');

module.exports = class CreatePlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'create-playlist',
      group: 'musik',
      memberName: 'create-playlist',
      guildOnly: true,
      description: 'Playlist erstellen',
      args: [
        {
          key: 'playlistName',
          prompt: 'Welchen Namen willst du der Playlist geben?',
          type: 'string'
        }
      ]
    });
  }

  run(message, { playlistName }) {
    // check if the user exists in the db
    if (!db.get(message.member.id)) {
      db.set(message.member.id, {
        savedPlaylists: [{ name: playlistName, urls: [] }]
      });
      message.reply(`Playlist wurde erstellt mit dem Namen: **${playlistName}**`);
      return;
    }
    // make sure the playlist name isn't a duplicate
    var savedPlaylistsClone = db.get(message.member.id).savedPlaylists;
    if (
      savedPlaylistsClone.filter(function searchForDuplicate(playlist) {
        return playlist.name == playlistName;
      }).length > 0
    ) {
      message.reply(
        `Es existiert schon eine Playlist mit dem Namen: **${playlistName}** in deinen gespeicherten Playlists!`
      );
      return;
    }
    // create and save the playlist in the db
    savedPlaylistsClone.push({ name: playlistName, urls: [] });
    db.set(`${message.member.id}.savedPlaylists`, savedPlaylistsClone);
    message.reply(`Eine neue Playlist wurde erstellt mit dem Namen: **${playlistName}**`);
  }
};
