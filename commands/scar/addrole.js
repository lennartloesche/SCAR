const { Command } = require('discord.js-commando');

module.exports = class AddroleCommand extends Command {
	constructor(client) {
	  super(client, {
		name: 'addrole',
		aliases: ['roleadd', 'role', 'giverole'],
		memberName: 'addrole',
		group: 'scar',
		description: 'Rolle geben',
		guildOnly: true,
		userPermissions: ['MANAGE_ROLES'],
		clientPermissions: ['MANAGE_ROLES'],
		args: [
			{
			  key: 'userToAssignRole',
			  prompt: 'Welcher Person möchtest du eine Rolle hinzufügen?',
			  type: 'member',
			  error: 'Bitte gebe eine gültige Person an.'
			},
			{
			  key: 'roleToAssign',
			  prompt: 'Welche Rolle?',
			  type: 'role',
			  error: 'Bitte gebe eine gültige Rolle an.'
			}
		  ]
		});
	  }
	  
	  run(message, { userToAssignRole, roleToAssign }) {
		message.delete();
		if (userToAssignRole._roles.includes(roleToAssign.id)) {
		  return message.say(
			`**${userToAssignRole.displayName}** hat die Rolle **${roleToAssign.name}** schon.`).then(m => m.delete({timeout: 9000}));
		}
	
		userToAssignRole.roles.add(roleToAssign)
		.catch(e => console.error(e))
		.catch(err => {
			message.reply('Etwas ist schiefgegangen. Bitte versuche es erneut!').then(m => m.delete({timeout: 9000}));
			return console.error(err);
		  });
	  }
	};