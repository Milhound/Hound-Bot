const superagent = require('superagent')
const req = require('request')
const usr = require('./user.json')
const fs = require('fs')

const expDelayTime = 30000
var expLocked = new Map()

'use strict'

function streamFromURL (msg, url) {
  join(msg).then(connection => {
    let dispatcher = connection.playStream(req(url), {volume: 0.08})
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
        dispatcher.end()
      }
    })
    dispatcher.on('end', () => {
      collector.stop()
      msg.member.voiceChannel.leave()
    })
  })
}

function join (msg) {
  return new Promise((resolve, reject) => {
    const voiceChannel = msg.member.voiceChannel
    if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply('Unable to join voice channel')
    voiceChannel.join().then(connection => resolve(connection))
  })
}

function initiateSave () {
  setInterval(() => {
    fs.writeFile('./user.json', JSON.stringify(usr), (err) => {
      if (err) console.log(err)
      console.log('Saved User.json')
    })
  }, 300000)
}

function toggleRole (msg, role) {
  if (msg.member.roles.has(role)) {
    msg.reply('Removed role ' + msg.guild.roles.get(role).name + '. Use !' + msg.guild.roles.get(role).name.toLowerCase() + ' to undo.')
    msg.guild.member(msg.author).removeRole(role)
  } else {
    msg.reply('You have been granted role - ' + msg.guild.roles.get(role).name + '.')
    msg.guild.member(msg.author).addRole(role)
  }
}

function apiRequest (url, callback) {
  return new Promise((resolve, reject) => {
    superagent.get(url)
    .end((err, res) => {
      if (err) return reject(err)
      return resolve(res.body)
    })
  })
}

function getTime (msg) {
  var argsTime = msg.content.split(' ')
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
    case 'wales':
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

function addExperience (msg) {
  if (msg.author.id === '169874052675010560') return
  if (!expLocked.hasOwnProperty(msg.author.id)) expLocked[msg.author.id] = false
  if (expLocked[msg.author.id] === false) {
    if (!usr.hasOwnProperty(msg.guild.id) || !usr[msg.guild.id].users.hasOwnProperty(msg.author.id)) return addUser(msg)
    const exp = Math.floor(Math.random() * 10 + 11)
    usr[msg.guild.id].users[msg.author.id].experience += exp
    expLocked[msg.author.id] = true
    setTimeout(() => {
      expLocked[msg.author.id] = false
    }, expDelayTime)
    if (msg.guild.id === '167693566267752449') {
      applyPerks(msg, usr[msg.guild.id].users[msg.author.id].experience)
        .then(response => { if (response) msg.channel.sendMessage(response) })
        .catch(console.log)
    }
    console.log(`Added ${exp} to ${msg.author.username}!`)
  }
}

function getLevel (guild, user) {
  return new Promise((resolve, reject) => {
    if (!usr[guild.id].users.hasOwnProperty(user.id)) {
      reject('No Experince Recorded')
    }
    if (usr[guild.id].users[user.id].experience >= 0) {
      var exp = usr[guild.id].users[user.id].experience
      const usrLevel = getLevelFromExp(exp)
      resolve({user: user, level: usrLevel.level, remaining: usrLevel.exp, nextLevel: getExpFromLevel(usrLevel.level + 1)})
    }
    reject('Unable to locate User')
  })
}

function addLevel (msg) {
  for (var expTarget of msg.mentions.users.array()) {
    const usrData = getLevelFromExp(usr[msg.guild.id].users[expTarget.id].experience)
    const usrNextLevelExp = getExpFromLevel(usrData.level)
    const usrRemainingExp = usrData.exp
    const expToAdd = usrNextLevelExp - usrRemainingExp
    usr[msg.guild.id].users[expTarget.id].experience += expToAdd
    msg.channel.sendMessage(`Added ${expToAdd} exp to ${expTarget}`)
  }
}

function leaderboard (msg) {
  return new Promise((resolve, reject) => {
    // Preliminary Tests
    if (!usr.hasOwnProperty(msg.guild.id)) reject('This server has not been recorded yet.')
    if (!usr[msg.guild.id].users) reject('No user data has been recorded yet.')

    const users = usr[msg.guild.id].users

    // Collect Users
    var userArray = []
    for (var key in users) {
      var user = users[key]
      userArray.push({
        id: key,
        username: user.username,
        exp: user.experience
      })
    }

    // Sort Users
    const sortedUsers = userArray.sort((a, b) => { return Math.sign(b.exp - a.exp) }).slice(0, 10)

    // Generate Report
    var rank = 1
    var responseText = `**Leaderboard of ${msg.guild.name}**`
    console.log(sortedUsers)
    for (var rankedUser of sortedUsers) {
      responseText += `\n${rank}. ${rankedUser.username} - Total Exp: ${rankedUser.exp}`
      rank += 1
    }
    if (userArray.length > 10) responseText += `\n\n*Only first 10 shown*`

    // Tests
    if (responseText.indexOf('1.') > 0) resolve(responseText)
    if (users.length === 0) reject('Unable to locate Users')
  })
}

function getExpFromLevel (level) {
  return 5 * (Math.pow(level, 2)) + 50 * level + 100
}

function getLevelFromExp (exp) {
  var experience = exp
  var level = 0
  while (experience >= getExpFromLevel(level)) {
    experience -= getExpFromLevel(level)
    level += 1
  }
  return {level: level, exp: experience}
}

function applyPerks (msg, exp) {
  return new Promise((resolve, reject) => {
    if (exp >= 100 && !msg.guild.member(msg.author).roles.exists('id', '180510856868528128')) {
      msg.guild.member(msg.author).addRole('180510856868528128')
      resolve(`${msg.author.username} you have achieved the rank of Member`)
    } else if (exp >= 10000 && !msg.guild.member(msg.author).roles.exists('id', '234345530803748874')) {
      msg.guild.member(msg.author).addRole('234345530803748874')
      resolve(`${msg.author.username} you have achieved the rank of VIP`)
    } else if (exp >= 50000 && !msg.guild.member(msg.author).roles.exists('id', '240269802411655179')) {
      msg.guild.member(msg.author).addRole('240269802411655179')
      resolve(`${msg.author.username} you have achieved the rank of Moderator`)
    } else {
      resolve()
    }
    reject('Something went wrong when applying perks')
  })
}

function addUser (msg) {
  if (!usr.hasOwnProperty(msg.guild.id)) {
    usr[msg.guild.id] = {}
    usr[msg.guild.id].users = {}
  }
  usr[msg.guild.id].users[msg.author.id] = {}
  usr[msg.guild.id].users[msg.author.id].username = msg.author.username
  usr[msg.guild.id].users[msg.author.id].experience = 0
}

module.exports = {
  join: join,
  initiateSave: initiateSave,
  leaderboard: leaderboard,
  addLevel: addLevel,
  getLevel: getLevel,
  streamFromURL: streamFromURL,
  toggleRole: toggleRole,
  apiRequest: apiRequest,
  getTime: getTime,
  addExperience: addExperience
}
