const Discord = require('discord.js')
const bot = new Discord.Client()

const Message = require('./modules/message.js')
const Fn = require('./modules/functions.js')
const Config = require('./data/config.json')

bot.on('ready', () => {
  console.log('Bot is Online')
  Fn.initiateSave()
})

bot.on('message', message => {
  console.log('Request ban: ' + message.guild.roles.find('name', 'Request BAN'))
  console.log('Skip ban: ' + message.guild.roles.find('name', 'Skip BAN'))
  if (!message.content.startsWith(Config.prefix)) return
  console.log(message.author.username + ' - ' + message.guild.name + ' says: ' + message.content)
  Message.cmds(message)
})

bot.on('disconnected', () => {
  console.log('Bot Disconnected.')
})

bot.login(process.env.HOUND_BOT_TOKEN)
