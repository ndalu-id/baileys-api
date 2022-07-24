'use strict'

const fs = require('fs')
const cron = require('node-cron')
const logger = require('../../lib/pino')
const whatsapp = require('../model/whatsapp')

let schedule = []

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
    const { token, id, type, data, time } = req.body
    if ( token, id, type, data, time ) {

        let json = getJsonScheduler(token)
        if ( json.length > 0 ) {
            const check = json.filter(x => x.id == id)
            if ( check.length > 0 ) return res.send({status: false, error: `Duplicate ID: ${id}`})
            json.push({id, type, data, time})
        } else {
            json = [{id, type, data, time}]
        }
        startScheduler(token, id, time, type, data)
        const result = writeJsonScheduler(token, json)
        return res.send({status: true, data: result})
    }
    res.send({status: false, error: 'wrong parameters'})
}

const stopScheduler = (req, res) => {
    const { token, id } = req.body
    if ( token && id ) {
        // console.log({token, id})
        let json = getJsonScheduler(token)
        const check = json.filter(x => x.id == id)
        if ( check.length == 0 ) return res.send({status: false, message: `ID: ${id} Not Found`})
        json.forEach( (x, i) => {
            if ( x.id == id) {
                json.splice(i, 1)
            }
        })
        writeJsonScheduler(token, json)
        if ( typeof schedule[token+'-'+id] !== 'undefined' ) {
            schedule[token+'-'+id].stop()
            return res.send({ status: true, message: `Scheduler ID: ${id} has been stopped` })
        }
        return res.send({ status: false, message: `Cannot stop scheduler if the scheduler not running`})
    }
    res.send({ status: false, message: "wrong parameters" })
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

function startScheduler(token, id, time, type, data) {
    schedule[token+'-'+id] = cron.schedule(time, () => {
        if ( type == 'sendText' ) {
            whatsapp.sendText(token, data.number, data.text)
        } else if (  type == 'sendMedia' ) {
            whatsapp.sendMedia(token, data.number, data.type, data.url, data.filName, data.caption)
        } else if ( type == 'sendButtonMessage') {
            whatsapp.sendButtonMessage(token, data.number, data.button, data.message, data.footer, data.type, data.image)
        } else if ( type == 'sendTemplateMessage') {
            whatsapp.sendTemplateMessage(token, data.number, data.button, data.text, data.footer, data.image)
        } else if ( type == 'sendListMessage' ) {
            whatsapp.sendListMessage(token, data.number, data.list, data.text, data.footer, data.title, data.buttonText)
        } else if ( type == 'sendListMessage' ) {
            whatsapp.sendListMessage(token, data.number, data.list, data.text, data.footer, data.title, data.buttonText)
        }
    })
}

function autostartScheduler(token) {
    try {
        const json = getJsonScheduler(token)
        json.forEach( x => {
            startScheduler(token, x.id, x.time, x.type, x.data)
        });
    } catch (error) {
        logger.info(`Scheduler ${token} not found`)
    }
}

module.exports = {
    getScheduler,
    addScheduler,
    autostartScheduler,
    stopScheduler
}