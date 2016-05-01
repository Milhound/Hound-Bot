var http = require('http');
var https = require('https');
var yt = require('ytdl-core');
var fn = require('./functions.js');
var fs = require('fs');
var Playlist = require('./playlist.json');
var queue = new Array();
var Authentication = require('./auth.json');
var async = require('async');

exports.cmds = (bot, msg) => {
    var server = bot.servers.get('name', 'Milhound');

    // Commands Command
    if(msg.content == '!commands'){
        bot.sendMessage(msg.author,
            `List of Commands: \n
            !ping - Replys Pong \n
            !help - Returns Help Text \n
            !slap @user - Slaps all mentioned users\n
            !insult (@user - optional) - Insults the sender or @user.\n
            !hi @user - Says Hello to all mentioned users\n
            !cat - Random Cat\n
            !toC <#> - Converts Fahrenheit to Celsius\n
            !toF <#> - Converts Celsius to Fahrenheit\n
            !time <TIMEZONE> - Returns current time in zone. Ex: !time CST\n
            !music - PMs list of available music\n
            !queue - PMs current queue\n
            !play (Song Name) - Plays the specified song\n
            !yt <url> - Plays the YouTube like a song\n
            !playAll or !play All - Plays all songs\n
            !playlist (Playlist Name) - Plays playlist\n
            !next - Plays the next song in queue\n
            !shuffle - Shuffles current queue\n
            !clear - Clears current queue`);
    }

    // Ping Command
    if(msg.content == '!ping'){
        console.log(msg.sender.username + ' as used the ping command')
        bot.reply(msg, 'pong');
        bot.deleteMessage(msg);
    }

    // Help Command
    if(msg.content == '!help'){
        console.log(msg.sender.username + ' as used the help command')
        bot.sendMessage(msg.sender, 'Please refer to ' + bot.channels.get('name','rules_and_info') + ' and ' + bot.channels.get('name','announcements') + ' for help! Bot commands can be found via !commands.')
    }

    // Slap Command
    if(msg.content.indexOf('!slap') == 0 && msg.mentions.length >= 0) {
        console.log(msg.sender.username  + ' used the slap command');
        for (mentioned of msg.mentions){
            bot.sendMessage(msg.channel, mentioned + " You've been SLAPPED!");
        }
        bot.deleteMessage(msg);
    }

    // Hi Command
    if(msg.content.indexOf('!hi') == 0 && msg.mentions.length >= 0){
        console.log(msg.sender.username  + ' used the Hi command');
        for (mentioned of msg.mentions){
            bot.sendMessage(msg.channel, 'Hello ' + mentioned);
        }
        bot.deleteMessage(msg);
    }

    // Cat Command
    if(msg.content == '!cat'){
        console.log(msg.author.name + ' used the !cat command.');
        var request = http.get('http://random.cat/meow', (response) => {
            response.setEncoding('utf8');
            response.on('data', (data) => {
                var json = JSON.parse(data);
                bot.reply(msg, json.file);
                bot.deleteMessage(msg);
            });
        });
    }

    // Insult Command
    if(msg.content.startsWith('!insult')){
        var args = msg.content.split(' ');
        console.log(msg.author.name + ' used the insult command on ' + args[1]);
        var jsonData = '';
        http.get('http://quandyfactory.com/insult/json', (response) => {
            response.setEncoding('utf8');
            response.on('data', (data) => {
                jsonData += data
            });
            response.on('end', () => {
                var json = JSON.parse(jsonData);
                if (args[1]){
                    bot.sendMessage(msg.channel, args[1] + ' ' + json.insult);
                    bot.deleteMessage(msg);
                } else {
                    bot.reply(msg, json.insult);
                    bot.deleteMessage(msg);
                }
            });
        });

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
                var api = Authentication.api;
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
                        title = title.trim();
                        yt(args[1], { filter: 'audioonly' }).pipe(fs.createWriteStream('music/' + title + '.m4a'));
                        bot.reply(msg, title + ' ready for use!');
                        bot.deleteMessage(msg);
                    });
                }); // end get
        }
        } else if (msg.content.startsWith('!ytdl') && !fn.hasRole(bot, msg, server)){
        bot.reply(msg, 'You dont have permission to download from youTube');
        bot.deleteMessage(msg);
    }

    //youTube Player
    if (msg.content.startsWith('!yt')){
        var args = msg.content.split(' ');
        console.log(msg.sender.name + ' used the !yt command on ' + args[1]);
        if (args[1] == null){
            bot.deleteMessage(msg);
            bot.reply(msg, 'Missing the URL');
        }

        if (args[1] != null && !args[2]){
                var ready = fn.ready_state(bot);
                var title = '';
                var url = args[1];
                console.log(bot.user.game);
                if (!ready && bot.user.game && bot.user.game == "youTube"){
                    bot.reply(msg, 'Try again when bot is not playing youTube.');
                } else {
                var youtube = yt(args[1], { filter: 'audioonly' });
                youtube.pipe(fs.createWriteStream('music/youTube.m4a'));
                youtube.on('end', () => {

                            if (!ready && queue.length > 0){
                                queue.push(args[1]);
                                bot.reply(msg, 'Added youTube to queue');
                                bot.deleteMessage(msg);
                                console.log('Added youTube to queue.');
                            }
                            if (!ready && queue.length == 0){
                                queue.push('youTube');
                                bot.reply('Your youTube will play next.');
                                bot.deleteMessage(msg);
                            }
                            if (ready && queue.length == 0){
                                bot.reply(msg, "Playing YouTube");
                                queue.push('youTube');
                                fn.play(bot, msg, queue);
                                bot.deleteMessage(msg);
                            }
                }); // End YouTube on
            }
        }
    }

    // List Music
    if (msg.content == '!music'){
        bot.sendFile(msg.sender, "./Music.txt", 'Music', 'List of Music Attached.');
        console.log(msg.author.name + ' used the !music command.');
    }

    // PM Queue
    if (msg.content == '!queue'){
        console.log(msg.sender.username + ' used the Queue command');
        bot.sendMessage(msg.sender, queue);
    }

    // Clear Queue
    if (msg.content == '!clear'){
        queue = new Array();
        bot.sendMessage(msg, 'Queue Cleared!');
    }

    // Next Song
    if (msg.content == '!next' && queue.length > 0){
        console.log(msg.author.name + ' used the next command.');
        if(bot.voiceConnection){
            var connections = bot.voiceConnections;
            for (var i = 0; i < connections.length; i++){
                var conn = bot.voiceConnections[i];
                conn.stopPlaying();
            }
            } else if (msg.content == '!next' && queue.length == 0){
                bot.reply(msg, 'Song queue is empty.');
        }
    }

    // Shuffle
    if (msg.content == '!shuffle' && queue.length > 0){
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
    if (msg.content.startsWith('!playAll') || msg.content == "!play All"){
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
        var ready = fn.ready_state(bot);
        if (ready){
            fn.play(bot,
                msg, queue, ready);
        }

        bot.reply(msg, 'Added all songs to the queue');
        console.log(msg.author.name + ' used the Play All command.');
        bot.deleteMessage(msg);
    }

    // Playlist Command
    if (msg.content.startsWith('!playlist')){
        var args = msg.content.split(' ');
        console.log(msg.author.name + ' used playlist command on ' + args[1]);
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
                var ready = fn.ready_state(bot);
                if (ready){
                    fn.play(bot, msg, queue);
                }
                console.log(queue);
            bot.reply(msg, 'Added playlist ' + args[1]);
            bot.deleteMessage(msg);
            } else {
                bot.reply(msg, 'Invalid Playlist');
                bot.deleteMessage(msg);
            }
        } else {
            bot.reply(msg, 'Please supply !playlist command with name of playlist');
            bot.deleteMessage(msg);
        }
    }

    // Force quit music
    if (msg.content == '!end'){
        queue = new Array();
        if(bot.voiceConnection){
            bot.leaveVoiceChannel(bot.voiceConnection.voiceChannel);
        }
        bot.setPlayingGame(null);
    }

    // Play Command
    if (msg.content.startsWith('!play') && !msg.content.startsWith('!playlist') && !msg.content.startsWith('!playAll') && msg.content != "!play All"){
        var args = msg.content.split(' ');

        if (queue.length == 0 && args[1] == null){
            console.log('Queue Empty');
            bot.reply(msg, 'Queue is Empty');
        }

        if (args[1]  != null){
            var song = msg.content;

            song = song.trim();
            song = song.replace('!play ', '');
            song = song.replace(/ /g, '\ ');

            if(fs.existsSync("music/" + song + ".m4a")){
                var ready = fn.ready_state(bot);

                if (!ready && queue.length > 0){
                    queue.push(song);
                    bot.reply(msg, 'Added ' + song + ' to queue');
                    console.log('Added ' + song + ' to queue.');
                }

                if (!ready && queue.length == 0){
                    queue.push(song);
                    bot.reply(msg, song + ' will play next.');
                    console.log('Playing Next ' + args[1]);
                }
                if (ready && queue.length == 0){
                    queue.push(song);
                    fn.play(bot, msg, queue);
                }
            } else {
                console.log('Unknown Song');
                bot.sendMessage(msg.author, song + ' song unknown. Use !music for a list.');
                }
        }
    }

    // Wipe Command
    if (msg.content.startsWith('!wipe') && fn.hasRole(bot, msg, server)){
        var args = msg.content.split(' ');
        if (args[1] <= 25){
            var count = args[1];
            count ++
            bot.getChannelLogs(msg.channel, count, (err, msgs) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                for(message of msgs){
                    bot.deleteMessage(message, (err) => {
                        if (err) {
                            console.log (err);
                            throw err;
                        }
                    });
                }
            });
        } else if (args[1] > 15){
            bot.deleteMessage(msg);
            bot.sendMessage(msg.sender, 'Limit 15 on wipe.');
            console.log(msg.author.name + " wiped " + args[1] + " messages.");
        }
    }

    // Change username
    if (msg.content.startsWith('!usrName') && fn.hasRole(bot, msg, server)){
        var args = msg.content.split(' ');
        if (args[1]){
            var username = msg.content.replace('!usrName', '').trim();
            bot.setUsername(username, (err) => {
                if (err){
                    console.log(err.text);
                }
            });
        }
        console.log(msg.sender.name + " changed bot's name.");
    }

    // Celsius to Fahrenheit
    if (msg.content.startsWith('!toF')){
        var args = msg.content.split(' ');
        if(args[1] && !args[2]){
            var C = args[1];
            var F = (C * 1.8 + 32).toFixed(0);
            bot.reply(msg, F);
        }
        console.log(msg.sender.name + " used Cel to Far.");
    }

    // Fahrenheit to Celsius
    if (msg.content.startsWith('!toC')){
        var args = msg.content.split(' ');
        if(args[1] && !args[2]){
            var F = args[1];
            var C = ((F -32) * (5/9)).toFixed(0);
            bot.reply(msg, C);
        }
        console.log(msg.sender.name + " used Far to Cel.");
    }

    // Time
    if (msg.content.startsWith('!time')){
        var goodTime = true;
        var args = msg.content.split(' ');
        var date = new Date();
        var hour = date.getUTCHours();

        switch (args[1].toLowerCase()){
            //United States
            case 'pdt':
            case 'california':
                hour = hour -7;
                break;

            case 'mdt':
                hour = hour -6;
                break;

            case 'cdt':
            case 'texas':
                hour = hour - 5;
                break;

            case 'edt':
                hour = hour - 4;
                break;

            //Europe
            case 'west':
            case 'cet':
                hour = hour + 1;
                break;

            case 'cest':
            case 'sweden':
            case 'eet':
            case 'germany':
            case 'austria':
                hour = hour + 2;
                break;

            case 'eest':
            case 'finland':
                hour = hour + 3;
                break;

            case 'uk':
            default:
                if(args[1].startsWith('GMT') || args[1].startsWith('UTC')){
                    if(args[1].startsWith('GMT')){
                        modifier = args[1].replace('GMT', '');
                    }else if(args[1].startsWith('UTC')){
                        modifier = args[1].replace('UTC', '');
                    }
                    switch(modifier.slice(0,1)){
                        case '+':
                            hour = hour +  parseInt(modifier.slice(1));
                            break;
                        case '-':
                            hour = hour - parseInt(modifier.slice(1));
                            break;
                        default:
                        console.log('Incorrect format for time command used  ' + modifier);
                    }
                } else
                if (args[1].toLowerCase() == 'uk') {
                    hour = hour;
                }else {
                    bot.reply(msg, 'Unknown Timezone.');
                    goodTime = false;
                    console.log('Timezone not avaliable yet: ' + args[1]);
                }
        }

        if (hour < 1){
            hour = 12 + hour;
        }

        if (hour > 24){
            hour = hour - 24;
        }
        if (hour < 10){
            hour = "0" + hour;
        }

        var minutes = date.getUTCMinutes();
        if(minutes < 10){
            minutes = "0" + minutes;
        }
        setTimeout(()=>{
            if (goodTime){
                bot.reply(msg, hour + ":" + minutes);
            }
        }, 1000);
    }
}
