'use strict'

const { downloadContentFromMessage } = require('../../baileys/lib')
const logger = require('../../lib/pino')
const fs = require('fs')

const downloadWhatsappMedia = async (req, res) => {
    let { token, message } = req.body

    if (!token && !message) return res.status(404).end('Not Found')

    // if (token !== 'pwekuk') return res.status(403).end('Forbidden')

    const messageType = Object.keys (message.message)[0]// get what type of message it is -- text, image, video
    const name = message.key.id
    let ext = 'document'
    let fileLength = 0
    let buffer = Buffer.from([])

    if ( !fs.existsSync('credentials/'+token+'/download/') ) {
        fs.mkdirSync('credentials/'+token+'/download/', { recursive: true });
    }

    let path = 'credentials/'+token+'/download/'

    let interval = []
    clearInterval(interval[name])

    try {
        if (messageType === 'documentMessage') {
            // download stream
            const stream = await downloadContentFromMessage(message.message.documentMessage, 'document')
            ext = message.message?.documentMessage.mimetype.split('/')[1]
            fileLength = message.message.documentMessage.fileLength
            path = path+name+'.'+ext

            if ( fs.existsSync(path) ) {
                // clearing interval
                clearInterval(interval[name])
                return res.send({status: false, message: name+'.'+ext+' has been downloaded'})
            }

            // awaiting stream
            for await(const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }
        }
        if (messageType === 'imageMessage') {
            // download stream
            const stream = await downloadContentFromMessage(message.message.imageMessage, 'image')
            ext = message.message?.imageMessage.mimetype.split('/')[1]
            fileLength = message.message.imageMessage.fileLength
            path = path+name+'.'+ext

            if ( fs.existsSync(path) ) {
                // clearing interval
                clearInterval(interval[name])
                return res.send({status: false, message: name+'.'+ext+' has been downloaded'})
            }

            // awaiting stream
            for await(const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }

        }
        if (messageType === 'videoMessage') {
            // download stream
            const stream = await downloadContentFromMessage(message.message.videoMessage, 'video')
            ext = message.message?.videoMessage.mimetype.split('/')[1]
            fileLength = message.message.videoMessage.fileLength
            path = path+name+'.'+ext

            if ( fs.existsSync(path) ) {
                // clearing interval
                clearInterval(interval[name])
                return res.send({status: false, message: name+'.'+ext+' has been downloaded'})
            }
            
            // awaiting stream
            for await(const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }
        }
        if (messageType === 'audioMessage') {
            // download stream
            const stream = await downloadContentFromMessage(message.message.audioMessage, 'audio')
            ext = message.message?.audioMessage.mimetype.split('/')[1]
            fileLength = message.message.audioMessage.fileLength
            path = path+name+'.'+ext

            if ( fs.existsSync(path) ) {
                // clearing interval
                clearInterval(interval[name])
                return res.send({status: false, message: name+'.'+ext+' has been downloaded'})
            }
            
            // awaiting stream
            for await(const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }
        }
        if (messageType === 'extendedTextMessage') {
            // logger.warn(message.message.extendedTextMessage)
            // download stream
            try {
                var stream = await downloadContentFromMessage(message.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage, 'video')
                ext = message.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage.mimetype.split('/')[1]
                fileLength = message.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage.fileLength
            } catch (error) {
                var stream = await downloadContentFromMessage(message.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage, 'image')
                ext = message.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage.mimetype.split('/')[1]
                fileLength = message.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage.fileLength
            }
            path = path+name+'.'+ext

            if ( fs.existsSync(path) ) {
                // clearing interval
                clearInterval(interval[name])
                return res.send({status: false, message: name+'.'+ext+' has been downloaded'})
            }
            
            // awaiting stream
            for await(const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }
        }

        interval[name] = setInterval(() => {
            req.io.emit('download', {token, message: 'Document '+name+'.'+ext +' transfered '+ Buffer.byteLength(buffer) + ' byte from '+fileLength +' byte'})
            logger.info('Document '+name+'.'+ext +' transfered '+ Buffer.byteLength(buffer) + ' byte from '+fileLength +' byte')
        }, 5_000)

        // clearing interval
        clearInterval(interval[name])

        // save to file
        fs.writeFileSync(path, buffer);
        logger.info('Downloaded document '+name+'.'+ext)
        setTimeout(() => {
            if ( fs.existsSync(path) ) {
                fs.unlinkSync(path)
            }
        }, 1000 * 60)
        return res.download(path)
    } catch (error) {
        logger.error(error)
        res.send({status: false, message: 'Failed downloading'})
    }
}

module.exports = {
    downloadWhatsappMedia
}