const Discord = require('discord.js')
const bot = new Discord.Client()

const Message = require('./modules/message.js')
const Usr = require('./modules/user.js')
const Config = require('./data/config.json')

bot.on('ready', () => {
  console.log('Bot is Online')
  Usr.initiateSave()
})

bot.on('guildMemberAdd', member => {
  // Log user
  if (member.guild.id === Config.guilds.milhound.id) {
    member.guild.channels.find('id', Config.guilds.milhound.channels.mod).sendMessage(`${member.user.username} has joined the Server.`)
  } else if (Config.guilds.hasOwnProperty(member.guild.id) && Config.guilds[member.guild.id].hasOwnProperty('channels') && Config.guilds[member.guild.id].channels.hasOwnProperty('log')) {
    member.guild.channels.find('id', Config.guilds[member.guild.id].channels.log).sendMessage(`${member.user.username} has joined the Server.`)
  }

  // Send welcome message
  if (member.guild.id === Config.guilds.milhound.id) {
    return member.sendMessage(Config.guilds['milhound'].welcome)
  } else if (Config.guilds.hasOwnProperty(member.guild.id) && Config.guilds[member.guild.id].hasOwnProperty('welcome')) {
    member.sendMessage(Config.guilds[member.guild.id].welcome)
  }
})

bot.on('message', message => {
  Usr.addExperience(message)
  if (!message.content.startsWith(Config.prefix)) return
  Message.cmds(message)
  if (message.content.toLowerCase() === '!reboot' && message.guild.member(message.author).hasPermission('ADMINISTRATOR')) bot.destroy()
})

bot.on('disconnected', () => {
  console.log('Bot Disconnected.')
})

process.on('unhandledRejection', err => {
  if (err.toString().indexOf('Forbidden') > 0) return console.log('Bot cannot talk in this channel.')
  console.error('Uncaught Promise Error: \n' + err.stack)
})

bot.login(process.env.HOUND_BOT_TOKEN)
