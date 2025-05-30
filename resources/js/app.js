if (localStorage.getItem('S-Key') && window.location.pathname.split("/").pop() !== 'index.html') {
    location.href = './index.html'
}

var tasks = []
var cache = {}

function scalePhoto(imgWidth, imgHeight, maxWidth = 500, maxHeight = 350) {
    let scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
    return {
        width: Math.round(imgWidth * scale),
        height: Math.round(imgHeight * scale)
    };
}

function loadSong(response, playlist) {
    const player = document.querySelector('.player')
    response.songs.forEach(song => {
        const item = document.createElement('div')
        item.className = 'item'
        item.setAttribute('data-mid', song.id)

        item.innerHTML += `
        <img class="image" src="${cover}">
        <p id="name">${song.title}</p>
        <p id="artist">${song.artist}</p>`
        
        item.addEventListener('click', () => {
            player.querySelector('audio').setAttribute('data-playlist', playlist)
            player.querySelector('audio').setAttribute('data-mid', song.id)
            player.querySelector('#name').textContent = song.title
            player.querySelector('#artist').textContent = song.artist
            getMedia(song.cover, player.querySelector('.image'), 'assets/images/no-music-cover.jpg')
            getMusic(song.id, player.querySelector('audio'))
            if (song.liked) {
                player.querySelectorAll('svg')[0].setAttribute('fill', 'currentColor')
            } else {
                player.querySelectorAll('svg')[0].setAttribute('fill', 'none')
            }
            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: song.title,
                    artist: song.artist,
                    album: song.album,
                    artwork: [
                        { src: `${cover}`, sizes: '200x200', type: 'image/jpeg' }
                    ]
                });
            }
        })

        document.querySelector('#music').querySelector('.' + playlist).appendChild(item)
        getMedia(song.cover, item.querySelector('img'), 'assets/images/no-music-cover.jpg')
    })
}

function parseTags(text) {
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

const icons = {
    verified: '<svg class="Icon" id="verified" viewBox="0 0 14 12" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M0.808312 2.95062C0.37935 3.6936 0.632055 4.63671 1.13747 6.52292L1.53952 8.0234C2.04493 9.90962 2.29763 10.8527 3.04061 11.2817C3.7836 11.7106 4.7267 11.4579 6.61292 10.9525L8.1134 10.5505C9.99961 10.0451 10.9427 9.79237 11.3717 9.04938C11.8006 8.3064 11.5479 7.36329 11.0425 5.47708L10.7855 4.51772L7.26808 8.03511L6.80991 8.49327C6.60769 8.69548 6.27984 8.69548 6.07763 8.49327L3.6093 6.02494C3.40708 5.82272 3.40708 5.49487 3.6093 5.29266L3.94388 4.95807C4.1461 4.75585 4.47395 4.75585 4.67617 4.95807L6.07764 6.35954C6.27985 6.56175 6.6077 6.56175 6.80992 6.35954L10.3289 2.84056C9.99633 1.69157 9.71499 1.05065 9.13938 0.718315C8.3964 0.289354 7.45329 0.542059 5.56707 1.04747L4.0666 1.44952C2.18038 1.95493 1.23727 2.20764 0.808312 2.95062Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M7.35912 9.04248L13.0281 3.37355C13.5336 2.86802 13.5336 2.04838 13.0281 1.54284L12.6935 1.20826C12.1879 0.702721 11.3683 0.702722 10.8628 1.20826L6.44378 5.62725L5.22538 4.40886C4.71984 3.90332 3.90021 3.90332 3.39467 4.40886L3.06008 4.74344C2.55455 5.24898 2.55455 6.06862 3.06008 6.57415L5.52841 9.04248C6.03395 9.54802 6.85358 9.54802 7.35912 9.04248ZM7.62111 7.8733C7.59582 7.81812 7.56315 7.78098 7.54268 7.7605L7.26808 8.03511L6.80991 8.49327C6.60769 8.69548 6.27984 8.69548 6.07763 8.49327L3.6093 6.02494C3.40708 5.82272 3.40708 5.49487 3.6093 5.29266L3.94388 4.95807C4.1461 4.75585 4.47395 4.75585 4.67617 4.95807L6.07764 6.35954C6.27985 6.56175 6.6077 6.56175 6.80992 6.35954L11.412 1.75747C11.6142 1.55525 11.9421 1.55525 12.1443 1.75747L12.4789 2.09206C12.6811 2.29427 12.6811 2.62213 12.4789 2.82434L7.54373 7.75945C7.58805 7.80295 7.62507 7.8619 7.64483 7.94092C7.65289 7.97316 7.65632 8.00398 7.65648 8.03285C7.65606 7.96735 7.6389 7.91213 7.62111 7.8733Z"></path></svg>',
    gold: '<svg class="Icon" id="gold" viewBox="0 0 12.7 12.7" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bbb"><stop offset="0" stop-color="#fab31e"></stop><stop offset="1" stop-color="#ffd479"></stop></linearGradient><linearGradient id="aaa"><stop offset="0" stop-color="#fab31e"></stop><stop offset=".744" stop-color="#ffd479"></stop></linearGradient></defs><path d="M7.296.694C7.106.646 5.043 4.02 4.898 4.078 4.752 4.137.927 3.16.824 3.327.72 3.494 3.29 6.497 3.3 6.65c.01.155-2.105 3.496-1.98 3.645.125.15 3.781-1.37 3.93-1.333.15.037 2.677 3.086 2.857 3.012.18-.073-.135-4.017-.055-4.148.08-.132 3.76-1.593 3.746-1.788-.014-.195-3.86-1.114-3.96-1.233-.1-.119-.353-4.065-.542-4.112z" fill="url(#aaa)" stroke="url(#bbb)" stroke-width="1.148" stroke-linejoin="round" paint-order="stroke fill markers"></path></svg>',
    play: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play"><polygon points="6 3 20 12 6 21 6 3"/></svg>',
    pause: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>',
    favorite: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    dev: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code-xml-icon lucide-code-xml"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>',
    k_connect: '<img src="https://elemsocial.com/static_sys/Images/Links/KConnect.svg"></img>',
    element: '<img src="https://elemsocial.com/favicon.ico"></img>',
}

function show_notification(title, desc, icon='https://elemsocial.com/static_sys/Images/DarkLogo.svg', autoClose=false, delay=2500) {
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

function checkUpdates() {
    var appVer = "2.0"
    if (!localStorage.getItem('AutoUpdates')) {
        localStorage.setItem('AutoUpdates', true)
    }
    if (localStorage.getItem('AutoUpdates')) {
        fetch('http://de2.kissboy.pro:4501/update/desktop/element', {
            method: 'POST',
            headers: {
              'Content-Type': "ElementDesktop/" + appVer
            }
          })
            .then(response => {
              if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
              }
              return response.json();
            })
            .then(data => {
              console.log('Ответ сервера:', data);
            })
            .catch(error => {
              console.error('Ошибка:', error);
            });          
    }
}

    if (Notification.permission !== "granted") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                if (localStorage.getItem('push-notifications')) {
                    new Notification("Успешно", {
                        body: "Push-уведомления успешно подключены"
                    });
                }
            }
        });
    }    
    if (window.location.pathname.split("/").pop() == 'auth.html') {
        var authDiv = document.querySelector('#auth')
        var notify = document.querySelector('#notification')
        // Адаптация под экраны
        authDiv.style.left = (window.innerWidth - authDiv.clientWidth) / 2 + 'px'
        authDiv.style.top = (window.innerHeight - authDiv.clientHeight) / 2 + 'px'
        notify.style.top = window.innerHeight + 'px'
        notify.style.left = window.innerWidth - notify.clientWidth + 'px'
        window.addEventListener('resize', () => {
            authDiv.style.left = (window.innerWidth - authDiv.clientWidth) / 2 + 'px'
            authDiv.style.top = (window.innerHeight - authDiv.clientHeight) / 2 + 'px'
            notify.style.top = window.innerHeight + 'px'
            notify.style.left = window.innerWidth - notify.clientWidth + 'px'
        })
    } else if (window.location.pathname.split("/").pop() == 'index.html') {
        var notify = document.querySelector('#notification')
        var posts = document.querySelector('.Posts')
        document.querySelectorAll('.modal-window').forEach(modal => {
            modal.style.left = (window.innerWidth - modal.clientWidth) / 2 + 'px'
            modal.style.top = (window.innerHeight - modal.clientHeight) / 2 + 'px'
        })

        notify.style.top = window.innerHeight + 'px'
        notify.style.left = window.innerWidth - notify.clientWidth + 'px'
        posts.style.left = (window.innerWidth - posts.clientWidth) / 2 + 'px'

        window.addEventListener('scroll', function() {
            if (window.scrollY + document.documentElement.clientHeight >= document.documentElement.scrollHeight - 1) {
                send({
                    type: 'social',
                    action: 'load_posts',
                    posts_type: 'last',
                    start_index: document.querySelector('.Posts').querySelectorAll('.Post').length
                })
            }
        });

        const musicModal = document.querySelector("#music");

        musicModal.querySelector('.favorites').addEventListener("scroll", () => {
            if (musicModal.querySelector('.favorites').scrollLeft + musicModal.querySelector('.favorites').clientWidth >= musicModal.querySelector('.favorites').scrollWidth - 10) {
                send({
                    type: 'social',
                    action: 'load_songs',
                    start_index: musicModal.querySelector('.favorites').querySelectorAll('.item').length,
                    songs_type: 'favorites'
                }, response => loadSong(response, 'favorites'))
            }
        });
        musicModal.querySelector('.latest').addEventListener("scroll", () => {
            if (musicModal.querySelector('.latest').scrollLeft + musicModal.querySelector('.latest').clientWidth >= musicModal.querySelector('.latest').scrollWidth - 10) {
                send({
                    type: 'social',
                    action: 'load_songs',
                    start_index: musicModal.querySelector('.latest').querySelectorAll('.item').length,
                    songs_type: 'latest'
                }, response => loadSong(response, 'latest'))
            }
        });
        musicModal.querySelector('.random').addEventListener("scroll", () => {
            if (musicModal.querySelector('.random').scrollLeft + musicModal.querySelector('.random').clientWidth >= musicModal.querySelector('.random').scrollWidth - 10) {
                send({
                    type: 'social',
                    action: 'load_songs',
                    start_index: musicModal.querySelector('.random').querySelectorAll('.item').length,
                    songs_type: 'random'
                }, response => loadSong(response, 'random'))
            }
        });

        const player = document.querySelector('.player')

        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        player.querySelector('audio').addEventListener('loadeddata', () => {
            player.querySelector('.timeline .duration').textContent = formatTime(player.querySelector('audio').duration)
            player.querySelector('.timeline input[type=range]').max = player.querySelector('audio').duration
        })

        player.querySelector('audio').addEventListener('timeupdate', () => {
            player.querySelector('.timeline .current-time').textContent = formatTime(player.querySelector('audio').currentTime)
            player.querySelector('.timeline input[type=range]').value = player.querySelector('audio').currentTime
        })

        player.querySelector('.timeline input[type=range]').addEventListener('change', () => {
            player.querySelector('audio').currentTime = player.querySelector('.timeline input[type=range]').value
        })

        player.querySelector('#icons').querySelectorAll('svg')[2].addEventListener('click', () => {
            if (player.querySelector('audio').paused) {
                player.querySelector('audio').play()
            } else {
                player.querySelector('audio').pause()
            }
        })

        player.querySelector('#icons').querySelectorAll('svg')[0].addEventListener('click', async () => {
            if (player.querySelector('#icons').querySelectorAll('svg')[0].getAttribute('fill') == 'none') {
                player.querySelector('#icons').querySelectorAll('svg')[0].setAttribute('fill', 'currentColor')
            } else {
                player.querySelector('#icons').querySelectorAll('svg')[0].setAttribute('fill', 'none')
            }
            const body = new FormData
            body.append("SongID", player.querySelector('audio').getAttribute('data-mid'))
            await fetch("https://elemsocial.com/System/API/MusicInteraction.php?F=LIKE", {
                method: "POST",
                body: body,
                headers: {
                  'S-KEY': localStorage.getItem('S-Key'),
                  'User-Agent': 'ElementAPI'
                }
            })
            send({
                type: 'social',
                action: 'load_songs',
                startIndex: 0,
                songs_type: 'favorites'
            }, response => {
                musicModal.querySelector('.favorites').innerHTML = ''
                loadSong(response, 'favorites')
            })
        })

        player.querySelector('#icons').querySelectorAll('svg')[4].addEventListener('click', () => {
            player.querySelector('audio').loop = !player.querySelector('audio').loop
            if (player.querySelector('audio').loop) {
                player.querySelector('#icons').querySelectorAll('svg')[5].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-repeat1-icon lucide-repeat-1"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/><path d="M11 10h1v4"/></svg>'
            } else {
                player.querySelector('#icons').querySelectorAll('svg')[5].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-repeat-icon lucide-repeat"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>'
            }
        })

        player.querySelector('#icons').querySelectorAll('svg')[1].addEventListener('click', () => {
            music.querySelector("." + player.querySelector('audio').getAttribute('data-playlist')).querySelectorAll('.item').forEach((item, i) => {
                if (item.getAttribute('data-mid') == player.querySelector('audio').getAttribute('data-mid')) {
                    music.querySelector("." + player.querySelector('audio').getAttribute('data-playlist')).querySelectorAll('.item')[i - 1].click()
                }
            })
        });
        player.querySelector('#icons').querySelectorAll('svg')[3].addEventListener('click', () => {
            var mid = player.querySelector('audio').getAttribute('data-mid')
            music.querySelector("." + player.querySelector('audio').getAttribute('data-playlist')).querySelectorAll('.item').forEach((item, i) => {
                if (item.getAttribute('data-mid') === mid) {
                    music.querySelector("." + player.querySelector('audio').getAttribute('data-playlist')).querySelectorAll('.item')[i + 1].click()
                }
            })
        });

        window.addEventListener('resize', () => {
            notify.style.top = window.innerHeight + 'px'
            notify.style.left = window.innerWidth - notify.clientWidth + 'px'
            posts.style.left = (window.innerWidth - posts.clientWidth) / 2 + 'px'
            document.querySelectorAll('.modal-window').forEach(modal => {
                modal.style.left = (window.innerWidth - modal.clientWidth) / 2 + 'px'
                modal.style.top = (window.innerHeight - modal.clientHeight) / 2 + 'px'
            })
        })
        document.querySelectorAll('button[open]').forEach(item => {
            item.addEventListener('click', () => {
                window.open(item.getAttribute('open'), '_blank')
            })
        })
        document.querySelector('#add-file').addEventListener('click', () => {document.querySelector('.Posts').querySelector('.Post').querySelector('input[type=file]').click()})
        document.querySelector('#send-post').addEventListener('click', () => {
            const formdata = new FormData
            formdata.append('Text', document.querySelector('.Posts').querySelector('.Post').querySelector('textarea').value)
            var input = document.querySelector('.Posts').querySelector('.Post').querySelector('input[type=file]')
            if (input.files.length > 0) {
                for (let i = 0; i < input.files.length; i++) {
                    formdata.append('Files[]', input.files[i]);
                }
                input.value = '';
            }
            fetch('https://elemsocial.com/System/API/AddPost.php', {
                method: 'POST',
                body: formdata,
                headers: {
                  'S-KEY': localStorage.getItem('S-Key'),
                  'User-Agent': 'ElementAPI'
                }
              })
                .then(response => {
                  if (!response.ok) {
                    throw new Error(`Ошибка HTTP: ${response.status}`);
                  }
                  return response.json();
                })
                .then(data => {
                    document.querySelector('.Posts').querySelector('.Post').querySelector('textarea').value = ''
                    document.querySelector('.Posts').querySelectorAll('.Post').forEach(item => {
                        if (item.id !== 'sys') {
                            item.remove()
                        }
                    })
                    send({
                        type: 'social',
                        action: 'load_posts',
                        posts_type: 'last',
                        start_index: 0
                    })
                    if (data.Type == 'Error') {
                        show_notification('Посты', data.Content)
                    }
                })
                .catch(error => {
                  console.error('Ошибка:', error);
                });              
        })
    }

const urls = {
    avatars: "https://elemsocial.com/Content/Avatars",
    covers: "https://elemsocial.com/Content/Covers",
    postPhoto: "https://elemsocial.com/Content/Posts/Images",
    postVideo: "https://elemsocial.com/Content/Posts/Video/",
    postInteraction: "https://elemsocial.com/System/API/PostInteraction.php",
    share: "https://share.elemsocial.com",
    notifications: "https://elemsocial.com/System/API/Notifications.php",
    music: "https://elemsocial.com/Content/Music/Files",
    musicCovers: "https://elemsocial.com/Content/Music/Covers",
    root: "https://elemsocial.com",
    get_sessions: "https://api.elemsocial.com/settings/load_sessions",
    change_profile: "https://api.elemsocial.com/settings/change_profile",
    load_comments: "https://elemsocial.com/System/API/PostInteraction.php?F=LOAD_COMMENTS"
}

function truncateText(text) {
    if (text.length > 7) {
        return text.slice(0, 6) + '...';
    }
    return text;
}

function getMusic(id, output, notfound='') {
    output.src = notfound
    send({
        type: 'download',
        action: "music",
        song_id: id
    }, blob => {
        if (blob.status != 200) {
            output.src = notfound
            return
        }
        blob = new Blob([blob.file.binary], { type: blob.file.mime });
        var blob = URL.createObjectURL(blob)
        output.src = blob
    })
}

function getMedia(image, output, notfound='') {
    output.src = notfound
    if (typeof {image} != 'object') {
        image = JSON.parse(image)
    }
    if (cache[JSON.stringify(image)]) {
        output.src = cache[JSON.stringify(image)]
        return
    }
    send({
        type: 'download',
        action: 'image',
        image: image,
        lossless: true
    }, blob => {
        if (blob.status != 200) {
            output.src = notfound
            return
        }
        blob = new Blob([blob.file.buffer], { type: 'image/' + blob.file.ext });
        var blob = URL.createObjectURL(blob)
        output.src = blob
        cache[JSON.stringify(image)] = blob
    })
}

setInterval(() => {
    cache = {}
}, 3600_000)

function load_page() {
    if (window.location.pathname.split("/").pop() == 'auth.html') {
        var authDiv = document.querySelector('#auth')
        send({
            type: 'system',
            action: 'get_last_users'
        })

        // Слушатели событий
        authDiv.querySelector('#confirm').addEventListener('click', () => {
            send({
                type: 'social',
                action: 'auth/login',
                email: document.querySelector('#auth input#email').value,
                password: document.querySelector('#auth input#password').value,
                device_type: 'windows_app',
                device: 'Element client | uasalt',
            }, response => {
                if (response.status == 'success') {
                    localStorage.setItem("S-Key", response.S_KEY)
                    location.href = './index.html'
                } else {
                    show_notification('Вход', response.message)
                    if (
                        response.message == "Почта не может быть пустой" ||
                        response.message == "Некорректный формат почты"
                    ) {
                        document.querySelector('#auth input#password').style.borderBottom = '1px rgb(35, 35, 35) solid'
                        document.querySelector('#auth input#email').style.borderBottom = '1px rgb(110, 0, 76) solid'
                    }
                    if (
                        response.message == "Пароль не может быть пустым" ||
                        response.message == "Неверный пароль"
                    ) {
                        document.querySelector('#auth input#email').style.borderBottom = '1px rgb(35, 35, 35) solid'
                        document.querySelector('#auth input#password').style.borderBottom = '1px rgb(110, 0, 76) solid'
                    }
                    if ( response.message == "Аккаунт не найден" ) {
                        document.querySelector('#auth input#email').style.borderBottom = '1px rgb(110, 0, 76) solid'
                        document.querySelector('#auth input#password').style.borderBottom = '1px rgb(110, 0, 76) solid'
                    }
                }
            })
        })
        //setInterval(() => {location.reload()}, 10000)
    } else if (window.location.pathname.split("/").pop() == 'index.html') {
        document.querySelector('.comments').querySelector('#send').addEventListener('click', async () => {
            if (!document.querySelector('.comments').hasAttribute('data-id')) { return }
            const formdata = new FormData
            formdata.append("PostID", document.querySelector('.comments').getAttribute('data-id'))
            formdata.append("Text", document.querySelector('.comments').querySelector('input').value)
            await fetch("https://elemsocial.com/System/API/PostInteraction.php?F=POST_COMMENT", {
                method: "POST",
                body: formdata,
                headers: {
                  'S-KEY': localStorage.getItem('S-Key'),
                  'User-Agent': 'ElementAPI'
                }
            })
            document.querySelector('.Posts .Post[data-id="' + document.querySelector('.comments').getAttribute('data-id') + '"]').querySelector('#comments').click()
            document.querySelector('.comments').querySelector('input').value = ''
        })
        setInterval(() => {
            fetch(`${urls.notifications}?F=CHECK`, {
                method: 'POST',
                headers: {
                    "S-KEY": localStorage.getItem('S-Key'),
                    "User-Agent": "ElementAPI"
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Ошибка HTTP: ${response.status}`);
                }
                return response.text();
            })
            .then(response => {
                if (parseInt(response) > 0) {
                    fetch(`${urls.notifications}?F=GET`, {
                        method: 'POST',
                        headers: {
                          'S-KEY': localStorage.getItem('S-Key'),
                          'User-Agent': 'ElementAPI'
                        }
                      })
                        .then(response => {
                          if (!response.ok) {
                            throw new Error(`Ошибка HTTP: ${response.status}`);
                          }
                          return response.json();
                        })
                        .then(data => {
                          data.forEach((item) => {
                            if (item.Viewed === 1) {return}

                            var body = "Неизвестный тип сообщения"
                            if (item.Action === "PostLike") {
                                body = 'Поставил(-а) лайк на пост'
                            } else if (item.Action === 'PostDislike') {
                                body = 'Поставил(-а) дизлайк на пост'
                            } else if (item.Action === 'PostComment') {
                                body = `Прокомментировал(-а) пост "${JSON.parse(item.Content).Text}"`
                            } else if (item.Action === 'ProfileSubscribe') {
                                body = 'Подписывается на вас'
                            } else if (item.Action === 'ProfileUnsubscribe') {
                                body = 'Отписался от вас'
                            }
                            Notification.requestPermission().then(permission => {
                                if (permission === "granted" && localStorage.getItem('push-notifications')) {
                                    new Notification(item.Name, {
                                        icon: `${urls.avatars}/${item.Avatar}`,
                                        body: body
                                    });
                                } else {
                                    show_notification(item.Name, body, `${urls.avatars}/${item.Avatar}`, false, 3500)
                                }
                            });
                          })
                        })
                        .catch(error => {
                          console.error('Ошибка:', error);
                        });                      
                }
            })
            .catch(error => {
                console.error('Ошибка запроса:', error);
            });
        }, 5000)
        send({
            type: 'social',
            action: 'get_online_users'
        })
        
        send({
            type: 'social',
            action: 'load_posts',
            posts_type: 'last',
            start_index: 0
        })
        
        send({
            type: 'system',
            action: 'get_gold_users'
        })
        
        send({
            type: 'system',
            action: 'get_gold_users'
        }, (usrs) => {
            console.log('Gold-users: ', usrs)
            if (usrs.users.some(item => item.id === JSON.parse(localStorage.getItem('udata')).id && true === false)) {
                document.querySelector('#gold').querySelector('.status').textContent = 'Приобретено'
                document.querySelector('#gold').querySelector('.buttons').remove()
            }
            document.querySelector('#gold').querySelector('.buttons').querySelector('#buy-gold').addEventListener('click', () => {
                send({
                    type: 'social',
                    action: 'gold_pay'
                }, (payment) => {
                    show_notification('Покупка GOLD', payment.message)
                })
            })
            document.querySelector('#gold').querySelector('.buttons').querySelector('#activate-gold').addEventListener('click', () => {
                document.querySelector('#gold').querySelector('#form').classList.toggle('open')
                document.querySelector('#gold').querySelector('#form').classList.toggle('close')
            })
            document.querySelector('#gold').querySelector('#form').querySelector('#activate').addEventListener('click', () => {
                send({
                    type: 'social',
                    action: "gold_activate",
                    code: document.querySelector('#gold').querySelector('#form').querySelector('#code').value
                }, (payment) => {
                    show_notification('Покупка GOLD', payment.message)
                    document.querySelector('#gold').querySelector('#form').classList.toggle('open')
                    document.querySelector('#gold').querySelector('#form').classList.toggle('close')
                })
            })
        })

        send({
            type: 'messenger',
            action: 'load_chats'
        })
        
        send({
            type: 'social',
            action: 'load_songs',
            startIndex: 0,
            songs_type: 'favorites'
        }, response => loadSong(response, 'favorites'))
        
        send({
            type: 'social',
            action: 'load_songs',
            startIndex: 0,
            songs_type: 'latest'
        }, response => loadSong(response, 'latest'))
        
        send({
            type: 'social',
            action: 'load_songs',
            startIndex: 0,
            songs_type: 'random'
        }, response => loadSong(response, 'random'))
                    
        if ('mediaSession' in navigator) {
            const music = document.querySelector('#music')
            const player = document.querySelector('.player')
            player.querySelector('audio').addEventListener('timeupdate', () => {
                if (player.querySelector('audio').currentTime == player.querySelector('audio').duration && player.querySelector('audio').paused) {
                    var mid = player.querySelector('audio').getAttribute('data-mid')
                    music.querySelector("." + player.querySelector('audio').getAttribute('data-playlist')).querySelectorAll('.item').forEach((item, i) => {
                        if (item.getAttribute('data-mid') === mid) {
                            music.querySelector("." + player.querySelector('audio').getAttribute('data-playlist')).querySelectorAll('.item')[i + 1].click()
                        }
                    })
                }
            })

            player.querySelector('audio').addEventListener('play', () => {
                player.querySelectorAll('svg')[2].innerHTML = icons.pause
            });
            player.querySelector('audio').addEventListener('pause', () => {
                player.querySelectorAll('svg')[2].innerHTML = icons.play
            });
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                music.querySelector("." + player.querySelector('audio').getAttribute('data-playlist')).querySelectorAll('.item').forEach((item, i) => {
                    if (item.getAttribute('data-mid') == player.querySelector('audio').getAttribute('data-mid')) {
                        music.querySelector("." + player.querySelector('audio').getAttribute('data-playlist')).querySelectorAll('.item')[i - 1].click()
                    }
                })
            });
            navigator.mediaSession.setActionHandler('nexttrack', () => {
                var mid = player.querySelector('audio').getAttribute('data-mid')
                music.querySelector("." + player.querySelector('audio').getAttribute('data-playlist')).querySelectorAll('.item').forEach((item, i) => {
                    if (item.getAttribute('data-mid') === mid) {
                        music.querySelector("." + player.querySelector('audio').getAttribute('data-playlist')).querySelectorAll('.item')[i + 1].click()
                    }
                })
            });
        }

        setInterval(() => send({
            type: 'messenger',
            action: 'load_chats'
        }), 2500)
    }
}

if (localStorage.getItem('first-start') == null || localStorage.getItem('first-start') == 'true') {
    fetch('https://raw.githubusercontent.com/uasalt/elemsocial-client/refs/heads/main/resources/config.json')
        .then(response => {
          if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
            var list = []
            data['hidden-users'].forEach(item => {
                list.push(item.toString())
            })
            icons = data['icons']
            console.log('Configs updated: ', data)
            localStorage.setItem('hiddenUsers', JSON.stringify(list))
            localStorage.setItem('first-start', true)
        })
        .catch(error => {
          console.error('Ошибка:', error);
        });
      
}
    var url = 'wss://ws.elemsocial.com:8880/user_api';
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            if (data.country_name != "Ukraine") {
                url = 'wss://bpws.elemsocial.com:8880/user_api'
            }
        });

    var socket = null;
    var isConnected = false;
    var isConnecting = false
    var rsaPublic = null;
    var rsaPrivate = null;
    var rsaPublicServer = null;
    var aesKey = null;
    var aesServerKey = null;
    var keysReady = false;
    var socketReady = false;
    var messageQueue = [];
    var processingMessages = false;
    var mesCount = 0;

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
    function connect() {
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
                    const decryptedData = MessagePack.decode(decryptedAes);
                    if (decryptedData.type === 'messenger' && decryptedData.action === 'download_file') {
                        mesCount++;
                        console.log('count: ' + mesCount);
                    }
                    // Здесь можно добавить вызов пользовательских колбэков, если необходимо TAG:callback
                    if (Object.keys(tasks).includes(decryptedData.ray_id)) {
                        tasks[decryptedData.ray_id](decryptedData)
                        delete tasks[decryptedData.ray_id]
                        return
                    }
                    if (decryptedData.type === 'system' && decryptedData.action === 'get_last_users') {
                        if (!document.querySelector('#lastUsers').querySelector('.user') || !document.querySelector('#lastUsers').querySelector('.user').length === 0) {
                            decryptedData.users.forEach((user) => {
                                const usr = document.createElement('button')
                                usr.className = "user"
                                usr.setAttribute('data-username', user.username)
                                usr.setAttribute('data-id', user.id)
                                usr.innerHTML = `
                                <img alt="avatar">
                                <p>${truncateText(user.name)}</p>`

                                usr.addEventListener('mouseenter', () => {
                                    document.querySelector('#show_profile').style.opacity = 1
                                    document.querySelector('#show_profile').style.visibility = 'visible'
                                    send({
                                        type: 'social',
                                        action: 'get_profile',
                                        username: usr.getAttribute('data-username')
                                    })
                                });
                                
                                usr.addEventListener('mouseleave', () => {
                                    document.querySelector('#show_profile').style.opacity = 0
                                    document.querySelector('#show_profile').style.visibility = 'hidden'
                                });
                                document.querySelector('#lastUsers').appendChild(usr)
                                getMedia(JSON.parse(user.avatar), usr.querySelector('img'), 'assets/images/no-avatar.png')
                            })
                            document.querySelector('#lastUsers').style.display = 'block'
                            document.querySelector('#lastUsers').style.left = (window.innerWidth - document.querySelector('#lastUsers').clientWidth) / 2 + 'px'
                            document.querySelector('#show_profile').style.left = `${(window.innerWidth - document.querySelector('#show_profile').clientWidth) / 2}px`
                            window.addEventListener('resize', () => {
                                document.querySelector('#lastUsers').style.left = (window.innerWidth - document.querySelector('#lastUsers').clientWidth) / 2 + 'px'
                                document.querySelector('#show_profile').style.left = `${(window.innerWidth - document.querySelector('#show_profile').clientWidth) / 2}px`
                            })
                        }
                    } else if (decryptedData.type === 'social' && decryptedData.action === 'get_profile' && window.location.pathname.split("/").pop() == 'auth.html') {
                        data = decryptedData.data
                        var cover = `${urls.covers}/${data.cover}`
                        getMedia(data.avatar, document.querySelector('#show_profile').querySelector('.avatar'), 'assets/images/no-avatar.png')
                        getMedia(data.cover, document.querySelector('#show_profile').querySelector('.cover'), 'assets/images/no-cover.png')
                        if (data.description == null) {
                            document.querySelector('#show_profile').querySelector('.description').style.display = 'none'
                        } else {
                            document.querySelector('#show_profile').querySelector('.description').style.display = 'block'
                        }
                        document.querySelector('#show_profile').querySelector('.description').innerHTML = `
                        <div class="Title">Описание</div>
                        ${data.description}`
                        data.icons.forEach((icon) => {
                            if (icon.icon_id == "GOLD") {
                                document.querySelector('#show_profile').querySelector('#userIcons').innerHTML += icons.gold
                            } else if (icon.icon_id == "VERIFY") {
                                document.querySelector('#show_profile').querySelector('#userIcons').innerHTML += icons.verified
                            }
                        })
                        document.querySelector('#show_profile').querySelector('#subscriptions').innerHTML = data.subscriptions
                        document.querySelector('#show_profile').querySelector('#subscribers').innerHTML = data.subscribers
                        document.querySelector('#show_profile').querySelector('#posts').innerHTML = data.posts
                        document.querySelector('#show_profile').querySelector('.name').innerHTML = parseTags(data.name)
                        document.querySelector('#show_profile').querySelector('.username').innerHTML = data.username
                    } else if (decryptedData.type === "messenger" && decryptedData.action === 'load_chats' && window.location.pathname.split("/").pop() == 'index.html') {
                        const messanger = document.querySelector('#messanger')
                        const chats = messanger.querySelector('#chats')
                        chats.innerHTML = '<div class="title">Чаты</div>'
                        
                        decryptedData.chats.forEach(chat => {
                            var last_message = chat.last_message
                            if (chat.last_message.length >= 29) {
                                last_message = chat.last_message.slice(0, 29) + '...';
                            }
                            const ch = document.createElement('div')
                            ch.className = 'chat'
                            ch.onclick = () => {
                                load_chat('${chat.username}')
                            }
                            ch.innerHTML = `<img class="image" src="${(chat.avatar == 'None') ? 'assets/images/no-avatar.png' : avatar}" alt="аватар">`
                            chats.appendChild(ch)
                            getMedia(chat.avatar, ch.querySelector('img'), "assets/images/no-avatar.png")
                            const nameP = document.createElement('p')
                            nameP.className = 'name'
                            nameP.textContent = chat.name
                            const last = document.createElement('p')
                            last.className = 'last'
                            last.textContent = last_message
                            chats.querySelectorAll('.chat')[chats.querySelectorAll('.chat').length - 1].appendChild(nameP)
                            chats.querySelectorAll('.chat')[chats.querySelectorAll('.chat').length - 1].appendChild(last)
                            
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
                                        });
                                    } else {
                                        show_notification(chat.name, chat.last_message, `${urls.avatars}/${chat.avatar}`, false, 3500)
                                    }
                                });
                            }
                        })
                    } else if (decryptedData.type === 'messenger' && decryptedData.action === 'new_message' && window.location.pathname.split("/").pop() == 'index.html') {
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
                    } else if (decryptedData.type === 'social' && decryptedData.action === 'load_posts' && window.location.pathname.split("/").pop() == 'index.html') {
                        if (decryptedData.status == "success") {
                            decryptedData.posts.forEach((item) => {
                                if (localStorage.getItem('hiddenUsers') && JSON.parse(localStorage.getItem('hiddenUsers')).includes(item.author.id.toString())) {
                                    return
                                }
                                const formdata = new FormData
                                formdata.append('PostID', item.id)
                                const post = document.createElement('div')
                                post.setAttribute('data-id', item.id)
                                post.setAttribute('data-user-id', item.author.id)
                                post.setAttribute('data-user-username', item.author.username)
                                post.className = 'Post'
                                if (item.author.avatar == null || item.author.avatar == "None") {
                                    avatar = "assets/images/no-avatar.png"
                                }
                                var content = ''
                                if (item.content.Image) {
                                    var style = ''
                                    if (item.content.Image.censoring) {
                                        style = 'style="filter: blur(10px);"'
                                    }
                                    content += `
                                    <img src="${urls.postPhoto}/${item.content.Image.file_name}" alt="Фото из поста" ${style} class='image'>`
                                } else if (item.content.images) {
                                    item.content.images.forEach((image) => {
                                        var style = ''
                                        if (item.content.censoring) {
                                            style = 'style="filter: blur(10px);"'
                                        }
                                        content += `
                                        <img src="${urls.postPhoto}/${image.file_name}" alt="Фото из поста" ${style} class='image'>`
                                    })
                                } else if (item.content.Video) {
                                    var size = scalePhoto(item.content.Video.width, item.content.Video.height)
                                    content += `
                                    <video controls alt="Видео из поста" class='video'>
                                        <source src="${urls.postVideo}/${item.content.Video.file_name}">
                                    </video>`
                                }
                                post.innerHTML += `
                                <div class="user">
                                    <img src="${avatar}">
                                    <p id="name">${parseTags(item.author.name)}</p>
                                    <p id="time">Несколько минут назад</p>
                                </div>
                                <div class="content">${content}</div>`
                                post.querySelectorAll('.image').forEach((item) => {
                                    item.onerror = () => {
                                        item.remove();
                                    };
                                })
                                const p = document.createElement('p')
                                p.id = 'text'
                                item.text.split('\n').forEach((line, index) => {
                                    p.appendChild(document.createTextNode(line));
                                    if (index < item.text.split('\n').length - 1) {
                                        p.appendChild(document.createElement('br'));
                                    }
                                });
                                post.appendChild(p)
                                post.innerHTML += `
                                <div class="interaction-container">
                                    <button id="like" class="${(item.liked) ? 'active ' : ''}left">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart">
                                           <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                                        </svg>
                                        <p>${(item.likes == 0) ? "Лайк" : item.likes}</p>
                                    </button>
                                    <button id="dislike" class="${(item.disliked) ? 'active' : ''}">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart-crack">
                                           <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                                           <path d="m12 13-1-1 2-2-3-3 2-2"/>
                                        </svg>
                                        <p>${(item.dislikes == 0) ? "Дизлайк" : item.dislikes}</p>
                                    </button>
                                    <button id="comments" class="right">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                        </svg>
                                        <p>${(item.comments == 0) ? "Обсуждения" : item.comments}</p>
                                    </button>
                                    <button id="share">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-share-2">
                                            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/>
                                            <circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/>
                                            <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
                                        </svg>
                                    </button>
                                </div>`
                                post.querySelector('.interaction-container').querySelector('#share').addEventListener('click', () => {
                                    navigator.clipboard.writeText(`${urls.share}/post/${item.id}`)
                                    show_notification('Поделиться', 'Ссылка скопирована')
                                })
                                post.querySelector('.interaction-container').querySelector('#comments').addEventListener('click', () => {
                                    show_notification('Посты', 'Загрузка комментариев...')
                                    var body = new FormData
                                    body.append("PostID", item.id)
                                    document.querySelector('.comments').setAttribute('data-id', item.id)
                                    fetch(urls.load_comments, {
                                        method: 'POST',
                                        headers: {
                                            'S-Key': localStorage.getItem('S-Key'),
                                            'User-Agent': 'ElementAPI'
                                        },
                                        body: body
                                      })
                                        .then(response => {
                                            if (!response.ok) {
                                                throw new Error(`Ошибка HTTP: ${response.status}`);
                                            }
                                            return response.json();
                                        })
                                        .then(data => {
                                            document.querySelector('.commentsd').innerHTML = ''
                                            if (data.length == 0) {
                                                document.querySelector('.comments hr').style.display = 'none'
                                            }
                                            data.forEach(item => {
                                                document.querySelector('.comments hr').style.display = 'block'
                                                const com = document.createElement('div')
                                                com.className = 'comment'
                                                com.innerHTML = `
                                                <div class="comment">
                                                    <div id="user">
                                                        <img alt="Аватар">
                                                        <p id="name">${item.Name}</p>
                                                        <p id="date">Только что</p>
                                                    </div>
                                                    <div class="content"></div>
                                                    <div class="text">${item.Text}</div>
                                                </div>`
                                                document.querySelector('.commentsd').appendChild(com)
                                                getMedia(JSON.parse(item.Avatar), com.querySelector('img'), "assets/images/no-avatar.png")
                                            })
                                            window.addEventListener("scroll", () => {
                                                document.querySelector('.comments').style.visibility = 'hidden'
                                                document.querySelector('.comments').style.opacity = '0'
                                            }, { once: true });
                                            document.querySelector('.comments').style.top = (post.getClientRects()[0].y + post.clientHeight) + 10 + 'px'
                                            document.querySelector('.comments').style.left = post.getClientRects()[0].x + 'px'
                                            document.querySelector('.comments').style.opacity = '1'
                                            document.querySelector('.comments').style.visibility = 'visible'
                                        })
                                        .catch(error => {
                                            console.error('Ошибка:', error);
                                        });                                      
                                })
                                post.querySelector('.interaction-container').querySelector('#like').addEventListener('click', () => {
                                    post.querySelector('.interaction-container').querySelector('#like').classList.toggle('active')
                                    post.querySelector('.interaction-container').querySelector('#dislike').classList.remove('active')

                                    fetch(`${urls.postInteraction}?F=LIKE`, {
                                        method: 'POST',
                                        body: formdata,
                                        headers: {
                                          'S-KEY': localStorage.getItem('S-Key'),
                                          'User-Agent': 'ElementAPI'
                                        }
                                    })
                                })
                                post.querySelector('.interaction-container').querySelector('#dislike').addEventListener('click', () => {
                                    post.querySelector('.interaction-container').querySelector('#dislike').classList.toggle('active')
                                    post.querySelector('.interaction-container').querySelector('#like').classList.remove('active')

                                    fetch(`${urls.postInteraction}?F=DISLIKE`, {
                                        method: 'POST',
                                        body: formdata,
                                        headers: {
                                          'S-KEY': localStorage.getItem('S-Key'),
                                          'User-Agent': 'ElementAPI'
                                        }
                                    })
                                })
                                document.querySelector('.Posts').appendChild(post)
                                getMedia(item.author.avatar, post.querySelector('img'), "assets/images/no-avatar.png")
                                post.addEventListener('contextmenu', (event) => {
                                    document.querySelector('context-menu').style.top = event.y + 'px'
                                    document.querySelector('context-menu').style.left = event.x + 'px'
                                    if (item.my_post) {
                                        document.querySelector('context-menu').innerHTML = `
                                            <option>Удалить</option>
                                            <option>Epack</option>`
                                    } else {
                                        document.querySelector('context-menu').innerHTML = `
                                            <option>Заблокировать</option>
                                            <option>Игнорировать</option>
                                            ${(post.content ? "<option>Скачать контент поста</option>" : "")}
                                            <option>Epack</option>`
                                    }
                                    document.querySelector('context-menu').style.visibility = 'visible'
                                    document.querySelector('context-menu').style.opacity = '1'
                                    window.addEventListener('scroll', () => {
                                        document.querySelector('context-menu').style.visibility = 'hidden'
                                        document.querySelector('context-menu').style.opacity = '0'
                                    }, {once: true})
                                    window.addEventListener('click', () => {
                                        document.querySelector('context-menu').style.visibility = 'hidden'
                                        document.querySelector('context-menu').style.opacity = '0'
                                    }, {once: true})
                                })
                                
                                post.querySelector('.user').querySelector('img').addEventListener("mouseenter", function () {
                                    var x = post.querySelector('.user').querySelector('img').getBoundingClientRect().x
                                    var y = post.querySelector('.user').querySelector('img').getBoundingClientRect().y
                                    document.querySelector('#quick_profile').style.top = (y + 50) + 'px'
                                    document.querySelector('#quick_profile').style.left = x - document.querySelector('#quick_profile').clientWidth / 2 + 'px'
                                    document.querySelector('#quick_profile').style.opacity = '1'
                                    document.querySelector('#quick_profile').style.visibility = 'visible'
                                    send({
                                        type: 'social',
                                        action: 'get_profile',
                                        username: post.getAttribute('data-user-username')
                                    }, (data) => {
                                        data = data.data
                                        getMedia(data.avatar, document.querySelector('#quick_profile').querySelector('.avatar'), 'assets/images/no-avatar.png')
                                        getMedia(data.cover, document.querySelector('#quick_profile').querySelector('.cover'), 'assets/images/no-cover.png')
                                        if (data.description == null) {
                                            document.querySelector('#quick_profile').querySelector('.description').style.display = 'none'
                                        } else {
                                            document.querySelector('#quick_profile').querySelector('.description').style.display = 'block'
                                        }
                                        document.querySelector('#quick_profile').querySelector('.description').innerHTML = `
                                        <div class="Title">Описание</div>
                                        ${data.description}`
                                        document.querySelector('#quick_profile').querySelector('#userIcons').innerHTML = ''
                                        data.icons.forEach((icon) => {
                                            if (icon.icon_id == "GOLD") {
                                                document.querySelector('#quick_profile').querySelector('#userIcons').innerHTML += icons.gold
                                            } else if (icon.icon_id == "VERIFY") {
                                                document.querySelector('#quick_profile').querySelector('#userIcons').innerHTML += icons.verified
                                            }
                                        })
                                        document.querySelector('#quick_profile').querySelector('#subscriptions').innerHTML = data.subscriptions
                                        document.querySelector('#quick_profile').querySelector('#subscribers').innerHTML = data.subscribers
                                        document.querySelector('#quick_profile').querySelector('#posts').innerHTML = data.posts
                                        document.querySelector('#quick_profile').querySelector('.name').innerHTML = parseTags(data.name)
                                        document.querySelector('#quick_profile').querySelector('.username').innerHTML = data.username
                                    })
                                });
                                post.querySelector('.user').querySelector('img').addEventListener("mouseleave", function () {
                                    document.querySelector('#quick_profile').style.opacity = '0'
                                    document.querySelector('#quick_profile').style.visibility = 'hidden'
                                })
                            })
                        }
                    }
                    if (localStorage.getItem('ghost') == 'true') {
                        disconnect()
                    }
                    
                } else {
                    const unit8Array = await blobToUint8Array(rawData);
                    const decryptedRsa = await rsaDecrypt(unit8Array, rsaPrivate);
                    const decryptedData = MessagePack.decode(decryptedRsa);

                    if (decryptedData.type && decryptedData.type === 'aes_key') {
                        aesServerKey = decryptedData.key;
                        socketReady = true;
                        show_notification('Статус подключения', 'Подключено')
                        // ВСЁ СОКЕТ ГОТОВ ПИЗДЕТЬ
                        if (localStorage.getItem('S-Key') && window.location.pathname.split("/").pop() == 'index.html') {
                            send({
                                type: 'authorization',
                                action: 'connect',
                                S_KEY: localStorage.getItem('S-Key')
                            }, response => {
                                if (response.status === 'error') {
                                    localStorage.removeItem("S-Key")
                                    location.href = 'auth.html'
                                    return
                                } else if (response.status === 'success') {
                                    load_page()
                                    localStorage.setItem('udata', JSON.stringify(response.accountData))
                                    document.querySelector('header').querySelector('.count').textContent = response.accountData.e_balls
            
                                    getMedia(JSON.parse(response.accountData.avatar), document.querySelector('header img'), 'assets/images/no-avatar.png')
                                    getMedia(JSON.parse(response.accountData.avatar), settings.querySelector('#avatar'), 'assets/images/no-avatar.png')
                                    getMedia(JSON.parse(response.accountData.cover), settings.querySelector('#cover'), 'assets/images/no-cover.png')
                                    settings.querySelector('#name').value = response.accountData.name
                                    settings.querySelector('#username').value = response.accountData.username
                                    settings.querySelector('#email .hidden').textContent = response.accountData.email
                                    var free = Object.values(response.accountData.permissions).filter(v => v === true).length
                                    var all = Object.values(response.accountData.permissions).length - 1
                                    var status = `${free}/${all}`
                                    if (free == all) {
                                        status = "Свободен"
                                    } else if (free == 0) {
                                        status = "Ничего"
                                    }
                                    settings.querySelector('#status .hidden').textContent = status
                                    fetch(urls["get_sessions"], {
                                        method: 'POST',
                                        headers: {
                                            'S-Key': localStorage.getItem('S-Key'),
                                            'User-Agent': 'ElementAPI'
                                        }
                                    })
                                        .then(response => {
                                            if (!response.ok) {
                                                throw new Error(`Ошибка HTTP: ${response.status}`);
                                            }
                                            return response.json();
                                        })
                                        .then(data => {
                                            if (data.status == "success") {
                                                settings.querySelector('#sessions .hidden').textContent = data.current_session.device
                                            } else {
                                                settings.querySelector('#sessions .hidden').textContent = "Ошибка"
                                            }
                                        })
                                        .catch(error => {
                                        console.error('Ошибка:', error);
                                        });
                                    settings.querySelector('#logout').addEventListener('click', () => {
                                        localStorage.removeItem("S-Key")
                                        location.href = 'auth.html'
                                        return
                                    })
                                    settings.querySelector('#username').addEventListener('change', () => {
                                        const body = new FormData
                                        body.append("username", settings.querySelector('#username').value)
                                        fetch(urls["change_profile"], {
                                            method: 'POST',
                                            headers: {
                                                'S-Key': localStorage.getItem('S-Key'),
                                                'User-Agent': 'ElementAPI'
                                            },
                                            body: body
                                        })
                                            .then(response => {
                                                if (!response.ok) {
                                                    throw new Error(`Ошибка HTTP: ${response.status}`);
                                                }
                                                return response.json();
                                            })
                                            .then(data => {
                                                if (data.status == "success") {
                                                    show_notification("Профиль", "Успех")
                                                } else {
                                                    show_notification("Профиль", data.text)
                                                }
                                            })
                                            .catch(error => {
                                            console.error('Ошибка:', error);
                                            });
                                    })
                                    settings.querySelector('#avatarI').addEventListener('change', () => {
                                        const body = new FormData
                                        body.append("avatar", settings.querySelector('#avatarI').files[0])
                                        fetch(urls["change_profile"], {
                                            method: 'POST',
                                            headers: {
                                                'S-Key': localStorage.getItem('S-Key'),
                                                'User-Agent': 'ElementAPI'
                                            },
                                            body: body
                                        })
                                            .then(response => {
                                                if (!response.ok) {
                                                    throw new Error(`Ошибка HTTP: ${response.status}`);
                                                }
                                                return response.json();
                                            })
                                            .then(data => {
                                                if (data.status == "success") {
                                                    getMedia(data.changes.avatar, document.querySelector('header').querySelector('img'), "/assets/images/no-avatar.png")
                                                    settings.querySelector('#avatar').src = `${urls.avatars}/${data.changes.avatar}`
                                                    show_notification("Профиль", "Успех")
                                                } else {
                                                    show_notification("Профиль", data.text)
                                                }
                                            })
                                            .catch(error => {
                                            console.error('Ошибка:', error);
                                            });
                                    })
                                    settings.querySelector('#coverI').addEventListener('change', () => {
                                        const body = new FormData
                                        body.append("cover", settings.querySelector('#coverI').files[0])
                                        fetch(urls["change_profile"], {
                                            method: 'POST',
                                            headers: {
                                                'S-Key': localStorage.getItem('S-Key'),
                                                'User-Agent': 'ElementAPI'
                                            },
                                            body: body
                                        })
                                            .then(response => {
                                                if (!response.ok) {
                                                    throw new Error(`Ошибка HTTP: ${response.status}`);
                                                }
                                                return response.json();
                                            })
                                            .then(data => {
                                                if (data.status == "success") {
                                                    settings.querySelector('#cover').src = `${urls.covers}/${data.changes.cover}`
                                                    show_notification("Профиль", "Успех")
                                                } else {
                                                    show_notification("Профиль", data.text)
                                                }
                                            })
                                            .catch(error => {
                                            console.error('Ошибка:', error);
                                            });
                                    })
                                    settings.querySelector('#name').addEventListener('change', () => {
                                        const body = new FormData
                                        body.append("name", settings.querySelector('#name').value)
                                        fetch(urls["change_profile"], {
                                            method: 'POST',
                                            headers: {
                                                'S-Key': localStorage.getItem('S-Key'),
                                                'User-Agent': 'ElementAPI'
                                            },
                                            body: body
                                        })
                                            .then(response => {
                                                if (!response.ok) {
                                                    throw new Error(`Ошибка HTTP: ${response.status}`);
                                                }
                                                return response.json();
                                            })
                                            .then(data => {
                                                if (data.status == "success") {
                                                    show_notification("Профиль", "Успех")
                                                } else {
                                                    show_notification("Профиль", data.text)
                                                }
                                            })
                                            .catch(error => {
                                            console.error('Ошибка:', error);
                                            });
                                    })
                                }
                            })
                        } else {
                            load_page()
                        }
                        processQueue();
                    }
                }
            } else {
                var data = JSON.parse(rawData);
                if (data.type === 'key_exchange') {
                    rsaPublicServer = data.key;
                    aesKey = generateAESKey();
                    const aesKeyPayload = MessagePack.encode({
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

    async function send(data, callback=false) {
        if (!isConnected || !socket || socket.readyState !== WebSocket.OPEN || !socketReady) {
            console.log('Отправка сообщения на сервер, но сокет не открыт', data)
            messageQueue.push(data);
            return;
        }
    
        function generateRandomString(length) {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            let result = ''
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length)
                result += characters[randomIndex]
            }
            return result
        }
        data.ray_id = generateRandomString(15)
        ray_id = data.ray_id

        if (callback) {
            tasks[data.ray_id] = callback
        }
    
        const binaryData = MessagePack.encode({ ray_id, ...data });
        const encrypted = await aesEncrypt(binaryData, aesServerKey);
        socket.send(encrypted);
    }
    
    async function generateRayID() {
        const timestamp = Date.now();
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomPart = '';
        for (let i = 0; i < 10; i++) {
            randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `${timestamp}${randomPart}`;
    }

    // Разрыв соединения
    function disconnect() {
        isConnecting = false
        if (socket) {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
            socket = null;
        }
        isConnected = false;
        rsaPublic = null;
        rsaPrivate = null;
        rsaPublicServer = null;
        aesKey = null;
        aesServerKey = null;
        keysReady = false;
        socketReady = false;
    }

window.addEventListener('load', function () {
    connect();
});