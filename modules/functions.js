const superagent = require('superagent')

const Timezone = require('../data/timezone.json')

module.exports = {
  'apiRequest': (url) => {
    return new Promise((resolve, reject) => {
      console.log(url)
      superagent.get(url)
      .end((err, res) => {
        if (err.toString().indexOf('Bad Request') > 0) return reject('Invalid url/request.')
        if (err) return reject(err)
        return resolve(res.body)
      })
    })
  },
  'getTime': msg => {
    return new Promise((resolve, reject) => {
      let argsTime = msg.content.split(' ')
      if (argsTime.length !== 2) reject('Usage: !time [timezone]')
      let date = new Date()
      let hour = date.getUTCHours() - 1

      if (Timezone.hasOwnProperty(argsTime[1].toLowerCase())) {
        hour += Timezone[argsTime[1].toLowerCase()]
      } else if (argsTime[1].toLowerCase() === 'gmt' || argsTime[1].toLowerCase() === 'utc') {
        if (argsTime[2] !== undefined) {
          let modifier = argsTime[2].toLowerCase()
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
      resolve('It is currently **' + hour + ':' + minutes + '** in **' + argsTime[1] + '**')
    })
  },
  'deleteCommand': msg => {
    msg.delete(1200)
  },
  'formatUDString' : (res, word) => {
    return '```Word: '+ word +'\nDefintion: '+res.list[0].definition+'```'
  }
}
