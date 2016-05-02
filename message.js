// IMPORTS
var http = require('http');
var https = require('https');
var yt = require('ytdl-core');
var fn = require('./functions.js');
var fs = require('fs');
var Playlist = require('./playlist.json');

// GLOBAL VARIABLES
var queue = new Array();

//Start Export
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
            !skip - Plays the next song in queue\n
            !shuffle - Shuffles current queue\n
            !clear - Clears current queue`);
    }

    // Ping Command
    if(msg.content == '!ping'){
        console.log(msg.sender.username + ' as used the ping command');
        bot.reply(msg, 'pong');
    }

    // Help Command
    if(msg.content == '!help'){
        console.log(msg.sender.username + ' as used the help command');
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
        // Say Hello to everyone who was mentioned
        for (mentioned of msg.mentions){
            bot.sendMessage(msg.channel, 'Hello ' + mentioned);
        }
        bot.deleteMessage(msg);
    }

    // Cat Command
    if(msg.content == '!cat'){
        console.log(msg.author.name + ' used the !cat command.');
        // Get random cat
        var request = http.get('http://random.cat/meow', (response) => {
            response.on('data', (data) => {
                var json = JSON.parse(data);
                // Reply with the url from the json under "file"
                bot.reply(msg, json.file);
                // Delete user's message to reduce clutter
                bot.deleteMessage(msg);
            });
        });
    }

    // Insult Command
    if(msg.content.startsWith('!insult')){
      console.log(msg.author.name + ' used the insult command');
      for (mentioned of bot.mentions) {
        // GET request for Quandry Factory API
        http.get('http://quandyfactory.com/insult/json', (response) => {
          var data = '';
          response.on('data', (chunk) => {
            // Add chunk of data to data variable
              data += chunk
          }); // End of on 'Data'
          response.on('end', () => {
            var json = JSON.parse(data);
            bot.sendMessage(msg.channel, mentioned + ' ' + json.insult);
            bot.deleteMessage(msg);
          }); // End of on 'End'
        }); // End of http.get
      } // End of for loop
    }

    // Youtube Download requires Admin / Moderator - Saves YouTube audio to a file.
    if (msg.content.startsWith('!ytdl') && fn.hasRole(bot, msg, server)){
        var args = msg.content.split(' ');
        // Check for no url passed and confirm correct format.
        if (args[1] == null || !args[1].startsWith('https')){
            bot.reply(msg, 'Missing or invalid URL');
        } else {
          var url = args[1];
          // Save api key to api variable
          var api = process.env.GOOGLE_API_KEY;
          // Remove unnecessary url component
          var id = args[1].replace('https://www.youtube.com/watch?v=', '');
          // Properly format the url for the api request
          var url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet&&id=' + id + '&&key=' + api;
          // Api GET request
          https.get(url, (res) => {
            // Declare empty data variable
              var data = '';
              // When data is transmitted
              res.on('data', (chunk) => {
                //Add the chunks of data to data variable
                  data += chunk;
              }); // End of on 'data'
              res.on('end', () => {
                // Convert data into usable json
                  var json = JSON.parse(data);
                  // Save title of youtube video to title variable.
                  var title = json.items[0].snippet.title;
                  // Remove any spacing before / after title
                  title = title.trim();
                  // Perform dowload 'audio only' of the youtube video, and write it to the corresponding .m4a file
                  yt(args[1], { filter: 'audioonly' }).pipe(fs.createWriteStream('music/' + title + '.m4a'));
                  // Inform user that file is ready. Depending on connection speed may need to institute a wait.
                  bot.reply(msg, title + ' ready for use!');
                  // Remove user message, as youtube videos are large and obstructive to the channel
                  bot.deleteMessage(msg);
              });
          }); // End of GET
          // If non-Admin / Moderator attempts to use !ytdl command.
        }} else if (msg.content.startsWith('!ytdl') && !fn.hasRole(bot, msg, server)){
          bot.reply(msg, 'You dont have permission to download from youTube');
          bot.deleteMessage(msg);
    }

    //youTube for non-Admin / Moderator - Overwrites existing youTube.m4a
    if (msg.content.startsWith('!yt')){
        var args = msg.content.split(' ');
        console.log(msg.sender.name + ' used the !yt command on ' + args[1]);
        if (args[1] == null){
            // Remove bad call to !yt command.
            bot.deleteMessage(msg);
            bot.reply(msg, 'Missing the URL');
        }
        // Confirm url is passed
        if (args[1] != null && args[1].startsWith('http')){
            // Check if ready then play the song if bot is available
                var ready = fn.ready_state(bot);
                var title = '';
                // Dont allow users to overwrite currently playing youTube
                if (!ready && bot.user.game && bot.user.game == "youTube"){
                    bot.reply(msg, 'Try again when bot is not playing youTube.');
                } else {
                // Arrange a call to the ytdl-core dependency
                var youtube = yt(args[1], { filter: 'audioonly' });
                // Write data to the youTube.m4a file.
                youtube.pipe(fs.createWriteStream('music/youTube.m4a'));
                // When finished downloading perform the appropriate action.
                youtube.on('end', () => {
                            // If currently playing and a queue is present
                            if (!ready && queue.length > 0){
                                queue.push(args[1]);
                                bot.reply(msg, 'Added youTube to queue');
                                bot.deleteMessage(msg);
                                console.log('Added youTube to queue.');
                            }
                            // If currently playing and no songs in queue
                            if (!ready && queue.length == 0){
                                queue.push('youTube');
                                bot.reply('Your youTube will play next.');
                                bot.deleteMessage(msg);
                            }
                            // If no song is playing and the queue is empty
                            if (ready && queue.length == 0){
                                bot.reply(msg, "Playing YouTube");
                                queue.push('youTube');
                                fn.play(bot, msg, queue);
                                bot.deleteMessage(msg);
                            }
                }); // End YouTube on
            } // End else
        } // End url passed?
    }

    // List Music
    if (msg.content == '!music'){
        // Send Music.txt file to message sender as listing all songs in message is too long.
        bot.sendFile(msg.sender, "./Music.txt", 'Music', 'List of Music Attached.');
        console.log(msg.author.name + ' used the !music command.');
    }

    // PM Queue
    if (msg.content == '!queue'){
        // Currently possible to have a queue too long to send to user. User will not be notified if too long.
        console.log(msg.sender.username + ' used the Queue command');
        bot.sendMessage(msg.sender, queue);
    }

    // Clear Queue
    if (msg.content == '!clear'){
        queue = new Array();
        bot.sendMessage(msg, 'Queue Cleared!');
    }

    // Skip Song
    if (msg.content == '!skip' && queue.length > 0){
        console.log(msg.author.name + ' used the next command.');
        if(bot.voiceConnection){
            var connections = bot.voiceConnections;
            for (var i = 0; i < connections.length; i++){
                var conn = bot.voiceConnections[i];
                conn.stopPlaying();
            }
        } else if (msg.content == '!skip' && queue.length == 0){
                bot.reply(msg, 'Song queue is empty.');
        }
    }

    // DEPRECIATED: !next
    if (msg.content == '!next'){
        bot.reply(msg, '!next is depreciated please use !skip');
    }

    // Shuffle
    if (msg.content == '!shuffle' && queue.length > 0){
        console.log('Shuffling queue');
        // Determine how many songs to shuffle.
        var counter = queue.length;

        while (counter >0) {
            // Get a random number 0 or 1
            var index = Math.floor(Math.random() * counter);
            // Subtract 1 from the counter variable
            counter--;
            // Select the current item in the queue
            var temp = queue[counter];
            // Grab the first or second item in the queue to the location of the current item
            queue[counter] = queue[index];
            // Move the current item to the location that the first or second item was removed from
            queue[index] = temp;
        }
        bot.reply(msg, 'Sucessfully shuffled the current queue');
        } else if (msg.content == '!shuffle' && queue.length == 1 || msg.content == '!shuffle' && queue.length == 0){
            bot.reply(msg, 'Queue not long enough to shuffle.');
    }

    //Play All
    if (msg.content.startsWith('!playAll') || msg.content == "!play All"){
        console.log(msg.author.name + ' used the Play All command.');
        // Grab all the music in the /music folder
        var music = fs.readdirSync('music');
        // Remove the first item .DS_Store
        music.shift();
        // Remove all of the extensions from the music
        for ( var i in music ) {
            music[i] = music[i].replace('.m4a', '');
        }
        // Add all songs w/o extension to the queue
        for (song of music){
            queue.push(song);
        }
        // Determine how many songs to shuffle.
        var counter = queue.length;

        while (counter >0) {
            // Get a random number 0 or 1
            var index = Math.floor(Math.random() * counter);
            // Subtract 1 from the counter variable
            counter--;
            // Select the current item in the queue
            var temp = queue[counter];
            // Grab the first or second item in the queue to the location of the current item
            queue[counter] = queue[index];
            // Move the current item to the location that the first or second item was removed from
            queue[index] = temp;
        }
        // If ready to play music... Play
        var ready = fn.ready_state(bot);
        if (ready){
            fn.play(bot,
                msg, queue, ready);
        }
        bot.reply(msg, 'Added all songs to the queue');
    }

    // Playlist Command
    if (msg.content.startsWith('!playlist')){
        var args = msg.content.split(' ');
        console.log(msg.author.name + ' used playlist command on ' + args[1]);
        if (args[1]){
            var addedPlaylist = Playlist[args[1]]
            // Check to confirm playlist added, and add all songs to queue
            if (addedPlaylist.length > 0){
                for (song of addedPlaylist){
                    queue.push(song);
                }
                // Determine how many songs to shuffle.
                var counter = queue.length;

                while (counter >0) {
                    // Get a random number 0 or 1
                    var index = Math.floor(Math.random() * counter);
                    // Subtract 1 from the counter variable
                    counter--;
                    // Select the current item in the queue
                    var temp = queue[counter];
                    // Grab the first or second item in the queue to the location of the current item
                    queue[counter] = queue[index];
                    // Move the current item to the location that the first or second item was removed from
                    queue[index] = temp;
                }
                // If ready to play music... Play
                var ready = fn.ready_state(bot);
                if (ready){
                    fn.play(bot, msg, queue);
                }
            console.log(msg.author.name + ' used playlist command on ' + args[1]);
            bot.reply(msg, 'Added playlist ' + args[1]);
            } else {
                bot.reply(msg, 'Invalid Playlist');
            }
        } else {
            bot.reply(msg, 'Please supply !playlist command with name of playlist');
            // Avoid repeated bad call spam by deleting bad call message.
            bot.deleteMessage(msg);
        }
    }

    // Force quit music
    if (msg.content == '!end'){
        // Clear the queue
        queue = new Array();
        if(bot.voiceConnection){
            bot.leaveVoiceChannel(bot.voiceConnection.voiceChannel);
        }
        bot.setPlayingGame(null);
    }

    // Play Command
    if (msg.content.startsWith('!play') && !msg.content.startsWith('!playlist') && !msg.content.startsWith('!playAll') && msg.content != "!play All"){
        var args = msg.content.split(' ');
        // If queue is empty and there is no second argument given
        if (queue.length == 0 && args[1] == null){
            console.log('Queue Empty');
            bot.reply(msg, 'Queue is Empty');
        }
        // If an argument is given
        if (args[1]  != null){
            var song = msg.content;
            // Remove the call from the song name
            song = song.replace('!play ', '');
            // Make the song name file resolveable by adding '\ ' to all spacing
            song = song.replace(/ /g, '\ ');
            // Confirm song exists (.esistsSync is DEPRECIATED update to .statSync)
            if(fs.existsSync("music/" + song + ".m4a")){
                var ready = fn.ready_state(bot);
                // Currently playing and songs are in queue
                if (!ready && queue.length > 0){
                    queue.push(song);
                    bot.reply(msg, 'Added ' + song + ' to queue');
                    console.log('Added ' + song + ' to queue.');
                }
                // Currently playing and no songs in queue
                if (!ready && queue.length == 0){
                    queue.push(song);
                    bot.reply(msg, song + ' will play next.');
                    console.log('Playing Next ' + args[1]);
                }
                // Not playing and no songs in queue
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
        // Limit wipe to 25 messages
        if (args[1] <= 25){
            var count = args[1];
            // Add 1 to count to include the actual wipe command
            count ++
            // Get logs limited to the count variable
            bot.getChannelLogs(msg.channel, count, (err, msgs) => {if (err) {console.log(err);throw err;}
                for(message of msgs){
                    // perform delete on message
                    bot.deleteMessage(message, (err) => {if (err) {console.log (err);throw err;}});
                }
            });
            // Return if over the max number of wipe
        } else if (args[1] > 25){
            bot.deleteMessage(msg);
            bot.sendMessage(msg.sender, 'Limit 15 on wipe.');
            console.log(msg.author.name + " wiped " + args[1] + " messages.");
        }
    }

    // Change username only performable by user with id
    if (msg.content.startsWith('!usrName') && msg.author.id == 167693414156992512){
        var args = msg.content.split(' ');
        if (args[1]){
            // Remove command call from new username
            var username = msg.content.replace('!usrName', '').trim();
            // Change bot's username to the passed argument
            bot.setUsername(username, (err) => {if (err){console.log(err.text);}});
        }
        // Console log with name to confirm correct user used command.
        console.log(msg.sender.name + " changed bot's name.");
    }

    // Celsius to Fahrenheit
    if (msg.content.startsWith('!toF')){
        var args = msg.content.split(' ');
        // Confirm only one argment is passed
        if(args[1] && !args[2]){
            // Assign the first argument to the C variable for readability
            var C = args[1];
            // Perform calculation and limit the result to 0 decimal places/ Whole Number
            var F = (C * 1.8 + 32).toFixed(0);
            bot.reply(msg, F);
        }
        console.log(msg.sender.name + " used Cel to Far.");
    }

    // Fahrenheit to Celsius
    if (msg.content.startsWith('!toC')){
        var args = msg.content.split(' ');
        // Confirm only one argment is passed
        if(args[1] && !args[2]){
            // Assign the first argument to the F variable for readability
            var F = args[1];
            // Perform calculation and limit the result to 0 decimal places/ Whole Number
            var C = ((F -32) * (5/9)).toFixed(0);
            bot.reply(msg, C);
        }
        console.log(msg.sender.name + " used Far to Cel.");
    }

    // Time
    if (msg.content.startsWith('!time')){
        var args = msg.content.split(' ');
        // Variable to confirm all calculations suceeded
        var goodTime = true;
        // Get Date
        var date = new Date();
        // Get current UTC time not local time
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
                // Allow users to do custom GMT/UTC timezones with GMT+1 as an example
                if(args[1].startsWith('GMT') || args[1].startsWith('UTC')){
                    // If the command begins with GMT or UTC remove the command from the modifier
                    if(args[1].startsWith('GMT')){
                        modifier = args[1].replace('GMT', '');
                    }else if(args[1].startsWith('UTC')){
                        modifier = args[1].replace('UTC', '');
                    }
                    // Grab the + or - from properly formated command
                    switch(modifier.slice(0,1)){
                        case '+':
                            // Get all numbers from 0..infinity listed in the command
                            hour = hour +  parseInt(modifier.slice(1));
                            break;
                        case '-':
                            // Get all numbers from 0..infinity listed in the command
                            hour = hour - parseInt(modifier.slice(1));
                            break;
                        default:
                        console.log('Incorrect format for time command used  ' + modifier);
                    }
                } else
                // Check if UK was passed
                if (args[1].toLowerCase() == 'uk') {
                    hour = hour;
                }else {
                    // All other checks failed, its is not a timezone currently in code.
                    bot.reply(msg, 'Unknown Timezone.');
                    goodTime = false;
                    // Log passed timezone for a potential addition
                    console.log('Timezone not avaliable yet: ' + args[1]);
                }
        }
        // Make sure the hour is never a negative number
        if (hour < 0){
            hour = 12 + hour;
        }
        // Make sure when the modifier is passed that you do not exceed the 24 hour clock
        if (hour > 24){
            hour = hour - 24;
        }
        // Prepend a zero to any single digit  i.e  9 turns into 09
        if (hour < 10){
            hour = "0" + hour;
        }
        // Get current UTC minutes
        var minutes = date.getUTCMinutes();
        // Prepend a zero to any single digit  i.e  9 turns into 09
        if(minutes < 10){
            minutes = "0" + minutes;
        }
        // Confirm all tasks are complete by adding a slight delay.
        setTimeout(()=>{
            // If everything went smoothly print the time.
            if (goodTime){
                bot.reply(msg, hour + ":" + minutes);
            }
        }, 500);
    }
}
