const superagent = require('superagent')

exports.toggleRole = (msg, role) => {
  if (msg.member.roles.has(role)) {
    msg.reply('Removed role ' + msg.guild.roles.get(role).name + '. Use !' + msg.guild.roles.get(role).name.toLowerCase() + ' to undo.')
    msg.guild.member(msg.author).removeRole(role)
  } else {
    msg.reply('You have been granted role - ' + msg.guild.roles.get(role).name + '.')
    msg.guild.member(msg.author).addRole(role)
  }
}

exports.filterWords = (msg) => {
  var badWordList = ['gay', 'queer', 'fuck', 'ass', 'nigger', 'nigga', 'nig', 'slut', 'cunt', 'boi', 'fag', 'testie']
  for (var word of badWordList) {
    if (msg.content.toLowerCase().indexOf(word) !== -1) {
      msg.delete()
      msg.channel.sendMessage('Please refrain from using profanity. If you feel this is an error please contact ' + msg.guild.owner + '.')
    }
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
