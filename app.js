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
  if (member.guild.id !== Config.guilds.milhound.id) return
  member.guild.channels.find('id', Config.guilds.milhound.channels.mod).sendMessage(`${member.user.username} has joined the Server.`)
  const newMemberMilhound = `\
Welcome to Milhound's Server:
Programmer? _Please use the !programmer command._
Gammer? _Please use the !gammer command._
Listen to music? _Please use the !dj command to request songs._

**RULES:**
1. All chat must be Safe for Work (SFW).
2. Profanity is to be kept at a minimum. Abuse may result in ban
3. All messages must comply with Discord Terms
4. No Spam
5. No Advertisements (Including other server invites)
6. Trolling is allowed
7. No unapproved bot invitations

All updates to Hound Bot and the server are located in #update-log. Be sure to check pinned messages.
`
  member.sendMessage(newMemberMilhound)
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
