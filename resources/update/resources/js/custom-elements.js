import { t } from './languages/translate.js'

class slider extends HTMLElement {
    connectedCallback() {
      this.querySelectorAll('option').forEach(option => {
        option.innerHTML = t(option.innerHTML)
        option.addEventListener('click', () => {
            this.querySelector('option[selected]').removeAttribute('selected')
            this.value = option.value
            option.setAttribute('selected', '')
            option.dispatchEvent(new CustomEvent('change', {
                detail: { value: option.value },
                bubbles: true,
                composed: true
            }))
        })
      })
    }
}

customElements.define('slider-', slider)