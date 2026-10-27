// PHONE 

const phoneInput = document.querySelector('#phone_input')
const phoneButton = document.querySelector('#phone_button')
const phoneResult = document.querySelector('#phone_result')

// const regExp = /\+996 [2579]\d{2} \d{3} \d{3}/
const regExp = /^\+996 [2579]\d{2} \d{2}-\d{2}-\d{2}$/

phoneButton.onclick = () => {
    if (regExp.test(phoneInput.value)) {
        phoneResult.innerHTML = 'OK'
        phoneResult.style.color = 'green'
    } else {
        phoneResult.innerHTML = 'ERROR'
        phoneResult.style.color = 'red'
    }
}

// TAB SLIDER

const tabContentBlocks = document.querySelectorAll('.tab_content_block')
const tabs = document.querySelectorAll('.tab_content_item')
const tabsParent = document.querySelector('.tab_content_items')


const hideTabContent = () => {
    tabContentBlocks.forEach((block) => {
        block.style.display = 'none'
    })
    tabs.forEach((tab) => {
        tab.classList.remove('tab_content_item_active')
    })
}

const showTabContent = (i = 0) => {
    tabContentBlocks[i].style.display = 'block'
    tabs[i].classList.add('tab_content_item_active')
}

hideTabContent()
showTabContent()

tabsParent.onclick = (event) => {
    if (event.target.classList.contains('tab_content_item')) {
        tabs.forEach((tab, tabIndex) => {
            if (tab.innerText === event.target.innerText) {
                hideTabContent()
                showTabContent(tabIndex)
            }
        })
    }
}

let currentIndex = 0

setInterval (() => {
    currentIndex++

    if (currentIndex >= tabs.length) {
        currentIndex = 0
    }

    hideTabContent()
    showTabContent(currentIndex)
}, 5000)

// converter 

const usdInput = document.querySelector('#usd')
const somInput = document.querySelector('#som')
const eurInput = document.querySelector('#eur')

const getCurrency = (element, target, another) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', '../data/converter.json')
    xhr.setRequestHeader('Content-type', 'application/json')
    xhr.send()

    xhr.onload = () => {
        const data = JSON.parse(xhr.response)
        element.oninput = () => {
            if (element.id === 'som') {
                target.value = (element.value / data.usd).toFixed(2)
                another.value = (element.value / data.eur).toFixed(2)
            }
            if (element.id === 'usd') {
                target.value = (element.value * data.usd).toFixed(2)
                another.value = (element.value / data.eur).toFixed(2)
            }
            if (element.id === 'eur') {
                target.value = (element.value * data.usd).toFixed(2)
                another.value = (element.value / data.eur).toFixed(2);
            }
            if (element.value === '') {
                target.value = ''
                another.value = ''
            }
        }
    }
}

getCurrency(somInput, usdInput, eurInput);
getCurrency(usdInput, somInput, eurInput);
getCurrency(eurInput, somInput, usdInput);


// getCurrency(somInput, usdInput)
// getCurrency(usdInput, somInput)


// somInput.oninput = () => {
//     const xhr = new XMLHttpRequest()
//     xhr.open('GET', '../data/converter.json')
//     xhr.setRequestHeader('Content-type', 'application/json')
//     xhr.send()

//     xhr.onload = () => {
//         const data = JSON.parse(xhr.response)
//         usdInput.value = (somInput.value / data.usd).toFixed(2)
//     }
// }

// usdInput.oninput = () => {
//     const xhr = new XMLHttpRequest()
//     xhr.open('GET', '../data/converter.json')
//     xhr.setRequestHeader('Content-type', 'application/json')
//     xhr.send()

//     xhr.onload = () => {
//         const data = JSON.parse(xhr.response)
//         somInput.value = (usdInput.value * data.usd).toFixed(2)
//     }
// }

// DRY - don't repeat yourself
// KISS - keep it simple, stupid
// KISS - keep it super simple
// BEM - meaningful class name
