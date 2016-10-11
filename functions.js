// Welcome new member to the Server
exports.notification = (bot, server, user) => {
    console.log('User ' + user.name +' has joined the Server');
    bot.sendMessage(server.channels.get('name', 'general'), user.name + ' has joined us!');
}
