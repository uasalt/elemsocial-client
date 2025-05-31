import { send } from './ws.js'
import { t } from './languages/translate.js'
import { getMedia, show_notification } from './functions.js'
import { urls } from './config.js'

const sendNotify = (blob, title, body) => {
    Notification.requestPermission().then(async permission => {
        if (permission === "granted" && localStorage.getItem('push-notifications')) {
            function blobToBase64(blob) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result)
                    reader.onerror = reject
                    reader.readAsDataURL(blob)
                })
            }
            var icon = URL.createObjectURL(blob)
            new Notification(title, {
                icon: icon,
                body: body
            })
        } else {
            show_notification(title, body, URL.createObjectURL(blob), false, 3500)
        }
    })
}

const prepareNotify = (notifications) => {
    notifications.forEach((notification) => {
        if (notification.viewed === 1) {return}

        var body = t('notifier-unknown')
        if (notification.action === "PostLike") {
            body = t('notifier-post-liked')
        } else if (notification.action === 'PostDislike') {
            body = t('notifier-post-disliked')
        } else if (notification.action === 'PostComment') {
            body = t('notifier-post-commented').replace('%1', notification.content.Text)
        } else if (notification.action === 'ProfileSubscribe') {
            body = t('notifier-subscribes')
        } else if (notification.action === 'ProfileUnsubscribe') {
            body = t('notifier-unsubscribes')
        }
        getMedia(notification.author.avatar, blob => sendNotify(blob, notification.author.name, body), "")
    })
}

const check_notifications = async () => {
    send({
        type: 'social',
        action: 'notifications/load',
        payload: {
            start_index: 0
        }
    }, r => {
        if (r.status == 'success') {
            prepareNotify(r.notifications)
        }
    })
}

setInterval(check_notifications, 1000)

send({
    type: 'messenger',
    action: 'load_chats'
})

setInterval(() => send({
    type: 'messenger',
    action: 'load_chats'
}), 2500)