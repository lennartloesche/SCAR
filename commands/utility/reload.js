const { oneLine } = require('common-tags');
const Command = require('../../node_modules/discord.js-commando/src/commands/base');

module.exports = class ReloadCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'reload',
			aliases: ['reload-command'],
			memberName: 'reload',
			group: 'utility',
			description: 'Einen Befehl reloaden.',
			details: oneLine`
			`,
			examples: ['reload some-command'],
			ownerOnly: true,
			guarded: true,

			args: [
				{
					key: 'cmdOrGrp',
					label: 'command/group',
					prompt: 'Welchen Befehl reloaden?',
					type: 'group|command'
				}
			]
		});
	}

	async run(msg, args) {
		const { cmdOrGrp } = args;
		const isCmd = Boolean(cmdOrGrp.groupID);
		cmdOrGrp.reload();

		if(this.client.shard) {
			try {
				await this.client.shard.broadcastEval(`
					const ids = [${this.client.shard.ids.join(',')}];
					if(!this.shard.ids.some(id => ids.includes(id))) {
						this.registry.${isCmd ? 'commands' : 'groups'}.get('${isCmd ? cmdOrGrp.name : cmdOrGrp.id}').reload();
					}
				`);
			} catch(err) {
				this.client.emit('warn', `Error when broadcasting command reload to other shards`);
				this.client.emit('error', err);
				if(isCmd) {
					await msg.say(`\`${cmdOrGrp.name}\` reloaded, but failed to reload on other shards.`);
				} else {
					await msg.say(
						`Reloaded all of the commands in the \`${cmdOrGrp.name}\` group, but failed to reload on other shards.`
					);
				}
				return null;
			}
		}

		if(isCmd) {
			msg.delete()
			await msg.say(`\`${cmdOrGrp.name}\` neugestartet`).then(m => m.delete({timeout: 5000}));
		} else {
			msg.delete()
			await msg.say(
				`Alle Befehle von \`${cmdOrGrp.name}\` neugestartet.`
			).then(m => m.delete({timeout: 5000}));
		}
		return null;
	}
};
