const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const fs = require('fs');

client.on('ready', () => {
    var now = new Date();    
    console.log("Logged in as " + client.user.tag + " on " + now.toUTCString() + "!");
    console.log("Running in:");
    client.guilds.forEach(guild=> console.log("> " + guild.name));
});

client.on('message', (receivedMessage) => {
   if (receivedMessage.author == client.user) {
       return
   }
   if (receivedMessage.content.startsWith("!")) {
      processCommand(receivedMessage)
   }
});

client.on('guildMemberAdd', (member) => {
   console.log(`User "${member.user.username}" has joined the server: "${member.guild.name}"` );
   member.guild.channels.find(c => c.name === "testing-grounds").send("Welcome! If you would like to join the Monster Game, type `!Start`, or type `!Help` for more info.");
});



function processCommand(receivedMessage) {
    let args = receivedMessage.content.substr(1).split(/ +/);
    console.log(receivedMessage.author.tag + " used the command: " + receivedMessage); //args
    let command = args.shift();
    let argsString = args.toString();
    if (command == "Stats") {
        userStats(receivedMessage)
    }  else if (command == "Start") {
	generateMonster(receivedMessage)
    }  else if (command == "Help") {
	gameHelp(receivedMessage)
    }  else if (command == "Attack" ) {
        attackUser(receivedMessage)
    }  else if (command == "Release" ) {
        releaseMonster(receivedMessage)
    }  else {
        receivedMessage.reply("I don't understand that command.\nUse `!Help` for a list of commands.")
    }
};



function gameHelp(receivedMessage) {
   receivedMessage.reply("Monster Game List of Commands:\n`!Start`: Generates your starting monster\n`!Stats`: Gives you your monster's stats\n`!Stats @User`: Gives you @User's monster's stats\n`!Attack @User`: Begins a battle with @User\n`!Release`: Releases your monster into the wild\n`!Help`: Lists possible commands");
};



function generateMonster(receivedMessage) {

   const fs = require('fs');
   const path = '/home/pi/Desktop/battle-bot/User-Monsters/' + receivedMessage.author.tag + '.json'
   if (fs.existsSync(path)) {
      receivedMessage.reply("You already have a monster!\nUse `!Stats` to see your monster's stats.")
   } else {

   var monster = [];
   var length = Math.floor(Math.random() * 10) + 3;
   var monsterName = '';
   var characters = 'abcdefghijklmnopqrstuvwxyz';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      monsterName += characters.charAt(Math.floor(Math.random() * charactersLength));
   }

   var statHP = Math.floor(Math.random() * 70) + 31;
   var statATK = Math.floor(Math.random() * 70) + 31;
   var statDEF = Math.floor(Math.random() * 70) + 31;
   monster[0] = monsterName;
   monster[1] = statHP;
   monster[2] = statATK;
   monster[3] = statDEF;
   monster[4] = statHP;

   receivedMessage.reply("\nWelcome to Monster Game!\n\nYour new monster is:\nName: " + monster[0] + "\nHP: " + monster[1] + "\nAttack: " + monster[2] + "\nDefense: " + monster[3])

   var userName = receivedMessage.author
   var stream = fs.createWriteStream("/home/pi/Desktop/battle-bot/User-Monsters/" + userName + ".json", {flags:'a'});
   stream.write(monster.toString() + "\n")
   stream.end();
   receivedMessage.reply("Your monster has been saved!");
   console.log("User " + receivedMessage.author.tag + " has created: " + monster.toString() + " on " + new Date().toISOString());

   }

};



function attackUser(receivedMessage) {
   let args = receivedMessage.content.split(/ +/);
   let mentionedUser = receivedMessage.mentions.users.first();
   if (mentionedUser === undefined) {
	receivedMessage.reply("You need to mention someone to attack!");
	return;
   }
   console.log("Tagged User ID:" + args[1]);
   console.log("Tagged User Username: " + mentionedUser.username);
   let guild = client.guilds.get('434162417228972032');
   console.log("Guild: " + guild);
   if (args.length < 2) {
      receivedMessage.reply("You need to tag someone to attack!");
      return;
   } /*else if (!guild.member(args[1].slice(2, -1))) {
      receivedMessage.reply(args[1] + " is not a valid target!");
      return;
   } */else {
      receivedMessage.channel.send(receivedMessage.author +  " attacked " + mentionedUser.username + "!!");

      var power = 50;
      var rand = Math.floor(Math.random() * 256) + 217;

      const fs = require('fs');
      const attackerPath = '/home/pi/Desktop/battle-bot/User-Monsters/' + receivedMessage.author + '.json'
      if (fs.existsSync(attackerPath)) {
         var attackerData = fs.readFileSync(attackerPath).toString().split(",");
         var attackerName = attackerData[0];
         var attackerATK = attackerData[2];
      }
      const defenderPath = '/home/pi/Desktop/battle-bot/User-Monsters/' + mentionedUser + '.json'
      if (fs.existsSync(defenderPath)) {
         var defenderData = fs.readFileSync(defenderPath).toString().split(",");
         var defenderName = defenderData[0];
         var defenderTempHP = defenderData[4];
         var defenderDEF = defenderData[3];
      }

      console.log("Temp HP before battle: " + defenderTempHP);

      var damage = (2*attackerATK/5 * attackerATK * power / defenderDEF / 50 * rand / 255);
      var newDamage = Math.round(damage);
      var defenderTempHP = defenderTempHP - newDamage;

      receivedMessage.channel.send(attackerName + " dealt " + newDamage + " damage to " + defenderName + "!!")
      if (defenderTempHP <= 0) {
         receivedMessage.channel.send(attackerName + " killed " + defenderName + "!!");
         var defenderTempHP = 0;
      } else {
         receivedMessage.channel.send(defenderName + "'s HP is now: " + defenderTempHP);
      }

      console.log("Temp HP after battle: " + defenderTempHP);

      defenderData[4] = defenderTempHP;
      var stream = fs.createWriteStream('/home/pi/Desktop/battle-bot/User-Monsters/' + mentionedUser + '.json', {flags:'w'});
      console.log("Defender Data: " + defenderData);
      stream.write(defenderData.toString())
      stream.end();
   }

   const fs = require('fs');
   let taggedMember = receivedMessage.mentions.members.first().user;
   const defenderPaths = '/home/pi/Desktop/battle-bot/User-Monsters/' + taggedMember + '.json'
   console.log("Defender File Path: " + defenderPaths);
   if (fs.existsSync(defenderPaths)) {
      var newDefenderData = fs.readFileSync(defenderPaths).toString().split(",");
      console.log("Defender Data: " + newDefenderData);
    //  receivedMessage.channel.send(taggedMember +"'s monster's data is:\nName: " + newDefenderData[0] + "\nHP: " + newDefenderData[1] + "->" + newDefenderData[4] + "\nAttack: " + newDefenderData[2] + "\nDefense: " + newDefenderData[3])
   } else {
      receivedMessage.reply(taggedMember + " doesn't have a monster yet.\nHave them type `!Start` to get one!")
   }

};



function userStats(receivedMessage) {
   let args = receivedMessage.content.split(/ +/);
   let guild = client.guilds.get('434162417228972032');
   if (args.length < 2) {
      const fs = require('fs');
      const path = '/home/pi/Desktop/battle-bot/User-Monsters/' + receivedMessage.author + '.json'
      if (fs.existsSync(path)) {
         var rawdata = fs.readFileSync(path).toString().split(",");
         receivedMessage.reply("Your monster information is:\nName: " + rawdata[0] + "\nMax HP: " + rawdata[1] + "\nCurrent HP: " + rawdata[4] + "\nAttack: " + rawdata[2] + "\nDefense: " + rawdata[3])
      } else {
         receivedMessage.reply("You don't have a monster yet.\nUse `!Start` to get one!")
      }
   } else if (!guild.member(args[1].slice(2, -1))) {
      receivedMessage.reply(args[1] + " does not have a monster!");
      return
   } else {
      let taggedMember = receivedMessage.mentions.members.first().user;
      const userPath = '/home/pi/Desktop/battle-bot/User-Monsters/' + taggedMember + '.json'
      if (fs.existsSync(userPath)) {
         var userData = fs.readFileSync(userPath).toString().split(",");
         receivedMessage.channel.send(taggedMember +"'s monster's data is:\nName: " + userData[0] + "\nMax HP: " + userData[1] + "\nCurrent HP: " + userData[4] + "\nAttack: " + userData[2] + "\nDefense: " + userData[3])
      } else {
         receivedMessage.reply(taggedMember + " doesn't have a monster yet.\nHave them type `!Start` to get one!")
      }
   }
};



function releaseMonster(receivedMessage) {
   let args = receivedMessage.content.split(/ +/);
   if (args.length < 2) {
      receivedMessage.reply("You need to enter your monster's name!");
      return
   } else if (args.length = 2) {
      const fs = require('fs');
      const path = '/home/pi/Desktop/battle-bot/User-Monsters/' + receivedMessage.author + '.json'
      if (fs.existsSync(path)) {
         var rawdata = fs.readFileSync(path).toString().split(",");
         if (args[1] != rawdata[0]) {
         receivedMessage.reply("That monster doesn't exist!");
         } else {
           receivedMessage.reply("Your monster has been released!")
           fs.unlinkSync(path);
         }
      } else {
         receivedMessage.reply("That monster doesn't exist!")
      }
   } else {
      receivedMessage.reply("That monster doesn't exist!")
   }
};


client.login(auth.token);