var Discord = require('discord.js');
var bot = new Discord.Client();

bot.on('ready', () => {
    bot.leaveServer(bot.servers.get("name", "Discord API"));
});

bot.loginWithToken(process.env.HOUND_BOT_TOKEN);
