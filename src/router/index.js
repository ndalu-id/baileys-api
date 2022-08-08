'use strict'

const express = require('express')
const router = express.Router()

/**
 * THIS IS MAIN ROUTER
 */
const wa = require('./model/routes')
const waDownload = require('./model/downloadWhatsappMedia')
const store = require('./model/store')
const scheduler = require('./model/scheduler')
const CryptoJS = require("crypto-js")
const validation = process.env.AUTH

// sendFile will from here. Delete or comment if no use anymore
router.get('/', (req, res) => {
    const path = require('path')
    res.sendFile(path.join(__dirname, '../public/index.html'));
})

router.get('/check-emit', (req, res) => {
    const path = require('path')
    res.sendFile(path.join(__dirname, '../public/check-emit.html'));
})

router.get('/docs', (req, res) => {
    const path = require('path')
    res.sendFile(path.join(__dirname, '../public/docs.html'));
})

router.get('/chats', (req, res) => {
    const path = require('path')
    const token = req.query.token
    res.sendFile(path.join(__dirname, '../public/chats.html'), {token});
})

// Check headers post from your PHP backend, don't forget to get
router.use((req, res, next) => {

    const authorization = req.headers.authorization
    // console.log(authorization)
    if ( typeof authorization == 'undefined' ) {
        return res.status(403).end('403 - Unauthorized')
    }

    const base64 = authorization.split(' ')[1]
    const parsedWord = CryptoJS.enc.Base64.parse(base64)
    const parsedStr = parsedWord.toString(CryptoJS.enc.Utf8)
    const check = parsedStr.substring(0, parsedStr.length - 1)
    const status = check === validation

    if (!status) {
        return res.status(403).end('403 - Authorization not allowed')
    }

    next()
})

// API WHATSAPP
router.post('/api/whatsapp/create-instance', wa.createInstance)
router.post('/api/whatsapp/send-text', wa.sendText)
router.post('/api/whatsapp/send-media', wa.sendMedia)
router.post('/api/whatsapp/send-button-message', wa.sendButtonMessage)
router.post('/api/whatsapp/send-template-message', wa.sendTemplateMessage)
router.post('/api/whatsapp/send-list-message', wa.sendListMessage)
router.post('/api/whatsapp/send-reaction', wa.sendReaction)
router.post('/api/whatsapp/is-exists', wa.isExists)
router.post('/api/whatsapp/get-profile-picture', wa.getPpUrl)
router.post('/api/whatsapp/delete-for-every-one', wa.deleteEveryOne)
router.post('/api/whatsapp/group-metadata', wa.groupMetadata)
router.post('/api/whatsapp/delete-credential', wa.deleteCredentials)

// DOWNLOAD
router.post('/api/whatsapp/download-media', waDownload.downloadWhatsappMedia)

// STORE
router.post('/api/whatsapp/store/chats', store.chats)

// SCHEDULER
router.post('/api/whatsapp/scheduler', scheduler.getScheduler)
router.post('/api/whatsapp/scheduler/add-scheduler', scheduler.addScheduler)
router.post('/api/whatsapp/scheduler/stop-scheduler', scheduler.stopScheduler)

module.exports = router