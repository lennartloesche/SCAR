const { CommandoClient } = require('discord.js-commando');
const { Structures, MessageEmbed, MessageAttachment } = require('discord.js');
const Discord = require('discord.js');
const path = require('path');
const { FILTER_LIST, prefix, token } = require('./config.json');
const db = require('quick.db');
const fetch = require('node-fetch');

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
    ['csgostats', ':gear: CSGOStats:'],
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
  console.log(`│ > Eingeloggt als ${client.user.tag}!                                                      │`);
  console.log('├──────────────────────────────────── Anzahl ────────────────────────────────────────┤')
  console.log(`│ > Aktiv auf ${client.guilds.cache.size} Servern!                                                             │`)
  console.log('│──────────────────────────────────── Server ────────────────────────────────────────│')
  let content = "";
  let s = "";
    client.guilds.cache.forEach((guild) => {
    let spaces = 85 - (`│ > ${guild.name} member's ${guild.memberCount}`).length
    s += 1
    if(s > Number(client.guilds.cache.size)-2){
      content += `\n│`

    } else {
      content += '│'
    }
    content += ` > ${guild.name} member's ${guild.memberCount}`

    for (i = 0; i < spaces; i++) { 
      content += ' '
    }
          content += '│'
  })
  console.log(content)
  console.log('└────────────────────────────────────────────────────────────────────────────────────┘	')
  console.log(' ')
}
)

// ❯ Word Blacklist

const client2 = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"]});
client2.on('message', message => {
  if(FILTER_LIST.some(word => message.content.toLowerCase().includes(word))){
    message.delete()
    var embed = new Discord.MessageEmbed()
      .setTitle(`${client2.user.username} • Chatguard`)
      .setDescription(`Dieses Wort darfst du nicht benutzen!`)
      .setTimestamp(message.createdAt)
      .setFooter(client2.user.username, client2.user.displayAvatarURL())
      .setColor("#c72810");
    message.channel.send(embed);
  }
})

// ❯ Join / Leave Message
client2.on("guildMemberAdd", member => {
  var willkommenschannel = config.willkommenschannel
  const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === `${willkommenschannel}`);
  var embed = new Discord.MessageEmbed()
  .setDescription(` **${member}** hat den Server betreten`)
  .setColor("#c72810")
  .setTimestamp()
  .setFooter(client2.user.username, member.user.displayAvatarURL())
  welcomeChannel.send(embed)
  var role = member.guild.roles.cache.find(role => role.name == "𝕊ℂ𝔸ℝ » Spieler")
  member.roles.add(role);
})
client2.on("guildMemberRemove", member => {
  var willkommenschannel = config.willkommenschannel
  const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === `${willkommenschannel}`);
  var embed = new Discord.MessageEmbed()
  .setDescription(` **${member.user.tag}** hat den Server verlassen`)
  .setColor("#c72810")
  .setTimestamp()
  .setFooter(client2.user.username, member.user.displayAvatarURL())
  welcomeChannel.send(embed)
})

// ❯ Member Count
client2.on('ready', () =>{
  var counterchannelid = config.counterchannelid
  var counterrole = config.counterroleid
  let myGuild = client2.guilds.cache.get(`${counterrole}`)
  let membercount = myGuild.memberCount;
  const membercountchannel = myGuild.channels.cache.get(`${counterchannelid}`);
  membercountchannel.setName('Mitglieder: ' + membercount)
})
client2.on('guildMemberAdd', member => {
  var counterchannelid = config.counterchannelid
  var counterrole = config.counterroleid
  let myGuild = client2.guilds.cache.get(`${counterrole}`)
  let membercount = myGuild.memberCount;
  const membercountchannel = myGuild.channels.cache.get(`${counterchannelid}`);
  membercountchannel.setName('Mitglieder: ' + membercount)
})
client2.on('guildMemberRemove', member => {
  var counterchannelid = config.counterchannelid
  var counterrole = config.counterroleid
  let myGuild = client2.guilds.cache.get(`${counterrole}`)
  let membercount = myGuild.memberCount;
  const membercountchannel = myGuild.channels.cache.get(`${counterchannelid}`);
  membercountchannel.setName('Mitglieder: ' + membercount)
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

client.login(token);
