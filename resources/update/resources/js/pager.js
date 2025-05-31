import { page } from './functions.js'
import { t } from './languages/translate.js'

if (page("index.html")) {
    // index.html
    document.body.querySelector('#root').innerHTML = `<header>
    <input id="searcher" placeholder="${t("nav-search")}">
        <div class="EBalls">
            <div class="ui">E</div>
            <div class="count">0</div>
        </div>
        <img>
    </header>

    <context-menu style="visibility: hidden;opacity: 0;">
    </context-menu>

    <div class="navbar">
        <button>
            <svg xmlns="http://www.w3.org/2000/svg" style="margin-top: 2px;" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house">
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            <p>${t("nav-general")}</p>
        </button>
        <button class="music">
            <svg xmlns="http://www.w3.org/2000/svg" style="margin-top: 2px;" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-music-2">
                <circle cx="8" cy="18" r="4"/>
                <path d="M12 18V2l7 4"/>
            </svg>
            <p>${t("nav-music")}</p>
        </button>
        <button class="settings">
            <svg xmlns="http://www.w3.org/2000/svg" style="margin-top: 2px;" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
            <p>${t("nav-settings")}</p>
        </button>
        <button class="gold">
            <p>${t("nav-subscribe")}</p>
        </button>

        <div id="ad" nobg>
            <div class="tag">Версия 2.5</div>
            <div class="line">• Полностью изменена структура проекта</div>
            <div class="line">• Исправлена отправка постов</div>
            <div class="line">• Добавлена локализация языков</div>
            <div class="line">• Исправлены посты</div>
            <div class="line">• Исправлена музыка</div>
            <div class="line">• Добавлена загрузка</div>
            <div class="line">• Исправлена панель навигации</div>
            <div class="line">• Обновлены посты</div>
            <div class="line">• Добавлено авто обновление</div>
        </div>

        <div id="ad">
            <div class="tag">${t("nav-ad")}</div>
            <div class="text">Подпишитесь на канал автора соц. сети</div>
            <button open="https://xaromieChannel.t.me">${t("nav-ad-join")}</button>
        </div>

        <div id="ad">
            <div class="tag">${t("nav-ad")}</div>
            <div class="text">Подпишитесь на канал автора клиента</div>
            <button open="https://uasaltChannel.t.me">${t("nav-ad-join")}</button>
        </div>
    </div>

    <div class="air"></div>

    <div id="search">
        <slider style="width: 500px;">
            <option value="all" selected>Все</option>
            <option value="users">Пользователи</option>
            <option value="channels">Каналы</option>
            <option value="posts">Посты</option>
            <option value="music">Музыка</option>
        </slider>
        <results></results>
    </div>

    <div class="Posts scrollY">
        <div class="Post" id="sys">
            <textarea placeholder="${t("posts-post-text")}" rows="4"></textarea>
            <div class="buttons-container">
                <button id="add-file">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file">
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                        <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                    </svg>
                </button>
                <button id="send-post">${t("posts-post-send")}</button>
                <input type="file" id="file" style="display: none;">
            </div>
        </div>
        <slider->
            <option value="last">posts-slider-latest</option>
            <option value="rec">posts-slider-rec</option>
            <option value="subscribe">posts-slider-subscribe</option>
        </slider->
        <div class="Post loading-shimmer" style="height: 100px;" sys></div>
        <div class="Post loading-shimmer" style="height: 100px;" sys></div>
        <div class="Post loading-shimmer" style="height: 100px;" sys></div>
        <div class="Post loading-shimmer" style="height: 100px;" sys></div>
        <div class="Post loading-shimmer" style="height: 100px;" sys></div>
    </div>

    <div class="comments" style="opacity: 0;visibility: hidden;">
        <input placeholder="Текст">
        <button id="send">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send-horizontal-icon lucide-send-horizontal">
                <path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z"/>
                <path d="M6 12h16"/>
            </svg>
        </button>
        <hr style="border: 0.5px rgb(40, 40, 40) solid;">
        <div class="commentsd"></div>
    </div>

    <div id="quick_profile" style="transition: 0.3s;opacity: 0;visibility: hidden;">
        <div class="images">
            <img alt="Обложка" class="cover">
            <img alt="Аватар" class="avatar">
        </div>
        <div class="air"></div>
        <div class="nameContainer">
            <p class="name">----</p>
            <div id="userIcons"></div>
        </div>
        <p class="username">@----</p>
        <div class="subscribers">
            <button class="left"><p class="title">${t("profile-subscriptions")}</p><p class="count" id="subscriptions">-</p></button>
            <button class="center"><p class="title">${t("profile-subscribers")}</p><p class="count" id="subscribers">-</p></button>
            <button class="right"><p class="title">${t("profile-posts")}</p><p class="count" id="posts">-</p></button>
        </div>
        <div class="description">
            <div class="Title">${t("profile-description")}</div>
            profile-loading
        </div>
    </div>

    <div class="modal-window" id="gold">
        <div class="header">
            <p>${t("modal-title-subscribe")}</p>
            <button id="close" onclick="this.parentNode.parentNode.classList.toggle('opened')">✕</button>
        </div>
        <div class="gold-preview">
            <img src="https://elemsocial.com/static_sys/Images/SubscriptionLogo.svg" class="image">
            <p class="status">${t('gold-price')}</p>
        </div>
        <div class="tab advantages">
            <div class="item" id="increased-limits">${t("gold-increased-limits")}</div>
            <div class="item" id="unique-icon" data-json="{'src': 'GoldSub_Icon.mp4', 'desc': 'У вас в профиле будет уникальный значок, он так же будет виден на посте.'}">${t("gold-unique-icon")}</div>
            <div class="item" id="unique-theme" data-json="{'src': 'GoldSub_Theme.mp4', 'desc': 'У вас будет дополнительная золотая тема.'}">${t("gold-unique-theme")}</div>
            <div class="item" id="ad-deletion" data-json="{'src': 'GoldSub_Ad.mp4', 'desc': 'Вся реклама которая есть будет скрыта для вас.'}">${t("gold-ad-deletion")}</div>
            <div class="item" id="special-list" data-json="{'src': 'GoldSub_List.mp4', 'desc': 'Ваш аккаунт будет добавлен в особый список на главной странице.'}">${t("gold-special-list")}</div>
        </div>
        <div id="form" class="close">
            <p style="margin-bottom: 10px;">${t("gold-enter-code")}</p>
            <input type="text" id="code" placeholder="XXXXXXX-XXXXX-XXXXX"><br>
            <button id="activate">${t("gold-activate")}</button>
        </div>
        <div class="buttons">
            <button id="buy-gold">${t('gold-buy')}</button>
            <button id="activate-gold">${t("gold-activate")}</button>
        </div>
    </div>

    <div class="modal-window" id="music">
        <div class="header">
            <p>${t("modal-title-music")}</p>
            <button id="close" onclick="this.parentNode.parentNode.classList.toggle('opened')">✕</button>
        </div>

        <div class="title">${t("music-playlist-favorite")}</div>
        <div class="favorites"></div>
        <div class="title">${t("music-playlist-latest")}</div>
        <div class="latest">
            <div class="item" onclick="addMusic()">
                <img class="image" src="assets/svg/plus.svg" style="background-color: rgb(25, 25, 25);">
                <p id="name">${t("music-add")}</p>
                <p id="artist">${t("music-empty")}</p>
            </div>
        </div>
        <div class="title">${t("music-playlist-random")}</div>
        <div class="random"></div>
    </div>

    <div class="player">
        <audio autoplay></audio>
        <img class="image" src="assets/images/no-music-cover.jpg">
        <p id="name">${t("music-player-title")}</p>
        <p id="artist">${t("music-player-artist")}</p>
        <div id="icons">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>

            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-skip-back-icon lucide-skip-back"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" x2="5" y1="19" y2="5"/></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play"><polygon points="6 3 20 12 6 21 6 3"/></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-skip-forward-icon lucide-skip-forward"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-repeat-icon lucide-repeat"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
        </div>
        <div class="timeline">
            <p class="current-time">00:00</p>
            <input type="range" value="0">
            <p class="duration">00:00</p>
        </div>
    </div>

    <div class="modal-window" id="settings">
        <div class="header">
            <p>${t("modal-title-settings")}</p>
            <button id="close" onclick="this.parentNode.parentNode.classList.remove('opened')">✕</button>
        </div>
        <div class="center">
            <img id="cover" src="" alt="Обложка" onclick="this.parentNode.parentNode.parentNode.querySelector('#coverI').click()">
        </div>
        <div class="center">
            <img id="avatar" src="" alt="Аватар" onclick="this.parentNode.parentNode.parentNode.querySelector('#avatarI').click()">
        </div>
        <input type="file" id="avatarI">
        <input type="file" id="coverI">
        <div style="margin-top: 58px;"></div>
        <div class="center">
            <input type="name" id="name" placeholder="${t("settings-name")}"><br>
            <input type="username" id="username" placeholder="${t("settings-username")}">
        </div>
        <div style="margin-top: 10px;"></div>
        <div class="center">
            <div class="button" id="email">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail-icon lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <p class="text">${t("settings-change-email")}</p>
                <p class="hidden">example@email.com</p>
            </div>
            <br>
            <div class="button" id="password">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-key-round-icon lucide-key-round"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg>
                <p class="text">${t("settings-change-password")}</p>
                <p class="hidden"></p>
            </div>
            <br>
            <div class="button" id="sessions">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-monitor-smartphone-icon lucide-monitor-smartphone"><path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8"/><path d="M10 19v-3.96 3.15"/><path d="M7 19h5"/><rect width="6" height="10" x="16" y="12" rx="2"/></svg>
                <p class="text">${t("settings-sessions")}</p>
                <p class="hidden">${t("settings-hidden-loading")}</p>
            </div>
            <br>
            <div class="button" id="status">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert-icon lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                <p class="text">${t("settings-my-status")}</p>
                <p class="hidden">${t("settings-hidden-loading")}</p>
            </div>
            <br>
            <div class="button" id="language">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-languages-icon lucide-languages"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
                <p class="text">${t("settings-language")}</p>
                <p class="hidden">Русский</p>
            </div>
            <br>
            <div class="button" id="information">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-icon lucide-book"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>
                <p class="text">${t('settings-info')}</p>
                <p class="hidden"></p>
            </div>
            <br>
            <div class="button" id="bug-report">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bug-icon lucide-bug"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>
                <p class="text">${t("settings-ask-problem")}</p>
                <p class="hidden">0</p>
            </div>
            <br>
            <div class="button" id="developer">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code-xml-icon lucide-code-xml"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
                <p class="text">${t("settings-dev-mode")}</p>
                <p class="hidden"></p>
            </div>
            <br>
            <div class="tiles">
                <option></option>
            </div>
            <br>
            <slider- style="width: 350px;margin: 0;margin-bottom: 5px;">
                <option value="last">posts-slider-latest</option>
                <option value="rec">posts-slider-rec</option>
                <option value="subscribe">posts-slider-subscribe</option>
            </slider->
            <br>
            <div class="button" id="logout">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out-icon lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                <p class="text">${t("settings-logout")}</p>
                <p class="hidden"></p>
            </div>
        </div>
    </div>

    <div id="notification">
        <img src="https://elemsocial.com/static_sys/Images/DarkLogo.svg">
        <p class="title">Title</p>
        <p class="description">Description</p>
    </div>`
    await import("./center.js")
} else if (page('auth.html')) {
    if (localStorage.getItem('S-Key')) { location.href = 'index.html' }
    document.body.querySelector('#root').innerHTML = `
<div id="lastUsers" style="display: none;">
    <div id="show_profile" style="transition: 0.3s;opacity: 0;visibility: hidden;">
        <div class="images">
            <img src="assets/images/no-cover.png" class="cover">
            <img src="assets/images/no-avatar.png" class="avatar">
        </div>
        <div class="air"></div>
        <div class="nameContainer">
            <p class="name">----</p>
            <div id="userIcons"></div>
        </div>
        <p class="username">@----</p>
        <div class="subscribers">
            <button class="left"><p class="title">${t('profile-subscriptions')}</p><p class="count" id="subscriptions">-</p></button>
            <button class="center"><p class="title">${t('profile-subscribers')}</p><p class="count" id="subscribers">-</p></button>
            <button class="right"><p class="title">${t('profile-posts')}</p><p class="count" id="posts">-</p></button>
        </div>
        <div class="description">
            <div class="Title">Описание</div>
            ${t('profile-loading')}
        </div>
    </div>
</div>

<div id="auth">
    <div class="left">
        <img src="assets/images/logo.png" alt="Лого">
        <h2>Element</h2>
    </div>
    <div class="right">
        <h2>${t('auth-title')}</h2>
        <div id="values">
            <label id="email">${t('auth-email')}</label>
            <input id="email" type="email" placeholder=" "><br>
            <label id="password">${t('auth-password')}</label>
            <input id="password" type="password" placeholder=" "><br>
        </div>
        <button id="confirm">${t('auth-login')}</button>
    </div>
</div>

<div id="notification">
    <img src="https://elemsocial.com/static_sys/Images/DarkLogo.svg">
    <p class="title">Title</p>
    <p class="description">Description</p>
</div>`
    await import("./center.js")
}