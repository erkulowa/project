// homework 1

const gmailInput = document.querySelector('#gmail_input')
const gmailButton = document.querySelector('#gmail_button')
const gmailResult = document.querySelector('#gmail_result')

const regExp = /^[\w.]+@(gmail|icloud|outlook)\.com$/

gmailButton.onclick = () => {
    if (regExp.test(gmailInput.value)) {
        gmailResult.innerHTML = 'OK'
        gmailResult.style.color = 'green'
    } else {
        gmailResult.innerHTML = 'ERROR'
        gmailResult.style.color = 'red'
    }
}

// homework 1.2

// const parentBlock = document.querySelector('.parent_block')
// const childBlock = document.querySelector('.child_block')

// let position = 0;

// parentBlock.style.position = 'relative';
// childBlock.style.position = 'absolute';

// function move() {
//     if (position >= 448) {
//         return;
//     }
//     position += 1;
//     childBlock.style.left = `${position}px`

//     requestAnimationFrame(move)
// }

// move()

const parentBlock = document.querySelector('.parent_block')
const childBlock = document.querySelector('.child_block')

let positionX = 0
let positionY = 0

const maxWidth = parentBlock.clientWidth - childBlock.offsetWidth
const maxHeight = parentBlock.clientHeight - childBlock.offsetHeight

const move = () => {
    childBlock.style.left = `${positionX}px`
    childBlock.style.top = `${positionY}px`

    if (positionX < maxWidth && positionY === 0) {
        positionX++
    } else if (positionX >= maxWidth && positionY < maxHeight) {
        positionY++
    } else if (positionY >= maxHeight && positionX > 0) {
        positionX--
    } else if (positionX <= 0 && positionY > 0) {
        positionY--
    }

    requestAnimationFrame(move)

}
move()


const seconds = document.querySelector('#seconds');
const startButton = document.querySelector('#start');
const stopButton = document.querySelector('#stop');
const resetButton = document.querySelector('#reset');

let count = 0;
let interval = null;

startButton.onclick = () => {
    if (interval === null) {
        interval = setInterval(() => {
            count++;
            seconds.textContent = count;
        }, 1000);
    }
};

stopButton.onclick = () => {
    clearInterval(interval);
    interval = null;
};

resetButton.onclick = () => {
    clearInterval(interval);
    interval = null;
    count = 0;
    seconds.textContent = count;
};


// Squid Game Characters

const charactersList = document.querySelector('.characters-list');

const xhr = new XMLHttpRequest();

xhr.open('GET', '../data/characters.json');

xhr.send();

xhr.onload = function () {
    console.log(xhr.status);

    if (xhr.status === 200) {
        const characters = JSON.parse(xhr.response);

        characters.forEach((character) => {
            charactersList.innerHTML += `
                <div class="character-card">
                    <img src="${character.photo}" alt="${character.name}">
                    <h3>${character.name}</h3>
                    <p>Player ${character.number}</p>
                </div>
            `;
        });
    }
};


const xhr2 = new XMLHttpRequest();

xhr2.open('GET', '../data/any.json');

xhr2.send();

xhr2.onload = function () {
    const data = JSON.parse(xhr2.response);

    console.log(data);
};