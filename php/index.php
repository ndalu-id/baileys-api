<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <style>
        html, body {
            margin: 0 0 0 0;
        }
        body {
            padding: 10px 10px 10px 10px;
        }
        #pre {
            background-color: black;
            color: white;
            padding: 10px 10px 10px 10px;
        }
        #qrcode-container {
            display: flex;
            justify-content: center;
        }
    </style>
    <!-- jquery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
    <!-- SOCKET.IO -->
    <!-- Check the server url to replace this -->
    <script src="http://localhost:3000/socket.io/socket.io.js"></script>
    <script>
        const socket = io("http://localhost:3000")
    </script>

</head>
<body>
    
<!-- THIS INPUT IS FOR POST TOKEN -->
<form id="token-form">
    This input is for post the Token
    <br />
    <input type="text" name="token">
    <input type="submit" name="submit">
    <br />
    <label for="">TOKEN</label>
    <br />
    <!-- YOU MUST PROVIDE THE TOKEN ON YOUR CLIENT SIDE, TO CHECK THE OWNER OF THE QRCODE, USE URL PARAMETER, QUERYSTRING, SESSIO OR JSONWEBOKEN AS DEFAULT VALUE-->
    <input id="token" type="text" placeholder="verified by token" disabled>
</form>

<!-- SAMPLE IMAGE TO GENERATE QRCODE -->
<div id="qrcode-container">
    <img id="qrcode" src="https://ndalu.id/favicon.png" alt="">
</div>

<!-- THIS JUST PRE FOR SHOWING THE JSON FROM SERVER -->
<pre id="pre">{
    message: "Here all the json will show"
}</pre>

<script>

    // prompter optional
    const pre = document.querySelector('#pre')
    // element token or your PHP session/database token
    const checkToken = document.querySelector('#token')
    // element image
    const qrcode = document.querySelector('#qrcode')
    // element post or when the button hit to post create-instance
    const form = document.querySelector('#token-form')
    if ( form ) form.addEventListener('submit', async (e) => {
        e.preventDefault()
        const token = document.querySelector('input[name="token"]')
        if (token.value) {
            checkToken.value = token.value
            $.post({
                url: 'getqr.php',
                data: {token: token.value},
                success: function(data) {
                    if (data.qrcode) { // if result has qrcode
                        qrcode.src = data.qrcode // set element image src to res.qrcode
                    }
                    return pre.innerHTML = JSON.stringify(data, undefined, 2)
                }
            })
        }
        pre.innerHTML = JSON.stringify({message: 'Token must not be empty'}, undefined, 2)
    })

    // CONSUME SOCKET IO CLIENT SIDE START
    // to receiving message from server
    socket.on('message', (data) => {
        // Check if token is same with te data.token, show the qrcode
        if (data.token === checkToken.value) { // remove if you want to watching entire connection
            console.log(data)
            pre.innerHTML = JSON.stringify(data, undefined, 2)
            if (data.message.error) {
                qrcode.src = "https://ndalu.id/favicon.png"
            }
        }
    })

    // to receiving whatsapp message from server ( watching whatsapp activity like receiving message, sending message, status@broadcast etc)
    socket.on('message-upsert', (data) => {
        // Check if token is same with te data.token, show the qrcode
        if (data.token === checkToken.value) { // remove if you want to watching entire connection
            pre.innerHTML = JSON.stringify(data, undefined, 2)
        }
    })

    // to receiving qrcode when starting connection
    socket.on('qrcode', (data) => {
        // Check if token is same with te data.token, show the qrcode
        if (data.token === checkToken.value) { // Don't remove or you will confuse if at the same time other people is request a qrcode too
            qrcode.src = data.data
            pre.innerHTML = JSON.stringify(data, undefined, 2)
        }
    })

    // when connection open, show the user and ppUrl
    socket.on('connection-open', (data) => {
        // Check if token is same with te data.token, show the qrcode
        if (data.token === checkToken.value) { // remove if you want to watching entire connection
            pre.innerHTML = JSON.stringify(data, undefined, 2)
            qrcode.src = data.ppUrl
        }
    })
    // CONSUME SOCKET IO CLIENT SIDE END

</script>

</body>
</html>