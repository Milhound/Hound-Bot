const expDelayTime = 30000
var expLocked = new Map()
const Usr = require('../data/user.json')

module.exports = {
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
    if (msg.author.id === '169874052675010560') return // Do not give Hound Bot Experience
    if (!expLocked.hasOwnProperty(msg.author.id)) expLocked[msg.author.id] = false
    if (expLocked[msg.author.id] === false) {
      if (!Usr.hasOwnProperty(msg.guild.id) || !Usr[msg.guild.id].users.hasOwnProperty(msg.author.id)) return addUser(msg)
      const exp = Math.floor(Math.random() * 10 + 11)
      Usr[msg.guild.id].users[msg.author.id].experience += exp
      expLocked[msg.author.id] = true
      setTimeout(() => {
        expLocked[msg.author.id] = false
      }, expDelayTime)
      if (msg.guild.id === '167693566267752449') {
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
  }
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
  if (!Usr.hasOwnProperty(msg.guild.id)) {
    Usr[msg.guild.id] = {}
    Usr[msg.guild.id].users = {}
  }
  Usr[msg.guild.id].users[msg.author.id] = {}
  Usr[msg.guild.id].users[msg.author.id].username = msg.author.username
  Usr[msg.guild.id].users[msg.author.id].experience = 0
}
