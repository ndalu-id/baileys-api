'use strict'

const fs = require('fs')

const chats = (req, res) => {

    const { token, type, jid } = req.body
    if ( token && type ) {
        try {
            const file = fs.readFileSync(`credentials/${token}/multistore.js`, {encoding:'utf8'})
            // parsing data to json
            let json = JSON.parse(file)
            if ( type === "chats" ) {
                json = json.chats
            } else if ( type === "contacts" ) {
                json = json.contacts
            } else if ( type === "messages" ) {
                if ( jid ) {
                    // json = Object.values(json.messages[jid])
                    json = json.messages[jid]
                } else {
                    json = json.messages
                }
            } else {
                return res.send({status: false, message: "Unknown type"})
            }
            if ( typeof json === 'undefined') return res.send({status: false, message: 'Data Not Found'})
            res.send(json.reverse())
        } catch (error) {
            console.log(error)
            res.send({status: false, error: error})
        }
    }
}

module.exports = {
    chats
}