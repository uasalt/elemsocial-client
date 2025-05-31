import { page } from './functions.js'

if (page('auth.html')) {
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
    await import('./auth/interaction.js')
} else if (page('index.html')) {
    var notify = document.querySelector('#notification')
    var posts = document.querySelector('.Posts')
    document.querySelectorAll('.modal-window').forEach(modal => {
        modal.style.left = (window.innerWidth - modal.clientWidth) / 2 + 'px'
        modal.style.top = (window.innerHeight - modal.clientHeight) / 2 + 'px'
    })

    notify.style.top = window.innerHeight + 'px'
    notify.style.left = window.innerWidth - notify.clientWidth + 'px'
    posts.style.left = (window.innerWidth - posts.clientWidth) / 2 + 'px'

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
}