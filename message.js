const fn = require('./functions.js')
const yt = require('ytdl-core')

'use strict'

exports.cmds = (msg) => {
  var message = msg.content.toLowerCase()
    // Commands
  if (message === '!commands') {
    var text = `List of Commands: \n
            !ping - Replys Pong \n
            !coin - Flip a coin\n
            !dice (opt X) - Roll the dice (x)\n
            !chuck - Chuck Norris Joke\n
            !toast - Prints Toast\n
            !slap @user - Slaps all mentioned users\n
            !insult (@user - optional) - Insults the sender or @user.\n
            !cat - Random Cat\n
            !boom - Roast your fellow users\n
            !to_C <#> - Converts Fahrenheit to Celsius\n
            !to_F <#> - Converts Celsius to Fahrenheit\n
            !time <TIMEZONE> - Returns current time in zone. Ex: !time CST`
    // If on Milhound's Server add the following commands
    if (msg.guild.id === '167693566267752449') {
      text += `\n 
            !gamer to add/remove Gamer role.\n
            !programmer to add/remove Programmer role.` }
    msg.channel.sendMessage(text)
  }

  // Gamer Command
  if (message === '!gamer' && msg.guild.id === '167693566267752449') {
    fn.toggleRole(msg, '235440340981514240')
  }

  // Programmer Command
  if (message === '!programmer' && msg.guild.id === '167693566267752449') {
    fn.toggleRole(msg, '235562658877800448')
  }

  // Mute Command
  if (message.startsWith('!mute') && msg.guild.member(msg.author).hasPermission('MUTE_MEMBERS')) {
    for (var muteMention of msg.mentions.users.array()) {
      msg.guild.member(muteMention).setMute(true)
      msg.reply(muteMention + ' has been globally muted!')
    }
  }

  // Mute Command
  if (message.startsWith('!unmute') && msg.guild.member(msg.author).hasPermission('MUTE_MEMBERS')) {
    for (var unmuteMention of msg.mentions.users.array()) {
      msg.guild.member(unmuteMention).setMute(false)
      msg.reply(unmuteMention + ' has been unmuted!')
    }
  }

  // Ping Command
  if (message === '!ping') {
    msg.channel.sendMessage('pong')
  }

  // Coin Flip
  if (message === '!coin') {
    if (Math.floor(Math.random() * 2 + 1) === 1) {
      msg.channel.sendMessage('Heads')
    } else {
      msg.channel.sendMessage('Tails')
    }
  }

  // Dice
  if (message.startsWith('!dice') || message.startsWith('!roll')) {
    var argsDice = message.split(' ')
    if (argsDice[1] !== undefined) {
      msg.channel.sendMessage(Math.floor(Math.random() * parseInt(argsDice[1]) + 1))
    } else {
      msg.channel.sendFile('./img/dice' + Math.floor((Math.random() * 6) + 1) + '.png')
    }
  }

  // Slap Command
  if (message.startsWith('!slap') && msg.mentions.users.array().length >= 0) {
    for (var slapTarget of msg.mentions.users.array()) {
      msg.channel.sendMessage(slapTarget + ' You\'ve been SLAPPED!')
    }
    msg.delete
  }

  // Cat Command
  if (message === '!cat') {
    fn.apiRequest('http://random.cat/meow').then(response => msg.channel.sendMessage(response.file))
  }

  // Insult Command
  if (message.startsWith('!insult') && msg.mentions.users.array().length >= 0) {
    for (var insultTarget of msg.mentions.users.array()) {
      fn.apiRequest('https://quandyfactory.com/insult/json').then(response =>
        msg.channel.sendMessage(insultTarget + ' ' + response.insult))
    }
  }

  // Celsius to Fahrenheit
  if (message.startsWith('!to_F')) {
    var argsF = message.split(' ')
    if (argsF[1] && !argsF[2]) {
      var fromC = argsF[1]
      // Round to whole number
      var toF = (fromC * 1.8 + 32).toFixed(0)
      msg.reply(toF)
    }
  }

  // Fahrenheit to Celsius
  if (message.startsWith('!to_C')) {
    var argsC = message.split(' ')
    if (argsC[1] && !argsC[2]) {
      var fromF = argsC[1]
      // Round to whole number
      var toC = ((fromF - 32) * (5 / 9)).toFixed(0)
      msg.reply(toC)
    }
  }

  // Time
  if (message.startsWith('!time')) {
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
  }

  // Toast
  if (message === '!toast') {
    msg.channel.sendMessage(`\`\`\`\n
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
  }

  // Boom
  if (message === '!boom') {
    var x = Math.floor(Math.random() * 5 + 1)
    msg.channel.sendFile('./img/boom' + x + '.jpeg')
  }

  // Wipe
  if (message.startsWith('!wipe') && msg.guild.member(msg.author).hasPermission('MANAGE_MESSAGES')) {
    var argsWipe = message.split(' ')
    if (argsWipe[1] !== undefined && argsWipe[1] <= 50) {
      var messages = msg.channel.fetchMessages({limit: (parseInt(argsWipe[1]) + 1)})
      messages.then(messages => { msg.channel.bulkDelete(messages) })
    } else if (argsWipe[1] > 50) {
      msg.reply('Attempted to wipe too many messages')
    }
  }

  // Chuck
  if (message === '!chuck') {
    fn.apiRequest('https://api.chucknorris.io/jokes/random').then(response =>
      msg.channel.sendMessage(response.value))
  }

  // Play 
  if (message.startsWith('!play') || message === '!join') {
    // var argsSong = msg.content.split(' ')
    const voiceChannel = msg.member.voiceChannel
    if (!voiceChannel) {
      return msg.reply('Unable to join. Are you in a voice channel?')
    }
    voiceChannel.join()
      .then(connection => {
        
        var stream = yt('https://www.youtube.com/watch?v=4KJpXriYC9A', {audioonly:true})
        const dispatcher = connection.playStream(stream)
        dispatcher.on('end', () => {
          voiceChannel.leave()
        })
        
        // const dispatcher = connection.playFile('dumb.mp3')
    }).catch(console.log);
  }

  // Volume
  if (message === '!volume') {
    if (typeof dispatcher !== 'undefined'){
      var argsVolume = msg.content.split(' ')
      if (argsVolume[1] === undefined && typeof disp){
        dispatcher.volume()
      } else 
      if (argsVolume[1] < 10 && argsVolume[1] > 0){
        dispatcher.setVolume(parseInt(argsVolume[1]))
        message.reply('Volume set to ' + argsVolume[1])
      } else {
        message.reply('Incorrect volume setting.')
      }
    } else {
      msg.reply('Unable to locate Voice Channel.')
    }
  }

  // Leave - Voice
  if (message === '!end') {
    if (typeof voiceChannel !== 'undefined'){
      msg.reply('Stopped playing.')
      voiceChannel.leave()
    } else {
      msg.reply('Not currrently playing.')
    }
  }
}
