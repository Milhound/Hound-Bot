var queue;

exports.msgOfTheDay = (bot) => {
    bot.sendMessage(bot.channels.get('name', 'general'),
    "Welcome to Milhound's Server. Please check out the " + bot.channels.get('name','rules') + ' and ' + bot.channels.get('name', 'info') + '. ' + "Please use !commands to get a list of Hound Bot's commands." );
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

function playSong (bot, conn, song, playing) {
    console.log('Play Song has been called');
    if(!playing){
        var niceSongName = song.replace(/_/g, ' ');
        var connection = conn;
        console.log('Playing ' + niceSongName);
        conn.playFile('./music/' + song + '.m4a', (error, intent) => {
            playing = true;
            bot.setPlayingGame(niceSongName, (error) => {
                if (error){
                    throw error;
                }
            });
            if (error){
                throw error;
            }
            intent.on('end', () => {
                playing = false;
                var song = getNextSong(bot);
                if (song != null){
                    playSong(bot, conn, song, playing);
                }
        }); // end play
    });
    }
}
exports.playSong = (bot, conn, song, playing) =>{
    playsong(bot, conn, song, playing);
}
exports.play = (bot, msg, que, playing) => {
    queue = que;
    if(!playing){
        if (queue.length > 0 && !playing) {
            var song = getNextSong(bot);
            var channel = msg.sender.voiceChannel;
            bot.joinVoiceChannel(channel, (error, conn) => {
                    if (error){
                        throw error;
                    }
                    console.log('Bot Joined Voice Channel');
                    playSong(bot, conn, song, playing);
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

exports.onServer = (bot, msg) =>{
    if (msg.author.voiceChannel != null){
        var anyTrue;
        var channel = msg.author.voiceChannel.id;
        var botChannels = bot.channels.getAll('name', 'Music');
        for (c of botChannels){
            if (c.id == channel){
                return true;
            }
        }
    } else if (!bot.channels.get('name', 'Music')){
            return true;
    } else if (forced){
        forced = false;
        bot.joinVoiceChannel(msg.sender.voiceChannel);
    } else {
        bot.reply(msg, 'Not on Server.');
    }
}

exports.notification = (bot, server, user) => {
    console.log('User ' + user.name +' has joined the Server');
    bot.sendMessage(server.channels.get('name', 'general'), user.name + ' has joined us!');
}
