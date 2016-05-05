var queue = new Array();
exports.queue = queue;
// Confirm bot is ready to play Music.
function ready_state(bot) {
    if(bot.voiceConnection && bot.voiceConnection.playing){
        return false;
    }else{
        return true;
    }
}

// Export the function ready_state
exports.ready_state = (bot) => {
    if(bot.voiceConnection && bot.voiceConnection.playing){
        return false;
    }else{
        return true;
    }
}
// Pull next song off queue.
function getNextSong(bot) {
  if(queue.length > 0){
    // Remove next item off queue, and store in currentSong.
      currentSong = queue.shift();
      return currentSong;
    }else{
    // When finished playing all songs.
    bot.leaveVoiceChannel(bot.voiceChannel, (err) => {if (err){console.log(err);throw err;}});
    bot.setPlayingGame(null);
    return null;
  }
}

// Standard Play function
function playSong (bot, conn, song) {
  // Conirm Ready to play, then play song.
    var ready = ready_state(bot);
    if(ready){
      // Grab a good song name.
        var niceSongName = song.replace(/_/g, ' ');
        conn.playFile('./music/' + song + '.m4a', (error, intent) => {if(error){console.log(error);throw error;}
        console.log('Playing ' + niceSongName);
          // Set playing to current song.
          bot.setPlayingGame(niceSongName, (error) => {if (error){console.log(error);throw error;}});
          // When song ends get next song, and start playing.
          intent.on('end', () => {
              var song = getNextSong(bot);

              if (song != null){playSong(bot, conn, song);}
          }); // End of intent "on"
        }); // End of playFile
    } // End of Ready
    else {
        console.log('Bot is not Ready!');
    }
}

// Special start playing function.
exports.play = (bot, msg, que) => {
  // Set functions.js global queue to passed queue
  queue = que;
  if (queue.length > 0) {
      var song = getNextSong(bot);
      var channel = msg.sender.voiceChannel;
      bot.joinVoiceChannel(channel, (err, conn) => {if (err){console.log(err);throw err;}
          console.log('Bot Joined Voice Channel');
          playSong(bot, conn, song);
      });
  }
}

// Confirm user has role of Admin or Moderator.
exports.hasRole = (bot, msg, server) => {
    var admin = bot.memberHasRole(msg.sender, server.roles.get('name', 'Admin'));
    var moderator = bot.memberHasRole(msg.sender, server.roles.get('name', 'Moderator'));
    // Admin? Moderator?
    if(admin || moderator){
        return true;
      } else {
        return false;
    }
}

// Welcome new member to the Server
exports.notification = (bot, server, user) => {
    console.log('User ' + user.name +' has joined the Server');
    bot.sendMessage(server.channels.get('name', 'general'), user.name + ' has joined us!');
}
