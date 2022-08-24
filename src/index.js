'use strict'

const fs = require('fs')
// check .env config
if ( !fs.existsSync('.env') ) {
    console.log('----------\n> env is not found\n> EXITED\n----------')
    process.exit(0)
}
// check folder credentials
if ( !fs.existsSync('credentials') ) {
    console.log('----------\n> credentials folder is not found\n----------')
    fs.mkdirSync('credentials')
    console.log('----------\n> credentials folder is created\n----------')
}

require('dotenv').config()
const lib = require('./lib')
global.log = lib.log
global.winston = lib.winston

/**
 * CHECK THE .ENV FIRST
 */
const port = process.env.PORT

if ( !port ) {
    log.fatal('PLEACE CHECK YOUR .env FILE')
    process.exit(1)
}
log.info('YOUR .env FILE is configured')

/**
 * EXPRESS FOR ROUTING
 */
const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)

/**
 * SOCKET.IO
 */
const io = require('socket.io')(server,{
    cors: {
      origin: process.env.ORIGIN
    }
});
// middleware
app.use( (req, res, next) => {
    res.set('Cache-Control', 'no-store')
    req.io = io
    // res.set('Cache-Control', 'no-store')
    next()
})
io.setMaxListeners(0)

/**
 * PARSER
 */
// body parser
const bodyParser = require('body-parser')
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use(express.static('src/public'))
app.use(require('./router'))

app.get('/*', (req, res) => {
    res.status(404).end('404 - PAGE NOT FOUND')
})

// console.log(process.argv)

server.listen(port, log.info(`Server run and listening port: ${port}`))

function autostartInstance() {
    
    const wa = require('./router/model/whatsapp')
    const scheduler = require('./router/model/scheduler')

    // looking for credentials saved
    const fs = require('fs')
    const path = 'credentials'
    const file = fs.readdirSync(path)
    let token = file.filter( x => x != 'store')
    token = token.map( x => x.split('.')[0])

    // looping credentials to reconnecting
    log.info(`Found ${token.length} credential${token.length > 1 ? '\'s' : ''}`)
    for ( let i = 0; i < token.length; i++ ) {
        const delay = i * 2000 // set delay 2 second each credentials. You can edit here for the delay
        setTimeout(async() => {
            log.info(`Reconnecting session ${token[i]}`)

            let connect
            try {
                connect = await wa.connectToWhatsApp(token[i], io)
                scheduler.autostartScheduler(token[i])
            } catch (error) {
                connect = error
            }

            winston.info(`autostart - ${token[i]} - ${JSON.stringify({
                tag: 'autostart',
                message: 'System autostart by nDalu.id',
                data: {
                    token: token[i],
                    connect: connect
                }
            })}`)

        }, delay)
    }

}

// delaying app 5 second before autostart, to more eficient ram.
setTimeout(() => {
    autostartInstance()
}, 5000)