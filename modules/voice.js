const req = require('request')
const yt = require('ytdl-core')

const Fn = require('./functions.js')
const Config = require('../data/config.json')


let apiKey
if (Config.yt.key) { apiKey = Config.yt.key } else { apiKey = process.env.GOOGLE_API_KEY }
const baseYtUrl = Config.yt.url
let queue = {}

module.exports = {
  add: add,
  play: play,
  'streamFromURL': (msg, url) => {
    join(msg).then(connection => {
      setInterval(() => { if (connection.channel.members.size === 0) dispatcher.end() }, 300000)
      let dispatcher = connection.playStream(req(url), {volume: 0.08})
      let collector = msg.channel.createCollector(m => m)
      collector.on('message', m => {
        if (m.content === '!volume+') {
          dispatcher.setVolume(dispatcher.volume * 2)
          msg.channel.sendMessage(`Volume set to ${Math.floor(dispatcher.volume * 1000)}%`)
        }
        if (m.content === '!volume-' && dispatcher.volume !== 0.02) {
          dispatcher.setVolume(dispatcher.volume / 2)
          msg.channel.sendMessage(`Volume set to ${Math.floor(dispatcher.volume * 1000)}%`)
        }
        if (m.content === '!end' || m.content.startsWith('!play') || m.content.startsWith('!request') || m.content.startsWith('!add')) {
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
        msg.channel.sendMessage('Stream encountered an error.')
        console.log(err)
      })
    }).catch(console.log)
  },
  'queue': (msg) => {
    if (typeof queue[msg.guild.id] === 'undefined') { return msg.reply('Queue is empty') }
    var currentQueue = []
    queue[msg.guild.id].songs.forEach((song, i) => { currentQueue.push(`${i + 1}. ${song.title} - Requested by: ${song.requester}`) })
    msg.channel.sendMessage(`
    **${msg.guild.name} Queue:**
    *${currentQueue.length} songs in queue*

    ${currentQueue.slice(0, 10).join('\n     ')}
    ${(currentQueue.length > 10) ? '*[Only next 10 shown]*' : ''}
    `)
  },
  'request': (msg) => {
    const queryRequest = msg.content.slice(8).trim().replace(' ', '%20')
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
      queue[msg.guild.id].songs.push({url: songUrl, title: songTitle, requester: msg.author.username})
      msg.reply(`Added **${songTitle}** to queue`)
      if (queue[msg.guild.id].playing === false) play(msg)
    })
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
    if (err) return msg.channel.sendMessage('Invalid URL:' + err)
    if (!queue.hasOwnProperty(msg.guild.id)) {
      queue[msg.guild.id] = {}
      queue[msg.guild.id].playing = false
      queue[msg.guild.id].songs = []
    }
    queue[msg.guild.id].songs.push({url: url, title: info.title, requester: msg.author.username})
    msg.channel.sendMessage(`Added **${info.title}** to queue.`)
    if (queue[msg.guild.id].playing === false) play(msg, true)
  })
}

function play (msg, alreadyAdded) {
  if (!msg.guild.voiceConnection) return join(msg).then(() => play(msg))
  if (msg.content.indexOf('http') !== -1 && alreadyAdded !== true) return add(msg)
  if (typeof queue[msg.guild.id] === 'undefined') return msg.channel.sendMessage('No songs in queue add with !add or !request')
  if (queue[msg.guild.id].playing) return msg.channel.sendMessage('Already Playing')

  let dispatcher
  let connection = msg.guild.voiceConnection

  queue[msg.guild.id].playing = true;

  (function play (song) {
    if (song === undefined) {
      return msg.channel.sendMessage('Queue is empty').then(() => {
        queue[msg.guild.id].playing = false
      })
    }
    msg.channel.sendMessage(`Playing: **${song.title}** as requested by: ${song.requester}`)
    dispatcher = connection.playStream(yt(song.url,
      {filter: 'audioonly'}).on('error', (err) => {
        if (err.code === 'ECONNRESET') return
      }), { volume: 0.08, passes: 2 })
    let collector = msg.channel.createCollector(m => m)
    collector.on('message', m => {
      if (m.content.startsWith('!pause')) {
        msg.channel.sendMessage('Paused').then(() => { dispatcher.pause() })
      }
      if (m.content.startsWith('!resume')) {
        msg.channel.sendMessage('Resuming...').then(() => { dispatcher.resume() })
      }
      if (m.content === '!skip') {
        msg.channel.sendMessage('Skipping').then(() => { dispatcher.end() })
      }
      if (m.content === '!volume+') {
        dispatcher.setVolume(dispatcher.volume * 2)
        msg.channel.sendMessage(`Volume set to ${Math.floor(dispatcher.volume * 1000)}%`)
      }
      if (m.content === '!volume-' && dispatcher.volume !== 0.02) {
        dispatcher.setVolume(dispatcher.volume / 2)
        msg.channel.sendMessage(`Volume set to ${Math.floor(dispatcher.volume * 1000)}%`)
      }
      if (m.content === '!end') {
        dispatcher.end()
        queue[msg.guild.id].songs = []
      }
    })
    dispatcher.on('end', () => {
      collector.stop()
      connection.channel.leave()
      queue[msg.guild.id].songs.shift()
      play(queue[msg.guild.id].songs[0])
    })
    dispatcher.on('error', (err) => {
      dispatcher.end()
      msg.channel.sendMessage('Error: unable to play audio')
      console.log(err)
    })
  })(queue[msg.guild.id].songs[0])
}
