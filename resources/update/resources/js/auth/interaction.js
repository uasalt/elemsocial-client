import { t } from '../languages/translate.js'
import { send } from '../ws.js'
import { truncateText, getMedia, show_notification } from '../functions.js'

var authDiv = document.querySelector('#auth')

// Слушатель события нажатия кнопки "Подтвердить вход"
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
			show_notification('Вход', t(response.message))

			const emailInput = document.querySelector('#auth input#email')
			const passwordInput = document.querySelector('#auth input#password')

			if (
				response.message == "Почта не может быть пустой" ||
				response.message == "Некорректный формат почты"
			) {
				passwordInput.style.borderBottom = '1px rgb(35, 35, 35) solid'
				emailInput.style.borderBottom = '1px rgb(110, 0, 76) solid'
			}

			if (
				response.message == "Пароль не может быть пустым" ||
				response.message == "Неверный пароль"
			) {
				emailInput.style.borderBottom = '1px rgb(35, 35, 35) solid'
				passwordInput.style.borderBottom = '1px rgb(110, 0, 76) solid'
			}

			if (response.message == "Аккаунт не найден") {
				emailInput.style.borderBottom = '1px rgb(110, 0, 76) solid'
				passwordInput.style.borderBottom = '1px rgb(110, 0, 76) solid'
			}
		}
	})
})

const loadProfile = (response) => {
    if (response.status == 'error') {
        show_notification(t('profile-title-name'), t('profile-not-found'))
        return
    }
    var data = response.data
    console.log(response)

    getMedia(data.avatar, document.querySelector('#show_profile').querySelector('.avatar'), 'assets/images/no-avatar.png')
    getMedia(data.cover, document.querySelector('#show_profile').querySelector('.cover'), 'assets/images/no-cover.png')

    if (data.description == null) {
        document.querySelector('#show_profile').querySelector('.description').style.display = 'none'
    } else {
        document.querySelector('#show_profile').querySelector('.description').style.display = 'block'
    }

    document.querySelector('#show_profile').querySelector('.description').innerHTML = `
    <div class="Title">${t('profile-description')}</div>
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
}

// Загрузка последних пользователей
send({
	type: 'system',
	action: 'get_last_users'
}, decryptedData => {
	const lastUsers = document.querySelector('#lastUsers')

	if (!lastUsers.querySelector('.user') || lastUsers.querySelectorAll('.user').length === 0) {
		decryptedData.users.forEach(user => {
			const usr = document.createElement('button')
			usr.className = "user"
			usr.setAttribute('data-username', user.username)
			usr.setAttribute('data-id', user.id)
			usr.innerHTML = `
				<img alt="avatar">
				<p>${truncateText(user.name)}</p>`

			usr.addEventListener('mouseenter', () => {
				const profile = document.querySelector('#show_profile')
				profile.style.opacity = 1
				profile.style.visibility = 'visible'
				send({
					type: 'social',
					action: 'get_profile',
                    payload: {
					    username: usr.getAttribute('data-username')
                    }
				}, loadProfile)
			})

			usr.addEventListener('mouseleave', () => {
				const profile = document.querySelector('#show_profile')
				profile.style.opacity = 0
				profile.style.visibility = 'hidden'
			})

			lastUsers.appendChild(usr)
			getMedia(JSON.parse(user.avatar), usr.querySelector('img'), 'assets/images/no-avatar.png')
		})

		lastUsers.style.display = 'block'
		lastUsers.style.left = (window.innerWidth - lastUsers.clientWidth) / 2 + 'px'

		const profile = document.querySelector('#show_profile')
		profile.style.left = `${(window.innerWidth - profile.clientWidth) / 2}px`

		window.addEventListener('resize', () => {
			lastUsers.style.left = (window.innerWidth - lastUsers.clientWidth) / 2 + 'px'
			profile.style.left = `${(window.innerWidth - profile.clientWidth) / 2}px`
		})
	}
})