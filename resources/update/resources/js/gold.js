import { send } from "./ws.js"
import { t } from "./languages/translate.js"

document.querySelector('.navbar .gold').addEventListener('click', () => {
    send({
        type: 'system',
        action: 'get_gold_users'
    }, (usrs) => {
        if (usrs.users.some(item => item.id === JSON.parse(localStorage.getItem('udata')).id && true === false)) {
            document.querySelector('#gold').querySelector('.status').textContent = t('gold-purchased')
            document.querySelector('#gold').querySelector('.buttons').remove()
        }
        document.querySelector('#gold').querySelector('.buttons').querySelector('#buy-gold').addEventListener('click', () => {
            send({
                type: 'social',
                action: 'gold_pay'
            }, (payment) => {
                show_notification(t('gold-title'), payment.message)
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
                show_notification(t('gold-title'), payment.message)
                document.querySelector('#gold').querySelector('#form').classList.toggle('open')
                document.querySelector('#gold').querySelector('#form').classList.toggle('close')
            })
        })
    })
    document.querySelector('#gold').classList.add('opened')
})