import { page, messanger_chats } from './functions.js'
import { encode, decode } from 'https://cdn.jsdelivr.net/npm/@msgpack/msgpack@3.1.1/dist.esm/index.mjs';
import { aesDecrypt, aesEncrypt, arrayBufferToPem, generateAESKey, rsaEncrypt, rsaDecrypt, blobToUint8Array } from "./Crypto.js"
import { url } from "./config.js"
import { show_notification, authorization, load } from "./functions.js"

var tasks = []
var socket = null
var isConnected = false
var isConnecting = false
var rsaPublic = null
var rsaPrivate = null
var rsaPublicServer = null
var aesKey = null
var aesServerKey = null
var keysReady = false
var socketReady = false
var messageQueue = []
var processingMessages = false
var mesCount = 0

async function generateKeys() {
    var keyPair = await window.crypto.subtle.generateKey({
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: { name: 'SHA-256' }
    }, true, ['encrypt', 'decrypt']);
    rsaPublic = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
    rsaPrivate = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
    keysReady = true;
    return true;
}

// Обработка очереди сообщений, ожидающих отправки
function processQueue() {
    if (!socketReady || processingMessages) return;
    processingMessages = true;
    while (messageQueue.length > 0) {
        var message = messageQueue.shift();
        send(message);
    }
    processingMessages = false;
}

// Устанавливаем соединение с сервером
export function connect() {
    socket = new WebSocket(url);
    isConnecting = true

    socket.onopen = async function () {
        isConnecting = false
        await generateKeys();
        var publicKeyPem = arrayBufferToPem(rsaPublic, 'PUBLIC KEY');
        // Отправляем публичный ключ для обмена
        socket.send(JSON.stringify({
            type: 'key_exchange',
            key: publicKeyPem
        }));
        isConnected = true;
        processQueue();
    };

    socket.onmessage = async function (event) {
        var rawData = event.data;

        if (rsaPublicServer) {
            if (aesServerKey) {
                const unit8Array = await blobToUint8Array(rawData);
                const decryptedAes = await aesDecrypt(unit8Array, aesKey);
                const decryptedData = decode(decryptedAes);
                if (decryptedData.type === 'messenger' && decryptedData.action === 'download_file') {
                    mesCount++;
                }
                // Здесь можно добавить вызов пользовательских колбэков, если необходимо TAG:callback
                if (tasks[decryptedData.ray_id]) {
                    tasks[decryptedData.ray_id](decryptedData)
                    delete tasks[decryptedData.ray_id]
                    return
                }
                
                if (decryptedData.type === 'messenger' && decryptedData.action === 'new_message' && window.location.pathname.split("/").pop() == 'index.html') {
                    if (localStorage.getItem('samples') && localStorage.getItem('hiddenUsers') && !JSON.parse(localStorage.getItem('hiddenUsers')).includes(decryptedData.uid.toString())) {
                        JSON.parse(localStorage.getItem('samples')).forEach(sample => {
                            if (sample.message.toLowerCase() == JSON.parse(decryptedData.message).text.toLowerCase()) {
                                send({
                                    type: "messenger",
                                    action: "send_message",
                                    uid: decryptedData.uid,
                                    message: sample.response,
                                    temp_mid: 100
                                })
                            }
                        })
                    }
                }
            } else {
                const unit8Array = await blobToUint8Array(rawData);
                const decryptedRsa = await rsaDecrypt(unit8Array, rsaPrivate);
                const decryptedData = decode(decryptedRsa);

                if (decryptedData.type && decryptedData.type === 'aes_key') {
                    aesServerKey = decryptedData.key;
                    socketReady = true;
                    show_notification('Статус подключения', 'Подключено')
                    document.querySelector('loader').remove()
                    // ВСЁ СОКЕТ ГОТОВ ПИЗДЕТЬ
                    if (localStorage.getItem('S-Key') && window.location.pathname.split("/").pop() == 'index.html') {
                        send({
                            type: 'authorization',
                            action: 'connect',
                            S_KEY: localStorage.getItem('S-Key')
                        }, authorization)
                    } else {
                        load()
                    }
                    processQueue();
                }
            }
        } else {
            var data = JSON.parse(rawData);
            if (data.type === 'key_exchange') {
                rsaPublicServer = data.key;
                aesKey = generateAESKey();
                const aesKeyPayload = encode({
                    type: 'aes_key',
                    key: aesKey
                });
                const encryptedPayload = await rsaEncrypt(aesKeyPayload, rsaPublicServer);
                socket?.send(encryptedPayload);
            }
        }
    };

    socket.onclose = function () {
        disconnect();
        setTimeout(() => {if (isConnecting) { return }; connect()}, 5000);
    };

    socket.onerror = function (error) {
        show_notification("Подключение", "Проверьте интернет соединение")
        disconnect();
        setTimeout(() => {if (isConnecting) { return }; connect()}, 5000);
    };
}

export async function send(data, callback=false) {
    if (!isConnected || !socket || socket.readyState !== WebSocket.OPEN || !socketReady) {
        console.log('Отправка сообщения на сервер, но сокет не открыт', data)
        messageQueue.push(data)
        if (!isConnecting || socket.readyState !== WebSocket.CONNECTING) {
            connect()
        }
        setTimeout(() => send(data, callback), 500)
        return
    }

    function gen_ray_id(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let result = ''
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length)
            result += characters[randomIndex]
        }
        return result
    }
    var ray_id = gen_ray_id(15)
    data.ray_id = ray_id

    if (callback) {
        tasks[data.ray_id] = callback
    }

    const binaryData = encode({ ray_id, ...data });
    const encrypted = await aesEncrypt(binaryData, aesServerKey);
    socket.send(encrypted);
}

// Разрыв соединения
function disconnect() {
    isConnecting = false
    if (socket) {
        if (socket.readyState === WebSocket.OPEN) {
            socket.close();
        }
        socket = null
    }
    isConnected = false
    rsaPublic = null
    rsaPrivate = null
    rsaPublicServer = null
    aesKey = null
    aesServerKey = null
    keysReady = false
    socketReady = false
}

window.addEventListener('load', () => {
    connect()
})