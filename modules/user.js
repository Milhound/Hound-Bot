const fs = require('fs')
const Config = require('../data/config.json')
var Usr = require('../data/user.json')
const expDelayTime = 30000
var expLocked = new Map()

module.exports = {
  initiateSave: initiateSave,
  logUser: logUser,
  welcomeMessage: welcomeMessage,
  'level': (msg) => {
    if (!msg.mentions.users.first()) {
      getLevel(msg.guild, msg.author)
        .then(response => { msg.channel.sendMessage(`Level: ${response.level} (${response.remaining}/${response.nextLevel})`) })
        .catch((err) => msg.channel.sendMessage(err))
    } else {
      for (var usrRequestedLevel of msg.mentions.users.array()) {
        getLevel(msg.guild, usrRequestedLevel)
          .then(response => {
            msg.channel.sendMessage(
              `${response.user.username} is Level: ${response.level} (${response.remaining}/${response.nextLevel})`
            ) })
          .catch((err) => msg.channel.sendMessage(err))
      }
    }
  },
  'toggleRole': (msg, role) => {
    if (msg.member.roles.has(role)) {
      msg.reply('Removed role ' + msg.guild.roles.get(role).name + '. Use !' + msg.guild.roles.get(role).name + ' to undo.')
      msg.guild.member(msg.author).removeRole(role)
    } else {
      msg.reply('You have been granted role - ' + msg.guild.roles.get(role).name + '.')
      msg.guild.member(msg.author).addRole(role)
    }
  },
  'addExperience': (msg) => {
    if (msg.author.id === Config.id) return // Do not give Hound Bot Experience
    if (!expLocked.hasOwnProperty(msg.author.id)) expLocked[msg.author.id] = false
    if (expLocked[msg.author.id] === false) {
      if (!Usr.hasOwnProperty(msg.guild.id) || !Usr[msg.guild.id].users.hasOwnProperty(msg.author.id)) return addUser(msg)
      const exp = Math.floor(Math.random() * 10 + 11)
      Usr[msg.guild.id].users[msg.author.id].experience += exp
      expLocked[msg.author.id] = true
      // Reconfirm user username is up to date.
      Usr[msg.guild.id].users[msg.author.id].username = msg.author.username
      setTimeout(() => {
        expLocked[msg.author.id] = false
      }, expDelayTime)
      if (msg.guild.id === Config.guilds.milhound.id) {
        applyPerks(msg, Usr[msg.guild.id].users[msg.author.id].experience)
          .then(response => { if (response) msg.channel.sendMessage(response) })
          .catch(console.log)
      }
      console.log(`Added ${exp} to ${msg.author.username}!`)
    }
  },
  'addLevel': (msg) => {
    for (var expTarget of msg.mentions.users.array()) {
      const usrData = getLevelFromExp(Usr[msg.guild.id].users[expTarget.id].experience)
      const usrNextLevelExp = getExpFromLevel(usrData.level)
      const usrRemainingExp = usrData.exp
      const expToAdd = usrNextLevelExp - usrRemainingExp
      Usr[msg.guild.id].users[expTarget.id].experience += expToAdd
      msg.channel.sendMessage(`Added ${expToAdd} exp to ${expTarget}`)
    }
  },
  'leaderboard': (msg) => {
    return new Promise((resolve, reject) => {
      if (!Usr.hasOwnProperty(msg.guild.id)) reject('This server has not been recorded yet.')
      if (!Usr[msg.guild.id].users) reject('No user data has been recorded yet.')
      const sortedUsers = getUsers(msg).sort((a, b) => { return Math.sign(b.exp - a.exp) }).slice(0, 10)
      // Generate Report
      var rank = 1
      var responseText = `**Leaderboard of ${msg.guild.name}**`
      for (var rankedUser of sortedUsers) {
        responseText += `\n${rank}. ${rankedUser.username} - Total Exp: ${rankedUser.exp}`
        rank += 1
      }
      if (getUsers(msg).length > 10) responseText += `\n\n*Only first 10 shown*`
      if (responseText.indexOf('1.') > 0) resolve(responseText)
      if (getUsers(msg).length === 0) reject('Unable to locate Users')
    })
  },
  'modifyExp': (msg) => {
    const modExp = parseInt(msg.content.split(' ')[1])
    if (!modExp || isNaN(modExp)) return msg.reply('Incorrect syntax')
    if (!msg.mentions.users.first()) return msg.reply('No user given')
    const target = msg.mentions.users.first().id
    if (modExp > 0) Usr[msg.guild.id].users[target].experience = modExp
    else msg.reply('Could not modify exp')
  }
}

function initiateSave () {
  setInterval(() => {
    fs.writeFile('./data/user.json', JSON.stringify(Usr), (err) => {
      if (err) console.log(err)
      console.log('Saved User.json')
    })
  }, 300000)
}
function getUsers (msg) {
  const users = Usr[msg.guild.id].users
  var userArray = []
  for (var key in users) {
    var user = users[key]
    userArray.push({
      id: key,
      username: user.username,
      exp: user.experience
    })
  }
  return userArray
}
function getLevel (guild, user) {
  return new Promise((resolve, reject) => {
    if (!Usr[guild.id].users.hasOwnProperty(user.id)) {
      reject('No Experince Recorded')
    }
    if (Usr[guild.id].users[user.id].experience >= 0) {
      var exp = Usr[guild.id].users[user.id].experience
      const usrLevel = getLevelFromExp(exp)
      resolve({user: user, level: usrLevel.level, remaining: usrLevel.exp, nextLevel: getExpFromLevel(usrLevel.level + 1)})
    }
    reject('Unable to locate User')
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
    if (exp >= 155 && !msg.guild.member(msg.author).roles.exists('id', Config.guilds.milhound.roles.member)) {
      msg.guild.member(msg.author).addRole(Config.guilds.milhound.roles.member)
      resolve(`${msg.author.username} you have achieved the rank of Member`)
    } else if (exp >= 1975 && !msg.guild.member(msg.author).roles.exists('id', Config.guilds.milhound.roles.vip)) {
      msg.guild.member(msg.author).addRole(Config.guilds.milhound.roles.vip)
      resolve(`${msg.author.username} you have achieved the rank of VIP`)
    } else if (exp >= 15100 && !msg.guild.member(msg.author).roles.exists('id', Config.guilds.milhound.roles.moderator)) {
      msg.guild.member(msg.author).addRole(Config.guilds.milhound.roles.moderator)
      resolve(`${msg.author.username} you have achieved the rank of Moderator`)
    } else if (exp > 0) { resolve() }
    reject('Something went wrong when applying perks')
  })
}
function addUser (msg) {
  if (!Usr.hasOwnProperty(msg.guild.id)) {
    Usr[msg.guild.id] = {}
    Usr[msg.guild.id].users = {}
  }
  Usr[msg.guild.id].users[msg.author.id] = {}
  Usr[msg.guild.id].users[msg.author.id].username = msg.author.username
  Usr[msg.guild.id].users[msg.author.id].experience = 0
}

function logUser (member) {
  if (member.guild.id === Config.guilds.milhound.id) {
    member.guild.channels.find('id', Config.guilds.milhound.channels.log).sendMessage(`${member.user.username} has joined the Server.`)
  } else if (Config.guilds.hasOwnProperty(member.guild.id) && Config.guilds[member.guild.id].hasOwnProperty('channels') && Config.guilds[member.guild.id].channels.hasOwnProperty('log')) {
    member.guild.channels.find('id', Config.guilds[member.guild.id].channels.log).sendMessage(`${member.user.username} has joined the Server.`)
  }
}

function welcomeMessage (member) {
  if (member.guild.id === Config.guilds.milhound.id) {
    return member.sendMessage(Config.guilds['milhound'].welcome)
  } else if (Config.guilds[member.guild.id].hasOwnProperty('welcome')) {
    member.sendMessage(Config.guilds[member.guild.id].welcome)
  }
}
