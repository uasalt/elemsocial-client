import { send } from './ws.js'
import { t } from './languages/translate.js'
const { ipcRenderer } = require('electron')

const open = () => {
    var accountData = JSON.parse(localStorage.getItem('udata'))
    settings.querySelector('#name').value = accountData.name
    settings.querySelector('#username').value = accountData.username
    settings.querySelector('#email .hidden').textContent = accountData.email
    var free = Object.values(accountData.permissions).filter(v => v === true).length
    var all = Object.values(accountData.permissions).length - 1
    var status = `${free}/${all}`
    if (free == all) {
        status = t('settings-status-free')
    } else if (free == 0) {
        status = t("settings-status-freezed")
    }
    settings.querySelector('#status .hidden').textContent = status
    send({
        type: "social",
        action: "auth/sessions/load"
    }, data => {
        if (data.status == "success") {
            settings.querySelector('#sessions .hidden').textContent = data.current_session.device
        } else {
            settings.querySelector('#sessions .hidden').textContent = "Ошибка"
        }
    })
    settings.querySelector('#logout').addEventListener('click', () => {
        localStorage.removeItem("S-Key")
        location.href = 'auth.html'
        return
    })
    settings.querySelector('#developer').addEventListener('click', () => {
        ipcRenderer.send('devtools')
    })
    settings.querySelector('#avatarI').addEventListener('change', () => {
        send({
            type: 'social',
            action: 'change_profile/avatar/upload',
            file: new Uint8Array(settings.querySelector('#avatarI').files[0].arrayBuffer()),
        }, a=>show_notification('Профиль', 'Успех'))
    })
    settings.querySelector('#coverI').addEventListener('change', () => {
        send({
            type: 'social',
            action: 'change_profile/cover/upload',
            file: new Uint8Array(settings.querySelector('#coverI').files[0].arrayBuffer()),
        }, a=>show_notification('Профиль', 'Успех'))
    })
    settings.querySelector('#name').addEventListener('change', () => {
        send({
            type: 'social',
            action: 'change_profile/name',
            name: settings.querySelector('#name').value
        }, a=>show_notification('Профиль', 'Успех'))
    })
    settings.querySelector('#username').addEventListener('change', () => {
        send({
            type: 'social',
            action: 'change_profile/username',
            username: settings.querySelector('#username').value
        }, a=>show_notification('Профиль', 'Успех'))
    })
    document.querySelector(`#settings .center slider- option[value='${document.querySelector('.Posts slider-').value}']`).setAttribute('selected', '')
    document.querySelector(`#settings .center slider-`).addEventListener('change', event => {
        localStorage.setItem('feed', event.detail.value)
    })
    document.querySelector('#settings').classList.add('opened')
}

document.querySelector('.navbar .settings').addEventListener('click', open)