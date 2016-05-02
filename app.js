var Discord = require('discord.js');
var bot = new Discord.Client({ autoReconnect: true});
var Message = require('./message.js');
var fs = require('fs');

bot.on('ready', () => {
    // Wipe Log if necessary.
    if(fs.stat('./nohup.out', (err) => {
        if (err){
            console.log('nohup.out does not exist.');
        }
      })){
          fs.unlinkSync('./nohup.out');
    }

    console.log('Bot is Online');

});

bot.on('message', (msg) => {
    Message.cmds(bot, msg);
});

bot.on('disconnected', () => {
    console.log('Bot Disconnected.');
});

bot.loginWithToken(process.env.HOUND_BOT_TOKEN);
