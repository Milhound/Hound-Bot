const superagent = require('superagent')
const usr = require('../data/user.json')
const fs = require('fs')

module.exports = {
  'apiRequest': (url, callback) => {
    return new Promise((resolve, reject) => {
      superagent.get(url)
      .end((err, res) => {
        if (err) return reject(err)
        return resolve(res.body)
      })
    })
  },
  'getTime': (msg) => {
    var argsTime = msg.content.split(' ')
    var goodTime = true
    var date = new Date()
    var hour = date.getUTCHours()

    switch (argsTime[1].toLowerCase()) {
      // United States
      case 'pdt':
      case 'pst':
      case 'california':
        hour = hour - 7
        break

      case 'mdt':
      case 'mst':
        hour = hour - 6
        break

      case 'cdt':
      case 'cst':
      case 'texas':
        hour = hour - 5
        break

      case 'edt':
      case 'est':
        hour = hour - 4
        break

      case 'hst':
      case 'hawaii':
        hour = hour - 10
        break

      // Rio de Janeiro
      case 'brt':
        hour = hour - 3
        break

      // Europe
      case 'bst':
      case 'west':
      case 'cet':
      case 'london':
      case 'wales':
        hour = hour + 1
        break

      case 'cest':
      case 'sweden':
      case 'eet':
      case 'germany':
      case 'austria':
        hour = hour + 2
        break

      case 'eest':
      case 'finland':
        hour = hour + 3
        break

      case 'ist':
      case 'india':
        hour = Math.floor(hour + 5.5)
        break

      case 'sgt':
      case 'singapore':
        hour = hour + 8
        break

      case 'jst':
      case 'japan':
      case 'tokyo':
        hour = hour + 9
        break

      case 'aedt':
      case 'australia':
        hour = hour + 11
        break

      case 'nzdt':
      case 'new-zealand':
        hour = hour + 13
        break

      default:
        // Allow users to do custom GMT/UTC timezones with GMT+1 as an example
        if (argsTime[1].toLowerCase() === 'gmt' || argsTime[1].toLowerCase() === 'utc') {
          if (argsTime[2] !== undefined) {
            var modifier = argsTime[2]
            console.log(modifier)
            // Grab the + or - from properly formated command
            if (modifier.slice(0, 1) === '-') {
              hour = hour - parseInt(modifier.slice(1))
            } else {
              hour = hour + parseInt(modifier)
            }
          }
        } else {
          // All other checks failed, its is not a timezone currently in code.
          msg.reply('Unknown Timezone.')
          goodTime = false
          // Log passed timezone for a potential addition
          console.log('Timezone not avaliable yet: ' + argsTime[1])
        }
    }
    if (hour < 0) {
      hour = 24 + hour
    } else
    if (hour > 24) {
      hour = hour - 24
    } else
    if (hour < 10) {
      hour = '0' + hour
    }

    var minutes = date.getUTCMinutes()
    if (minutes < 10) {
      minutes = '0' + minutes
    }

    if (goodTime) { msg.reply(hour + ':' + minutes) }
  },
  'initiateSave': () => {
    setInterval(() => {
      fs.writeFile('./user.json', JSON.stringify(usr), (err) => {
        if (err) console.log(err)
        console.log('Saved User.json')
      })
    }, 300000)
  }
}
