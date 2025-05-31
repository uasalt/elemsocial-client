import { page } from './functions.js'

fetch('https://raw.githubusercontent.com/uasalt/elemsocial-client/refs/heads/main/resources/config.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (page('index.html')) {
            var list = []
            data['hidden-users'].forEach(item => {
                list.push(item.toString())
                document.querySelector('#settings .tiles').innerHTML += `<option>${item}</option>`
            })
            //icons = data['icons']
            localStorage.setItem('hiddenUsers', JSON.stringify(list))
            localStorage.setItem('first-start', true)
        }
    })