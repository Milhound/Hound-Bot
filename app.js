const Discord = require('discord.js')
const bot = new Discord.Client()

const Message = require('./modules/message.js')
const Usr = require('./modules/user.js')
const Config = require('./data/config.json')

bot.on('ready', () => {
  console.log('Bot is Online')
  Usr.initiateSave()
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
  if (err.indexOf('Forbidden') > 0) console.log('Bot cannot talk in this channel.')
  console.error('Uncaught Promise Error: \n' + err.stack)
})

bot.login(process.env.HOUND_BOT_TOKEN)
