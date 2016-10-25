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
        !ping - Replys Pong
        !coin - Flip a coin
        !dice (opt X) - Roll the dice (x)
        !chuck - Chuck Norris Joke
        !toast - Prints Toast
        !slap @user - Slaps all mentioned users
        !insult (@user - optional) - Insults the sender or @user.
        !cat - Random Cat
        !boom - Roast your fellow users
        !to_C <#> - Converts Fahrenheit to Celsius
        !to_F <#> - Converts Celsius to Fahrenheit
        !time <TIMEZONE> - Returns current time in zone. Ex: !time CST`
      // If on Milhound's Server add the following commands
      if (msg.guild.id === '167693566267752449') {
        text += `
        !gamer - add/remove Gamer role.
        !programmer - add/remove Programmer role.
        !dj or music - add/remove DJ role.
        
        IN BETA:
        !play <url> - Plays a song from YouTube.
        !pause - Pauses song
        !resume - Resumes song
        !volume - Tells you current volume
        !volume+ - Increases volume by 25%
        !volume- - Reduces volume by 25%
        !yt - Search for YouTube video
        !request <Search Query> - Add youtube video to queue` }
      msg.channel.sendMessage(text)
    },
    'time': (msg) => {
      var argsTime = message.split(' ')
      // Variable to confirm all calculations suceeded
      var goodTime = true
      var date = new Date()
      var hour = date.getUTCHours()

      switch (argsTime[1].toLowerCase()) {
        // United States
        case 'pdt':
        case 'pst':
        case 'california':
          hour = hour - 7
          break

        case 'mdt':
        case 'mst':
          hour = hour - 6
          break

        case 'cdt':
        case 'cst':
        case 'texas':
          hour = hour - 5
          break

        case 'edt':
        case 'est':
          hour = hour - 4
          break

        case 'hst':
        case 'hawaii':
          hour = hour - 10
          break

        // Rio de Janeiro
        case 'brt':
          hour = hour - 3
          break

        // Europe
        case 'bst':
        case 'west':
        case 'cet':
        case 'london':
          hour = hour + 1
          break

        case 'cest':
        case 'sweden':
        case 'eet':
        case 'germany':
        case 'austria':
          hour = hour + 2
          break

        case 'eest':
        case 'finland':
          hour = hour + 3
          break

        case 'ist':
        case 'india':
          hour = Math.floor(hour + 5.5)
          break

        case 'sgt':
        case 'singapore':
          hour = hour + 8
          break

        case 'jst':
        case 'japan':
        case 'tokyo':
          hour = hour + 9
          break

        case 'aedt':
        case 'australia':
          hour = hour + 11
          break

        case 'nzdt':
        case 'new-zealand':
          hour = hour + 13
          break

        default:
          // Allow users to do custom GMT/UTC timezones with GMT+1 as an example
          if (argsTime[1].toLowerCase() === 'gmt' || argsTime[1].toLowerCase() === 'utc') {
            if (argsTime[2] !== undefined) {
              var modifier = argsTime[2]
              console.log(modifier)
              // Grab the + or - from properly formated command
              if (modifier.slice(0, 1) === '-') {
                hour = hour - parseInt(modifier.slice(1))
              } else {
                hour = hour + parseInt(modifier)
              }
            }
          } else {
            // All other checks failed, its is not a timezone currently in code.
            msg.reply('Unknown Timezone.')
            goodTime = false
            // Log passed timezone for a potential addition
            console.log('Timezone not avaliable yet: ' + argsTime[1])
          }
      }
      if (hour < 0) {
        hour = 24 + hour
      }
      if (hour > 24) {
        hour = hour - 24
      }
      if (hour < 10) {
        hour = '0' + hour
      }
      var minutes = date.getUTCMinutes()
      if (minutes < 10) {
        minutes = '0' + minutes
      }
      // Confirm all tasks are complete by adding a slight delay.
      setTimeout(() => {
        if (goodTime) {
          msg.reply(hour + ':' + minutes)
        }
      }, 500)
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
      return new Promise((resolve, reject) => {
        const voiceChannel = msg.member.voiceChannel
        if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply('Unable to join voice channel')
        voiceChannel.join().then(connection => resolve(connection))
      })
    },
    'queue': (msg) => {
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
      if (!msg.guild.voiceConnection) return commands.join(msg).then(() => commands.play(msg))
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
        dispatcher = msg.guild.voiceConnection.playStream(yt(song.url, {filter: 'audioonly'}), { volume: 0.05 })
        let collector = msg.channel.createCollector(m => m)
        collector.on('message', m => {
          if (m.content.startsWith('!pause')) {
            msg.channel.sendMessage('Paused').then(() => { dispatcher.pause() })
          }
          if (m.content.startsWith('!resume')) {
            msg.channel.sendMessage('Paused').then(() => { dispatcher.resume() })
          }
          if (m.content === '!skip') {
            msg.channel.sendMessage('Skipping').then(() => { dispatcher.end() })
          }
          if (m.content === '!volume') {
            msg.channel.sendMessage(`Volume: ${dispatcher.volume * 100}%`)
          }
          if (m.content === '!volume+' && dispatcher.volume !== 0.1) {
            dispatcher.setVolume(dispatcher.volume + 0.01)
            msg.channel.sendMessage(`Volume set to ${Math.floor(dispatcher.volume * 1000)}%`)
          }
          if (m.content === '!volume-' && dispatcher.volume !== 0.01) {
            dispatcher.setVolume(dispatcher.volume - 0.01)
            msg.channel.sendMessage(`Volume set to ${Math.floor(dispatcher.volume * 1000)}%`)
          }
          if (m.content === '!end') {
            queue[msg.guild.id].songs = {}
            queue[msg.guild.id].playing = false
            dispatcher.end()
            msg.member.voiceChannel.leave()
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
      })(queue[msg.guild.id].songs[0])
    },
    'yt': (msg) => {
      const queryYt = msg.content.slice(4).trim().replace(' ', '%20')
      const urlYt = baseYtUrl + queryYt + '&key=' + apiKey
      fn.apiRequest(urlYt)
      .then(info => msg.reply('https://www.youtube.com/watch?v=' + info.items[0].id.videoId))
    },
    'request': (msg) => {
      if (msg.length <= 9) return msg.reply('Please specifiy a song.')
      const queryRequest = msg.content.slice(4).trim().replace(' ', '%20')
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
      fn.getLevel(msg)
      .then(response => { msg.channel.sendMessage(`Level: ${Math.floor(response / 1000)} Experience: ${response}`) })
      .catch((err) => msg.channel.sendMessage(err))
    },
    'addlevel': (msg) => {
      if (msg.guild.member(msg.author).hasPermission('ADMINISTRATOR')) {
        fn.addLevel(msg)
      }
    }
  }

  if (commands.hasOwnProperty(message.slice(1).split(' ')[0])) {
    commands[message.slice(1).split(' ')[0]](msg)
  }
}
