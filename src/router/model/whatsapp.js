'use strict'

// const { default: makeWASocket, makeWALegacySocket, downloadContentFromMessage } = require('@adiwajshing/baileys')
// const { useSingleFileAuthState, makeInMemoryStore, fetchLatestBaileysVersion, AnyMessageContent, delay, MessageRetryMap, useMultiFileAuthState } = require('@adiwajshing/baileys')
// const { DisconnectReason } = require('@adiwajshing/baileys')
const { default: makeWASocket, makeInMemoryStore, fetchLatestBaileysVersion, useMultiFileAuthState, downloadContentFromMessage, DisconnectReason } = require('../../baileys/lib')
const QRCode = require('qrcode')

const lib = require('../../lib')
const fs = require('fs')
let sock = []
let qrcode = []
let intervalStore = []
let intervalConnCheck = []
let counterQr = []

const axios = require('axios')

/***********************************************************
 * FUNCTION
 **********************************************************/
const MAIN_LOGGER = require('../../lib/pino')
const logger = MAIN_LOGGER.child({ level: 'info' })
 
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
    // const store = makeInMemoryStore({ logger })
    // store?.readFromFile(`credentials/${token}/multistore.js`)
    // {"chats":[],"contacts":{},"messages":{}}

    // interval
    // intervalStore[token] = setInterval(() => {
    //     try {
    //         store?.writeToFile(`credentials/${token}/multistore.js`)
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }, 10_000)
    intervalConnCheck[token] = setInterval(async () => {
        const check = await connectToWhatsApp(token, io)
        console.log(`> Interval check connection TOKEN: ${token}`, check)
    }, 1000 * 60 * 5)

    sock[token] = makeWASocket({
        version,
        // browser: ['Linux', 'Chrome', '103.0.5060.114'],
        // browser: Browsers.macOS('Ubuntu'),
        browser: ['Linux', 'Chrome', chrome?.data?.versions[0]?.version || '103.0.5060.114'],
        syncFullHistory: true,
        markOnlineOnConnect: false,
        downloadHistory: true,
        logger,
        printQRInTerminal: true,
        auth: state,
        level: 'silent',
        msgRetryCounterMap,
        getMessage: async key => {
            try {
                let msg = await readJsonFromFile({token, name: 'messages'})
                msg = msg.messages.filter( x => x.key.id === key.id)
                winstonLog({tag: 'resend-message', token: token, json: {
                    tag: 'resend-message',
                    message: 'resend message',
                    data: {
                        token: token,
                        msg: msg
                    }
                }})
                return msg.message
            } catch (error) {
                winstonLog({tag: 'error', token: token, json: {
                    tag: 'error-resend-message',
                    message: 'error resend message',
                    data: {
                        token: token,
                        error: error
                    }
                }})
                return {
                    conversation: 'Hello, this is resending message. But my message was lost. Please reply this message to tell me the message is lost.\n\nRegard web dev *ndalu.id*'
                }
            }
		}
    })

    // store?.bind(sock[token].ev)

    sock[token].ev.process(
		// events is a map for event name => event data
		async(events) => {
            // console.log(events)
			// something about the connection changed
			// maybe it closed, or we received all offline message or connection opened
			if(events['connection.update']) {
				const update = events['connection.update']
				const { connection, lastDisconnect, qr } = update

                winstonLog({tag: 'connection.update', token: token, json: {
                    tag: 'connection.update',
                    message: connection,
                    data: {
                        token: token,
                        update: update
                    }
                }})

                // CONNECTION CLOSE
                if(connection === 'close') {
                    delete qrcode[token]
                    if ( counterQr[token] < 5 ) {
                        connectToWhatsApp(token, io)
                        io.emit('connection-close', { token: token, message: 'Connecting'})
                    }
                }
				
                // QRCODE
                if (qr) {
                    counterQr[token] = (counterQr[token] || 0)
                    if ( counterQr[token] >= 5 ) {
                        io.emit('connection-close', { token: token, message: 'QR CODE Time Out'})
                        return await clearConnection(token)
                    }
                    counterQr[token]++
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
    
                // CONNECTION OPEN
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

                // DON't DELETE THIS FOR BACKUP
                // if ( lastDisconnect?.error) {
                //     if ( lastDisconnect.error.output.statusCode !== 408 || lastDisconnect.error.output.statusCode !== 515 ) {
                //         delete qrcode[token]
                //         connectToWhatsApp(token, io)
                //         io.emit('message', {token: token, message: "Reconnecting"})
                //     } else {
                //         io.emit('message', {token: token, message: lastDisconnect.error.output.payload.message, error: lastDisconnect.error.output.payload.error})
                //         delete qrcode[token]
                //         await clearConnection(token)
                //     }
                // }

                // console.log(`connection update TOKEN: ${token} ${new Date()}`, update)
			}

			// credentials updated -- save them
			if(events['creds.update']) {
				await saveCreds()
			}

			if(events.call) {
				console.log('recv call event', events.call)
                winstonLog({tag: 'call', token: token, json: {
                    tag: 'call',
                    message: 'chats set',
                    data: {
                        token: token,
                        call: events.call
                    }
                }})
			}

			// chat history received
			if(events['chats.set']) {
                const { chats, isLatest } = events['chats.set']
				console.log(`recv ${chats.length} chats (is latest: ${isLatest})`)
                winstonLog({tag: 'chats.set', token: token, json: {
                    tag: 'chats.set',
                    message: 'chats set',
                    data: {
                        token: token,
                        chatsSet: { chats, isLatest }
                    }
                }})
                writeJsonToFile({token: token, name: 'chats', json: { chats, isLatest }})
			}

			// message history received
			if(events['messages.set']) {
                const { messages, isLatest } = events['messages.set']
				console.log(`recv ${messages.length} messages (is latest: ${isLatest})`)
                winstonLog({tag: 'messages-set', token: token, json: {
                    tag: 'messages-set',
                    message: 'messages set',
                    data: {
                        token: token,
                        messagesSet: { messages, isLatest }
                    }
                }})
                writeJsonToFile({token: token, name: 'messages', json: { messages, isLatest }})
                console.log(messages.length.length)
			}

			if(events['contacts.set']) {
				const { contacts, isLatest } = events['contacts.set']
				console.log(`recv ${contacts.length} contacts (is latest: ${isLatest})`)
                winstonLog({tag: 'contacts-upsert', token: token, json: {
                    tag: 'contacts-upsert',
                    message: 'contacts upsert',
                    data: {
                        token: token,
                        contactsSet: { contacts, isLatest }
                    }
                }})
                writeJsonToFile({token: token, name: 'contacts', json: { contacts, isLatest }})
			}

			// received a new message
			if(events['messages-upsert']) {
                manageIncomingMessage({token, upsert: events['messages.upsert'], io})
			}

			// messages updated like status delivered, message deleted etc.
			if(events['messages.update']) {
				console.log('messages update ', events['messages.update'])
                winstonLog({tag: 'messages-update', token: token, json: {
                    tag: 'messages-update',
                    message: 'messages update',
                    data: {
                        token: token,
                        messagesUpdate: events['messages.update']
                    }
                }})
			}

			if(events['message-receipt.update']) {
				console.log('message receipt update ', events['message-receipt.update'])
                winstonLog({tag: 'message-receipt.update', token: token, json: {
                    tag: 'message-receipt.update',
                    message: 'message receipt update',
                    data: {
                        token: token,
                        messageReceiptUpdate: events['message-receipt.update']
                    }
                }})
			}

			if(events['messages.reaction']) {
				console.log('messages reaction', events['messages.reaction'])
                winstonLog({tag: 'messages-reaction', token: token, json: {
                    tag: 'messages-reaction',
                    message: 'messages reaction',
                    data: {
                        token: token,
                        messagesReaction: events['messages.reaction']
                    }
                }})
			}

			if(events['presence.update']) {
				console.log('presence.update', events['presence.update'])
                winstonLog({tag: 'presence.update', token: token, json: {
                    tag: 'presence.update',
                    message: 'messages reaction',
                    data: {
                        token: token,
                        presenceUpdate: events['presence.update']
                    }
                }})
			}

			if(events['chats.update']) {
				console.log('chats update ', events['chats.update'])
                winstonLog({tag: 'chats-update', token: token, json: {
                    tag: 'chats-update',
                    message: 'chats update',
                    data: {
                        token: token,
                        chatsUpdate: events['chats.update']
                    }
                }})
			}

			if(events['chats.delete']) {
				console.log('chats deleted ', events['chats.delete'])
                winstonLog({tag: 'chats-delete', token: token, json: {
                    tag: 'chats-delete',
                    message: 'chats delete',
                    data: {
                        token: token,
                        chatsDelete: events['chats.delete']
                    }
                }})
			}
		}
	)

    sock[token].ev.on('messages.upsert', m => {
        manageIncomingMessage({token, upsert: m, io})
    })

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
                    const sendingTextMessage = await sock[token].sendMessage(number[i], { text: text })
                    winstonLog({tag: 'sendText', token: token, json: {
                        tag: 'sendText',
                        message: 'Sending text',
                        data: {
                            token: token,
                            sendingTextMessage: sendingTextMessage
                        }
                    }})
                }, delay)
            }
            return `Sending ${number.length} message start`
        } else {
            const sendingTextMessage = await sock[token].sendMessage(number, { text: text }) // awaiting sending message
            winstonLog({tag: 'sendText', token: token, json: {
                tag: 'sendText',
                message: 'Sending text',
                data: {
                    token: token,
                    sendingTextMessage: sendingTextMessage
                }
            }})
            return sendingTextMessage
        }
    } catch (error) {
        console.log(error)
        winstonLog({tag: 'error', token: token, json: {
            tag: 'error-sendText',
            message: 'error send text',
            data: {
                token: token,
                error: error
            }
        }})
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
            console.log('Please add your own role of mimetype')
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

/** HELPER */
async function getChromeLates() {
    const req = await axios.get('https://versionhistory.googleapis.com/v1/chrome/platforms/linux/channels/stable/versions')
    return req
}

function clearConnection(token) {
    delete sock[token]
    delete qrcode[token]
    delete counterQr[token]
    clearInterval(intervalStore[token])
    clearInterval(intervalConnCheck[token])
    fs.rmdir(`credentials/${token}`, { recursive: true }, (err) => {
        if (err) {
            throw err;
        }
        console.log(`credentials/${token} is deleted`);
        return true
    });
    return true
}

async function getImageBase64(token, msg) {
    // download stream
    if ( msg.message.imageMessage ) {
        var stream = await downloadContentFromMessage(msg.message.imageMessage, 'image')
        var mimetype = msg.message.imageMessage.mimetype
    } else {
        var stream = await downloadContentFromMessage(msg.message.videoMessage, 'video')
        var mimetype = msg.message.videoMessage.mimetype
        if ( !msg.message.videoMessage.gifPlayback ) return false
    }
    let buffer = Buffer.from([])

    // awaiting stream
    for await(const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
    }
    // convert binary data to base64 encoded string
    return `data:${mimetype};base64,${buffer.toString('base64')}`
    // return 'data:image/png;base64,'+buffer.toString('base64');
}

function winstonLog({tag, token, json}) {
    winston.info(`${tag} - ${token} - ${JSON.stringify(json)}`)
}

function writeJsonToFile({token, name, json}) {
    const path = `credentials/${token}/${name}.json`
    if  ( fs.existsSync(path) ) {
        var arr = JSON.parse(fs.readFileSync(path))
        if ( name === 'messages') {
            json = {
                messages: [...arr.messages, ...json.messages],
                isLatest: json.isLatest
            }
        } else if ( name === 'chats') {
            json = {
                chats: [...arr.chats, ...json.chats],
                isLatest: json.isLatest
            }
        } else if ( name === 'contacts') {
            json = {
                contacts: [...arr.contacts, ...json.contacts],
                isLatest: json.isLatest
            }
        }
    }
    fs.writeFileSync(path, JSON.stringify(json))
}

function readJsonFromFile({token, name}) {
    const path = `credentials/${token}/${name}.json`
    if  ( fs.existsSync(path) ) {
        return {
            name: name,
            json: JSON.parse(fs.readFileSync(path))
        }
    }
    return {
        name: name,
        json: []
    }
}

async function manageIncomingMessage({token, upsert, io}) {
    upsert.isLatest = true
    writeJsonToFile({token, name: 'messages', json: upsert})
    // console.log( upsert.messages )
    if(upsert?.type === 'notify') {
        for(const msg of upsert.messages) {
            // if(!msg.key.fromMe && doReplies) {
            if(!msg.key.fromMe && msg.key.remoteJid !== 'status@broadcast') {

                try {
                    const id = msg.key.remoteJid
                    const pushName = msg.pushName
                    const messageType = Object.keys (msg.message)[0]
                    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || msg.message?.imageMessage?.caption || undefined
                    const contextInfo = msg.message?.extendedTextMessage?.contextInfo || undefined
                    const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || undefined
                    const key = msg.key
                    const message = msg.message
    
                    await sock[token].sendPresenceUpdate('unavailable', key.remoteJid)
                    io.emit('message-upsert', {token, id, pushName, messageType, text, key, message})
    
                    var dataSend = {
                        token: token,
                        key: key,
                        message: message
                    }
    
                    if ( msg?.message?.imageMessage || msg?.message?.videoMessage) {
                        dataSend.imageBase64 = await getImageBase64(token, msg)
                    }
    
                    console.log('recv messages TOKEN: '+token)
                    console.log({
                        token, id, pushName, messageType, text, contextInfo, quotedMessage, key, message
                    })
    
                    /** START WEBHOOK */
                    const url = process.env.WEBHOOK
                    if ( url ) {
                        axios.post(url, dataSend)
                        .then(function (response) {
                            if ( process.env.NODE_ENV === 'development' ) {
                                console.log(`\n> RESPONSE FROM WEBHOOK`)
                                console.log(response.data)
                            }
                        })
                        .catch(function (error) {
                            console.log(error)
                        });
                    }
                    /** END WEBHOOK */
                } catch (error) {
                    console.log(error)
                    winstonLog({tag: 'connection.update', token: token, json: {
                        tag: 'manageIncomingMessage',
                        message: 'Error manage incoming message',
                        data: {
                            token: token,
                            upsert: upsert
                        }
                    }})
                }

            }
        }
    }
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
