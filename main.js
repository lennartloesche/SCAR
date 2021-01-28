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
    url: "https://twitch.tv/milchi_true"
  });
});

// ❯ Online Konsole
client.on('ready', async () => {
console.log(`❯ Bot gestartet als ${client.user.username}`)
})

// ❯ Join / Leave Message
client.on("guildMemberAdd", member => {
  const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === '╔-🔓-eingangshalle');
  welcomeChannel.send (`${member} hat den Server betreten!`)
})
client.on("guildMemberRemove", member => {
  const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === '╔-🔓-eingangshalle');
  welcomeChannel.send (`${member.user.tag} hat den Server verlassen.`)
})

// ❯ Member Count
client.on('ready', () =>{
  let myGuild = client.guilds.cache.get('757168568315150337')
  let membercount = myGuild.memberCount;
  const membercountchannel = myGuild.channels.cache.get('788127232530579478');
  membercountchannel.setName('Mitglieder: ' + membercount)
})
client.on('guildMemberAdd', member => {
  let myGuild = client.guilds.cache.get('757168568315150337')
  let membercount = myGuild.memberCount;
  const membercountchannel = myGuild.channels.cache.get('788127232530579478');
  membercountchannel.setName('Mitglieder: ' + membercount)
})
client.on('guildMemberRemove', member => {
  let myGuild = client.guilds.cache.get('757168568315150337')
  let membercount = myGuild.memberCount;
  const membercountchannel = myGuild.channels.cache.get('788127232530579478');
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
  { name: 'Nachrichten senden', value: '+send <Message>'},
)
.addFields(
  { name: 'Mitglied eine DM schicken', value: '+msg <@Member> <Message>'},
)
.addFields(
  { name: 'Nachrichten löschen', value: '+clear <1-99>' },
)
.addFields(
  { name: 'Mitglied Verwarnen', value: '+warn <@Member> <Grund>'},
)
.addFields(
  { name: 'Kicken', value: '+kick <@Member>'},
)
.addFields(
  { name: 'Bannen', value: '+ban <@Member> <Grund>'},
)
.addFields(
  { name: 'Mute', value: '+mute <@Member> <Zeit | 1s = 1 Sekunde | 1m = 1 Minute | 1h = 1 Stunde>'},
)
.addFields(
  { name: 'Unmute', value: '+unmute <@Member>'},
)
.setTimestamp(message.createdAt)
.setFooter(`${client.user.username}`, `https://file.lennartloesche.de/a602919780d37bd5a562b5514322781d.png`)
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
        .setFooter("System", "https://file.lennartloesche.de/a602919780d37bd5a562b5514322781d.png")          
    mentioned.send(warningEmbed); 
    var warnSuccessfulEmbed = new Discord.MessageEmbed()
    .setTimestamp(message.createdAt)
    .setFooter("System", "https://file.lennartloesche.de/a602919780d37bd5a562b5514322781d.png")
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

// ❯ Reaction Role - CSGO
if (command == "cs") {
  if (!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send(embed);
  let embed = new Discord.MessageEmbed()
  .setThumbnail('https://lh3.googleusercontent.com/proxy/hj1C35sGhpQiBkj7MbXZhOL36OUeTplK4x_Di_vE7d1CcNU_xa2oK-XD6Rq_B3SiubFTXEEqezgTvUa4fBXrlSF74FxdieTk9VLsUQ_s2-OjjLk_WrGJq-jk47Q')
  .addFields(
    { name: 'Counter Strike : Global Offensive', value: '⠀' },
  )
  .addFields(
    { name: '⠀', value: 'Wenn du die Berechtigung für die CS:GO Channel haben willst reagiere hier.' },
  )
  .addFields(
    { name: '⠀', value: 'Solltest du die Channel nicht mehr brauchen kannst du die Reaktion wieder entfernen' },
  )
  .setColor('#c72810')
  let msgEmbed = await message.channel.send(embed)
  msgEmbed.react('🔫');
}

client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();
  if (user.bot) return;
  if (!reaction.message.guild) return;

  if (reaction.message.channel.id === "760592891574747157") {
    if (reaction.emoji.name === '🔫') {
      await reaction.message.guild.member(user.id).roles.add("757223856363536474")
    }
  }
})

client.on('messageReactionRemove', async (reaction, user) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();
  if (user.bot) return;
  if (!reaction.message.guild) return;

  if (reaction.message.channel.id === "760592891574747157") {
    if (reaction.emoji.name === '🔫') {
      await reaction.message.guild.member(user.id).roles.remove("757223856363536474")
    }
  }
})

// ❯ Reaction Role - LoL
if (command == "lol") {
  if (!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send(embed);
  let embed = new Discord.MessageEmbed()
  .setThumbnail('https://sm.ign.com/ign_de/screenshot/default/signup_logo2_pm9x.png')
  .addFields(
    { name: 'League of Legends', value: '⠀' },
  )
  .addFields(
    { name: '⠀', value: 'Wenn du die Berechtigung für die LoL Channel haben willst reagiere hier.' },
  )
  .addFields(
    { name: '⠀', value: 'Solltest du die Channel nicht mehr brauchen kannst du die Reaktion wieder entfernen' },
  )
  .setColor('#c72810')
  let msgEmbed = await message.channel.send(embed)
  msgEmbed.react('⚔');
}

client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();
  if (user.bot) return;
  if (!reaction.message.guild) return;

  if (reaction.message.channel.id === "760592891574747157") {
    if (reaction.emoji.name === '⚔') {
      await reaction.message.guild.members.cache.get(user.id).roles.add("757223854707048539")
    }
  }
})

client.on('messageReactionRemove', async (reaction, user) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();
  if (user.bot) return;
  if (!reaction.message.guild) return;

  if (reaction.message.channel.id === "760592891574747157") {
    if (reaction.emoji.name === '⚔') {
      await reaction.message.guild.members.cache.get(user.id).roles.remove("757223854707048539")
    }
  }
})

// ❯ Reaction Role - Rocket League
if (command == "rl") {
  if (!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send(embed);
  let embed = new Discord.MessageEmbed()
  .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Rocket_League_logo.svg/1200px-Rocket_League_logo.svg.png')
  .addFields(
    { name: 'Rocket League', value: '⠀' },
  )
  .addFields(
    { name: '⠀', value: 'Wenn du die Berechtigung für die Rocket League Channel haben willst reagiere hier.' },
  )
  .addFields(
    { name: '⠀', value: 'Solltest du die Channel nicht mehr brauchen kannst du die Reaktion wieder entfernen' },
  )
  .setColor('#c72810')
  let msgEmbed = await message.channel.send(embed)
  msgEmbed.react('🚘');
}

client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();
  if (user.bot) return;
  if (!reaction.message.guild) return;

  if (reaction.message.channel.id === "760592891574747157") {
    if (reaction.emoji.name === '🚘') {
      await reaction.message.guild.members.cache.get(user.id).roles.add("761960632396283914")
    }
  }
})

client.on('messageReactionRemove', async (reaction, user) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();
  if (user.bot) return;
  if (!reaction.message.guild) return;

  if (reaction.message.channel.id === "760592891574747157") {
    if (reaction.emoji.name === '🚘') {
      await reaction.message.guild.members.cache.get(user.id).roles.remove("761960632396283914")
    }
  }
})

}
)
client.login(config.token);