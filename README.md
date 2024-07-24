# Ndalu-wa-client

![Wa.ndalu.id!](https://wa.ndalu.id/favicon.png "Tofik Nuryanto")

    DEPENDENCIES : {
        "@adiwajshing/keyed-db": "^0.2.4",
        "@hapi/boom": "^10.0.0",
        "axios": "^0.27.2",
        "body-parser": "^1.20.0",
        "crypto-js": "^4.1.1",
        "dotenv": "^16.0.1",
        "express": "^4.18.1",
        "futoin-hkdf": "^1.5.1",
        "libsignal": "git+https://github.com/adiwajshing/libsignal-node",
        "link-preview-js": "^2.1.19",
        "music-metadata": "^8.0.1",
        "mysql": "^2.18.1",
        "node-cache": "^5.1.2",
        "node-cron": "^3.0.1",
        "pino": "^8.1.0",
        "pino-pretty": "^8.1.0",
        "protobufjs": "^7.0.0",
        "qrcode": "^1.5.0",
        "qrcode-terminal": "^0.12.0",
        "sharp": "^0.30.7",
        "socket.io": "^4.5.1",
        "uuid": "^8.3.2",
        "winston": "^3.8.1",
        "winston-daily-rotate-file": "^4.7.1",
        "ws": "^8.8.1"
    }

Whatsapp API based on [baileys](https://github.com/adiwajshing/Baileys).

Demo visit here [ndalu-wa.herokuapp.com](https://ndalu-wa.herokuapp.com/)

# Update

    Please share your log file if any error.
    Don't share your creds !!!!! Or if you trust me contact me on instagram

## HEROKU

[![How to deploy this app at HEROKU](https://img.youtube.com/vi/EMV7-LRyec4/0.jpg)](https://www.youtube.com/watch?v=EMV7-LRyec4 "How to deploy this app at HEROKU")

## TODO

    - download media ✔️
    - log to file every actifity (will input into database chat, will make app lighter) 🔥🔥🔥✔️✔️
    - group API (after mysql done) 🔥🔥🔥

## UPDATE

If imageMessage or videoMessage using gif webhook will receive imageBase64 for your media // feature by request Liu Bei. Thanks the donation btw.

REMOVE baileys from node_moduless. Add baileys own build to src folder. Fix LIST, BUTTON message and TEMPLATE.

Adding message type for scheduler

    - type == 'sendText'
    - type == 'sendMedia'
    - type == 'sendButtonMessage'
    - type == 'sendTemplateMessage'
    - type == 'sendListMessage'
    - type == 'sendListMessage'

Now you can use number as array in scheduler.

Update getMessage on retry sending message.

## EMIT LIST

    // This app is emitting event:
    event: 'connection-open'
    data: {token, user, ppUrl}

    event: 'message-upsert'
    data: {token, key, message}

    event: 'message'
    data: {message}

    event: 'qrcode'
    data: {token, data}

    event: 'message'
    data: {message}

    // Your client side use this on your js
    socket.on('event', (data) => {
        // do something with this data
        console.log(data)
    })

## DOCUMENTATION

    BEFORE INSTALLATION
    Create folder named credentials

    TO CLEAR YARN CACHE
    yarn clean cache

    TO INSTALL
    yarn install

    TO START DEVELOPER MODE
    WINDOWS: yarn win-dev
    LINUX: yarn dev
    VISIT: http://localhost:3000

    TO START production MODE
    WINDOWS: yarn win-start
    LINUX: yarn start

    If you deploy to VPS and your client side is different domain, make sure this rule:
    1. API https Client http
    2. API https Client https
    3. API http Client http

## ENV

    ALWAYS CHECK YOUR .env FILE
    PORT = 3000 // port for your nodejs api (http://localhost:3000)
    AUTH = Ndalu-server-uUdkfgli783pkfnlaskogoighr // key to protect your api server from attacker, you can change but must change the headers auth. Try using postman to generate the auth
    ORIGIN = http://localhost // your client domain
    WEBHOOK = http://localhost/webhook-catch-message-from-api

## EXAMPLE

![example page](/src/public/sample-page.png)

    run the app and open http://localhost:PORT
    I just add example page using static html. Remove this if you done with your update

    If you using PHP on client side you can check PHP folder.
    Index.php is client interface and post.php is controller to handle post to API

## WEBHOOK

    READ file src/router/model/whatsapp.js
    LINE 149

    /** START WEBHOOK */
    const url = process.env.WEBHOOK
    axios.post(url, {
        token: token,
        key: key,
        message: message
    })
    .then(function (response) {
        console.log(response);
        io.emit('message-upsert', {token, key, message: message, info: 'Your webhook is configured', response: response})
    })
    .catch(function (error) {
        console.log(error);
        io.emit('message-upsert', {token, key, message: message, alert: 'This is because you not set your webhook to receive this action', error: error})
    });
    /** END WEBHOOK */

    REPLACE the [url] value with your webhook url, this action will send all actifity to your webhook
    It send 3 value, token, key, and message. Do something action with your webhook.

    // deprecated, enntity to large
    If imageMessage or videoMessage using gif webhook will receive imageBase64 for your media // feature by request Liu Bei

## AUTOSTART INSTANCE

    WHEN YOU SEEN ERROR MESSAGE LIKE THIS

    ERROR [2022-06-12 09:02:00.173 +0700]: Cannot read property 'emit' of undefined
    err: {
      "type": "TypeError",
      "message": "Cannot read property 'emit' of undefined",
      "stack":
          TypeError: Cannot read property 'emit' of undefined
              at EventEmitter.<anonymous> (D:\9. nDalu.id\BLOG\wa.ndalu.express\NDALU-WA-CLIENT\src\router\model\whatsapp.js:112:20)
              at processTicksAndRejections (internal/process/task_queues.js:95:5)
    }

    It cause auto start not emitting data to client. It's ok

## CONNECTION

    curl --location --request POST 'localhost:3000/api/whatsapp/create-instance' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Basic TmRhbHUtc2VydmVyLXVVZGtmZ2xpNzgzcGtmbmxhc2tvZ29pZ2hyOg==' \
    --data-raw '{
        "token": "sometoken"
    }'

## DELETE INSTANCE (VERY RECOMENDED TO CLOSE FROM WHATSAPP DEVICE)

    curl --location --request POST 'localhost:3000/api/whatsapp/delete-credential' \
    --header 'Authorization: Basic TmRhbHUtc2VydmVyLXVVZGtmZ2xpNzgzcGtmbmxhc2tvZ29pZ2hyOg==' \
    --header 'Content-Type: application/json' \
    --data-raw '{
        "token": "token"
    }'

    RESPONSE
    {
        "status": true,
        "data": {
            "status": true,
            "message": "Deleting session and credential"
        }
    }

## SEND TEXT MESSAGE

    curl --location --request POST 'localhost:3000/api/whatsapp/send-text' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Basic TmRhbHUtc2VydmVyLXVVZGtmZ2xpNzgzcGtmbmxhc2tvZ29pZ2hyOg==' \
    --data-raw '{
        "token": "sometoken",
        "text": "Some text",
        "number": "000000@s.whatsapp.net"
    }'

    RESPONSE
    {
        "status": true,
        "message": {
            "key": {
                "remoteJid": "000000@s.whatsapp.net",
                "fromMe": true,
                "id": "BAE5297A96E02462"
            },
            "message": {
                "extendedTextMessage": {
                    "text": "This is text"
                }
            },
            "messageTimestamp": "1654779828",
            "status": "PENDING"
        }
    }

## SEND MEDIA

    curl --location --request POST 'localhost:3000/api/whatsapp/send-media' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Basic TmRhbHUtc2VydmVyLXVVZGtmZ2xpNzgzcGtmbmxhc2tvZ29pZ2hyOg==' \
    --data-raw '{
        "token": "sometoken",
        "number": "000000@s.whatsapp.net",
        "type": "image",
        "url": "https://www.accenture.com/t20200916T091441Z__w__/id-en/_acnmedia/Accenture/Redesign-Assets/DotCom/Images/Global/Hero/14/Accenture-Dutch-Flower-Group-Hero-768x432.jpg",
        "fileName": null,
        "caption": "Sample post image"
    }'

    RESPONSE
    {
        "status": true,
        "data": {
            "key": {
                "remoteJid": "000000@s.whatsapp.net",
                "fromMe": true,
                "id": "BAE59EA5D8DAA724"
            },
            "message": {
                "imageMessage": {
                    "url": "https://mmg.whatsapp.net/d/f/Aj_8pgwA2F-051ramSmyaSQ2UxFkJUfWeHfdb64102u6.enc",
                    "mimetype": "image/jpeg",
                    "caption": "Sample post image",
                    "fileSha256": "EAoHpByPmaXBROZdbDGFE0ny43akP1mtoOc0pVIVHZo=",
                    "fileLength": "50273",
                    "mediaKey": "kYMps2Okcz4hseS3Z0xYVi3GaHcRau+QM0yyFi1vMdM=",
                    "fileEncSha256": "T12a3I0clU6YXrJhbul9FnIhZNkFkBgvyRvtiYKcx4Y=",
                    "directPath": "/v/t62.7118-24/29985078_795739718081779_7756978664535743234_n.enc?ccb=11-4&oh=01_AVxl5oG_J7XfVxfogP2b-DU5ADW3RTbsUTxGXwtYs360FQ&oe=62C749F1",
                    "mediaKeyTimestamp": "1654781441",
                    "jpegThumbnail": "/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAASACADASIAAhEBAxEB/8QAGQAAAwEBAQAAAAAAAAAAAAAAAAUGBAED/8QAJxAAAgEDAgUEAwAAAAAAAAAAAQIDAAQREiEFEyJBYRQxUXEVkeH/xAAXAQEBAQEAAAAAAAAAAAAAAAADAgEE/8QAGhEAAgMBAQAAAAAAAAAAAAAAAAECETESE//aAAwDAQACEQMRAD8AuAayy8St4ndGJ1oRtj3+q9JpDHGWUZI7VPtfpFfOZWYIwORyiSue4+P1Wt0XBLWMfycz3GqIxGHcjU2M/wBphHdK8vLyC4GWAOcVIxM1zCY3tVKI7MsoGHI8jNd4ZdCC+aQS6mAwVHs/n7xQ+r6SoqT6pJUVprA6L65zpGeWN8eTRRTgMUX40XaFOk57bUquunjMgXYFckD5oooZ6dEMP//Z"
                }
            },
            "messageTimestamp": "1654781441",
            "status": "PENDING"
        }
    }

    TYPE LIST
    MEDIA DEFAULT
    type == 'image'
    type == 'video'
    type == 'audio'

    DOCUMENT
    type == 'pdf'
    type == 'xls'
    type == 'xlsx'
    type == 'doc'
    type == 'docx'
    type == 'zip'
    type == 'mp3'

    src/router/model/whatsapp.js start from line 222
    Update with your own mimetype if you need

## SEND BUTTON MESSAGE

    curl --location --request POST 'localhost:3000/api/whatsapp/send-button-message' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Basic TmRhbHUtc2VydmVyLXVVZGtmZ2xpNzgzcGtmbmxhc2tvZ29pZ2hyOg==' \
    --data-raw '{
        "token": "sometoken",
        "number": "000000@s.whatsapp.net",
        "button": [
            {"displayText": "First Button"},
            {"displayText": "Second Button"},
            {"displayText": "Third Button"}
        ],
        "message": "Message using buttons",
        "footer": "Footer message",
        "type": "url",
        "image": "https://wa.ndalu.id/favicon.png"
    }'

    RESPONSE
    {
        "status": true,
        "data": {
            "key": {
                "remoteJid": "000000@s.whatsapp.net",
                "fromMe": true,
                "id": "BAE58396D9FC00F6"
            },
            "message": {
                "buttonsMessage": {
                    "imageMessage": {
                        "url": "https://mmg.whatsapp.net/d/f/Ajj14KBK6Td4y8sAhVMlH3BNcIyfArxxXiUf4LH8GQYH.enc",
                        "mimetype": "image/jpeg",
                        "caption": "Message using buttons",
                        "fileSha256": "Gu2aCbfn2d+siwhE6oY5l6h1V2swt904x7aVp471uag=",
                        "fileLength": "73382",
                        "mediaKey": "eOZ8nyOPTvPqh+jOubKhCF3saK8SO6978ZZWabgUVYo=",
                        "fileEncSha256": "iPYUnT/+c1GSA0Gwsr+rjhGOjid4VbCp8AjICNX88DY=",
                        "directPath": "/v/t62.7118-24/33538136_3309741435925578_5503761464211122759_n.enc?ccb=11-4&oh=01_AVzT742cWpk0CaKo0HjR0ruEfFVrO6aMJOCkh-ulv4gEsA&oe=62C7C20F",
                        "mediaKeyTimestamp": "1654782402",
                        "jpegThumbnail": "/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAgACADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABQYA/8QAJxAAAgEEAgAFBQEAAAAAAAAAAQIDAAQFESExEkFRYZEGIkJxwdH/xAAWAQEBAQAAAAAAAAAAAAAAAAAAAQL/xAAYEQEBAQEBAAAAAAAAAAAAAAABABECMf/aAAwDAQACEQMRAD8Av6k76XK5fOXNtZ3zWNpZEKzINs7kbqsoEtaRZi5tiwe4ZhchTwd68PG++h81npwqGsfiJ8njPqSPG31817DdRs6O/akb+Ojx+qrqAgaylz8ECMBcW6vMVUb5YaIJ8vWn6cukfbUR4obvJywywg/j9y6JAHY9RulZC6oSihm8hvW6l85hb7OSQywSLaspIckEH5HJPt1VaTFqYI8lJbrCEeKNdMB2D5D/AD2pKpjAYm8wiuLjV1K77Urs6Gtb2f7VMpJUEjR1yPShL//Z"
                    },
                    "contentText": "Message using buttons",
                    "buttons": [
                        {
                            "buttonId": "0",
                            "buttonText": {
                                "displayText": "First Button"
                            },
                            "type": "RESPONSE"
                        },
                        {
                            "buttonId": "1",
                            "buttonText": {
                                "displayText": "Second Button"
                            },
                            "type": "RESPONSE"
                        },
                        {
                            "buttonId": "2",
                            "buttonText": {
                                "displayText": "Third Button"
                            },
                            "type": "RESPONSE"
                        }
                    ],
                    "headerType": "IMAGE"
                }
            },
            "messageTimestamp": "1654782402",
            "status": "PENDING"
        }
    }

## SEND TEMPLATE MESSAGE

    (If you message is sent back to your device, check your desktop whatsapp. Fix on desktop. Bug from baileys)

    curl --location --request POST 'localhost:3000/api/whatsapp/send-template-message' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Basic TmRhbHUtc2VydmVyLXVVZGtmZ2xpNzgzcGtmbmxhc2tvZ29pZ2hyOg==' \
    --data-raw '{
        "token": "sometoken",
        "number": "000000@s.whatsapp.net",
        "button": [
            {"displayText": "Visit my website", "url": "https://wa.ndalu.id"},
            {"displayText": "Call me", "phoneNumber": "000000"},
            {"displayText": "Push to reply", "id": "id-like-buttons-message"}
        ],
        "text": "Message using buttons",
        "footer": "Footer message",
        "image": "https://wa.ndalu.id/favicon.png"
    }'

    RESPONSE
    {
        "status": true,
        "data": {
            "key": {
                "remoteJid": "000000@s.whatsapp.net",
                "fromMe": true,
                "id": "BAE5DF8FA196F0DE"
            },
            "message": {
                "templateMessage": {
                    "hydratedTemplate": {
                        "hydratedContentText": "Hi it's a template message",
                        "hydratedFooterText": "Hello World",
                        "hydratedButtons": [
                            {
                                "urlButton": {
                                    "displayText": "⭐ Star Baileys on GitHub!",
                                    "url": "https://github.com/adiwajshing/Baileys"
                                },
                                "index": 1
                            },
                            {
                                "callButton": {
                                    "displayText": "Call me!",
                                    "phoneNumber": "+1 (234) 5678-901"
                                },
                                "index": 2
                            },
                            {
                                "quickReplyButton": {
                                    "displayText": "This is a reply, just like normal buttons!",
                                    "id": "id-like-buttons-message"
                                },
                                "index": 3
                            }
                        ]
                    }
                }
            },
            "messageTimestamp": "1654783970",
            "status": "PENDING"
        }
    }

    // Unfortunally, image is not displayed for now, let me monitoring from github bailyes issues

## SEND LIST MESSAGE

    (NO IMAGE SUPPORTED, read baileys. https://github.com/adiwajshing/Baileys)

    curl --location --request POST 'localhost:3000/api/whatsapp/send-list-message' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Basic TmRhbHUtc2VydmVyLXVVZGtmZ2xpNzgzcGtmbmxhc2tvZ29pZ2hyOg==' \
    --data-raw '{
        "token": "sometoken",
        "number": "000000@s.whatsapp.net",
        "list": [
            {
                "title": "Section 1",
                "rows": [
                    {"title": "Option 1", "rowId": "option1"},
                    {"title": "Option 2", "rowId": "option2", "description": "This is a description"}
                ]
            },
            {
                "title": "Section 2",
                "rows": [
                    {"title": "Option 3", "rowId": "option3", "description": "This is a description"},
                    {"title": "Option 4", "rowId": "option4"}
                ]
            }
        ],
        "text": "This is a text",
        "footer": "And this is a footer",
        "link": "https://wa.ndalu.id",
        "title": "And this is TITLE",
        "buttonText": "Required, text on the button to view the list"
    }'

    RESPONSE
    {
        "status": true,
        "data": {
            "key": {
                "remoteJid": "000000@s.whatsapp.net",
                "fromMe": true,
                "id": "BAE56E515A609CD5"
            },
            "message": {
                "listMessage": {
                    "title": "And this is TITLE",
                    "description": "This is a text",
                    "buttonText": "Required, text on the button to view the list",
                    "listType": "SINGLE_SELECT",
                    "sections": [
                        {
                            "title": "Section 1",
                            "rows": [
                                {
                                    "title": "Option 1",
                                    "rowId": "0"
                                },
                                {
                                    "title": "Option 2",
                                    "description": "This is a description",
                                    "rowId": "1"
                                }
                            ]
                        },
                        {
                            "title": "Section 2",
                            "rows": [
                                {
                                    "title": "Option 3",
                                    "description": "This is a description",
                                    "rowId": "0"
                                },
                                {
                                    "title": "Option 4",
                                    "rowId": "1"
                                }
                            ]
                        }
                    ],
                    "footerText": "And this is a footer"
                }
            },
            "messageTimestamp": "1654784580",
            "status": "PENDING"
        }
    }

## SEND REACTION

    curl --location --request POST 'localhost:3000/api/whatsapp/send-reaction' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Basic TmRhbHUtc2VydmVyLXVVZGtmZ2xpNzgzcGtmbmxhc2tvZ29pZ2hyOg==' \
    --data-raw '{
        "token": "sometoken",
        "number": "000000@s.whatsapp.net",
        "text": "🦖",
        "key": {
            "remoteJid": "000000@s.whatsapp.net",
            "fromMe": true,
            "id": "BAE56E515A609CD5"
        }
    }'

    RESPONSE
    {
        "status": true,
        "data": {
            "key": {
                "remoteJid": "000000@s.whatsapp.net",
                "fromMe": true,
                "id": "BAE5D730190A2628"
            },
            "message": {
                "reactionMessage": {
                    "key": {
                        "remoteJid": "000000@s.whatsapp.net",
                        "fromMe": true,
                        "id": "BAE56E515A609CD5"
                    },
                    "text": "🦖"
                }
            },
            "messageTimestamp": "1654784998",
            "status": "PENDING"
        }
    }

## IS EXISTS

    curl --location --request POST 'localhost:3000/api/whatsapp/is-exists' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Basic TmRhbHUtc2VydmVyLXVVZGtmZ2xpNzgzcGtmbmxhc2tvZ29pZ2hyOg==' \
    --data-raw '{
        "token": "sometoken",
        "number": "000000@s.whatsapp.net"
    }'

    RESPONSE
    {
        "status": true,
        "data": {
            "exists": true,
            "jid": "000000@s.whatsapp.net"
        }
    }

## GET PROFILE PICTURE URL

    curl --location --request POST 'localhost:3000/api/whatsapp/get-profile-picture' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Basic TmRhbHUtc2VydmVyLXVVZGtmZ2xpNzgzcGtmbmxhc2tvZ29pZ2hyOg==' \
    --data-raw '{
        "token": "sometoken",
        "number": "000000@s.whatsapp.net",
        "highrest": true
    }'

    RESPONSE
    {
        "status": true,
        "data": "https://pps.whatsapp.net/v/t61.24694-24/175575661_389612149492065_1766253441851505238_n.jpg?ccb=11-4&oh=be11861a0046460383de6c9da800a184&oe=62B101AD"
    }

## DELETE FOR EVERYONE

    curl --location --request POST 'localhost:3000/api/whatsapp/delete-for-every-one' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Basic TmRhbHUtc2VydmVyLXVVZGtmZ2xpNzgzcGtmbmxhc2tvZ29pZ2hyOg==' \
    --data-raw '{
        "token": "sometoken",
        "number": "000000@s.whatsapp.net",
        "key": {
            "remoteJid": "000000@s.whatsapp.net",
            "fromMe": true,
            "id": "134BB7213EB66BADD360D9A037F4FD19"
        }
    }'

    RESPONSE
    {
        "status": true,
        "data": {...data}
    }

## GROUP METADATA

    curl --location --request POST 'localhost:3000/api/whatsapp/group-metadata' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Basic TmRhbHUtc2VydmVyLXVVZGtmZ2xpNzgzcGtmbmxhc2tvZ29pZ2hyOg==' \
    --data-raw '{
        "token": "sometoken",
        "number": "000000@g.us"
    }'

    RESPONSE
    {
        "status": true,
        "data": {
            "id": "000000@g.us",
            "subject": "Wabot test",
            "creation": 1649779303,
            "owner": "000000@s.whatsapp.net",
            "restrict": false,
            "announce": false,
            "participants": [
                {
                    "id": "000000@s.whatsapp.net",
                    "admin": "superadmin"
                },
                {
                    "id": "000000@s.whatsapp.net",
                    "admin": null
                },
                {
                    "id": "000000000000@s.whatsapp.net",
                    "admin": null
                }
            ]
        }
    }

## STORE

    curl --location --request POST 'localhost:3000/api/whatsapp/store/chats' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Basic TmRhbHUtc2VydmVyLXVVZGtmZ2xpNzgzcGtmbmxhc2tvZ29pZ2hyOg==' \
    --data-raw '{
        "token": "sometoken",
        "type": "messages",
        "jid": "000000@s.whatsapp.net" // optional for type messages only
    }'
    // type : "chats" || "contacts" || "messages"

    RESPONSE "chats"
    [
        {
            "id": "000000@s.whatsapp.net",
            "conversationTimestamp": 1654788131,
            "unreadCount": 11
        },
        {
            "id": "0000000000@g.us",
            "conversationTimestamp": 1654787697,
            "unreadCount": 2
        },
        ...
    }

    RESPONSE "contacts"
    {
        "0000000000@g.us": {
            "id": "0000000000@g.us",
            "name": "The name of group"
        },
        "000000@g.us": {
            "id": "000000@s.whatsapp.net",
            "name": "The name of contacts"
        },
        ...
    }

    RESPONSE "messages"
    {
        "status@broadcast": [...{key, message, messageTimestamp, pushName}],
        "0000000@s.whatsapp.net": [...{key, message, messageTimestamp, pushName}]
    }

    RESPONSE "messages" WITH "jid"
    [
        {
            "key": {
                "remoteJid": "000000@s.whatsapp.net",
                "fromMe": true,
                "id": "BAE5D730190A2628"
            },
            "message": {
                "reactionMessage": {
                    "key": {
                        "remoteJid": "000000@s.whatsapp.net",
                        "fromMe": true,
                        "id": "BAE56E515A609CD5"
                    },
                    "text": "🦖"
                }
            },
            "messageTimestamp": "1654784998",
            "status": "PENDING"
        },
        {
            "key": {
                "remoteJid": "000000@s.whatsapp.net",
                "fromMe": true,
                "id": "BAE5DA01C6BAC242"
            },
            "message": {
                "reactionMessage": {
                    "text": "[object Object]"
                }
            },
            "messageTimestamp": "1654786716",
            "status": "PENDING"
        }
    ]

## DOWNLOAD MEDIA

After you have a data store (or you can build your own). You can get a message by getting message by jid.

For sample you ca get message from some jid using POST http://localhost:3000/api/whatsapp/store/chats (Read STORE docs). And you will get data like this

![example get message](/src/public/sample-get-store.png)

To download videoMessage from this data is just copy the blocked json like sample up there.

    curl --location --request POST http://localhost:3000/api/whatsapp/download-media \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Basic TmRhbHUtc2VydmVyLXVVZGtmZ2xpNzgzcGtmbmxhc2tvZ29pZ2hyOg==' \
    --data-raw '{
        "token": "sometoken",
        "message": {
            "key": {...},
            "message": {...}
        }
    }'

![example download file](/src/public/result-download.png)

file only ready for 1 hour

## IMPLEMENTING A DATA STORE

As mentioned earlier, Baileys does not come with a defacto storage for chats, contacts, messages. However, a simple in-memory implementation has been provided. The store listens for chat updates, new messages, message updates etc. to always have an up to date version of the data.

The store also provides some simple functions such as loadMessages that utilize the store to speed up data retrieval.

Note: I highly recommend building your own data store especially for MD connections, as storing someone's entire chat history in memory is a terrible waste of RAM. Connecting, deleting credential, connecting again will make your MD store mess up and last store will gone.

## GET SCHEDULER

    curl --location --request POST 'localhost:3000/api/whatsapp/scheduler' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Basic TmRhbHUtc2VydmVyLXVVZGtmZ2xpNzgzcGtmbmxhc2tvZ29pZ2hyOg==' \
    --data-raw '{
        "token": "sometoken"
    }'

    RESPONSE
    {
        "status": true,
        "data": [
            {
                "type": "sendText",
                "data": {
                    "number": "6285640465672@s.whatsapp.net",
                    "text": "scheduler text"
                },
                "time": "58 11 * * *"
            },
            {
                "type": "sendText",
                "data": {
                    "number": "6285640465672@s.whatsapp.net",
                    "text": "scheduler text"
                },
                "time": "58 11 * * *"
            }
        ]
    }

## ADD SCHEDULER

    curl --location --request POST 'localhost:3000/api/whatsapp/scheduler/add-scheduler' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Basic TmRhbHUtc2VydmVyLXVVZGtmZ2xpNzgzcGtmbmxhc2tvZ29pZ2hyOg==' \
    --data-raw '{
        "id": 1, // uniq id. Will be saved into scheduler.js. When system restarted this data will auto executed by node-cron
        "token": "test",
        "type": "sendText",
        "data": {
            "number": "000000@s.whatsapp.net",
            "text": "Pesan otomatis"
        },
        "time": "05 12 * * *"
    }'

    type : ['on update']
    data: ['on update']

    RESPONSE
    {
        "status": true,
        "data": [...data-cron]
    }

## STOP SCHEDULER

    curl --location --request POST 'localhost:3000/api/whatsapp/scheduler/stop-scheduler' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: Basic TmRhbHUtc2VydmVyLXVVZGtmZ2xpNzgzcGtmbmxhc2tvZ29pZ2hyOg==' \
    --data-raw '{
        "id": 1, // this id will stopped and deleted from scheduler.js. When system restarted node-cron not run it again
        "token": "test",
    }'

    RESPONSE
    {
        "status": true || false,
        "message": [Message status success or failed]
    }

## SUPPORT

Please Fork

Star :star:

Share

[Donation - Paypal](https://paypal.me/tofiknuryanto)

[Donation - Buy me a coffee](https://www.buymeacoffee.com/tofiknuryanto)

[Ask me on telegram ( Sometime slow response, sorry I'mm hungry )](https://t.me/ndaludotid)

Bank JAGO/Artos - 506443461704

Other BANK by chat telegram

Still updating every have a break time from my activity
