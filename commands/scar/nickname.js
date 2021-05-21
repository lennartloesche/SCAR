const { Command } = require('discord.js-commando');

module.exports = class NicknameCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'nickname',
      aliases: ['set-nick', 'set-nickname', 'name'],
      group: 'scar',
      memberName: 'nickname',
      description: 'Nickname setzen von einer Person oder von einem selber',
      clientPermissions: ['MANAGE_NICKNAMES'],
      userPermissions: ['MANAGE_NICKNAMES'],
      guildOnly: true,
      args: [
        {
          key: 'memberName',
          prompt: 'Which member do you want to change the nickname of?',
          type: `member`,
          error: 'Person wurde nicht gefunden, versuche es erneut.'
        },
        {
          key: 'nickname',
          prompt: 'Welchen Namen soll die Person bekommen?',
          type: 'string'
        }
      ]
    });
  }

  async run(message, { memberName, nickname }) {
    if (nickname === 'remove') {
      await memberName.setNickname('');
    } else {
      await memberName.setNickname(nickname);

      if (message.deletable) {
        message.delete();
      }
    }
  }
};
