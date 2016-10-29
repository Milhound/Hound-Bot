const fn = require('./functions.js')
const yt = require('ytdl-core')

const apiKey = process.env.GOOGLE_API_KEY
const baseYtUrl = 'https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&q='
let queue = {}

'use strict'

exports.cmds = (msg) => {
  fn.addExperience(msg)
  if (!msg.content.startsWith('!')) return
  var message = msg.content.toLowerCase()

  const commands = {
    'commands': (msg) => {
      var text = `List of Commands:
        **TEXT:**
        !ping - Replys Pong
        !coin - Flip a coin
        !dice <O: X> - Roll the dice (x)
        !chuck - Chuck Norris Joke
        !toast - Prints Toast
        !slap @user - Slaps all mentioned users
        !insult (@user - optional) - Insults the sender or @user.
        !cat - Random Cat
        !boom - Roast your fellow users
        !to_C <#> - Converts Fahrenheit to Celsius
        !to_F <#> - Converts Celsius to Fahrenheit
        !time <TIMEZONE> - Returns current time in zone. Ex: !time CST
        !level <O: user> - Prints out your (or user) current level and experience
        !leaderboard - Shows the current rankings of the Server.
        !yt - Search for YouTube video

        **VOICE:**
        !play <url> - Plays a song from YouTube.
        !skip - Skips current song.
        !pause - Pauses song
        !resume - Resumes song
        !volume - Tells you current volume
        !volume+ - Increases volume by 20%
        !volume- - Reduces volume by 20%
        !request <Search Query> - Add youtube video to queue`
      // If on Milhound's Server add the following commands
      if (msg.guild.id === '167693566267752449') {
        text += `
        !gamer - add/remove Gamer role.
        !programmer - add/remove Programmer role.
        !dj or music - add/remove DJ role.` }
      msg.channel.sendMessage(text)
    },
    'time': (msg) => {
      fn.getTime(msg)
    },
    'mute': (msg) => {
      if (msg.guild.member(msg.author).hasPermission('MUTE_MEMBERS')) {
        for (var muteMention of msg.mentions.users.array()) {
          msg.guild.member(muteMention).setMute(true)
          msg.reply(muteMention + ' has been globally muted!')
        }
      }
    },
    'unmute': (msg) => {
      if (msg.guild.member(msg.author).hasPermission('MUTE_MEMBERS')) {
        for (var unmuteMention of msg.mentions.users.array()) {
          msg.guild.member(unmuteMention).setMute(false)
          msg.reply(unmuteMention + ' has been unmuted!')
        }
      }
    },
    'programmer': (msg) => {
      if (msg.guild.id === '167693566267752449') {
        fn.toggleRole(msg, '235562658877800448')
      }
    },
    'dj': (msg) => {
      if (msg.guild.id === '167693566267752449') {
        fn.toggleRole(msg, '240125651007438849')
      }
    },
    'music': (msg) => {
      commands.dj(msg)
    },
    'gamer': (msg) => {
      if (msg.guild.id === '167693566267752449') {
        fn.toggleRole(msg, '235440340981514240')
      }
    },
    'ping': (msg) => {
      msg.channel.sendMessage('Pong!')
    },
    'coin': (msg) => {
      if (Math.floor(Math.random() * 2 + 1) === 1) {
        msg.channel.sendMessage('Heads')
      } else {
        msg.channel.sendMessage('Tails')
      }
    },
    'dice': (msg) => {
      var argsDice = message.split(' ')
      if (argsDice[1] !== undefined) {
        msg.channel.sendMessage(Math.floor(Math.random() * parseInt(argsDice[1]) + 1))
      } else {
        msg.channel.sendFile('./img/dice' + Math.floor((Math.random() * 6) + 1) + '.png')
      }
    },
    'slap': (msg) => {
      if (msg.mentions.users.array().length >= 0) {
        for (var slapTarget of msg.mentions.users.array()) {
          msg.channel.sendMessage(slapTarget + ' You\'ve been SLAPPED!')
        }
        msg.delete
      }
    },
    'cat': (msg) => {
      fn.apiRequest('http://random.cat/meow').then(response => msg.channel.sendMessage(response.file))
    },
    'insult': (msg) => {
      if (msg.mentions.users.array().length >= 0) {
        for (var insultTarget of msg.mentions.users.array()) {
          fn.apiRequest('https://quandyfactory.com/insult/json').then(response =>
            msg.channel.sendMessage(insultTarget + ' ' + response.insult))
        }
      }
    },
    'to_f': (msg) => {
      var argsF = message.split(' ')
      if (argsF[1] && !argsF[2]) {
        var fromC = argsF[1]
        // Round to whole number
        var toF = (fromC * 1.8 + 32).toFixed(0)
        msg.reply(toF)
      }
    },
    'to_c': (msg) => {
      var argsC = message.split(' ')
      if (argsC[1] && !argsC[2]) {
        var fromF = argsC[1]
        // Round to whole number
        var toC = ((fromF - 32) * (5 / 9)).toFixed(0)
        msg.reply(toC)
      }
    },
    'wipe': (msg) => {
      if (msg.guild.member(msg.author).hasPermission('MANAGE_MESSAGES')) {
        var argsWipe = message.split(' ')
        if (argsWipe[1] !== undefined && argsWipe[1] <= 50) {
          var messages = msg.channel.fetchMessages({limit: (parseInt(argsWipe[1]) + 1)})
          messages.then(messages => { msg.channel.bulkDelete(messages) })
        } else if (argsWipe[1] > 50) {
          msg.reply('Attempted to wipe too many messages')
        }
      }
    },
    'boom': (msg) => {
      var x = Math.floor(Math.random() * 5 + 1)
      msg.channel.sendFile('./img/boom' + x + '.jpeg')
    },
    'chuck': (msg) => {
      fn.apiRequest('https://api.chucknorris.io/jokes/random').then(response =>
      msg.channel.sendMessage(response.value))
    },
    'toast': (msg) => {
      msg.channel.sendMessage(`\`\`\`
        Toast!
              ______
         ____((     )_
        |\'->==))   (= \\
        |  \\ ||_____|_ \\
        |[> \\___________\\
        | | |            |                                    |
         \\  |            |             .--.                   |
          \\ |            |)---.   .---\'    \`-.         .----(]|
           \\|____________|     \`-'            \`.     .\'       |
                                                \`---\'         |
        \`\`\`
        `)
      msg.delete
    },
    'add': (msg) => {
      if (msg.guild.id === '167693566267752449' && msg.channel.id !== '240125330390646786') return msg.reply('All music commands must be done in #music.')
      let url = msg.content.split(' ')[1]
      yt.getInfo(url, (err, info) => {
        if (err) return msg.channel.sendMessage('Invalid URL:' + err)
        if (!queue.hasOwnProperty(msg.guild.id)) {
          queue[msg.guild.id] = {}
          queue[msg.guild.id].playing = false
          queue[msg.guild.id].songs = []
        }
        queue[msg.guild.id].songs.push({url: url, title: info.title, requester: msg.author.username})
        msg.channel.sendMessage(`Added **${info.title}** to queue.`)
        if (queue[msg.guild.id].playing === false) commands.play(msg, true)
      })
    },
    'join': (msg) => {
      fn.join(msg)
    },
    'queue': (msg) => {
      if (msg.guild.id === '167693566267752449' && msg.channel.id !== '240125330390646786') return msg.reply('All music commands must be done in #music.')
      if (queue[msg.guild.id] === undefined) { return msg.reply('Queue is empty') }
      var currentQueue = []
      queue[msg.guild.id].songs.forEach((song, i) => { currentQueue.push(`${i + 1}. ${song.title} - Requested by: ${song.requester}`) })
      msg.channel.sendMessage(`
      **${msg.guild.name} Queue:**
      *${currentQueue.length} songs in queue*

      ${currentQueue.slice(0, 10).join('\n      ')}
      ${(currentQueue.length > 10) ? '*[Only next 10 shown]*' : ''}
      `)
    },
    'play': (msg, alreadyAdded) => {
      if (msg.guild.id === '167693566267752449' && msg.channel.id !== '240125330390646786') return msg.reply('All music commands must be done in #music.')
      if (!msg.guild.voiceConnection) return fn.join(msg).then(() => commands.play(msg))
      if (!msg.guild.voiceConnection) {
        var voiceChannel = msg.member.voiceChannel
        voiceChannel.join()
      }
      if (message.indexOf('http') !== -1 && alreadyAdded !== true) return commands.add(msg)
      if (queue[msg.guild.id] === undefined) return msg.channel.sendMessage('No songs in queue add with !add')
      if (queue[msg.guild.id].playing) return msg.channel.sendMessage('Already Playing')

      let dispatcher

      queue[msg.guild.id].playing = true;

      (function play (song) {
        if (song === undefined) {
          return msg.channel.sendMessage('Queue is empty').then(() => {
            queue[msg.guild.id].playing = false
            msg.member.voiceChannel.leave()
          })
        }
        msg.channel.sendMessage(`Playing: **${song.title}** as requested by: ${song.requester}`)
        dispatcher = msg.guild.voiceConnection.playStream(yt(song.url,
          {filter: 'audioonly'}).on('error', (err) => {
            if (err.code === 'ECONNRESET') return
          }), { volume: 0.08, passes: 2 })
        let collector = msg.channel.createCollector(m => m)
        collector.on('message', m => {
          if (m.content.startsWith('!pause')) {
            msg.channel.sendMessage('Paused').then(() => { dispatcher.pause() })
          }
          if (m.content.startsWith('!resume')) {
            msg.channel.sendMessage('Resuming...').then(() => { dispatcher.resume() })
          }
          if (m.content === '!skip') {
            msg.channel.sendMessage('Skipping').then(() => { dispatcher.end() })
          }
          if (m.content === '!volume') {
            msg.channel.sendMessage(`Volume: ${dispatcher.volume * 100}%`)
          }
          if (m.content === '!volume+') {
            dispatcher.setVolume(dispatcher.volume * 2)
            msg.channel.sendMessage(`Volume set to ${Math.floor(dispatcher.volume * 1000)}%`)
          }
          if (m.content === '!volume-' && dispatcher.volume !== 0.02) {
            dispatcher.setVolume(dispatcher.volume / 2)
            msg.channel.sendMessage(`Volume set to ${Math.floor(dispatcher.volume * 1000)}%`)
          }
          if (m.content === '!end') {
            queue[msg.guild.id].songs = {}
            queue[msg.guild.id].playing = false
            dispatcher.end()
          }
        })
        dispatcher.on('end', () => {
          collector.stop()
          queue[msg.guild.id].songs.shift()
          play(queue[msg.guild.id].songs[0])
        })
        dispatcher.on('error', (err) => {
          return msg.channel.sendMessage('Error: ' + err).then(() => {
            collector.stop()
            queue[msg.guild.id].songs.shift()
            play(queue[msg.guild.id].songs[0])
          })
        })
        dispatcher.on('debug', (info) => {
          console.log(info)
        })
      })(queue[msg.guild.id].songs[0])
    },
    'yt': (msg) => {
      const queryYt = msg.content.slice(3).trim().replace(' ', '%20')
      const urlYt = baseYtUrl + queryYt + '&key=' + apiKey
      fn.apiRequest(urlYt)
      .then(info => msg.reply('https://www.youtube.com/watch?v=' + info.items[0].id.videoId))
    },
    'request': (msg) => {
      if (msg.guild.id === '167693566267752449' && msg.channel.id !== '240125330390646786') return msg.reply('All music commands must be done in #music.')
      if (msg.length <= 9) return msg.reply('Please specifiy a song.')
      const queryRequest = msg.content.slice(8).trim().replace(' ', '%20')
      const urlRequest = baseYtUrl + queryRequest + '&key=' + apiKey
      fn.apiRequest(urlRequest)
      .then(info => {
        var songUrl = 'https://www.youtube.com/watch?v=' + info.items[0].id.videoId
        var songTitle = info.items[0].snippet.title
        if (!queue.hasOwnProperty(msg.guild.id)) {
          queue[msg.guild.id] = {}
          queue[msg.guild.id].playing = false
          queue[msg.guild.id].songs = []
        }
        queue[msg.guild.id].songs.push({url: songUrl, title: songTitle, requester: msg.author.username})
        msg.reply(`Added **${songTitle}** to queue`)
        if (queue[msg.guild.id].playing === false) commands.play(msg)
      })
    },
    'level': (msg) => {
      if (!msg.mentions.users.first()) {
        fn.getLevel(msg.guild, msg.author)
          .then(response => { msg.channel.sendMessage(`Level: ${response.level} (${response.remaining}/${response.nextLevel})`) })
          .catch((err) => msg.channel.sendMessage(err))
      } else {
        for (var usrRequestedLevel of msg.mentions.users.array()) {
          fn.getLevel(msg.guild, usrRequestedLevel)
            .then(response => { msg.channel.sendMessage(`${response.user.username} is Level: ${response.level} (${response.remaining}/${response.nextLevel})`) })
            .catch((err) => msg.channel.sendMessage(err))
        }
      }
    },
    'addlevel': (msg) => {
      if (msg.guild.member(msg.author).hasPermission('ADMINISTRATOR')) {
        fn.addLevel(msg)
      }
    },
    'leaderboard': (msg) => {
      fn.leaderboard(msg).then((response) => msg.channel.sendMessage(response)).catch((err) => msg.channel.sendMessage(err))
    },
    'kick': (msg) => {
      if (msg.guild.member(msg.author).hasPermission('KICK_MEMBERS')) {
        for (var kickUser of msg.mentions.users.array()) {
          msg.guild.member(kickUser.id).kick()
        }
      }
    },
    'ban': (msg) => {
      if (msg.guild.member(msg.author).hasPermission('BAN_MEMBERS')) {
        for (var kickUser of msg.mentions.users.array()) {
          msg.guild.member(kickUser.id).ban()
        }
      }
    },
    'radio': (msg) => {
      fn.streamFromURL(msg, 'http://stream1.ml1.t4e.dj/dublovers_high.mp3')
    },
    'dubstep': (msg) => {
      fn.streamFromURL(msg, 'https://t1-1.p-cdn.com/access/?version=5&lid=1560647969&token=%2FIjhCB%2F0HipzbCXLY9073u3nH0M4BEPhEjTtIXTt8AE7hgYweFV7tjHzjiUJbMisqOcvkRQLGc0Yn2GMWQdR9NSGmzdn8%2BDgL9BxclvvTRb696gwcT3xnYS4vu8e%2FFXLUNa%2BTYBeeAe%2BtE24aLqcpbu2Oa8fP2dFoeJELT6LdoZmZGy4H%2BZ6zWKjuGYuwaKKQ1wNhlkGQF1Hz1qgmCL1Uvlo2QGukoiF8Mj0T9a6C08mOmHuXjEHkiPBSkm1OOreOjMuxnw88XLvnSPn0ABgWMz4jpc8PAr%2F9ANoYTxjQwLrgEQ9ffvm1wK67v4IMbz7myNBDIEreYA%3D&lo=33')
    },
    'test': (msg) => {
      fn.streamFromURL(msg, 'http://mux.mtl.djfmradio.com/djfm')
    }
  }

  if (commands.hasOwnProperty(message.slice(1).split(' ')[0])) {
    commands[message.slice(1).split(' ')[0]](msg)
  }
}
