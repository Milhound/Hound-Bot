const Admin = require('./admin.js')
const Fn = require('./functions.js')
const User = require('./user.js')
const Voice = require('./voice.js')
const Config = require('../data/config.json')
const Guild = require('./guild.js')

let apiKey
if (Config.yt.key) { apiKey = Config.yt.key } else { apiKey = process.env.GOOGLE_API_KEY }
const baseYtUrl = Config.yt.url

exports.cmds = (msg) => {
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
        !to_K <Cel> - Converts Celsius to Kelvin
        !time <TIMEZONE> - Returns current time in zone. Ex: !time CST
        !level <O: user> - Prints out your (or user) current level and experience
        !leaderboard - Shows the current rankings of the Server.
        !yt - Search for YouTube video
        !ud <word> - Urban dictonary defintition

        **VOICE:**
        !play <url> - Plays a song from YouTube.
        !skip - Skips current song.
        !pause - Pauses song
        !resume - Resumes song
        !volume+ - Increases volume by 25%
        !volume++ - Increases volume by 2x
        !volume- - Reduces volume by 25%
        !volume-- - Reduces volume by 2x
        !request <Search Query> - Add youtube video to queue
        !radio - plays dub radio
        !weeb - Plays weeabo radio
        !mix - Plays mix radio
        !setVolume - Sets preferred server volume`
      msg.channel.send(text)
    },
    'help': (msg) => {
      commands.commands(msg)
    },
    'time': (msg) => {
      Fn.getTime(msg).then(response => msg.reply(response)).catch(err => msg.reply(err))
    },
    'mute': (msg) => {
      Admin.mute(msg)
    },
    'unmute': (msg) => {
    },
    'ping': (msg) => {
      msg.channel.send('Pong!')
    },
    'coin': (msg) => {
      if (Math.floor(Math.random() * 2 + 1) === 1) {
        msg.channel.send('Heads')
      } else {
        msg.channel.send('Tails')
      }
    },
    'dice': (msg) => {
      var argsDice = msg.content.split(' ')
      if (argsDice[1] !== undefined) {
        msg.channel.send(Math.floor(Math.random() * parseInt(argsDice[1]) + 1))
      } else {
        msg.channel.sendFile('./data/img/dice' + Math.floor((Math.random() * 6) + 1) + '.png')
      }
    },
    'slap': (msg) => {
      if (msg.mentions.users.array().length >= 0) {
        for (var slapTarget of msg.mentions.users.array()) {
          msg.channel.send(slapTarget + ' You\'ve been SLAPPED!')
        }
        msg.delete
      }
    },
    'cat': (msg) => {
      Fn.apiRequest('http://random.cat/meow').then(response => msg.channel.send(response.file))
    },
    'insult': (msg) => {
      if (msg.mentions.users.array().length >= 0) {
        for (var insultTarget of msg.mentions.users.array()) {
          Fn.apiRequest('https://quandyfactory.com/insult/json')
          .then(response => msg.channel.send(insultTarget + ' ' + response.insult))
        }
      }
    },
    'to_f': (msg) => {
      var C = msg.content.split(' ')[1]
      var toF = (C * 1.8 + 32).toFixed(0)
      msg.reply(toF)
    },
    'to_c': (msg) => {
      var F = msg.content.split(' ')[1]
      var toC = ((F - 32) * (5 / 9)).toFixed(0)
      msg.reply(toC)
    },
    'to_k': (msg) => {
      var K = parseInt(msg.content.split(' ')[1]) + 273.15
      msg.reply(K)
    },
    'to_kg': (msg) => {
      var lbs = parseInt(msg.content.split(' ')[1])
      msg.reply(lbs * 0.4536)
    },
    'to_lbs': (msg) => {
      var kgs = parseInt(msg.content.split(' ')[1])
      msg.reply(kgs / 0.4536)
    },
    'to_in': (msg) => {
      var cm = parseFloat(msg.content.split(' ')[1])
      msg.reply((cm * 0.3937).toFixed(0))
    },
    'to_cm': (msg) => {
      var inch = parseFloat(msg.content.split(' ')[1])
      msg.reply((inch / 0.3937).toFixed(0))
    },
    'wipe': (msg) => {
      Admin.wipe(msg)
    },
    'boom': (msg) => {
      var x = Math.floor(Math.random() * 5 + 1)
      msg.channel.sendFile('./data/img/boom' + x + '.jpeg')
    },
    'chuck': (msg) => {
      Fn.apiRequest('https://api.chucknorris.io/jokes/random')
        .then(response => msg.channel.send(response.value))
    },
    'toast': (msg) => {
      msg.channel.send(`\`\`\`
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
      Voice.add(msg)
    },
    'queue': (msg) => {
      Voice.queue(msg)
    },
    'yt': (msg) => {
      const queryYt = msg.content.slice(3).trim().replace(' ', '%20')
      const urlYt = baseYtUrl + queryYt + '&key=' + apiKey
      Fn.apiRequest(urlYt)
      .then(info => msg.reply('https://www.youtube.com/watch?v=' + info.items[0].id.videoId))
    },
    'request': (msg) => {
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
    'exp': (msg) => {
      if (msg.guild.member(msg.author).hasPermission('ADMINISTRATOR')) {
        User.modifyExp(msg)
      }
    },
    'leaderboard': (msg) => {
      User.leaderboard(msg).then((response) => msg.channel.send(response)).catch((err) => msg.channel.send(err))
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
      Voice.streamFromURL(msg, 'http://shinsen-radio.org:8000/shinsen-radio.128.ogg')
    },
    'mix': (msg) => {
      Voice.streamFromURL(msg, 'http://14963.live.streamtheworld.com/KHMXFMAAC?streamtheworld_user=1&SRC=CBS&DIST=CBS&TGT=cbslocalplayer&demographic=false')
    },
    'test': (msg) => {
      if (msg.content.split(' ')[1]) var url = msg.content.split(' ')[1]
      if (url.indexOf('http') === -1) return
      Voice.streamFromURL(msg, url)
    },
    'setvolume': (msg) => {
      Voice.setServerVolume(msg)
    },
    'channel': (msg) => {
      Admin.channelInfo(msg)
    },
    'addguild': (msg) => {
      Guild.addServer(msg)
    },
    'welcome': (msg) => {
      Guild.setWelcome(msg)
    },
    'greet': (msg) => {
      Guild.toggleGreet(msg)
    },
    'ud': (msg) => {
      var wordToDefine = msg.content.slice(3).trim().replace(' ', '%20')
      const udURL = 'http://api.urbandictionary.com/v0/define?term=' + wordToDefine
      Fn.apiRequest(udURL)
        .then(response => msg.channel.send(Fn.formatUDString(response, wordToDefine, udURL)))
    }
  }

  if (commands.hasOwnProperty(msg.content.toLowerCase().slice(1).split(' ')[0])) {
    console.log(msg.author.username + ' - ' + msg.guild.name + ' used command: ' + msg.content.slice(0))
    commands[msg.content.toLowerCase().slice(1).split(' ')[0]](msg)
    if (!msg.content.startsWith('!wipe')) Fn.deleteCommand(msg)
  }
}
