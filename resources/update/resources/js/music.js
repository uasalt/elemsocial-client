import { send } from './ws.js'
import { t } from './languages/translate.js'
import { getMedia } from './functions.js'

function getMusic(id, output, notfound='') {
    output.src = notfound
    const request = indexedDB.open('element', 1)
    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('cache')) {
            db.createObjectStore('cache')
        }
    }
    request.onsuccess = (event) => {
        const tx = event.target.result.transaction('cache', 'readwrite')
        const store = tx.objectStore('cache')
        store.get(id).onsuccess = function(e) {
            if (!e.target.result) {
                send({
                    type: 'download',
                    action: "music",
                    song_id: id
                }, audio => {
                    if (audio.status != 200) {
                        output.src = notfound
                        return
                    }
                    const request = indexedDB.open('element', 1)
                    request.onupgradeneeded = function(event) {
                        const db = event.target.result;
                        if (!db.objectStoreNames.contains('cache')) {
                            db.createObjectStore('cache')
                        }
                    }
                    request.onsuccess = (event) => {
                        const tx = event.target.result.transaction('cache', 'readwrite')
                        const store = tx.objectStore('cache')
                        store.put({ file: audio.file.binary, ext: audio.file.mime }, id)
                    }
                    blob = new Blob([audio.file.binary], { type: audio.file.mime });
                    var blob = URL.createObjectURL(blob)
                    output.src = blob
                })
                return
            }
            var blob = new Blob([e.target.result.file], { type: e.target.result.ext })
            output.src = URL.createObjectURL(blob)
        }
    }
}

document.querySelector('.player audio').addEventListener('pause', () => {
    if (document.querySelector('.player audio').currentTime == document.querySelector('.player audio').duration) {
        document.querySelector('.player #icons .lucide-skip-forward-icon').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    }
})

const loadSong = (response, playlist) => {
    const player = document.querySelector('.player')
    response.songs.forEach(song => {
        const item = document.createElement('div')
        item.className = 'item'
        item.setAttribute('data-mid', song.id)

        item.innerHTML += `
        <img class="image">
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
            getMedia(song.cover, blob => {
                if ('mediaSession' in navigator) {
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: song.title,
                        artist: song.artist,
                        album: song.album,
                        artwork: [
                            { src: URL.createObjectURL(blob), sizes: '200x200', type: 'image/jpeg' }
                        ]
                    });
                    navigator.mediaSession.setActionHandler('previoustrack', () => document.querySelector('.player #icons .lucide-skip-back-icon').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })))
                    navigator.mediaSession.setActionHandler('nexttrack', () => document.querySelector('.player #icons .lucide-skip-forward-icon').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })))
                }
            }, 'assets/images/no-music-cover.jpg')
        })

        document.querySelector('#music').querySelector('.' + playlist).appendChild(item)
        getMedia(song.cover, item.querySelector('img'), 'assets/images/no-music-cover.jpg')
    })
}

const open = () => {
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
    document.querySelector('#music').classList.add('opened')
}

document.querySelector('.navbar .music').addEventListener('click', open)

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

document.querySelector('.player audio').addEventListener('loadeddata', () => {
    document.querySelector('.player .timeline .duration').textContent = formatTime(document.querySelector('.player audio').duration)
    document.querySelector('.player .timeline input[type=range]').max = document.querySelector('.player audio').duration
})

document.querySelector('.player audio').addEventListener('timeupdate', () => {
    document.querySelector('.timeline .current-time').textContent = formatTime(document.querySelector('.player audio').currentTime)
    document.querySelector('.timeline input[type=range]').value = document.querySelector('.player audio').currentTime
})

document.querySelector('.player .timeline input[type=range]').addEventListener('change', () => {
    document.querySelector('.player audio').currentTime = document.querySelector('.player .timeline input[type=range]').value
})

document.querySelector('.player #icons .lucide.lucide-heart').addEventListener('click', async () => {
    if (document.querySelector('.player #icons .lucide.lucide-heart').getAttribute('fill') == 'none') {
        document.querySelector('.player #icons .lucide.lucide-heart').setAttribute('fill', 'currentColor')
    } else {
        document.querySelector('.player #icons .lucide.lucide-heart').setAttribute('fill', 'none')
    }
    send({
        type: 'social',
        action: 'music/like',
        song_id: document.querySelector('.player audio').getAttribute('data-mid')
    }, () => {
        send({
            type: 'social',
            action: 'load_songs',
            startIndex: 0,
            songs_type: 'favorites'
        }, response => {
            document.querySelector('#music .favorites').innerHTML = ''
            loadSong(response, 'favorites')
        })
    })
})

document.querySelector('.player #icons .lucide-skip-back').addEventListener('click', () => {
    music.querySelector("." + document.querySelector('.player audio').getAttribute('data-playlist')).querySelectorAll('.item').forEach((item, i) => {
        if (item.getAttribute('data-mid') == document.querySelector('.player audio').getAttribute('data-mid')) {
            music.querySelector("." + document.querySelector('.player audio').getAttribute('data-playlist')).querySelectorAll('.item')[i - 1].click()
        }
    })
})

document.querySelector('.player #icons .lucide.lucide-play').addEventListener('click', () => {
    if (document.querySelector('.player audio').paused) {
        document.querySelector('.player audio').play()
    } else {
        document.querySelector('.player audio').pause()
    }
})

document.querySelector('.player #icons .lucide-skip-forward').addEventListener('click', () => {
    var mid = document.querySelector('.player audio').getAttribute('data-mid')
    music.querySelector("." + document.querySelector('.player audio').getAttribute('data-playlist')).querySelectorAll('.item').forEach((item, i) => {
        if (item.getAttribute('data-mid') === mid) {
            music.querySelector("." + document.querySelector('.player audio').getAttribute('data-playlist')).querySelectorAll('.item')[i + 1].click()
        }
    })
})

document.querySelector('.player #icons .lucide-repeat').addEventListener('click', () => {
    document.querySelector('.player audio').loop = !document.querySelector('.player audio').loop
    if (document.querySelector('.player audio').loop) {
        document.querySelector('.player #icons .lucide-repeat').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-repeat1-icon lucide-repeat-1"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/><path d="M11 10h1v4"/></svg>'
    } else {
        document.querySelector('.player #icons .lucide-repeat').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-repeat-icon lucide-repeat"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>'
    }
})

document.querySelector('.latest').addEventListener("scroll", () => {
    if (document.querySelector('.latest').scrollLeft + document.querySelector('.latest').clientWidth >= document.querySelector('.latest').scrollWidth - 10) {
        send({
            type: 'social',
            action: 'load_songs',
            start_index: document.querySelector('.latest').querySelectorAll('.item').length,
            songs_type: 'latest'
        }, response => loadSong(response, 'latest'))
    }
})
document.querySelector('#music .random').addEventListener("scroll", () => {
    if (document.querySelector('#music .random').scrollLeft + document.querySelector('#music .random').clientWidth >= document.querySelector('#music .random').scrollWidth - 10) {
        send({
            type: 'social',
            action: 'load_songs',
            start_index: document.querySelector('#music .random').querySelectorAll('.item').length,
            songs_type: 'random'
        }, response => loadSong(response, 'random'))
    }
});