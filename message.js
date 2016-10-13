const fn = require('./functions.js')

exports.cmds = (msg) => {
    // Commands
  if (msg.content === '!commands') {
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
  if (msg.content === '!gamer' && msg.guild.id === '167693566267752449') {
    fn.toggleRole(msg, '235440340981514240')
  }

  // Programmer Command
  if (msg.content === '!programmer' && msg.guild.id === '167693566267752449') {
    fn.toggleRole(msg, '235562658877800448')
  }

  // Mute Command
  if (msg.content.startsWith('!mute') && msg.guild.member(msg.author).hasPermission('MUTE_MEMBERS')) {
    for (var muteMention of msg.mentions.users.array()) {
      msg.guild.member(muteMention).setMute(true)
      msg.reply(muteMention + ' has been globally muted!')
    }
  }

  // Mute Command
  if (msg.content.startsWith('!unmute') && msg.guild.member(msg.author).hasPermission('MUTE_MEMBERS')) {
    for (var unmuteMention of msg.mentions.users.array()) {
      msg.guild.member(unmuteMention).setMute(false)
      msg.reply(unmuteMention + ' has been unmuted!')
    }
  }

  // Ping Command
  if (msg.content === '!ping') {
    msg.channel.sendMessage('pong')
  }

  // Coin Flip
  if (msg.content === '!coin') {
    if (Math.floor(Math.random() * 2 + 1) === 1) {
      msg.channel.sendMessage('Heads')
    } else {
      msg.channel.sendMessage('Tails')
    }
  }

  // Dice
  if (msg.content.startsWith('!dice') || msg.content.startsWith('!roll')) {
    var argsDice = msg.content.split(' ')
    if (argsDice[1] !== undefined) {
      msg.channel.sendMessage(Math.floor(Math.random() * parseInt(argsDice[1]) + 1))
    } else {
      msg.channel.sendFile('./img/dice' + Math.floor((Math.random() * 6) + 1) + '.png')
    }
  }

  // Slap Command
  if (msg.content.startsWith('!slap') && msg.mentions.users.array().length >= 0) {
    for (var slapTarget of msg.mentions.users.array()) {
      msg.channel.sendMessage(slapTarget + ' You\'ve been SLAPPED!')
    }
    msg.delete
  }

  // Cat Command
  if (msg.content === '!cat') {
    fn.apiRequest('http://random.cat/meow').then(response => msg.channel.sendMessage(response.file))
  }

  // Insult Command
  if (msg.content.startsWith('!insult') && msg.mentions.users.array().length >= 0) {
    for (var insultTarget of msg.mentions.users.array()) {
      fn.apiRequest('https://quandyfactory.com/insult/json').then(response =>
        msg.channel.sendMessage(insultTarget + ' ' + response.insult))
    }
  }

  // Celsius to Fahrenheit
  if (msg.content.startsWith('!to_F')) {
    var argsF = msg.content.split(' ')
    if (argsF[1] && !argsF[2]) {
      var fromC = argsF[1]
      // Round to whole number
      var toF = (fromC * 1.8 + 32).toFixed(0)
      msg.reply(toF)
    }
  }

  // Fahrenheit to Celsius
  if (msg.content.startsWith('!to_C')) {
    var argsC = msg.content.split(' ')
    if (argsC[1] && !argsC[2]) {
      var fromF = argsC[1]
      // Round to whole number
      var toC = ((fromF - 32) * (5 / 9)).toFixed(0)
      msg.reply(toC)
    }
  }

  // Time
  if (msg.content.startsWith('!time')) {
    var argsTime = msg.content.split(' ')
    // Variable to confirm all calculations suceeded
    var goodTime = true
    var date = new Date()
    var hour = date.getUTCHours()

    switch (argsTime[1].toLowerCase()) {
      // United States
      case 'pdt':
      case 'california':
        hour = hour - 7
        break

      case 'mdt':
        hour = hour - 6
        break

      case 'cdt':
      case 'texas':
        hour = hour - 5
        break

      case 'edt':
        hour = hour - 4
        break

      // Europe
      case 'west':
      case 'cet':
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

      case 'uk':
      default:
        // Allow users to do custom GMT/UTC timezones with GMT+1 as an example
        if (argsTime[1].startsWith('GMT') || argsTime[1].startsWith('UTC')) {
          if (argsTime[1].startsWith('GMT')) {
            var modifier = argsTime[1].replace('GMT', '')
          } else if (argsTime[1].startsWith('UTC')) {
            modifier = argsTime[1].replace('UTC', '')
          }
          // Grab the + or - from properly formated command
          switch (modifier.slice(0, 1)) {
            case '+':
              hour = hour + parseInt(modifier.slice(1))
              break
            case '-':
              hour = hour - parseInt(modifier.slice(1))
              break
            default:
              console.log('Incorrect format for time command used  ' + modifier)
          }
        } else
        // Check if UK was passed
        if (argsTime[1].toLowerCase() !== 'uk') {
          // All other checks failed, its is not a timezone currently in code.
          msg.reply('Unknown Timezone.')
          goodTime = false
          // Log passed timezone for a potential addition
          console.log('Timezone not avaliable yet: ' + argsTime[1])
        }
    }
    if (hour < 0) {
      hour = 12 + hour
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
  if (msg.content === '!toast') {
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
  if (msg.content === '!boom') {
    var x = Math.floor(Math.random() * 5 + 1)
    msg.channel.sendFile('./img/boom' + x + '.jpeg')
  }

  // Wipe
  if (msg.content.startsWith('!wipe') && msg.guild.member(msg.author).hasPermission('MANAGE_MESSAGES')) {
    var argsWipe = msg.content.split(' ')
    if (argsWipe[1] !== undefined && argsWipe[1] <= 50) {
      var messages = msg.channel.fetchMessages({limit: (parseInt(argsWipe[1]) + 1)})
      messages.then(messages => { msg.channel.bulkDelete(messages) })
    } else if (argsWipe[1] > 50) {
      msg.reply('Attempted to wipe too many messages')
    }
  }

  // Chuck
  if (msg.content === '!chuck') {
    fn.apiRequest('https://api.chucknorris.io/jokes/random').then(response =>
      msg.channel.sendMessage(response.value))
  }
}
