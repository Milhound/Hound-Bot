const superagent = require('superagent')
const fs = require('fs')

const Usr = require('../data/user.json')
const Timezone = require('../data/timezone.json')

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
    return new Promise((resolve, reject) => {
      let argsTime = msg.content.split(' ')
      let date = new Date()
      let hour = date.getUTCHours() - 1

      if (Timezone.hasOwnProperty(argsTime[1])) {
        hour += Timezone[argsTime[1]]
      } else if (argsTime[1].toLowerCase() === 'gmt' || argsTime[1].toLowerCase() === 'utc') {
        if (argsTime[2] !== undefined) {
          let modifier = argsTime[2]
          // Grab the + or - from properly formated command
          if (modifier.slice(0, 1) === '-') {
            hour = hour - parseInt(modifier.slice(1))
          } else {
            hour = hour + parseInt(modifier)
          }
        }
      } else {
        reject('Unknown Timezone.')
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

      let minutes = date.getUTCMinutes()
      if (minutes < 10) {
        minutes = '0' + minutes
      }
      resolve(hour + ':' + minutes)
    })
  },
  'initiateSave': () => {
    setInterval(() => {
      fs.writeFile('./user.json', JSON.stringify(Usr), (err) => {
        if (err) console.log(err)
        console.log('Saved User.json')
      })
    }, 300000)
  }
}
