const { CommandoClient } = require('discord.js-commando');
const { Structures } = require('discord.js');
const Discord = require('discord.js');
const path = require('path');
const { FILTER_LIST, prefix, token } = require('./config.json');
const db = require('quick.db');
const config = require('./config.json')

Structures.extend('Guild', function(Guild) {
  class MusicGuild extends Guild {
    constructor(client, data) {
      super(client, data);
      this.musicData = {
        queue: [],
        isPlaying: false,
        nowPlaying: null,
        songDispatcher: null,
        skipTimer: false, // only skip if user used leave command
        loopSong: false,
        loopQueue: false,
        volume: 1
      };
      this.triviaData = {
        isTriviaRunning: false,
        wasTriviaEndCalled: false,
        triviaQueue: [],
        triviaScore: new Map()
      };
    }
  }
  return MusicGuild;
});

const client = new CommandoClient({
  commandPrefix: prefix,
	owner: '137259014986792960',
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['scar', ':gear: Serverbefehle:'],
    ['stats', ':gear: Statistiken:'],
    ['musik', ':notes: Musikbefehle:'],
    ['rollen', ':notes: Rollenbefehle:'],
    ['utility', ':loud_sound: Zusätzliche Befehle:']
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({
    eval: false,
    prefix: false,
    commandState: false
  })
  .registerCommandsIn(path.join(__dirname, 'commands'));

// ❯ Rich Presence/RPC
setInterval(() => {
  const activities = [
      `+help | ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} Mitglieder`
  ];
  let activity = activities[Math.floor(Math.random() * activities.length)];
  client.user.setActivity(
      activity,
      {
        type: "STREAMING",
        url: "https://www.twitch.tv/milchitrue"
      }
  );
}, 15000);

// ❯ Bot ist online


client.on('ready', () => {
  console.log(' ')
  console.log('┌──────────────────────────────────── Login ─────────────────────────────────────────┐')
  console.log(`│ > Eingeloggt als ${client.user.tag}!                                                 │`);
  console.log('├──────────────────────────────────── Anzahl ────────────────────────────────────────┤')
  console.log(`│ > Aktiv auf ${client.guilds.cache.size} Server!                                                              │`)
  console.log('└────────────────────────────────────────────────────────────────────────────────────┘	')
  console.log(' ')
}
)
// ❯ Word Blacklist

client.on('message', message => {
  if(FILTER_LIST.some(word => message.content.toLowerCase().includes(word))){
    message.delete()
    var embed = new Discord.MessageEmbed()
      .setTitle(`${client.user.username} • Chatguard`)
      .setDescription(`Dieses Wort darfst du nicht benutzen!`)
      .setTimestamp(message.createdAt)
      .setFooter(client.user.username, client.user.displayAvatarURL())
      .setColor("#c72810");
    message.channel.send(embed).then(m => m.delete({timeout: 10000}));
  }
})

client.on('voiceStateUpdate', async (___, newState) => {
  if (
    newState.member.user.bot &&
    !newState.channelID &&
    newState.guild.musicData.songDispatcher &&
    newState.member.user.id == client.user.id
  ) {
    newState.guild.musicData.queue.length = 0;
    newState.guild.musicData.songDispatcher.end();
    return;
  }
  if (
    newState.member.user.bot &&
    newState.channelID &&
    newState.member.user.id == client.user.id &&
    !newState.selfDeaf
  ) {
    newState.setSelfDeaf(true);
  }
});

// ❯ Join / Leave Message
client.on("guildMemberAdd", member => {
  var willkommenschannel = config.willkommenschannel
  const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === `${willkommenschannel}`);
  var embed = new Discord.MessageEmbed()
  .setDescription(` **${member}** hat den Server betreten`)
  .setColor("#c72810")
  .setTimestamp()
  .setFooter(client.user.username, member.user.displayAvatarURL())
  welcomeChannel.send(embed)
  var role = member.guild.roles.cache.find(role => role.name == "𝕊ℂ𝔸ℝ » Spieler")
  member.roles.add(role);
})
client.on("guildMemberRemove", member => {
  var willkommenschannel = config.willkommenschannel
  const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === `${willkommenschannel}`);
  var embed = new Discord.MessageEmbed()
  .setDescription(` **${member.user.tag}** hat den Server verlassen`)
  .setColor("#c72810")
  .setTimestamp()
  .setFooter(client.user.username, member.user.displayAvatarURL())
  welcomeChannel.send(embed)
})

// ❯ Sprachkanal erstellen mit Channel Join

var anzahl = [];
client.on('voiceStateUpdate', async (oldMember, newMember) => {
    let category = client.channels.cache.get('838153923797712896');
    let voiceCH = client.channels.cache.get('838154057717645363');
    if (newMember.channel == voiceCH) {
        await newMember.guild.channels.create(`${newMember.member.displayName}'s Channel`, {
            type: 'voice', parent: category, permissionOverwrites: [
              {
                id: '757168568315150337', // @everyone
                deny: ['CONNECT'],
            },
              {
                id: '788178021173297202', // Muted Rolle
                deny: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK', 'STREAM'],
            },
            {
                id: newMember.id, // Person
                allow: ['VIEW_CHANNEL', 'CONNECT', 'MANAGE_CHANNELS', 'MANAGE_ROLES'],
            },
              {
                id: '757221755306639460', // Scar Mitglieder Rolle
                allow: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK', 'STREAM', 'PRIORITY_SPEAKER', 'MANAGE_CHANNELS']
            },
            ]
        }).then(async channel => {
            anzahl.push({ newID: channel.id, guild: channel.guild });
            await newMember.setChannel(channel.id);
        });
    }
    if (anzahl.length > 0) for (let i = 0; i < anzahl.length; i++) {
        let ch = client.channels.cache.get(anzahl[i].newID);
        if (ch.members.size === 0) {
            await ch.delete();
            return anzahl.splice(i, 1);
        }
    }
});

client.login(token);
