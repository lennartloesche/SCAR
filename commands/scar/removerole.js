const { Command } = require('discord.js-commando');

module.exports = class RemoveRoleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'removerole',
      aliases: ['roleremove', 'roledelete', 'deleterole'],
      memberName: 'removerole',
      group: 'scar',
      description: 'Rolle entfernen',
      guildOnly: true,
      userPermissions: ['MANAGE_ROLES'],
      clientPermissions: ['MANAGE_ROLES'],
      args: [
        {
          key: 'userToRemoveRole',
          prompt: 'Von welcher Person möchtest du eine Rolle entfernen?',
          type: 'member',
          error: 'Bitte gebe eine gültige Person an.'
        },
        {
          key: 'roleToRemove',
          prompt: 'Welche Rolle?',
          type: 'role',
          error: 'Bitte gebe eine gültige Rolle an.'
        }
      ]
    });
  }

  run(message, { userToRemoveRole, roleToRemove }) {
    message.delete();
    if (!userToRemoveRole._roles.includes(roleToRemove.id)) {
      return message
        .say(
          `**${userToRemoveRole.displayName}** hat die Rolle **${roleToRemove.name}** nicht.`
        )
        .then((m) => m.delete({ timeout: 9000 }));
    }

    userToRemoveRole.roles
      .remove(roleToRemove)
      .catch((e) => console.error(e))
      .catch((err) => {
        message
          .reply('Etwas ist schiefgegangen. Bitte versuche es erneut!')
          .then((m) => m.delete({ timeout: 9000 }));
        return console.error(err);
      });
  }
};
