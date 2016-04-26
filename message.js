var http = require('http');
var yt = require('ytdl-core');
var fn = require('./functions.js');
var fs = require('fs');
var Playlist = require('./playlist.json');
var MotD = null;
// 60,000 = 1 Minutes
var msgTime = 1800000;

exports.cmds = (bot, msg, queue, playing) => {
    var server = bot.servers.get('name', 'Milhound');
    // Commands Command
    if(msg.content == '!commands'){
        bot.sendMessage(msg.author,
            `List of Commands: \n
            !commands - PMs this list\n
            !ping - Replys Pong \n
            !help - Returns Help Text \n
            !slap @user - Slaps all mentioned users\n
            !insult (@user - optional) - Insults the sender or @user.\n
            !hi @user - Says Hello to all mentioned users\n
            !admin - Sends PM with a list of Admins\n
            !cat - Random Cat\n
            !music - PMs list of available music\n
            !queue - PMs current queue\n
            !play (Song Name) - Plays the specified song\n
            !playAll - Plays all songs\n
            !playlist (Playlist Name) - Plays playlist\n
            !next - Plays the next song in queue\n
            !shuffle - Shuffles current queue\n
            !clear - Clears current queue\n
            !end - Forces bot to stop playing`);
    }

    // Ping Command
    if(msg.content == '!ping'){
        console.log(msg.sender.username + ' as used the ping command')
        bot.reply(msg, 'pong');
    }

    // Help Command
    if(msg.content == '!help'){
        console.log(msg.sender.username + ' as used the help command')
        bot.reply(msg, 'Please refer to ' + bot.channels.get('name','rules') + ' and ' + bot.channels.get('name','info') + ' for help! Bot commands can be found via !commands.')
    }

    // Slap Command
    if(msg.content.indexOf('!slap') == 0 && msg.mentions.length >= 0) {
        console.log(msg.sender.username  + ' used the slap command');
        for (mentioned of msg.mentions){
            bot.sendMessage(msg.channel, mentioned + " You've been SLAPPED!");
        }
    }

    // Hi Command
    if(msg.content.indexOf('!hi') == 0 && msg.mentions.length >= 0){
        console.log(msg.sender.username  + ' used the Hi command');
        for (mentioned of msg.mentions){
            bot.sendMessage(msg.channel, 'Hello ' + mentioned);
        }
    }

    // Admin Command
    if(msg.content == '!admin'){
        console.log(msg.sender.username  + ' used the Admin Command')
         var admin = server.usersWithRole(server.roles.get('name', 'Admin'))
        bot.sendMessage(msg.author, 'Admins: \n' + server.usersWithRole(server.roles.get('name', 'Admin')));
    }

    // Cat Command
    if(msg.content == '!cat'){
        var request = http.get('http://random.cat/meow', (response) => {
            response.setEncoding('utf8');
            response.on('data', (data) => {
                var json = JSON.parse(data);
                bot.reply(msg, json.file);
            });
        });
    }

    // Insult Command
    if(msg.content.startsWith('!insult')){
        var args = msg.content.split(' ');
        var jsonData = '';
        http.get('http://quandyfactory.com/insult/json', (response) => {
            response.setEncoding('utf8');
            response.on('data', (data) => {
                jsonData += data
            });
            response.on('end', () => {
                var json = JSON.parse(jsonData);
                console.log(json);
                if (args[1]){
                    bot.sendMessage(msg.channel, args[1] + ' ' + json.insult);
                } else {
                    bot.reply(msg, json.insult);
                }
            });
        });

    }

    // Start MotD
    if (msg.content == '!start' && fn.hasRole(bot, msg, server)){
        console.log(msg.sender.username  + ' as used the Message of the Day Start command')
        MotD = setInterval(fn.msgOfTheDay, msgTime);
    }

    // Stop MotD
    if (msg.content == '!stop' && fn.hasRole(bot, msg, server)){
        console.log(msg.sender.username  + ' as used the Message of the Day Stop command')
        clearInterval(MotD);
    }

    // Youtube Download
    if (msg.content.startsWith('!ytdl') && fn.hasRole(bot, msg, server)){
        var args = msg.content.split(' ');
        if (args[1] == null){
            bot.reply(msg, 'Missing the URL');
        }

        if (args[1] != null){
                var title = '';
                var url = args[1];
                var api = Authentication.yt-api;
                var id = args[1].replace('https://www.youtube.com/watch?v=', '');
                var url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet&&id=' + id + '&&key=' + Authentication.api;
                https.get(url, (res) => {
                    var chunk = '';
                    res.on('data', (data) => {
                        chunk += data;
                    }); // end on data
                    res.on('end', () => {
                        var json = JSON.parse(chunk);
                        title = json.items[0].snippet.title;
                        title = title.replace(/\u+0028/, '').replace( /\u+005B/, '_').replace(/ - /g, '-').replace(/ /g, '_').replace(/\u+005D/, '').replace(/\u+0029/, '');
                        yt(args[1], { filter: 'audioonly' }).pipe(fs.createWriteStream('music/' + title + '.m4a'));
                        bot.reply(msg, title + ' ready for use!');
                    });
                }); // end get
        }
    } else if (msg.content.startsWith('!ytdl') && !fn.hasRole(bot, msg, server)){
        bot.reply(msg, 'You dont have permission to download from youTube');
    }

    // List Music
    if (msg.content == '!music'){
        var message = fs.readdirSync('music');
        message[0] = 'Music List:';
        for ( var i in message ) {
            message[i] = message[i].replace('.m4a', '');
        }
        bot.sendMessage(msg.author, message);
    }

    // PM Queue
    if (msg.content == '!queue' && fn.onServer(bot, msg)){
        console.log(msg.sender.username + ' used the Queue command');
        bot.sendMessage(msg.sender, queue);
    }

    // Clear Queue
    if (msg.content == '!clear' && fn.onServer(bot, msg)){
        queue = new Array();
        bot.sendMessage(msg, 'Queue Cleared!');
    }

    // Next Song
    if (msg.content == '!next' && queue.length > 0 && fn.onServer(bot, msg)){
        var connections = bot.voiceConnections;
        for (var i = 0; i < connections.length; i++){
            var conn = bot.voiceConnections[i];
            conn.stopPlaying();
        }
    } else if (msg.content == '!next' && queue.length == 0 && fn.onServer(bot, msg)){
        bot.reply(msg, 'Song queue is empty.');
    }

    // Shuffle
    if (msg.content == '!shuffle' && queue.length > 0 && fn.onServer(bot, msg)){
        console.log('Shuffling queue');

        var counter = queue.length;

            while (counter >0) {
                var index = Math.floor(Math.random() * counter);

                counter--;

                var temp = queue[counter];
                queue[counter] = queue[index];
                queue[index] = temp;
            }
        bot.reply(msg, 'Sucessfully shuffled the current queue');
    } else if (msg.content == '!shuffle' && queue.length == 1 || msg.content == '!shuffle' && queue.length == 0){
        bot.reply(msg, 'Queue not long enough to shuffle.');
    }

    //Play All
    if (msg.content.startsWith('!playAll') && fn.onServer(bot, msg)){
        var music = fs.readdirSync('music');
        music.shift();
        for ( var i in music ) {
            music[i] = music[i].replace('.m4a', '');
        }
        for (song of music){
            queue.push(song);
        }
        var counter = queue.length;

        while (counter >0) {
            var index = Math.floor(Math.random() * counter);

            counter--;

            var temp = queue[counter];
            queue[counter] = queue[index];
            queue[index] = temp;
        }

        if (!playing){
            fn.play(bot,
                msg, queue, playing);
        }

        bot.reply(msg, 'Added all songs to the queue');
    }

    // Playlist Command
    if (msg.content.startsWith('!playlist') && fn.onServer(bot, msg)){
        var args = msg.content.split(' ');
        if (args[1]){
            var addedPlaylist = Playlist[args[1]]
            if (addedPlaylist.length > 0){
                for (song of addedPlaylist){
                    console.log(song);
                    queue.push(song);
                }
                var counter = queue.length;

                while (counter >0) {
                    var index = Math.floor(Math.random() * counter);

                    counter--;

                    var temp = queue[counter];
                    queue[counter] = queue[index];
                    queue[index] = temp;
                }
                if (!playing){
                    fn.play(bot, msg, queue, playing);
                }
                console.log(queue);
            bot.reply(msg, 'Added playlist ' + args[1]);
            } else {
                bot.reply(msg, 'Invalid Playlist');
            }
        } else {
            bot.reply(msg, 'Please supply !playlist command with name of playlist');
        }
    }

    // Force quit music
    if (msg.content == '!end' && fn.hasRole(bot, msg, server) && msg.sender.voiceChannel.name == 'Music'){
        queue = new Array();
        bot.leaveVoiceChannel(msg.sender.voiceChannel);
        bot.setPlayingGame(null);
        playing = false;
        forced = true;
        bot.reply(msg, 'Bot has stopped playing Music, and can now change Servers.');
    } else if (msg.content == '!end' && !fn.hasRole(bot, msg, server)){
        bot.reply(msg, 'You do not have permission to !end on this server');
    }


    // Play Command
    if (msg.content.startsWith('!play') && !msg.content.startsWith('!playlist') && !msg.content.startsWith('!playAll') && fn.onServer(bot, msg)){
        var args = msg.content.split(' ');

        if (queue.length == 0 && args[1] == null){
            console.log('Queue Empty');
            bot.reply(msg, 'Queue is Empty');
        }

        if (args[1]  != null){
            if(fs.existsSync("music/" + args[1] + ".m4a")){

                if (playing && queue.length > 0){
                    queue.push(args[1]);
                    bot.reply(msg, 'Added ' + args[1] + ' to queue');
                    console.log('Added ' + args[1]+ ' to queue.');
                }

                if (playing && queue.length == 0){
                    queue.push(args[1]);
                    bot.reply(msg, args[1] + ' will play next.');
                    console.log('Playing Next ' + args[1]);
                }
                if (!playing && queue.length == 0){
                    queue.push(args[1]);
                    fn.play(bot, msg, queue, playing);
                }
            } else {
                console.log('Unknown Song');
                bot.reply(msg, 'Song unknown. Use !music for a list.');
                }
        }
    }
}
