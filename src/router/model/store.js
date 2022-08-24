'use strict'

const fs = require('fs')
const whatsapp = require('./whatsapp')

const chats = async (req, res) => {

    const { token, type, jid } = req.body
    if ( token && type ) {
        try {
            if ( type === 'chats') {
                var json = JSON.parse(fs.readFileSync(`credentials/${token}/chats.json`))
                return res.send({type, json})
            } else if ( type === 'messages') {
                var json = JSON.parse(fs.readFileSync(`credentials/${token}/messages.json`))
                if ( jid ) {
                    json = json.messages.filter( x => x.key.remoteJid === jid)
                }
                return res.send({type, json})
            } else if ( type === 'contacts') {
                var json = JSON.parse(fs.readFileSync(`credentials/${token}/contacts.json`))
                return res.send({type, json})
            }
            return res.send({type, json: []})
            // if ( type === "chats" ) {
            //     json = json.chats
            // } else if ( type === "contacts" ) {
            //     if ( jid ) {
            //         json = json.contacts[jid]
            //         // json = json.contacts['6281215031288@s.whatsapp.net']
            //     } else {
            //         json = json.contacts
            //     }
            // } else if ( type === "messages" ) {
            //     if ( jid ) {
            //         json = json.messages[jid]
            //     } else {
            //         json = json.messages
            //         // const contacts = json.contacts
            //         // const arr = Object.entries(json.messages)
            //         // json = []
            //         // for ( var i = 0; i < arr.length; i++) {
            //         //     try {
            //         //         var name = contacts[arr[i][0]].notify
            //         //         // var image = await whatsapp.getPpUrl(token, contacts[arr[i][0]].id)
            //         //     } catch (error) {
            //         //         var name = arr[i][0]
            //         //         // var image = 'https://ndalu.id/favicon.png'
            //         //     }
            //         //     arr[i][2] = name
            //         //     arr[i][3] = 'https://ndalu.id/favicon.png'
            //         //     json = [...json, arr[i]]
            //         // }
            //     }
            // } else {
            //     return res.send({status: false, message: "Unknown type"})
            // }
            // if ( typeof json === 'undefined') return res.send({status: false, message: 'Data Not Found'})
            // // return res.send( json.length > 0 ? json : json )
            // return res.send({
            //     type, json
            // })
        } catch (error) {
            // process.env.NODE_ENV !== 'production' ? console.log(error) : null
            return res.send({status: false, error: error})
        }
    }

    res.send({status: false, error: 'wrong parameters'})
}

module.exports = {
    chats
}