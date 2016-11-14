module.exports = {
  'mute': (msg) => {
    if (msg.guild.member(msg.author).hasPermission('MUTE_MEMBERS')) {
      for (var muteMention of msg.mentions.users.array()) {
        msg.guild.member(muteMention).setMute(true)
        msg.reply(muteMention + ' has been globally muted!')
      }
    }
  },
  'unmute': (msg) => {
    if (msg.guild.member(msg.author).hasPermission('MUTE_MEMBERS')) {
      for (var unmuteMention of msg.mentions.users.array()) {
        msg.guild.member(unmuteMention).setMute(false)
        msg.reply(unmuteMention + ' has been unmuted!')
      }
    }
  },
  'wipe': (msg) => {
    if (msg.guild.member(msg.author).hasPermission('MANAGE_MESSAGES')) {
      var argsWipe = msg.content.split(' ')
      if (argsWipe[1] !== undefined && !isNaN(parseInt(argsWipe[1])) && argsWipe[1] <= 50) {
        var messages = msg.channel.fetchMessages({limit: (parseInt(argsWipe[1]) + 1)})
        messages.then(messages => { msg.channel.bulkDelete(messages) })
      } else if (argsWipe[1] > 50 || argsWipe[1] === ' ') {
        msg.reply('Attempted to wipe too many messages')
      }
    }
  },
  'kick': (msg) => {
    if (msg.guild.member(msg.author).hasPermission('KICK_MEMBERS')) {
      for (var kickUser of msg.mentions.users.array()) {
        msg.guild.member(kickUser.id).kick()
      }
    }
  },
  'ban': (msg) => {
    if (msg.guild.member(msg.author).hasPermission('BAN_MEMBERS')) {
      for (var kickUser of msg.mentions.users.array()) {
        msg.guild.member(kickUser.id).ban()
      }
    }
  }
}
