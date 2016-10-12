var http = require('http');

// Welcome new member to the Server
exports.notification = (bot, server, user) => {
    console.log('User ' + user.name +' has joined the Server');
    bot.sendMessage(server.channels.get('name', 'general'), user.name + ' has joined us!');
}

exports.toggleRole = (msg, role) => {
    if(msg.member.roles.has(role)){
        console.log(msg.author.username + " has granted themselves role - " + msg.guild.roles.get(role).name);
        msg.reply("Removed role " + msg.guild.roles.get(role).name + ". Use !" + msg.guild.roles.get(role).name.toLowerCase() + " to undo.");
        msg.guild.member(msg.author).removeRole(role)
    } else {
        console.log(msg.author.username + " has removed their role - " + msg.guild.roles.get(role).name);
        msg.reply("You have been granted role - " + msg.guild.roles.get(role).name + ".")
        msg.guild.member(msg.author).addRole(role);
    }
}

exports.filterWords = (msg) => {
    var bad_word_list = ["gay", "queer", "fuck", "ass", "nigger", "slut", "cunt", "boi", "fag", "testie"];
    for(word of bad_word_list){
        if(msg.content.toLowerCase().indexOf(word) !== -1){
            msg.delete();
            msg.channel.sendMessage("Please refrain from using profanity. If you feel this is an error please contact " + msg.guild.owner + ".");
            
        } 
    }
}

exports.apiRequest = (url, callback) => {
    http.get(url, (response) => {
        var data = '';
        response.on('data', (chunk) => {data += chunk});
        response.on('end', () => {
        callback(JSON.parse(data));
        });
    });
}