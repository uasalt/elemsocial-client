import { send } from "../ws.js";
import { show_notification, parseTags, getMedia } from "../functions.js";
import { t } from "../languages/translate.js";
import { urls } from "../config.js";

var current_feed = localStorage.getItem('feed') || 'rec'
document.querySelector(`.Posts slider-`).value = current_feed
var posts = 0

window.addEventListener('scroll', function() {
    if (window.scrollY + document.documentElement.clientHeight >= document.documentElement.scrollHeight - 1) {
        posts = posts + 25
        send({
            type: 'social',
            action: 'load_posts',
            payload: {
                posts_type: current_feed,
                start_index: posts
            }
        }, loadPosts)
    }
});

document.querySelector('#add-file').addEventListener('click', () => {
    document.querySelector('.Posts').querySelector('.Post').querySelector('input[type=file]').click()
})

document.querySelector('#send-post').addEventListener('click', () => {
    document.querySelector('.Posts').querySelectorAll('.Post').forEach(item => {
        if (item.id !== 'sys') {
            item.remove()
        }
    })
    for (let i = 1; i <= 5; i++) {
        const loading = document.createElement('div')
        loading.innerHTML = '<div class="Post loading-shimmer" style="height: 100px;" sys></div>'
        document.querySelector(".Posts").appendChild(loading)
    }
    var input = document.querySelector('.Posts').querySelector('.Post').querySelector('input[type=file]')
    var files = []
    if (input.files.length > 0) {
        for (let i = 0; i < input.files.length; i++) {
            files.push(new Uint8Array(input.files[i].arrayBuffer()))
        }
        input.value = '';
    }
    send({
        type: "social",
        action: "posts/add",
        payload: {
            text: document.querySelector('.Posts').querySelector('.Post').querySelector('textarea').value,
            files: files,
            settings: {
                clear_metadata_img: true
            }
        }
    }, r => {
        document.querySelector('.Posts').querySelector('.Post').querySelector('textarea').value = ''
        send({
            type: 'social',
            action: 'load_posts',
            payload: {
                posts_type: current_feed,
                start_index: 0
            }
        }, loadPosts)
        if (r.status == 'error') {
            show_notification('Посты', r.message)
        }
    })
})

document.querySelector('.Posts slider-').addEventListener('change', value => {
    document.querySelectorAll(".Posts .Post:not(#sys)").forEach(post => post.remove())
    for (let i=1; i<=5; i++) {
        const loading = document.createElement('div')
        loading.innerHTML = '<div class="Post loading-shimmer" style="height: 100px;margin-top: 10px;" sys></div>'
        document.querySelector(".Posts").appendChild(loading)
    }
    current_feed = value.detail.value
    send({
        type: 'social',
        action: 'load_posts',
        payload: {
            posts_type: value.detail.value,
            start_index: 0
        }
    }, loadPosts)
})

document.querySelector('.comments #send').addEventListener('click', async () => {
    if (!document.querySelector('.comments').hasAttribute('data-id')) { return }
    send({
        type: 'social',
        action: 'comments/add',
        payload: {
            post_id: document.querySelector('.comments').getAttribute('data-id'),
            text: document.querySelector('.comments').querySelector('input').value,
            files: []
        }
    }, () => {
        document.querySelector(`.Posts .Post[data-id="${document.querySelector('.comments').getAttribute('data-id')}"]`).querySelector('#comments').click()
        document.querySelector('.comments').querySelector('input').value = ''
    })
})

document.querySelector(`.Posts slider- option[value='${localStorage.getItem('feed') || 'rec'}']`).setAttribute('selected', '')

const context_menu = (event) => {
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
        Array.from(document.querySelectorAll('context-menu option')).pop().addEventListener('click', () => {
            function blobToBase64(blob) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader()
                    reader.onloadend = () => resolve(reader.result)
                    reader.onerror = reject
                    reader.readAsDataURL(blob);
                })
            }
            fetch(post.querySelector('img').src)
                .then(res => res.blob())
                .then(blob => blobToBase64(blob))
                .then(base64 => {
                    const epack = {
                        "E_VER":"2.1",
                        "E_FROM": {
                            "name": "Element",
                            "domain": "elemsocial.com"
                        },
                        "E_TYPE": "post",
                        "id": item.id,
                        "author_data": {
                            "id": item.author.id,
                            "author_type": "user",
                            "name": item.author.name,
                            "username": item.author.username,
                            "avatar": base64.split(',')[1]
                        },
                        "date": item.create_date,
                        "text": item.text,
                        "content": item.content,
                        "likes_count": item.likes,
                        "dislikes_count": item.dislikes,
                        "comments_count": item.comments,
                        "comments": false
                    }
                    const url = URL.createObjectURL(
                        new Blob(
                            [JSON.stringify(epack)],
                            { type: 'text/plain' }
                        )
                    )
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `Пост ID${item.id}.epack`
                    a.click()
                })
        }, {once: true})
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
}

function formatRelativeTime(dateString) {
    function pluralize(n, word) {
        const forms = {
            "секунда": ["секунда", "секунды", "секунд"],
            "минута": ["минута", "минуты", "минут"],
            "час":    ["час", "часа", "часов"],
            "день":   ["день", "дня", "дней"],
            "неделя": ["неделя", "недели", "недель"],
            "месяц":  ["месяц", "месяца", "месяцев"],
            "год":    ["год", "года", "лет"]
        }

        let form = forms[word]
        if (!form) return word

        if (n % 10 === 1 && n % 100 !== 11) return form[0]
        if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return form[1]
        return form[2]
    }
    const units = [
        { name: "год",   seconds: 31536000 },
        { name: "месяц", seconds: 2592000 },
        { name: "неделя", seconds: 604800 },
        { name: "день",  seconds: 86400 },
        { name: "час",   seconds: 3600 },
        { name: "минута", seconds: 60 },
        { name: "секунда", seconds: 1 }
    ]

    const diffInSeconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)

    for (let unit of units) {
        const count = Math.floor(diffInSeconds / unit.seconds)
        if (count >= 1) { return `${count} ${pluralize(count, unit.name)} назад` }
    }

    return "Только что";
}

const loadPosts = (response) => {
    if (response.status == "success") {
        document.querySelectorAll('.Post[sys]').forEach(a => a.remove())
        response.posts.forEach((item) => {
            if (localStorage.getItem('hiddenUsers') && JSON.parse(localStorage.getItem('hiddenUsers')).includes(item.author.id.toString())) { return }
            const post = document.createElement('div')
            post.setAttribute('data-id', item.id)
            post.setAttribute('data-user-id', item.author.id)
            post.setAttribute('data-user-username', item.author.username)
            post.className = 'Post'
                                
            var content = ''
            if (item.content.Image) {
                var style = ''
                if (item.content.Image.censoring) {
                    style = 'style="filter: blur(10px);"'
                }
                content += `<img src="${urls.postPhoto}/${item.content.Image.file_name}" alt="Фото из поста" ${style} class='image'>`
            } else if (item.content.images) {
                item.content.images.forEach((image) => {
                    var style = ''
                    if (item.content.censoring) {
                        style = 'style="filter: blur(10px);"'
                    }
                    content += `<img source='${JSON.stringify(image.img_data)}' alt="Фото из поста" ${style} class='image'>`
                })
            } else if (item.content.Video) {
                var size = scalePhoto(item.content.Video.width, item.content.Video.height)
                content += `<video controls alt="Видео из поста" class='video'>
                                <source src="${urls.postVideo}/${item.content.Video.file_name}">
                            </video>`
            }
            post.innerHTML += `
                <div class="user">
                    <img>
                    <p id="name">${parseTags(item.author.name)}</p>
                    <p id="time">${formatRelativeTime(item.create_date)}</p>
                </div>
                <div class="content">${content}</div>`
            send({
                type: 'system',
                action: 'get_last_users'
            }, data => {
                data.users.forEach(user => {
                    if (user.id == item.author.id) {
                        post.querySelector('img').style.padding = '1px'
                        post.querySelector('img').style.background = '#346d1f'
                    }
                })
            })
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
                                        <p>${(item.likes == 0) ? t('posts-post-like') : item.likes}</p>
                                    </button>
                                    <button id="dislike" class="${(item.disliked) ? 'active' : ''}">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart-crack">
                                           <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                                           <path d="m12 13-1-1 2-2-3-3 2-2"/>
                                        </svg>
                                        <p>${(item.dislikes == 0) ? t('posts-post-dislike') : item.dislikes}</p>
                                    </button>
                                    <button id="comments" class="right">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                        </svg>
                                        <p>${(item.comments == 0) ? t('posts-post-comments') : item.comments}</p>
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
                                    document.querySelector('.comments').setAttribute('data-id', item.id)
                                    send({
                                        type: "social",
                                        action: "comments/load",
                                        payload: {
                                            post_id: item.id
                                        }
                                    }, response => {
                                        if (response.status != 'success') {
                                            return
                                        }
                                        var data = response.comments
                                        document.querySelector('.commentsd').innerHTML = ''
                                        if (data.length == 0) {
                                            document.querySelector('.comments hr').style.display = 'none'
                                        }
                                        data.forEach(item => {
                                            document.querySelector('.comments hr').style.display = 'block'
                                            var content = ''
                                            if (item.content) {
                                                if (item.content.reply) {
                                                    content += `
                                                    <div class="comment" style="background-color: rgb(25, 25, 25);padding: 15px;">
                                                        <div id="user">
                                                            <img alt="Аватар">
                                                            <p id="name">${parseTags(item.content.reply.author.name)}</p>
                                                        </div>
                                                        <div class="text">${item.content.reply.text}</div>
                                                    </div>`
                                                }
                                                if (item.content.image) {
                                                    content += `<img src="https://elemsocial.com/Content/Comments/Images/${item.Content.Image.file_name}" alt="Фото">`
                                                }
                                            }
                                            const com = document.createElement('div')
                                            com.className = 'comment'
                                            com.innerHTML = `
                                            <div class="comment">
                                                <div id="user">
                                                    <img alt="Аватар">
                                                    <p id="name">${parseTags(item.author.name)}${item.author.icons}</p>
                                                    <p id="date">Только что</p>
                                                </div>
                                                <div class="content">${content}</div>
                                                <div class="text">${item.text}</div>
                                            </div>`
                                            document.querySelector('.commentsd').appendChild(com)
            
                                            if (item.content && item.content.reply) { getMedia(item.content.reply.author.avatar, Array.from(com.querySelectorAll('.content .comment #user img')).pop(), 'assets/images/no-avatar.png') }
                                            getMedia(item.author.avatar, com.querySelector('img'), "assets/images/no-avatar.png")
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
                                })
                                post.querySelector('.interaction-container').querySelector('#like').addEventListener('click', () => {
                                    post.querySelector('.interaction-container').querySelector('#like').classList.toggle('active')
                                    post.querySelector('.interaction-container').querySelector('#dislike').classList.remove('active')
                                    send({
                                        type: 'social',
                                        action: 'posts/like',
                                        payload: {
                                            post_id: item.id
                                        }
                                    })
                                })
                                post.querySelector('.interaction-container').querySelector('#dislike').addEventListener('click', () => {
                                    post.querySelector('.interaction-container').querySelector('#dislike').classList.toggle('active')
                                    post.querySelector('.interaction-container').querySelector('#like').classList.remove('active')
                                    send({
                                        type: 'social',
                                        action: 'posts/dislike',
                                        payload: {
                                            post_id: item.id
                                        }
                                    })
                                })
                                document.querySelector('.Posts').appendChild(post)
                                getMedia(item.author.avatar, post.querySelector('img'), "assets/images/no-avatar.png")
                                post.querySelectorAll('.content img').forEach(image => {
                                    getMedia(JSON.parse(image.getAttribute('source')), image)
                                    image.removeAttribute('source')
                                })

                                post.addEventListener('contextmenu', context_menu)
                                
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
                                        if (data.icons) {
                                            data.icons.forEach((icon) => {
                                                if (icon.icon_id == "GOLD") {
                                                    document.querySelector('#quick_profile').querySelector('#userIcons').innerHTML += icons.gold
                                                } else if (icon.icon_id == "VERIFY") {
                                                    document.querySelector('#quick_profile').querySelector('#userIcons').innerHTML += icons.verified
                                                }
                                            })
                                        }
                                        document.querySelector('#quick_profile').querySelector('#subscriptions').innerHTML = data.subscriptions
                                        document.querySelector('#quick_profile').querySelector('#subscribers').innerHTML = data.subscribers
                                    document.querySelector('#quick_profile').querySelector('#posts').innerHTML = data.posts
                    document.querySelector('#quick_profile').querySelector('.name').innerHTML = parseTags(data.name)
                    document.querySelector('#quick_profile').querySelector('.username').innerHTML = data.username
                })
            })
            post.querySelector('.user').querySelector('img').addEventListener("mouseleave", function () {
                document.querySelector('#quick_profile').style.opacity = '0'
                document.querySelector('#quick_profile').style.visibility = 'hidden'
            })
        })
    }
}

send({
    type: 'social',
    action: 'load_posts',
    payload: {
        posts_type: current_feed,
        start_index: 0
    }
}, loadPosts)