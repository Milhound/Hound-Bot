const Admin = require('./admin.js')
const Cmds = require('./functions.js')
const User = require('./user.js')
const Voice = require('./voice.js')
const Config = require('../data/config.json')

let apiKey
if (Config.yt.key) { apiKey = Config.yt.key } else { apiKey = process.env.GOOGLE_API_KEY }
const baseYtUrl = Config.yt.url

exports.cmds = (msg) => {
  User.addExperience(msg)

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
        !volume+ - Increases volume by 2x
        !volume- - Reduces volume by 2x
        !request <Search Query> - Add youtube video to queue
        !radio - plays dub radio
        !weeb - Plays weeabo radio`
      // If on Milhound's Server add the following commands
      if (msg.guild.id === Config.guilds.milhound.id) {
        text += `
        !gamer - add/remove Gamer role.
        !programmer - add/remove Programmer role.
        !dj or music - add/remove DJ role.` }
      msg.channel.sendMessage(text)
    },
    'time': (msg) => {
      Cmds.getTime(msg).then(response => msg.reply(response)).catch(err => msg.reply(err))
    },
    'mute': (msg) => {
      Admin.mute(msg)
    },
    'unmute': (msg) => {
      Admin.unmute(msg)
    },
    'programmer': (msg) => {
      if (msg.guild.id === Config.guilds.milhound.id) {
        User.toggleRole(msg, Config.guilds.milhound.roles.programmer)
      }
    },
    'dj': (msg) => {
      if (msg.guild.id === Config.guilds.milhound.id) {
        User.toggleRole(msg, Config.guilds.roles.music)
      }
    },
    'music': (msg) => {
      commands.dj(msg)
    },
    'gamer': (msg) => {
      if (msg.guild.id === Config.guilds.milhound.id) {
        User.toggleRole(msg, Config.guilds.milhound.roles.gamer)
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
      var argsDice = msg.content.split(' ')
      if (argsDice[1] !== undefined) {
        msg.channel.sendMessage(Math.floor(Math.random() * parseInt(argsDice[1]) + 1))
      } else {
        msg.channel.sendFile('./data/img/dice' + Math.floor((Math.random() * 6) + 1) + '.png')
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
      Cmds.apiRequest('http://random.cat/meow').then(response => msg.channel.sendMessage(response.file))
    },
    'insult': (msg) => {
      if (msg.mentions.users.array().length >= 0) {
        for (var insultTarget of msg.mentions.users.array()) {
          Cmds.apiRequest('https://quandyfactory.com/insult/json')
          .then(response => msg.channel.sendMessage(insultTarget + ' ' + response.insult))
        }
      }
    },
    'to_f': (msg) => {
      var argsF = msg.split(' ')
      if (argsF[1] && !argsF[2]) {
        var fromC = argsF[1]
        // Round to whole number
        var toF = (fromC * 1.8 + 32).toFixed(0)
        msg.reply(toF)
      }
    },
    'to_c': (msg) => {
      var argsC = msg.content.split(' ')
      if (argsC[1] && !argsC[2]) {
        var fromF = argsC[1]
        // Round to whole number
        var toC = ((fromF - 32) * (5 / 9)).toFixed(0)
        msg.reply(toC)
      }
    },
    'wipe': (msg) => {
      Admin.wipe(msg)
    },
    'boom': (msg) => {
      var x = Math.floor(Math.random() * 5 + 1)
      msg.channel.sendFile('./data/img/boom' + x + '.jpeg')
    },
    'chuck': (msg) => {
      Cmds.apiRequest('https://api.chucknorris.io/jokes/random')
        .then(response => msg.channel.sendMessage(response.value))
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
      if (msg.guild.id === Config.guilds.milhound.id && msg.channel.id !== Config.guilds.milhound.channels.music) return msg.reply('All music commands must be done in #music.')
      Voice.add(msg)
    },
    'join': (msg) => {
      Voice.join(msg)
    },
    'queue': (msg) => {
      if (msg.guild.id === Config.guild.milhound.id && msg.channel.id !== Config.guild.milhound.roles.music) return msg.reply('All music commands must be done in #music.')
      Voice.queue(msg)
    },
    'play': (msg, alreadyAdded) => {
      if (msg.guild.id === Config.guilds.milhound.id && msg.channel.id !== Config.guilds.milhound.channels.music) return msg.reply('All music commands must be done in #music.')
      Voice.play(msg, alreadyAdded)
    },
    'yt': (msg) => {
      const queryYt = msg.content.slice(3).trim().replace(' ', '%20')
      const urlYt = baseYtUrl + queryYt + '&key=' + apiKey
      Cmds.apiRequest(urlYt)
      .then(info => msg.reply('https://www.youtube.com/watch?v=' + info.items[0].id.videoId))
    },
    'request': (msg) => {
      if (msg.guild.id === Config.guilds.milhound.id && msg.channel.id !== Config.guilds.milhound.channels.music) return msg.reply('All music commands must be done in #music.')
      if (msg.length <= 9) return msg.reply('Please specifiy a song.')
      Voice.request(msg)
    },
    'level': (msg) => {
      User.level(msg)
    },
    'addlevel': (msg) => {
      if (msg.guild.member(msg.author).hasPermission('ADMINISTRATOR')) {
        User.addLevel(msg)
      }
    },
    'leaderboard': (msg) => {
      User.leaderboard(msg).then((response) => msg.channel.sendMessage(response)).catch((err) => msg.channel.sendMessage(err))
    },
    'kick': (msg) => {
      Admin.kick(msg)
    },
    'ban': (msg) => {
      Admin.ban(msg)
    },
    'radio': (msg) => {
      Voice.streamFromURL(msg, 'http://stream1.ml1.t4e.dj/dublovers_high.mp3')
    },
    'weeb': (msg) => {
      Voice.streamFromURL(msg, 'http://shinsen-radio.org:8000/shinsen-radio.128.mp3')
    },
    'mix': (msg) => {
      Voice.streamFromURL(msg, 'http://14963.live.streamtheworld.com/KHMXFMAAC?streamtheworld_user=1&SRC=CBS&DIST=CBS&TGT=cbslocalplayer&demographic=false')
    },
    'test': (msg) => {
      if (msg.content.split(' ')[1]) var url = msg.content.split(' ')[1]
      if (url.indexOf('http') === -1) return
      Voice.streamFromURL(msg, url)
    }
  }

  if (commands.hasOwnProperty(msg.content.slice(1).split(' ')[0])) {
    commands[msg.content.slice(1).split(' ')[0]](msg)
  }
}
