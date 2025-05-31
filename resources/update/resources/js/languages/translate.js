const current_lang = localStorage.getItem('lang') || 'ru'
var translation
var defaultTranslation

import { urls } from "../config.js"

export const load_lang = () => {
    fetch(`${urls.langs}/${current_lang}.json`)
        .then(res => {return res.json()})
        .then(a => translation = a)
}

await load_lang()

await fetch(`${urls.langs}/ru.json`)
    .then(res => {return res.json()})
    .then(a => defaultTranslation = a)

export const t = (key) => {
    return translation[key] || defaultTranslation[key] || key
}