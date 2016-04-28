var Discord = require('discord.js');
var bot = new Discord.Client();
var Authentication = require('./auth.json');
var Message = require('./message.js');

bot.on('ready', () => {
    console.log('Bot is Online');
});

bot.on('message', (msg) => {
    Message.cmds(bot, msg);
});

bot.loginWithToken(Authentication.token);
