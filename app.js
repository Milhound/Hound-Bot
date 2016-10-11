const Discord = require('discord.js');
const bot = new Discord.Client({ autoReconnect: true});
var Message = require('./message.js');

bot.on('ready', () => {
    console.log('Bot is Online')
});

bot.on('message', message => {
    Message.cmds(bot, message);
});

bot.on('disconnected', () => {
    console.log('Bot Disconnected.');
});

bot.login(process.env.HOUND_BOT_TOKEN);
