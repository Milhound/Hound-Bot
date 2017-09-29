const req = require('request')
const yt = require('ytdl-core')
const Fn = require('./functions.js')
const Config = require('../data/config.json')

let apiKey
if (Config.yt.key) { apiKey = Config.yt.key } else { apiKey = process.env.GOOGLE_API_KEY }
const baseYtUrl = Config.yt.url
let queue = {}
let preferredServerVolume = {}

module.exports = {
  add: add,
  'streamFromURL': (msg, url) => {
    join(msg).then(connection => {
      setInterval(() => { if (connection.channel.members.size === 0) dispatcher.end() }, 300000)
      let dispatcher = connection.playStream(req(url))
      if (preferredServerVolume.hasOwnProperty(msg.guild.id)) dispatcher.setVolume(preferredServerVolume[msg.guild.id]); else dispatcher.setVolume(0.08)
      let collector = msg.channel.createCollector(m => m)
      collector.on('collect', m => {
        if (m.content === '!volume+') {
          dispatcher.setVolume(dispatcher.volume + (dispatcher.volume / 4))
          msg.channel.send(`Volume set to ${Math.floor(dispatcher.volume * 1000)}%`)
        } else if (m.content === '!volume++') {
          dispatcher.setVolume(dispatcher.volume * 2)
          msg.channel.send(`Volume set to ${Math.floor(dispatcher.volume * 1000)}%`)
        } else if (m.content === '!volume-') {
          dispatcher.setVolume(dispatcher.volume - (dispatcher.volume / 4))
          msg.channel.send(`Volume set to ${Math.floor(dispatcher.volume * 1000)}%`)
        } else if (m.content === '!volume--') {
          dispatcher.setVolume(dispatcher.volume / 2)
          msg.channel.send(`Volume set to ${Math.floor(dispatcher.volume * 1000)}%`)
        } else if (m.content === '!end' || m.content.startsWith('!play') || m.content.startsWith('!request') || m.content.startsWith('!add')) {
          dispatcher.end()
        }
      })
      dispatcher.on('end', () => {
        connection.channel.leave()
        collector.stop()
      })
      dispatcher.on('error', (err) => {
        dispatcher.end()
        collector.stop()
        msg.channel.send('Stream encountered an error.')
        console.log(err)
      })
    }).catch(console.log)
  },
  'queue': (msg) => {
    if (typeof queue[msg.guild.id] === 'undefined') { return msg.reply('Queue is empty') }
    var currentQueue = []
    queue[msg.guild.id].songs.forEach((song, i) => { currentQueue.push(`${i + 1}. ${song.title} - Requested by: ${song.requester}`) })
    msg.channel.send(`
    **${msg.guild.name} Queue:**
    *${currentQueue.length} songs in queue*

    ${currentQueue.slice(0, 10).join('\n     ')}
    ${(currentQueue.length > 10) ? '*[Only next 10 shown]*' : ''}
    `)
  },
  'request': (msg) => {
    const queryRequest = msg.content.slice(8).trim().replace(/ /g, '%20')
    const urlRequest = baseYtUrl + queryRequest + '&key=' + apiKey
    Fn.apiRequest(urlRequest)
    .then(info => {
      var songUrl = 'https://www.youtube.com/watch?v=' + info.items[0].id.videoId
      var songTitle = info.items[0].snippet.title
      if (!queue.hasOwnProperty(msg.guild.id)) {
        queue[msg.guild.id] = {}
        queue[msg.guild.id].playing = false
        queue[msg.guild.id].songs = []
      }
      if (typeof queue[msg.guild.id].songs !== 'object') queue[msg.guild.id].songs = {}
      queue[msg.guild.id].songs.push({url: songUrl, title: songTitle, requester: msg.author.username})
      msg.reply(`Added **${songTitle}** to queue`)
      if (queue[msg.guild.id].playing === false) play(msg)
    })
  },
  'setServerVolume': (msg) => {
    const preferredVolume = parseInt(msg.content.slice(11, 14).trim()) / 1000
    console.log(msg.content.slice(11, 14))
    if (!isNaN(preferredVolume)) {
      preferredServerVolume[msg.guild.id] = preferredVolume
      msg.channel.send(`Preferred server volume set to: ${preferredVolume * 1000}%`)
    }
  }
}

function join (msg) {
  return new Promise((resolve, reject) => {
    const voiceChannel = msg.member.voiceChannel
    if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply('Unable to join voice channel')
    voiceChannel.join().then(connection => resolve(connection))
  })
}

function add (msg) {
  let url = msg.content.split(' ')[1]
  yt.getInfo(url, (err, info) => {
    if (err) return msg.channel.send('Invalid URL:' + err)
    if (!queue.hasOwnProperty(msg.guild.id)) {
      queue[msg.guild.id] = {}
      queue[msg.guild.id].playing = false
      queue[msg.guild.id].songs = []
      queue[msg.guild.id].songs.push({url: url, title: info.title, requester: msg.author.username})
    }
    var guildSongs = queue[msg.guild.id].songs
    guildSongs.push({url: url, title: info.title, requester: msg.author.username})

    msg.channel.send(`Added **${info.title}** to queue.`)
    if (queue[msg.guild.id].playing === false) play(msg)
  })
}

function getSongFunctions(msg, dispatcher) {
  // Create message collector for song
  let collector = msg.channel.createCollector(m => m)
  collector.on('collect', m => {
    if (m.content.startsWith('!pause')) {
      msg.channel.send('Paused').then(() => { dispatcher.pause() })
    } else if (m.content.startsWith('!resume')) {
      msg.channel.send('Resuming...').then(() => { dispatcher.resume() })
    } else if (m.content === '!skip') {
      msg.channel.send('Skipping').then((msg) => { dispatcher.end() })
    } else if (m.content === '!volume+') {
      dispatcher.setVolume(dispatcher.volume + (dispatcher.volume / 4))
      msg.channel.send(`Volume set to ${Math.floor(dispatcher.volume * 1000)}%`)
    } else if (m.content === '!volume++') {
      dispatcher.setVolume(dispatcher.volume * 2)
      msg.channel.send(`Volume set to ${Math.floor(dispatcher.volume * 1000)}%`)
    } else if (m.content === '!volume-') {
      dispatcher.setVolume(dispatcher.volume - (dispatcher.volume / 4))
      msg.channel.send(`Volume set to ${Math.floor(dispatcher.volume * 1000)}%`)
    } else if (m.content === '!volume--') {
      dispatcher.setVolume(dispatcher.volume / 2)
      msg.channel.send(`Volume set to ${Math.floor(dispatcher.volume * 1000)}%`)
    } else if (m.content === '!end') {
      queue[msg.guild.id].songs = {}
      dispatcher.end()
    }
  })
  return collector
}

function play (msg) {
  // Connect if not connected
  if (!msg.guild.voiceConnection) return join(msg).then(() => play(msg))
  let connection = msg.guild.voiceConnection
  queue[msg.guild.id].playing = true;

  // Grab current song
  var song = queue[msg.guild.id].songs[0]
  queue[msg.guild.id].songs.shift()

  // Play song
  let dispatcher = connection.playStream(yt(song.url,
    {filter: 'audioonly'}).on('error', (err) => {
      if (err.code === 'ECONNRESET') return
    }), { passes: 2 })
  msg.channel.send(`Playing: **${song.title}** as requested by: ${song.requester}`)

  if (preferredServerVolume.hasOwnProperty(msg.guild.id)) dispatcher.setVolume(preferredServerVolume[msg.guild.id]); else dispatcher.setVolume(0.1)
  let collector = getSongFunctions(msg, dispatcher)

  // On Song End
  dispatcher.on('end', () => {
    collector.stop()
    // Check if next song in que exists
    if (queue[msg.guild.id].songs[0]) { play(msg) } else {
      return msg.channel.send('Queue is empty').then(() => {
        queue[msg.guild.id].playing = false
        connection.channel.leave()
      })
    }
  })

  dispatcher.on('error', (err) => {
    msg.channel.send('Error: unable to play audio')
    console.log(err)
  })
}

