var Discord = require('discord.js');
var bot = new Discord.Client();
var Authentication = require('./auth.json');
var Message = require('./message.js');
var Icon = require('./icon.json');
var queue = new Array();
var playing = false;
forced = false;



bot.on('ready', () => {
    console.log('Bot is Online');
    bot.setPlayingGame(null);
    //Set Avatar Image
    bot.setAvatar('data:image/jpeg;base64,' + Icon.image2, (err) => console.dir(err));

});

bot.on('message', (msg) => {
    Message.cmds(bot, msg, queue, playing);
});


 // New Member has Joined
bot.on('serverNewMember', (server, user) => {
    fn.notification(bot,server,user);
    // Wait 3 seconds for the user to update.
    setTimeout(fn.notification(bot,server,user), 3000);
});

bot.loginWithToken(Authentication.token, Authentication.email, Authentication.pass);
