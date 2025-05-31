import { send, connect } from './ws.js'
import { t } from './languages/translate.js'
import { urls } from './config.js'

export function truncateText(text) {
    if (text.length > 7) {
        return text.slice(0, 6) + '...';
    }
    return text;
}

export const database = async (write=false, key, table, value, createIfNotExists=true) => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('element', 2)
        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(table) && createIfNotExists) {
                db.createObjectStore(table)
            }
        }
        request.onsuccess = (event) => {
            const tx = event.target.result.transaction(table, 'readwrite')
            const store = tx.objectStore(table)
            if (write) {
                store.put(value, key)
                resolve(true)
            } else {
                if (key) {
                    store.get(key).onsuccess = function(e) {
                        resolve(e.target.result)
                    }
                } else {
                    store.getAll().onsuccess = function(e) {
                        resolve(e.target.result)
                    }
                }
            }
        }
        request.onerror = (event) => {
            reject(event)
        }
    })
}

export function getMusic(id, output, notfound='') {
    if (typeof output == 'object') {
        output.src = notfound
    }
    return new Promise(async (resolve) => {
        var cache = await database(
            false,
            id,
            'cache'
        )
        if (cache) {
            var blob = new Blob([cache.file], { type: cache.ext })
        } else {
            const req = () => {
                return new Promise(async (resolve) => {
                    send({
                        type: 'download',
                        action: 'music',
                        song_id: id
                    }, audio => {
                        if (audio.status != 200) {
                            if (typeof output == 'object') {
                                output.src = notfound
                                return
                            } else { console.warn(`${id}: ${JSON.stringify(audio)}`); return }
                        }
                        database(
                            true,
                            id, 
                            'cache',
                            { file: audio.file.binary, ext: audio.file.mime }
                        )
                        blob = new Blob([audio.file.binary], { type: audio.file.mime })
                        resolve(blob)
                    })
                })
            }
            var blob = await req()
        }
        if (typeof output === 'function') { output(blob) } else if (typeof output == 'object') {
            output.src = URL.createObjectURL(blob)
        }
        resolve({ blob: blob, url: URL.createObjectURL(blob) })
    })
}

export async function getMedia(image, output, notfound='') {
    if (typeof output == 'object') {
        output.classList.add('loading-shimmer')
        output.src = 'assets/images/transparent.png'
        if (typeof {image} != 'object') { image = JSON.parse(image) }
        output.onerror = () => { output.src = notfound }
    }
    return new Promise(async (resolve) => {
        var cache = await database(
            false,
            (typeof image == 'string' ? image : JSON.stringify(image)),
            'cache'
        )
        if (cache) {
            var blob = new Blob([cache.file], { type: 'image/' + cache.ext })
        } else {
            const req = () => {
                return new Promise(async (resolve) => {
                    send({
                        type: 'download',
                        action: 'image',
                        image: image,
                        lossless: true
                    }, img => {
                        if (img.status != 200) {
                            if (typeof output == 'object') {
                                output.classList.remove('loading-shimmer')
                                output.src = notfound
                                return
                            } else { console.error(img); return }
                        }
                        database(
                            true,
                            JSON.stringify(image), 
                            'cache',
                            { file: img.file.buffer, ext: img.file.ext }
                        )
                        blob = new Blob([img.file.buffer], { type: 'image/' + img.file.ext })
                        resolve(blob)
                    })
                })
            }
            var blob = await req()
        }
        if (typeof output === 'function') { output(blob) } else if (typeof output == 'object') {
            output.src = URL.createObjectURL(blob)
        }
        resolve({ blob: blob, url: URL.createObjectURL(blob) })
    })
}


export function show_notification(title, desc, icon='https://elemsocial.com/static_sys/Images/DarkLogo.svg', autoClose=false, delay=2500) {
    if (delay < 300) {return}
    const notify = document.querySelector('#notification')
    if (notify.style.top == window.innerHeight - notify.clientHeight + 'px') {
        notify.style.top = window.innerHeight + 'px'
        setTimeout(() => {
            notify.querySelector('.title').textContent = title
            notify.querySelector('.description').textContent = desc
            notify.querySelector('img').src = icon
            notify.style.top = window.innerHeight - notify.clientHeight + 'px'
            if (!autoClose) {
                setTimeout(() => {notify.style.top = window.innerHeight + 'px'}, delay)
            }
        }, 300)
        return
    }

    notify.querySelector('.title').textContent = title
    notify.querySelector('.description').textContent = desc
    notify.querySelector('img').src = icon
    notify.style.top = window.innerHeight - notify.clientHeight + 'px'
    if (!autoClose) {
        setTimeout(() => {notify.style.top = window.innerHeight + 'px'}, delay)
    }
}

export function parseTags(text) {
    let redacted = ''
    text.split(' ').forEach(word => {
        if (word.startsWith('t')) {
            const key = word.slice(1)
            redacted += (icons[key] || '') + ' '
        } else {
            redacted += word + ' '
        }
    })
    return redacted.trim()
}

export function scalePhoto(imgWidth, imgHeight, maxWidth = 500, maxHeight = 350) {
    let scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
    return {
        width: Math.round(imgWidth * scale),
        height: Math.round(imgHeight * scale)
    };
}

export const authorization = (response) => {
    if (response.status === 'error') {
        localStorage.removeItem("S-Key")
        location.href = 'auth.html'
        return
    } else if (response.status === 'success') {
        load()
        localStorage.setItem('udata', JSON.stringify(response.accountData))
        document.querySelector('header').querySelector('.count').textContent = response.accountData.e_balls
            
        getMedia(JSON.parse(response.accountData.avatar), document.querySelector('header img'), 'assets/images/no-avatar.png')
        getMedia(JSON.parse(response.accountData.avatar), settings.querySelector('#avatar'), 'assets/images/no-avatar.png')
        getMedia(JSON.parse(response.accountData.cover), settings.querySelector('#cover'), 'assets/images/no-cover.png')
    }
}

export const page = (name) => {
    return window.location.pathname.split('/').pop() == name
}

export const messanger_chats = (decryptedData) => {
    decryptedData.chats.forEach(chat => {
        if (localStorage.getItem('samples') && localStorage.getItem('hiddenUsers') && !JSON.parse(localStorage.getItem('hiddenUsers')).includes(chat.id.toString())) {
            JSON.parse(localStorage.getItem('samples')).forEach(sample => {
                if (sample.message.toLowerCase() == chat.last_message.toLowerCase()) {
                    send({
                        type: "messenger",
                        action: "send_message",
                        message: sample.response,
                        temp_mid: 100,
                        target: {
                            id: chat.target.id,
                            type: chat.target.type
                        }
                    })
                }
            })
        }
        if (chat.notifications > 0 && JSON.parse(localStorage.getItem('udata')).id != chat.id && localStorage.getItem('hiddenUsers') && !JSON.parse(localStorage.getItem('hiddenUsers')).includes(chat.id.toString())) {
            Notification.requestPermission().then(permission => {
                if (permission === "granted" && localStorage.getItem('push-notifications')) {
                    new Notification(chat.name, {
                        icon: `${urls.avatars}/${chat.avatar}`,
                        body: chat.last_message
                    })
                } else {
                    show_notification(chat.name, chat.last_message, `${urls.avatars}/${chat.avatar}`, false, 3500)
                }
            });
        }
    })
}

export const load = async () => {
    if (page('index.html')) {
        await import('./settings.js')
        await import('./notifier.js')
        await import('./music.js')
        await import('./gold.js')
        await import('./posts/interaction.js')
        //await import('./extensions/tests.js')
    }
}