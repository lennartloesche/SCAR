const { Command } = require('discord.js-commando');
const fetch = require('node-fetch');
const { token } = require('../../config.json');

module.exports = class betrayalCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'betrayal',
      aliases: ['betrayalio'],
      memberName: 'betrayal',
      group: 'minigames',
      description: 'betrayal',
      guildOnly: true
    });
  }

  async run(message) {
    const voice = message.member.voice.channel;
    message.delete();
    fetch(`https://discord.com/api/v8/channels/${voice.id}/invites`, {
      method: 'POST',
      body: JSON.stringify({
        max_age: 86400,
        max_uses: 0,
        target_application_id: '773336526917861400',
        target_type: 2,
        temporary: false,
        validate: null
      }),
      headers: {
        Authorization: `Bot ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then((response) => response.json())
      .then((invite) => {
        if (!invite.code)
          return message.say('Ích kann das Minigame nicht starten.');
        message
          .say(
            `Klicke auf den Link um Betrayal zu spielen:\nhttps://discord.com/invite/${invite.code}`
          .then((m) => m.delete({ timeout: 86400000 }))
          )
      });
  }
};
