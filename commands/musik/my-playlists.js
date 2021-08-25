const { Command } = require('discord.js-commando');
const db = require('quick.db');
const Pagination = require('discord-paginationembed');

const { color } = require('../../config.json');

module.exports = class MyPlaylistsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'my-playlists',
      group: 'musik',
      memberName: 'my-playlists',
      guildOnly: true,
      description: 'Auflistung der gespeicherten Playlists'
    });
  }

  run(message) {
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
    const playlistsEmbed = new Pagination.FieldsEmbed()
      .setArray(savedPlaylistsClone)
      .setAuthorizedUsers([message.author.id])
      .setChannel(message.channel)
      .setElementsPerPage(5)
      .formatField('# - Playlist', function (e) {
        return `**${savedPlaylistsClone.indexOf(e) + 1}**: ${e.name}`;
      });

    playlistsEmbed.embed.setColor(color).setTitle('Gespeicherte Playlists');
    playlistsEmbed.build();
  }
};
