const email = require('emailjs/email')
const config = require('../config.json')
const server = email.server.connect(config.email)

module.exports = function (subject, text) {
  return new Promise((resolve, reject) => {
    // send the message and get a callback with an error or details of the message that was sent
    server.send({
      text: text,
      from: config.email.from,
      to: config.email.to,
      // cc: "else <else@your-email.com>",
      subject: subject
    }, function (err, message) {
      console.log(err || message)
      if (err) {
        reject(err)
      }
      resolve(message)
    })
  })
}