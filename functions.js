var queue;

function ready_state(bot) {
    if(bot.voiceConnection && bot.voiceConnection.playing){
        return false;
    }else{
        return true;
    }
}
exports.ready_state = (bot) => {
    if(bot.voiceConnection && bot.voiceConnection.playing){
        return false;
    }else{
        return true;
    }
}

function getNextSong(bot) {
        if(queue.length > 0){
            currentSong = queue.shift();
            return currentSong;
        }else{
            bot.setPlayingGame(null);
            return null;
        }
}

function playSong (bot, conn, song) {
    var ready = ready_state(bot);
    if(ready){
        var niceSongName = song.replace(/_/g, ' ');
        var connection = conn;
        console.log('Playing ' + niceSongName);
        conn.playFile('./music/' + song + '.m4a', (error, intent) => {
            bot.setPlayingGame(niceSongName, (error) => {
                if (error){
                    throw error;
                }
            });
            if (error){
                throw error;
            }
            intent.on('end', () => {
                var song = getNextSong(bot);
                if (song != null){
                    playSong(bot, conn, song);
                }
        }); // end play
    });
    }
}

exports.play = (bot, msg, que) => {
    var ready = ready_state(bot);
    if(ready){
        queue = que;
        if (queue.length > 0) {
            var song = getNextSong(bot);
            var channel = msg.sender.voiceChannel;
            bot.joinVoiceChannel(channel, (err, conn) => {
                    if (err){
                        console.log(err);
                        throw err;
                    }
                    console.log('Bot Joined Voice Channel');
                    playSong(bot, conn, song);
            });
        }
    }
}

exports.hasRole = (bot, msg, server) => {
    var admin = bot.memberHasRole(msg.sender, server.roles.get('name', 'Admin'));
    var moderator = bot.memberHasRole(msg.sender, server.roles.get('name', 'Moderator'));
    if(admin || moderator){
        return true;
    }
}

exports.notification = (bot, server, user) => {
    console.log('User ' + user.name +' has joined the Server');
    bot.sendMessage(server.channels.get('name', 'general'), user.name + ' has joined us!');
}
