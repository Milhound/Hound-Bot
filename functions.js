const superagent = require('superagent')
const usr = require('./user.json')
const fs = require('fs')

const expDelayTime = 30000
var expLocked = new Map()

'use strict'

function addUser (msg) {
  if (!usr.hasOwnProperty(msg.guild.id)) {
    usr[msg.guild.id] = {}
    usr[msg.guild.id].users = {}
  }
  usr[msg.guild.id].users[msg.author.id] = {}
  usr[msg.guild.id].users[msg.author.id].username = msg.author.username
  usr[msg.guild.id].users[msg.author.id].experience = 0
}

exports.toggleRole = (msg, role) => {
  if (msg.member.roles.has(role)) {
    msg.reply('Removed role ' + msg.guild.roles.get(role).name + '. Use !' + msg.guild.roles.get(role).name.toLowerCase() + ' to undo.')
    msg.guild.member(msg.author).removeRole(role)
  } else {
    msg.reply('You have been granted role - ' + msg.guild.roles.get(role).name + '.')
    msg.guild.member(msg.author).addRole(role)
  }
}

exports.apiRequest = (url, callback) => {
  return new Promise((resolve, reject) => {
    superagent.get(url)
    .end((err, res) => {
      if (err) return reject(err)
      return resolve(res.body)
    })
  })
}

exports.addExperience = (msg) => {
  if (!expLocked.hasOwnProperty(msg.author.id)) expLocked[msg.author.id] = false
  if (expLocked[msg.author.id] === false) {
    if (!usr.hasOwnProperty(msg.guild.id) || !usr[msg.guild.id].users.hasOwnProperty(msg.author.id)) return addUser(msg)
    const exp = Math.floor(Math.random() * 10 + 11)
    usr[msg.guild.id].users[msg.author.id].experience += exp
    fs.writeFile('./user.json', JSON.stringify(usr), (err) => {
      if (err) console.log(err)
      console.log('Saved File')
    })
    expLocked[msg.author.id] = true
    setTimeout(() => {
      expLocked[msg.author.id] = false
    }, expDelayTime)
    if (msg.guild.id === '167693566267752449') applyPerks(msg, usr[msg.guild.id].users[msg.author.id].experience).then(response => { msg.channel.sendMessage(response) })
    console.log(`Added ${exp} to ${msg.author.username}!`)
  }
}

exports.getLevel = (msg) => {
  return new Promise((resolve, reject) => {
    if (!usr[msg.guild.id].users.hasOwnProperty(msg.author.id)) {
      reject('No Experince Recorded')
    }
    if (usr[msg.guild.id].users[msg.author.id].experience >= 0) resolve(usr[msg.guild.id].users[msg.author.id].experience)
    reject('Unable to locate User')
  })
}

exports.addLevel = (msg) => {
  console.log('Adding Exp')
  var exp = 1000
  for (var expTarget of msg.mentions.users.array()) {
    usr[msg.guild.id].users[expTarget.id].experience += exp
    msg.channel.sendMessage(`Added 1000 exp to ${expTarget}`)
  }
}

function applyPerks (msg, exp) {
  return new Promise((resolve, reject) => {
    if (exp >= 100 && !msg.guild.member(msg.author).roles.exists('id', '180510856868528128')) {
      msg.guild.member(msg.author).addRole('180510856868528128')
      resolve(`${msg.author.username} you have achieved the rank of Member`)
    }
    if (exp >= 10000 && !msg.guild.member(msg.author).roles.exists('id', '234345530803748874')) {
      msg.guild.member(msg.author).addRole('234345530803748874')
      resolve(`${msg.author.username} you have achieved the rank of VIP`)
    }
    if (exp >= 50000 && !msg.guild.member(msg.author).roles.exists('id', '240269802411655179')) {
      msg.guild.member(msg.author).addRole('240269802411655179')
      resolve(`${msg.author.username} you have achieved the rank of Moderator`)
    }
    reject('No Perks Added')
  })
}
