const { Command, version } = require('discord.js-commando');
const Discord = require('discord.js');
const os = require('os');
const pkg = require('../../package.json');

module.exports = class BotStatusCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'bot-status',
      memberName: 'bot-status',
      group: 'utility',
      description: 'Bot-System Status anzeigen lassen'
    });
  }

  run(message) {
    const commandTotal = this.client.registry.commands.keyArray();
    const platform = os
      .platform()
      .replace(/win32/, 'Windows')
      .replace(/darwin/, 'MacOS')
      .replace(/linux/, 'Linux');
    const archInfo = os.arch();
    const libList = JSON.stringify(pkg.dependencies)
      .replace(/,/g, '\n')
      .replace(/"/g, '')
      .replace(/{/g, '')
      .replace(/}/g, '')
      .replace(/\^/g, '')
      .replace(/github\:discordjs\/Commando/, `${version}`)
      .replace(/github\:discordjs\/discord.js#stable/, `${Discord.version}`)
      .replace(/:/g, ': ');

    const used = process.memoryUsage().heapUsed / 1024 / 1024;

    let totalSeconds = process.uptime();
    let realTotalSecs = Math.floor(totalSeconds % 60);
    let days = Math.floor((totalSeconds % 31536000) / 86400);
    let hours = Math.floor((totalSeconds / 3600) % 24);
    let mins = Math.floor((totalSeconds / 60) % 60);

    const guildCacheMap = this.client.guilds.cache;
    const guildCacheArray = Array.from(guildCacheMap, ([name, value]) => ({
      name,
      value
    }));
    let memberCount = 0;
    for (let i = 0; i < guildCacheArray.length; i++) {
      memberCount = memberCount + guildCacheArray[i].value.memberCount;
    }

    const StatusEmbed = new Discord.MessageEmbed()
      .setThumbnail(this.client.user.displayAvatarURL())
      .setTitle(`Status von ${this.client.user.username}`)
      .setColor('#c72810')
      .addField(`Ramverbrauch`, `${Math.round(used * 100) / 100}MB`, true)
      .addField(
        `Läuft seit`,
        `${days} D 
         ${hours} H : ${mins} M : ${realTotalSecs} S`,
        true
      )
      .addField(`System`, `${platform} ${archInfo}`, true)

      .addField('Befehle', `${commandTotal.length} Befehle verfügbar`, true)
      .addField(
        'Server, Users',
        `Auf ${this.client.guilds.cache.size}, mit einer Summe von ${memberCount} Usern.`
      )
      .addField(
        'Dependencies',
        `node: ${process.version.replace(/v/, '')}
        ${libList}`
      )
      .setFooter('Angefragt', this.client.user.avatarURL())
      .setTimestamp(this.client.user.createdAt);

    message.channel.send(StatusEmbed);
  }
};
