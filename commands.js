{
  'add': (msg) => {
      let url = msg.content.split(' ')[1]
      yt.getInfo(url, (err, info) => {
        if (err) return msg.channel.sendMessage('Invalid URL:' + err)
        if (!queue.hasOwnProperty(msg.guild.id)) {
          queue[msg.guild.id] = {}
          queue[msg.guild.id].playing = false
          queue[msg.guild.id].songs = []
        }
        queue[msg.guild.id].songs.push({url: url, title: info.title, requester: msg.author.username})
        console.log(queue)
        msg.channel.sendMessage(`Added **${info.title}** to queue.`)
      })
    },
    'join': (msg) => {
      return new Promise((resolve, reject) => {
        const voiceChannel = msg.member.voiceChannel
        if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply('Unable to join voice channel')
        voiceChannel.join().then(connection => resolve(connection).catch(err => reject(err)))
      })
    },
    'queue': (msg) => {
      if (queue[msg.guild.id] === undefined) { return msg.reply('Queue is empty') }
      var currentQueue = []
      queue[msg.guild.id].songs.forEach((song, i) => { currentQueue.push(`${i + 1}. ${song.title} - Requested by: ${song.requester}`) })
      msg.channel.sendMessage(
        `**${msg.guild.name} Queue:**
        *${currentQueue.length} songs in queue*
        ${currentQueue.slice(0, 5).join('\n')}
        ${(currentQueue > 5) ? '*[Only next 5 shown]*' : ''}
      `)
    },
    'play': (msg) => {
      if (queue[msg.guild.id] === undefined) return msg.channel.sendMessage('No songs in queue add with !add')
      if (!msg.guild.voiceConnection) {
        var voiceChannel = msg.member.voiceChannel
        voiceChannel.join()
      }
      if (queue[msg.guild.id].playing) return msg.channel.sendMessage('Already Playing')

      let dispatcher

      queue[msg.guild.id].playing = true

      (function play (song) {
        if (song === undefined) {
          return msg.channel.sendMessage('Queue is empty').then(() => {
            queue[msg.guild.id].playing = false
            msg.member.voiceChannel.leave()
          })
        }
        msg.channel.sendMessage(`Playing: **${song.title}** as requested by: ${song.requester}`)
        dispatcher = msg.guild.voiceConnection.playStream(yt(song.url, {filter: 'audioonly'}))
        let collector = msg.channel.createCollector(m => m)
        collector.on('message', m => {
          if (m.content.startsWith('!pause')) {
            msg.channel.sendMessage('Paused').then(() => { dispatcher.pause() })
          }
        })
        dispatcher.on('end', () => {
          collector.stop()
          queue[msg.guild.id].songs.shift()
          play(queue[msg.guild.id].songs[0])
        })
        dispatcher.on('error', (err) => {
          return msg.channel.sendMessage('Error: ' + err).then(() => {
            collector.stop()
            queue[msg.guild.id].songs.shift()
            play(queue[msg.guild.id].songs[0])
          })
        })
      })(queue[msg.guild.id].songs[0])
    }
  }