<?php
header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
if ($method == "POST") {
    $_POST = json_decode(file_get_contents('php://input'), true);

    $token = isset($_POST['token']) ? $_POST['token'] : null;
    $key = isset($_POST['key']) ? $_POST['key'] : null;
    $message = isset($_POST['message']) ? $_POST['message'] : null;

    if ( $token && $key && $message ) {

        // do something this $token, $key and $message
        // This is sample if you want send back the conversation to the sender
        if ( isset($message['conversation']) ) { // In this case, I just reply if has message has conversation

            // START CURL
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, 'http://localhost:3000/api/whatsapp/send-text');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
                'token' => $token,
                'text' => $message['conversation'].'

*This is sample of autoreply*',
                'number' => $key['remoteJid']
            ]));
            $headers = array();
            $headers[] = 'Content-Type: application/json';
            $headers[] = 'Authorization: Basic TmRhbHUtc2VydmVyLXVVZGtmZ2xpNzgzcGtmbmxhc2tvZ29pZ2hyOg==';
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            $result = curl_exec($ch);
            
            // send back to app for the console.log() after send reply
            echo json_encode([
                'status' => true,
                'message' => 'Thank\'s for the JSON',
                'json' => ['token' => $token, 'key' => $key, 'message' => $message],
                'result' => $result
            ]);
        } else {
            // send back to app for the console.log() without reply
            echo json_encode([
                'status' => true,
                'message' => 'Thank\'s for the JSON',
                'json' => ['token' => $token, 'key' => $key, 'message' => $message]
            ]);
        }

    } else {
        echo json_encode([
            'status' => false,
            'message' => 'Wrong parameters'
        ]);
    }

}

?>