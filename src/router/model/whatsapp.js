'use strict'

const { default: makeWASocket, makeWALegacySocket, downloadContentFromMessage } = require('@adiwajshing/baileys')
const { useSingleFileAuthState, makeInMemoryStore, fetchLatestBaileysVersion, AnyMessageContent, delay, MessageRetryMap, useMultiFileAuthState } = require('@adiwajshing/baileys')
const { DisconnectReason } = require('@adiwajshing/baileys')
const QRCode = require('qrcode')

// const logger = require('../../lib/pino')
const lib = require('../../lib')
const fs = require('fs')
let sock = []
let qrcode = []
let intervalStore = []

const axios = require('axios')

/***********************************************************
 * FUNCTION
 **********************************************************/
//  import { Boom } from '@hapi/boom'
//  import makeWASocket, { AnyMessageContent, delay, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, MessageRetryMap, useMultiFileAuthState } from '../src'
 const MAIN_LOGGER = require('../../lib/pino')
 
 const logger = MAIN_LOGGER.child({ })
//  logger.level = 'trace'
 
const useStore = !process.argv.includes('--no-store')
 
// external map to store retry counts of messages when decryption/encryption fails
// keep this out of the socket itself, so as to prevent a message decryption/encryption loop across socket restarts
const msgRetryCounterMap = () => MessageRetryMap = { }

// start a connection
const connectToWhatsApp = async (token, io) => {

    if ( typeof qrcode[token] !== 'undefined' ) {
        console.log(`> QRCODE ${token} IS READY`)
        return {
            status: false,
            sock: sock[token],
            qrcode: qrcode[token],
            message: "Please scann qrcode"
        }
    }

    try {
        let number = sock[token].user.id.split(':')
        number = number[0]+'@s.whatsapp.net'        
        const ppUrl = await getPpUrl(token, number)
        io.emit('connection-open', {token, user: sock[token].user, ppUrl})
        return { status: true, message: 'Already connected'}
    } catch (error) {
        io.emit('message', {token, message: `Try to connecting ${token}`})
        console.log(`Try to connecting ${token}`)
    }

    const { state, saveCreds } = await useMultiFileAuthState(`credentials/${token}`)
    // fetch latest version of Chrome For Linux
    const chrome = await getChromeLates()
    console.log(`using Chrome v${chrome?.data?.versions[0]?.version}, isLatest: ${chrome?.data?.versions.length > 0 ? true : false}`)
    // fetch latest version of WA Web
    const { version, isLatest } = await fetchLatestBaileysVersion()
    console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)

    // the store maintains the data of the WA connection in memory
    // can be written out to a file & read from it
    const store = useStore ? makeInMemoryStore({ logger }) : undefined
    store?.readFromFile(`credentials/${token}/multistore.js`)

    // console.log(`\n\n\n-------------------`)
    // const file = fs.readFileSync(`credentials/test/multistore.js`, {encoding:'utf8'})
    // let json = JSON.parse(file)
    // json = json.messages['6282136795287@s.whatsapp.net']
    // console.log(json)
    // const getMessage = json.filter( x => x.key.id == '27C0E81F6FCB71E6BA4E431B668A0378')
    // console.log(getMessage[0].message)

    // save every 10s
    intervalStore[token] = setInterval(() => {
        try {
            store?.writeToFile(`credentials/${token}/multistore.js`)
        } catch (error) {
            console.log(error)
        }
    }, 10_000)

    sock[token] = makeWASocket({
        version,
        // browser: ['Linux', 'Chrome', '103.0.5060.114'],
        browser: ['Linux', 'Chrome', chrome?.data?.versions[0]?.version],
        logger,
        printQRInTerminal: true,
        auth: state,
        msgRetryCounterMap,
        // implement to handle retries
        // getMessage: (AnyMessageContent) => Promise(AnyMessageContent || undefined) // Not works
        getMessage: async key => {
            const file = fs.readFileSync(`credentials/${token}/multistore.js`, {encoding:'utf8'})
            let json = JSON.parse(file)
            json = json.messages[key.remoteJid]
            const getMessage = json.filter( x => x.key.id == key.id)
            const message = store.messages[key.remoteJid][0]
            console.log(`\n> resend message ${getMessage[0].message}`)
            return message
        }
    })

    store?.bind(sock[token].ev)

    // const sendMessageWTyping = async({msg: AnyMessageContent, jid: string}) => {
    //     await sock.presenceSubscribe(jid)
    //     await delay(500)

    //     await sock.sendPresenceUpdate('composing', jid)
    //     await delay(2000)

    //     await sock.sendPresenceUpdate('paused', jid)

    //     await sock.sendMessage(jid, msg)
    // }

    // sock[token].ev.on('call', item => console.log('recv call event', item))
    // sock[token].ev.on('chats.set', item => console.log(`recv ${item.chats.length} chats (is latest: ${item.isLatest})`))
    // sock[token].ev.on('messages.set', item => console.log(`recv ${item.messages.length} messages (is latest: ${item.isLatest})`))
    // sock[token].ev.on('contacts.set', item => console.log(`recv ${item.contacts.length} contacts`))

    sock[token].ev.on('messages.upsert', async m => {
        // console.log(JSON.stringify(m, undefined, 2))

        // const msg = m.messages[0]
        // if(!msg.key.fromMe && m.type === 'notify' && doReplies) {
        //     console.log('replying to', m.messages[0].key.remoteJid)
        //     // await sock.sendReadReceipt(msg.key.remoteJid, msg.key.participant, [msg.key.id])
        //     // await sendMessageWTyping({ text: 'Hello there!' }, msg.key.remoteJid)
        // }
        
        // console.log('got contacts', Object.values(store.chats))
        store?.writeToFile(`credentials/${token}/multistore.js`)

        const key = m.messages[0].key
        const message = m.messages[0].message
        
        console.log( {key, message} )

        await sock[token].sendPresenceUpdate('unavailable', key.remoteJid)
        io.emit('message-upsert', {token, key, message})

        /** START WEBHOOK */
        const url = process.env.WEBHOOK
        if ( url ) {
            axios.post(url, {
                token: token,
                key: key,
                message: message
            })
            .then(function (response) {
                console.log(`\n> RESPONSE FROM WEBHOOK`)
                console.log(response.data)
            })
            .catch(function (error) {
                console.log(error)
            });
        }
        /** END WEBHOOK */

    })

    // sock[token].ev.on('messages.update', m => console.log(m))
    // sock[token].ev.on('message-receipt.update', m => console.log(m))
    // sock[token].ev.on('presence.update', m => console.log(m))
    // sock[token].ev.on('chats.update', m => console.log(m))
    // sock[token].ev.on('chats.delete', m => console.log(m))
    // sock[token].ev.on('contacts.upsert', m => console.log(m))

    sock[token].ev.on('connection.update', async (update) => {
        const { connection, qr, lastDisconnect } = update
        if(connection === 'close') {
            // reconnect if not logged out
            if((lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut) {
                connectToWhatsApp(token, io)
            } else {
                console.log('Connection closed. You are logged out.')
                io.emit('message', {token: token, message: 'Connection closed. You are logged out.'})
                clearConnection(token)
            }
        }

        if (qr) {
            // SEND TO YOUR CLIENT SIDE
            QRCode.toDataURL(qr, function (err, url) {
                if (err) {
                    logger.error(err)
                }
                qrcode[token] = url
                try {
                    io.emit('qrcode', {token, data: url, message: "Qrcode updated, please scann with your Whatsapp Device"})
                } catch (error) {
                    lib.log.error(error)
                }
            })
        }

        if(connection === 'open') {
            logger.info('opened connection')
            logger.info(sock[token].user)
            await sock[token].sendPresenceUpdate('unavailable')

            let number = sock[token].user.id.split(':')
            number = number[0]+'@s.whatsapp.net'

            const ppUrl = await getPpUrl(token, number)
            io.emit('connection-open', {token, user: sock[token].user, ppUrl})
            delete qrcode[token]
        }

        if ( lastDisconnect?.error) {
            if ( lastDisconnect.error.output.statusCode !== 408 ) {
                delete qrcode[token]
                connectToWhatsApp(token, io)
                io.emit('message', {token: token, message: "Reconnecting"})
            } else {
                io.emit('message', {token: token, message: lastDisconnect.error.output.payload.message, error: lastDisconnect.error.output.payload.error})
                clearConnection(token)
            }
        }
    })
    
    // listen for when the auth credentials is updated
    sock[token].ev.on('creds.update', saveCreds)

    return {
        sock: sock[token],
        qrcode: qrcode[token]
    }
}

// text message
async function sendText(token, number, text) {

    try {
        if (Array.isArray(number)) {
            for ( let i = 0;  i < number.length; i++ ) {
                const random = Math.floor(Math.random() * (process.env.MAX - process.env.MIN + 1) + process.env.MIN)
                const delay = i * 1000 * random
                setTimeout(async () => {
                    await sock[token].sendMessage(number[i], { text: text })
                }, delay)
            }
            return `Sending ${number.length} message start`
        } else {
            const sendingTextMessage = await sock[token].sendMessage(number, { text: text }) // awaiting sending message
            return sendingTextMessage
        }
    } catch (error) {
        console.log(error)
        return false
    }

}

// media
async function sendMedia(token, number, type, url, fileName, caption) {

    /**
     * type is "url" or "local"
     * if you use local, you must upload into src/public/temp/[fileName]
     */

    try {
        if ( type == 'image' ) {
            var data = { image: url ? {url} : fs.readFileSync('src/public/temp/'+fileName), caption: caption ? caption : null}
        } else if ( type == 'video' ) {
            var data = { video: url ? {url} : fs.readFileSync('src/public/temp/'+fileName), caption: caption ? caption : null}
        } else if ( type == 'audio' ) {
            var data = { audio: url ? {url} : fs.readFileSync('src/public/temp/'+fileName), caption: caption ? caption : null}
        } else if ( type == 'pdf' ) {
            var data = { document: url ? {url} : fs.readFileSync('src/public/temp/'+fileName), mimetype: 'application/pdf'}
        } else if ( type == 'xls' ) {
            var data = { document: url ? {url} : fs.readFileSync('src/public/temp/'+fileName), mimetype: 'application/excel'}
        } else if ( type == 'xlsx' ) {
            var data = { document: url ? {url} : fs.readFileSync('src/public/temp/'+fileName), mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
        } else if ( type == 'doc' ) {
            var data = { document: url ? {url} : fs.readFileSync('src/public/temp/'+fileName), mimetype: 'application/msword'}
        } else if ( type == 'docx' ) {
            var data = { document: url ? {url} : fs.readFileSync('src/public/temp/'+fileName), mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}
        } else if ( type == 'zip' ) {
            var data = { document: url ? {url} : fs.readFileSync('src/public/temp/'+fileName), mimetype: 'application/zip'}
        } else if ( type == 'mp3' ) {
            var data = { document: url ? {url} : fs.readFileSync('src/public/temp/'+fileName), mimetype: 'application/mp3'}
        } else {
            console.log('Please add your won role of mimetype')
            return false
        }
        if (Array.isArray(number)) {
            for ( let i = 0;  i < number.length; i++ ) {
                const random = Math.floor(Math.random() * (process.env.MAX - process.env.MIN + 1) + process.env.MIN)
                const delay = i * 1000 * random
                setTimeout(async () => {
                    await sock[token].sendMessage(number[i], data)
                }, delay)
            }
            return `Sending ${number.length} message start`
        } else {
            var sendMsg = await sock[token].sendMessage( number, data )
            // console.log(sendMsg)
            return sendMsg
        }
    } catch (error) {
        console.log(error)
        return false
    }

}

// button message
async function sendButtonMessage(token, number, button, message, footer, type, image) {
    
    /**
     * type is "url" or "local"
     * if you use local, you must upload into src/public/temp/[fileName]
     */

    try {
        const buttons = button.map( (x, i) => {
            return {buttonId: i, buttonText: {displayText: x.displayText}, type: 1}
        })
        if (image) {
            var buttonMessage = {
                image: type == 'url' ? {url: image} : fs.readFileSync('src/public/temp/'+image),
                // jpegThumbnail: await lib.base64_encode(),
                caption: message,
                footer: footer,
                buttons: buttons,
                headerType: 4
            }
        } else {
            var buttonMessage = {
                text: message,
                footer: footer,
                buttons: buttons,
                headerType: 1
            }
        }
        if (Array.isArray(number)) {
            for ( let i = 0;  i < number.length; i++ ) {
                const random = Math.floor(Math.random() * (process.env.MAX - process.env.MIN + 1) + process.env.MIN)
                const delay = i * 1000 * random
                setTimeout(async () => {
                    await sock[token].sendMessage(number[i], buttonMessage)
                }, delay)
            }
            return `Sending ${number.length} message start`
        } else {
            const sendMsg = await sock[token].sendMessage(number, buttonMessage)
            return sendMsg
        }
    } catch (error) {
        console.log(error)
        return false
    }

}

// template message
async function sendTemplateMessage(token, number, button, text, footer, image) {
    
    try {
        const templateButtons = [
            {index: 1, urlButton: {displayText: button[0].displayText, url: button[0].url}},
            {index: 2, callButton: {displayText: button[1].displayText, phoneNumber: button[1].phoneNumber}},
            {index: 3, quickReplyButton: {displayText: button[2].displayText, id: button[2].id}},
        ]

        if ( image ) {
            var buttonMessage = {
                caption: text,
                footer: footer,
                templateButtons: templateButtons,
                image: {url: image}
            }
        } else {
            var buttonMessage = {
                text: text,
                footer: footer,
                templateButtons: templateButtons
            }
        }
        if (Array.isArray(number)) {
            for ( let i = 0;  i < number.length; i++ ) {
                const random = Math.floor(Math.random() * (process.env.MAX - process.env.MIN + 1) + process.env.MIN)
                const delay = i * 1000 * random
                setTimeout(async () => {
                    await sock[token].sendMessage(number[i], buttonMessage)
                }, delay)
            }
            return `Sending ${number.length} message start`
        } else {
            const sendMsg = await sock[token].sendMessage(number, buttonMessage)
            return sendMsg
        }

    } catch (error) {
        console.log(error)
        return false
    }

}

// list message
async function sendListMessage(token, number, list, text, footer, title, buttonText) {
    
    try {
        const sections = list.map( (x, i) => {
            return {
                title: x.title,
                rows: x.rows.map((xx, ii) => {
                    return {title: xx.title, rowId: ii, description: xx.description ? xx.description : null}
                })
            }
        })
        const listMessage = { text, footer, title, buttonText, sections }
        if (Array.isArray(number)) {
            for ( let i = 0;  i < number.length; i++ ) {
                const random = Math.floor(Math.random() * (process.env.MAX - process.env.MIN + 1) + process.env.MIN)
                const delay = i * 1000 * random
                setTimeout(async () => {
                    await sock[token].sendMessage(number[i], listMessage)
                }, delay)
            }
            return `Sending ${number.length} message start`
        } else {
            const sendMsg = await sock[token].sendMessage(number, listMessage)
            return sendMsg
        }
    } catch (error) {
        console.log(error)
        return false
    }

}

// reaction message
async function sendReaction(token, number, text, key) {
    
    try {
        const reactionMessage = {
            react: {
                text: text,
                key: key
            }
        }
        const sendMsg = await sock[token].sendMessage(number, reactionMessage)
        return sendMsg
    } catch (error) {
        console.log(error)
        return false
    }

}

// if exist
async function isExist(token, number) {
    
    try {
        const [result] = await sock[token].onWhatsApp(number)
        return result
    } catch (error) {
        return false
    }

}

// ppUrl
async function getPpUrl(token, number, highrest) {

    let ppUrl
    try {
        if (highrest) {
            // for high res picture
            ppUrl = await sock[token].profilePictureUrl(number, 'image')
        } else {
            // for low res picture
            ppUrl = await sock[token].profilePictureUrl(number)
        }

        return ppUrl
    } catch (error) {
        console.log(error)
        return false
    }
}

// delete for everyone
async function deleteEveryOne(token, number, key) {
    try {
        const deleteEveryOne = await sock[token].sendMessage(number, { delete: key })
        return deleteEveryOne
    } catch (error) {
        console.log(error)
        return false
    }
}

// group metadata
async function groupMetadata(token, number) {
    try {
        const metadata = await sock[token].groupMetadata(number) 
        return metadata
    } catch (error) {
        console.log(error)
        return false
    }
}

// close connection
function deleteCredentials(token) {
    try {
        delete sock[token]
        delete qrcode[token]
        clearInterval(intervalStore[token])
        fs.rmdir(`credentials/${token}`, { recursive: true }, (err) => {
            if (err) {
                throw err;
            }
            console.log(`credentials/${token} is deleted`);
        });
        // fs.existsSync('credentials/'+token.json) && fs.unlinkSync('credentials/'+token.json) && fs.existsSync('credentials/store/'+token.json) && fs.unlinkSync('credentials/store/'+token.json)
        return {
            status: true, message: 'Deleting session and credential'
        }
    } catch (error) {
        return {
            status: true, message: 'Nothing deleted'
        }
    }
}

async function getChromeLates() {
    const req = await axios.get('https://versionhistory.googleapis.com/v1/chrome/platforms/linux/channels/stable/versions')
    return req
}

function clearConnection(token) {
    clearInterval(intervalStore[token])
    delete sock[token]
    delete qrcode[token]
    fs.rmdir(`credentials/${token}`, { recursive: true }, (err) => {
        if (err) {
            throw err;
        }
        console.log(`credentials/${token} is deleted`);
    });
}

module.exports = {

    connectToWhatsApp,
    sendText,
    sendMedia,
    sendButtonMessage,
    sendTemplateMessage,
    sendListMessage,
    sendReaction,
    isExist,
    getPpUrl,
    deleteEveryOne,
    groupMetadata,
    deleteCredentials

}
