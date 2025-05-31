try {
    await import("./pager.js")
    await import("./custom-elements.js")
    await import("./update.js")
} catch {
    location.reload()
}
import { database } from './functions.js'
const { send, connect } = await import("./ws.js")
document.send = send
console.clear()
console.warn(`Если нужно вручную данные в сокет: document.send({ ... })

Для загрузки расширений: document.ext() ( Что бы разрешить автозагрузку напишите: document.allowAutorun() )
Для установки расширения: document.instExt( *ссылка либо текст скрипта* , *название*)`)

const allowAutorun = () => {
    localStorage.setItem('autorun', 'true')
    console.warn('Если вы не доверяете издателю расширения не загружайте его так как оно может получить доступ ко всей файловой системе и д.р')
}
const ext = async () => {
    console.warn('Если вы не доверяете издателю расширения не загружайте его так как оно может получить доступ ко всей файловой системе и д.р')
    var r = await database(false, undefined, 'scripts')
    console.log(r)
}

if (localStorage.getItem('autorun') && localStorage.getItem('autorun') == 'true') {
    ext()
}

document.allowAutorun = allowAutorun
document.ext = ext
document.database = database