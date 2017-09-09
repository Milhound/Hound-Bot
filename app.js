const Discord = require('discord.js')
const bot = new Discord.Client()
const Message = require('./modules/message.js')
const Usr = require('./modules/user.js')
const Guild = require('./modules/guild.js')
const Config = require('./data/config.json')

bot.on('ready', () => {
  console.log('Bot is Online')
  Usr.initiateSave()
  Guild.initGuildSave()
})

bot.on('guildMemberAdd', member => {
  if (Config.server.id === member.guild.id) {
    // Log user
    Usr.logUser(member)
    // Send welcome message
    Usr.welcomeMessage(member)
  }
  if (member.guild.id === 149632998055215105) {
    const channel = member.guild.channels.find('id', 160062431236849665)
    if (!channel) return
    channel.send(`Welcome to TGC ${member}!`)
  }
})

bot.on('guildMemberRemove', member => {
  if (Config.server.id === member.guild.id) {
    Usr.logUserLeave(member)
  }
})

bot.on('message', message => {
  if (message.channel.type === 'dm' && message.author.id !== Config.id) return message.reply('I currently cannot communicate via DM. Please use !commands in a regular server channel.')
  Usr.addExperience(message)
  if (!message.content.startsWith(Config.prefix)) return
  Message.cmds(message)
})

bot.on('disconnected', () => {
  console.log('Bot Disconnected.')
})

process.on('unhandledRejection', err => {
  if (err.toString().indexOf('Forbidden') > 0) return console.log('Bot cannot talk in this channel.')
  console.error('Uncaught Promise Error: \n' + err.stack)
})

bot.login(process.env.HOUND_BOT_TOKEN)
