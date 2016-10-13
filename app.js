const Discord = require('discord.js')
const bot = new Discord.Client()
const Message = require('./message.js')
const fn = require('./functions.js')

var newUsers = []

'use strict'

bot.on('guildMemberAdd', (guild, member) => {
  if (!newUsers[guild.id]) newUsers[guild.id] = new Discord.Collection()
  newUsers[guild.id].set(member.user.id, member.user)

  if (newUsers[guild.id].size > 3) {
    var userlist = newUsers[guild.id].map(u => u.mention()).join(' ')
    guild.channels.get(guild.id).sendMessage('Welcome our new users!\n' + userlist)
    newUsers[guild.id] = new Discord.Collection()
  }
})

bot.on('guildMemberRemove', (guild, member) => {
  if (newUsers[guild.id].exists('id', member.user.id)) newUsers.delete(member.user.id)
})

bot.on('ready', () => {
  console.log('Bot is Online')
})

bot.on('message', message => {
  console.log(message.author.username + ' Says: ' + message.content)
  // Filter Profanity on Milhound's Server
  if (message.guild.id === '167693566267752449') fn.filterWords(message)
  Message.cmds(message)
})

bot.on('disconnected', () => {
  console.log('Bot Disconnected.')
})

bot.login(process.env.HOUND_BOT_TOKEN)
