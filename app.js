var Discord = require('discord.js');
var bot = new Discord.Client();
var Authentication = require('./auth.json');
var Message = require('./message.js');
var fs = require('fs');

bot.on('ready', () => {
    // Wipe Log if necessary.
    if(fs.statSync('./nohup.out').isFile()){
        fs.rmdirSync('./nohup.out');
    }
    console.log('Bot is Online');

});

bot.on('message', (msg) => {
    Message.cmds(bot, msg);
});

bot.loginWithToken(Authentication.token);
