const fs = require('fs')
var Guilds = require('../data/guilds.json')

module.exports = {
  'addServer': msg => {
    Guilds[msg.guild.id] = {}
    Guilds[msg.guild.id].name = msg.guild.name
    Guilds[msg.guild.id].owner = msg.guild.owner.user.username
    Guilds[msg.guild.id].ownerID = msg.guild.ownerID
    Guilds[msg.guild.id].greet = false
    Guilds[msg.guild.id].welcome = ''
    Guilds[msg.guild.id].volume = 100
    Guilds[msg.guild.id].roles = {}
    for (let role of msg.guild.roles.array()) {
      Guilds[msg.guild.id].roles[role.name] = {}
      Guilds[msg.guild.id].roles[role.name].id = role.id
    }
    Guilds[msg.guild.id].channels = {}
    for (let channel of msg.guild.channels.array()) {
      Guilds[msg.guild.id].channels[channel.name] = {}
      Guilds[msg.guild.id].channels[channel.name].id = channel.id
    }
    msg.reply('Server has been added!')
  },
  'toggleGreet': (msg) => {
    if (Guilds.hasOwnProperty(msg.guild.id)) {
      if (Guilds[msg.guild.id].greet === false) {
        Guilds[msg.guild.id].greet = true
        msg.reply('Greet turned on.')
      } else {
        Guilds[msg.guild.id].greet = false
        msg.reply('Greet turned off.')
      }
    } else msg.reply('Please add your server first with !addGuild')
  },
  'setWelcome': (msg) => {
    if (Guilds.hasOwnProperty(msg.guild.id)) {
      Guilds[msg.guild.id].welcome = msg.content.slice(9).replace(/"/g, '\'').trim()
      msg.reply(`Server welcome message set to: ${msg.content.slice(9).replace(/"/g, '\'').trim()}`)
    } else msg.reply('Please add your server first with !addGuild')
  },
  'initGuildSave': () => {
    setInterval(() => {
      fs.writeFile('./data/guilds.json', JSON.stringify(Guilds), (err) => {
        if (err) console.log(err); else console.log('Saved guilds.json')
      })
    }, 300000)
  }
}
