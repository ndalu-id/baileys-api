'use strict'

const fs = require('fs')

const chats = async (req, res) => {

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
                    const contacts = json.contacts
                    const arr = Object.entries(json.messages)
                    json = []
                    for ( var i = 0; i < arr.length; i++) {
                        try {
                            var name = contacts[arr[i][0]].notify
                        } catch (error) {
                            var name = arr[i][0]
                        }
                        arr[i][2] = name
                        json = [...json, arr[i]]
                    }
                }
            } else {
                return res.send({status: false, message: "Unknown type"})
            }
            if ( typeof json === 'undefined') return res.send({status: false, message: 'Data Not Found'})
            return res.send( json.length > 0 ? json : json )
        } catch (error) {
            process.env.NODE_ENV !== 'production' ? console.log(error) : null
            return res.send({status: false, error: error})
        }
    }

    res.send({status: false, error: 'wrong parameters'})
}

module.exports = {
    chats
}