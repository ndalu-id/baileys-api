'use strict'

const wa = require('./whatsapp')
const lib = require('../../lib')

const createInstance = async (req, res) => {

    const { token } = req.body
    if ( token ) {
        try {
            const connect = await wa.connectToWhatsApp(token, req.io)
            const status = connect?.status
            const message = connect?.message
            return res.send({
                status: status,
                qrcode: connect?.qrcode,
                message: message ? message : 'Processing'
            })
        } catch (error) {
            console.log(error)
            return res.send({status: false, error: error})
        }
    }
    res.status(403).end('Token needed')

}

const sendText = async (req, res) => {

    const { token, number, text } = req.body

    if ( token && number && text ) {
        const sendingTextMessage = await wa.sendText(token, number, text)
        if (sendingTextMessage) {
            return res.send({status: true, data: sendingTextMessage})
        }
        return res.send({status: false, message: 'Check your connection'})
    }
    res.send({status: false, message: 'Check your parameter'})

}

const sendMedia = async (req, res) => {

    const { token, number, type, url, fileName, caption } = req.body

    if ( token && number && type && url && caption ) {
        const sendingMediaMessage = await wa.sendMedia(token, number, type, url, fileName, caption)
        if (sendingMediaMessage) return res.send({status: true, data: sendingMediaMessage})
        return res.send({status: false, message: 'Check your connection'})
    }
    res.send({status: false, message: 'Check your parameter'})

}

const sendButtonMessage = async (req, res) => {
    
    const { token, number, button, message, footer, type, image } = req.body
    
    if ( token && number && button && message && footer ) {
        const sendButtonMessage = await wa.sendButtonMessage(token, number, button, message, footer, type, image)
        if (sendButtonMessage) return res.send({status: true, data: sendButtonMessage})
        return res.send({status: false, message: 'Check your connection'})
    }
    res.send({status: false, message: 'Check your parameter'})

}

const sendTemplateMessage = async (req, res) => {

    const { token, number, button, text, footer, image } = req.body

    if ( token && number && button && text && footer ) {
        const sendTemplateMessage = await wa.sendTemplateMessage( token, number, button, text, footer, image )
        if (sendTemplateMessage) return res.send({status: true, data: sendTemplateMessage})
        return res.send({status: false, message: 'Check your connection'})
    }
    res.send({status: false, message: 'Check your parameter'})

}

const sendListMessage = async (req, res) => {
    
    const { token, number, list, text, footer, title, buttonText } = req.body

    if ( token && number && list && text && footer && title && buttonText ) {
        const sendListMessage = await wa.sendListMessage(token, number, list, text, footer, title, buttonText)
        if ( sendListMessage ) return res.send({status: true, data: sendListMessage})
        return res.send({status: false, message: 'Check your connection'})
    }
    res.send({status: false, message: 'Check your parameter'})

}

const sendReaction = async (req, res) => {
    
    const { token, number, text, key } = req.body

    if ( token && number && text && key ) {
        const sendReaction = await wa.sendReaction(token, number, text, key)
        if ( sendReaction ) return res.send({status: true, data: sendReaction})
        return res.send({status: false, message: 'Check your connection'})
    }
    res.send({status: false, message: 'Check your parameter'})

}

const isExists = async (req, res) => {
    
    const { token, number } = req.body
    
    if ( token && number ) {
        const isExists = await wa.isExist(token, number)
        if (isExists) return res.send({status: true, data: isExists})
        return res.send({status: false, message: 'Check your connection'})
    }
    res.send({status: false, message: 'Check your parameter'})

}

const getPpUrl = async (req, res) => {
    
    const { token, number, highrest } = req.body

    if ( token && number && highrest ) {
        const getPpUrl = await wa.getPpUrl(token, number, highrest)
        if ( getPpUrl ) return res.send({status: true, data: getPpUrl})
        return res.send({status: false, message: 'Check your connection'})
    }
    res.send({status: false, message: 'Check your parameter'})

}

const deleteEveryOne = async (req, res) => {
    
    const { token, number, key } = req.body

    if ( token && number && key ) {
        const deleteEveryOne = await wa.deleteEveryOne(token, number, key)
        if ( deleteEveryOne ) return res.send({status: true, data: deleteEveryOne})
        return res.send({status: false, message: 'Check your connection'})
    }
    res.send({status: false, message: 'Check your parameter'})

}

const groupMetadata = async (req, res) => {
    const { token, number } = req.body

    if (token && number) {
        const groupMetadata = await wa.groupMetadata(token, number)
        if ( groupMetadata ) return res.send({status: true, data: groupMetadata})
        return res.send({status: false, message: 'Check your connection'})
    }
    res.send({status: false, message: 'Check your parameter'})

}

const deleteCredentials = async (req, res) => {
    const { token } = req.body

    if (token) {
        const deleteCredentials = await wa.deleteCredentials(token)
        if ( deleteCredentials ) return res.send({status: true, data: deleteCredentials})
        return res.send({status: false, message: 'Check your connection'})
    }
    res.send({status: false, message: 'Check your parameter'})

}

module.exports = {
    
    createInstance,
    sendText,
    sendMedia,
    sendButtonMessage,
    sendTemplateMessage,
    sendListMessage,
    sendReaction,
    isExists,
    getPpUrl,
    deleteEveryOne,
    groupMetadata,
    deleteCredentials

}