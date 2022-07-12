'use strict'

const fs = require('fs')
const cron = require('node-cron')
const whatsapp = require('../model/whatsapp')

const getScheduler = (req, res) => {
    const { token } = req.body

    if ( token ) {
        let json = getJsonScheduler(token)
        if ( json ) {
            return res.send({status: true, data: json})
        } else {
            return res.status(404).send({status: false, message: 'Not Found'})
        }
    }
    res.send({status: false, error: 'wrong parameters'})
}

const addScheduler = (req, res) => {
    const { token, type, data, time } = req.body
    if ( token, type, data, time ) {

        startScheduler(token, time, type, data)

        let json = getJsonScheduler(token)
        if ( json.length > 0 ) {
            json.push({type, data, time})
        } else {
            json = [{type, data, time}]
        }

        const result = writeJsonScheduler(token, json)
        return res.send({status: true, data: result})
    }
    res.send({status: false, error: 'wrong parameters'})
}

function getJsonScheduler(token) {
    const pathScheduler = `credentials/${token}/scheduler.js`
    if ( fs.existsSync(pathScheduler) ) {
        return JSON.parse( fs.readFileSync(pathScheduler, {encoding: 'utf-8'}) )
    }
    return false
}

function writeJsonScheduler(token, json) {
    const pathScheduler = `credentials/${token}/scheduler.js`
    fs.writeFileSync(pathScheduler, JSON.stringify(json, undefined, 2))
    return getJsonScheduler(token)
}

function startScheduler(token, time, type, data) {
    cron.schedule(time, () => {
        if ( type == 'sendText') {
            whatsapp.sendText(token, data.number, data.text)
        }
    })
}

function autostartScheduler(token) {
    const json = getJsonScheduler(token)
    json.forEach( x => {
        startScheduler(token, x.time, x.type, x.data)
    });
}

module.exports = {
    getScheduler,
    addScheduler,
    autostartScheduler
}