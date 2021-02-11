const Discord = require("discord.js");
const client = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"]});
const ms = require("ms");

// ❯ Verbindung zur Config
const config = require("./config.json");

// ❯ Rich Presence/RPC
client.on('ready', () => {
  client.user.setStatus('Online')
  client.user.setActivity("+help", {
    type: "STREAMING",
    url: "https://twitch.tv/milchitrue"
  });
});

// ❯ Online Konsole
client.on('ready', async () => {
console.log(`❯ Bot gestartet als ${client.user.username}`)
})

// ❯ Join / Leave Message
client.on("guildMemberAdd", member => {
  var willkommenschannel = config.willkommenschannel
  const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === `${willkommenschannel}`);
  var embed = new Discord.MessageEmbed()
  .setDescription(` **${member}** hat den Server betreten`)
  .setColor("#c72810")
  .setTimestamp()
  .setFooter(`${client.user.username}`, member.user.displayAvatarURL())
  welcomeChannel.send(embed)
})
client.on("guildMemberRemove", member => {
  var willkommenschannel = config.willkommenschannel
  const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === `${willkommenschannel}`);
  var embed = new Discord.MessageEmbed()
  .setDescription(` **${member.user.tag}** hat den Server verlassen`)
  .setColor("#c72810")
  .setTimestamp()
  .setFooter(`${client.user.username}`, member.user.displayAvatarURL())
  welcomeChannel.send(embed)
})

// ❯ Member Count
client.on('ready', () =>{
  var counterchannelid = config.counterchannelid
  var counterrole = config.counterroleid
  let myGuild = client.guilds.cache.get(`${counterrole}`)
  let membercount = myGuild.memberCount;
  const membercountchannel = myGuild.channels.cache.get(`${counterchannelid}`);
  membercountchannel.setName('Mitglieder: ' + membercount)
})
client.on('guildMemberAdd', member => {
  var counterchannelid = config.counterchannelid
  var counterrole = config.counterroleid
  let myGuild = client.guilds.cache.get(`${counterrole}`)
  let membercount = myGuild.memberCount;
  const membercountchannel = myGuild.channels.cache.get(`${counterchannelid}`);
  membercountchannel.setName('Mitglieder: ' + membercount)
})
client.on('guildMemberRemove', member => {
  var counterchannelid = config.counterchannelid
  var counterrole = config.counterroleid
  let myGuild = client.guilds.cache.get(`${counterrole}`)
  let membercount = myGuild.memberCount;
  const membercountchannel = myGuild.channels.cache.get(`${counterchannelid}`);
  membercountchannel.setName('Mitglieder: ' + membercount)
})

// ❯ Word Blacklist
client.on('message', message => {
  if(config.FILTER_LIST.some(word => message.content.toLowerCase().includes(word))){
    message.delete()
  }
})

// ❯ Prefix
client.on("message", async message => {
    if (message.author.bot) return;
    if (message.content.indexOf(config.prefix) !== 0) return;
    const args = message.content
      .slice(config.prefix.length)
      .trim()
      .split(/ +/g);
      const command = args.shift().toLowerCase();      
      var prefix = "+";

// ❯ Help
if (command == "help") {
  var embed = new Discord.MessageEmbed()
.setTitle(`${client.user.username} • Help`)
.addFields(
  { name: '`+send <Message>`', value: 'Sendet eine Nachricht als Bot'},
  { name: '`+msg <@Member> <Message>`', value: 'Schreibt einer Person Privat Nachrichten'},
  { name: '`+clear <1-99>`', value: 'Löscht Nachrichten' },
  { name: '`+warn <@Member> <Grund>`', value: 'Verwarnt eine Person'},
  { name: '`+kick <@Member>`', value: 'Kickt eine Person'},
  { name: '`+ban <@Member> <Grund>`', value: 'Bannt eine Person'},
  { name: '`+mute <@Member> <Zeit | 1s = 1 Sekunde | 1m = 1 Minute | 1h = 1 Stunde>`', value: 'Muted eine Person'},
  { name: '`+unmute <@Member>`', value: 'Unmutet eine Person'}
)
.setTimestamp(message.createdAt)
.setFooter(`${client.user.username}`, message.member.user.displayAvatarURL())
.setColor("#c72810");
message.channel.send(embed);
}

// ❯ Send
if (command === "send") {
  var embed = new Discord.MessageEmbed()
  .setDescription('**❯ Fehlende Berechtigungen ✘**')
  .setColor("#c72810");
  if (!message.member.permissions.has("MANAGE_MESSAGES")) return message.channel.send(embed);
  const sayMessage = args.join(" ");
  message.delete().catch(O_o => {});
  message.channel.send(sayMessage);
}

// ❯ Private Message
if (command === "msg") {
  let dUser =
    message.guild.member(message.mentions.users.first()) ||
    message.guild.members.cache.get(args[0]);

    var embed = new Discord.MessageEmbed()
    .setDescription('**❯ Fehlender Tag! | Vewende +msg @Name (Grund) ✘**')
    .setColor("#c72810");
    if (!dUser) return message.channel.send(embed);

    var embed = new Discord.MessageEmbed()
    .setDescription('**❯ Fehlende Berechtigungen ✘**')
    .setColor("#c72810");
    if (!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send(embed);
    let dMessage = args.join(" ").slice(22);

    var embed = new Discord.MessageEmbed()
    .setDescription('**❯ Fehlende Nachricht ✘**')
    .setColor("#c72810");
    if (dMessage.length < 1)
    return message.channel.send(embed);

    dUser.send(`${dMessage}`);

    var embed = new Discord.MessageEmbed()
    .setDescription('**❯ Erfolgreich gesendet ✓**')
    .setColor("#c72810");
    message.channel.send(embed).then(m => m.delete({timeout: 2000}))
    message.delete();
}


// ❯ Clear
if (command == "clear") {
  var embed = new Discord.MessageEmbed()
  .setDescription('**❯ Fehlende Berechtigungen ✘**')
  .setColor("#c72810");
  if (!message.member.permissions.has("MANAGE_MESSAGES")) return message.channel.send(embed);
  let deleteAmount;
  var embed = new Discord.MessageEmbed()
  .setDescription('**❯ Fehlende Nummer ✘**')
  .setColor("#c72810");
  if (isNaN(args[0]) || parseInt(args[0]) <= 0) { return message.channel.send(embed); }
  if (parseInt(args[0]) > 100) {
    return
  } 
  else {
    deleteAmount = parseInt(args[0]);
  }
  var embed = new Discord.MessageEmbed()
  .setDescription(`**❯ Erfolgreich ${deleteAmount} Nachrichten gelöscht ✓**`)
  .setColor("#c72810");
  message.channel.bulkDelete(deleteAmount + 1, true);
  await message.channel.send(embed).then(m => m.delete({timeout: 2000}))
}

// ❯ Warn
if (command == "warn") {   
  var embed = new Discord.MessageEmbed()
  .setDescription('**❯ Fehlende Berechtigungen ✘**')
  .setColor("#c72810");
  if (!message.member.permissions.has("MUTE_MEMBERS")) return message.channel.send(embed);
    let mentioned = message.mentions.users.first(); 
    if(!mentioned) return message.channel.send(""); 
    let reason = args.slice(1).join(' ') 
    var warningEmbed = new Discord.MessageEmbed()
      .setColor('#c72810')
      .setTitle("Du wurdest verwarnt!")
      .addFields(
        { name: 'Grund', value: reason },
      )
      .setTimestamp(message.createdAt)
      .setFooter(`${client.user.username}`, message.member.user.displayAvatarURL())          
    mentioned.send(warningEmbed); 
    var warnSuccessfulEmbed = new Discord.MessageEmbed()
    .setTimestamp(message.createdAt)
    .setFooter(`${client.user.username}`, message.member.user.displayAvatarURL())
    var embed = new Discord.MessageEmbed()
    .setDescription('**❯ Erfolgreich verwarnt ✓**')
    .setColor("#c72810");
    message.channel.send(embed);
    message.delete();
}

// ❯ Kick & Ban
if(command === 'kick'){
  var embed1 = new Discord.MessageEmbed()
  .setDescription('**❯ Fehlende Berechtigungen ✘**')
  .setColor("#c72810");
  if (!message.member.permissions.has("KICK_MEMBERS")) return message.channel.send(embed1);

  var embed2 = new Discord.MessageEmbed()
  .setDescription('**❯ Fehlender Tag! | Vewende +kick @Name (Grund) ✘**')
  .setColor("#c72810");
  let toKick = message.mentions.members.first();

  var embed3 = new Discord.MessageEmbed()
  .setDescription('**❯ Fehlender Grund ✘**')
  .setColor("#c72810");
  let reason = args.slice(1).join(" ");

  var embed6 = new Discord.MessageEmbed()
  .setDescription('**❯ Fehlender Tag! | Vewende +kick @Name (Grund) ✘**')
  .setColor("#c72810");
  if(!args[0]) return message.channel.send(embed6);
  if(!toKick) return message.channel.send(embed2);
  if(!reason) return message.channel.send(embed3);

  var embed4 = new Discord.MessageEmbed()
  .setDescription('**❯ Fehlende Berechtigungen ✘**')
  .setColor("#c72810");
  if(!toKick.kickable){
    return message.channel.send(embed4);
  }

  var embed5 = new Discord.MessageEmbed()
  .setDescription('**❯ Erfolgreich gekickt ✓**')
  .setColor("#c72810");

  if(toKick.kickable){
    message.channel.send(embed5);
    toKick.kick();
  }
}

if(command === 'ban'){
  var embed1 = new Discord.MessageEmbed()
  .setDescription('**❯ Fehlende Berechtigungen ✘**')
  .setColor("#c72810");
  if (!message.member.permissions.has("BAN_MEMBERS")) return message.channel.send(embed1);

  var embed2 = new Discord.MessageEmbed()
  .setDescription('**❯ Fehlender Tag! | Vewende +ban @Name (Grund) ✘**')
  .setColor("#c72810");
  let toBan = message.mentions.members.first();

  var embed3 = new Discord.MessageEmbed()
  .setDescription('**❯ Fehlender Grund ✘**')
  .setColor("#c72810");
  let reason = args.slice(1).join(" ");

  var embed4 = new Discord.MessageEmbed()
  .setDescription('**❯ Fehlender Tag! | Vewende +ban @Name (Grund) ✘**')
  .setColor("#c72810");
  if(!args[0]) return message.channel.send(embed4);
  if(!toBan) return message.channel.send(embed2);
  if(!reason) return message.channel.send(embed3);

  var embed5 = new Discord.MessageEmbed()
  .setDescription('**❯ Fehlende Berechtigungen ✘**')
  .setColor("#c72810");

  if(!toBan.bannable){
      return message.channel.send(embed5);
   }

   var embed6 = new Discord.MessageEmbed()
   .setDescription('**❯ Erfolgreich gebannt ✓**')
   .setColor("#c72810");

  if(toBan.bannable){
    message.channel.send(embed6);
    toBan.ban();
  }
}

// ❯ Mute & Unmute
if (command == "mute") {
  let tomute = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
  var embed = new Discord.MessageEmbed()
  .setDescription('**❯ Fehlende UID ✘**')
  .setColor("#c72810");
  if(!tomute) return message.channel.send(embed);

  var embed = new Discord.MessageEmbed()
  .setDescription('**❯ Fehlende Berechtigungen ✘**')
  .setColor("#c72810");
  if(tomute.hasPermission("MUTE_MEMBERS")) return message.channel.send(embed);
  let muterole = message.guild.roles.cache.find(muterole => muterole.name === "Kanal » Mute");
  
  if(!muterole){
    try{
      muterole = await message.guild.roles.create({
        name: "Kanal » Mute",
        color: "#c72810",
        permissions:[]
      })
      message.guild.channels.cache.forEach(async (channel) => {
        await channel.overwritePermissions(muterole, {
          SEND_MESSAGES: false,
          ADD_REACTIONS: false
        });
      });
    }catch(e){
      console.log(e.stack);
    }
  }

  var embed = new Discord.MessageEmbed()
  .setDescription('**❯ Fehlende Zeit ✘**')
  .setColor("#c72810");
  let mutetime = args[1];
  if(!mutetime) return message.channel.send(embed);

  var embed = new Discord.MessageEmbed()
  .setDescription('**❯ Erfolgreich gemutet ✓**')
  .setColor("#c72810");
  await(tomute.roles.add(muterole.id));
  message.channel.send(embed);

  var embed = new Discord.MessageEmbed()
  .setDescription('**❯ Erfolgreich unmuted ✓**')
  .setColor("#c72810");
  setTimeout(function(){
  tomute.roles.remove(muterole.id);
  message.channel.send(embed).then(m => m.delete({timeout: 2000}))},ms(mutetime));
}

if (command == "unmute") {

  let tomute = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
  var embed = new Discord.MessageEmbed()
  .setDescription('**❯ Fehlende UID ✘**')
  .setColor("#c72810");
  if(!tomute) return message.channel.send(embed);

  var embed = new Discord.MessageEmbed()
  .setDescription('**❯ Fehlende Berechtigungen ✘**')
  .setColor("#c72810");
  if(tomute.hasPermission("MUTE_MEMBERS")) return message.channel.send(embed);
  let muterole = message.guild.roles.cache.find(muterole => muterole.name === "Kanal » Mute");

  var embed = new Discord.MessageEmbed()
  .setDescription('**❯ Erfolgreich unmuted ✓**')
  .setColor("#c72810");
  tomute.roles.remove(muterole.id);
    message.channel.send(embed);
  }

// ❯ CSGO
if (command == "csgo") {
  var csgo = config.csgo
  let role = message.guild.roles.cache.find(role => role.name === `${csgo}`);
  let member = message.member

  if(message.member.roles.cache.some(role => role.name === `${csgo}`)) {
    member.roles.remove(role).catch(console.error);
    var embed = new Discord.MessageEmbed()
    .setDescription(`**❯ ${csgo} REMOVED ✘**`)
    .setColor("RED");
    message.channel.send(embed);  
  }
  else {
    member.roles.add(role).catch(console.error);
    var embed = new Discord.MessageEmbed()
    .setDescription(`**❯ ${csgo} ADDED ✓**`)
    .setColor("GREEN");
    message.channel.send(embed);
  }
}

// ❯ LOL
if (command == "lol") {
  var lol = config.lol
  let role = message.guild.roles.cache.find(role => role.name === `${lol}`);
  let member = message.member

  if(message.member.roles.cache.some(role => role.name === `${lol}`)) {
    member.roles.remove(role).catch(console.error);
    var embed = new Discord.MessageEmbed()
    .setDescription(`**❯ ${lol} REMOVED ✘**`)
    .setColor("RED");
    message.channel.send(embed);  
  }
  else {
    member.roles.add(role).catch(console.error);
    var embed = new Discord.MessageEmbed()
    .setDescription(`**❯ ${lol} ADDED ✓**`)
    .setColor("GREEN");
    message.channel.send(embed);
  }
}

// ❯ Rocket League
if (command == "rl") {
  var rl = config.rl
  let role = message.guild.roles.cache.find(role => role.name === `${rl}`);
  let member = message.member

  if(message.member.roles.cache.some(role => role.name === `${rl}`)) {
    member.roles.remove(role).catch(console.error);
    var embed = new Discord.MessageEmbed()
    .setDescription(`**❯ ${rl} REMOVED ✘**`)
    .setColor("RED");
    message.channel.send(embed);  
  }
  else {
    member.roles.add(role).catch(console.error);
    var embed = new Discord.MessageEmbed()
    .setDescription(`**❯ ${rl} ADDED ✓**`)
    .setColor("GREEN");
    message.channel.send(embed);
  }
}

// ❯ Valorant
if (command == "valorant") {
  var valorant = config.valorant
  let role = message.guild.roles.cache.find(role => role.name === `${valorant}`);
  let member = message.member

  if(message.member.roles.cache.some(role => role.name === `${valorant}`)) {
    member.roles.remove(role).catch(console.error);
    var embed = new Discord.MessageEmbed()
    .setDescription(`**❯ ${valorant} REMOVED ✘**`)
    .setColor("RED");
    message.channel.send(embed);  
  }
  else {
    member.roles.add(role).catch(console.error);
    var embed = new Discord.MessageEmbed()
    .setDescription(`**❯ ${valorant} ADDED ✓**`)
    .setColor("GREEN");
    message.channel.send(embed);
  }
}

}

)

client.login(config.token);