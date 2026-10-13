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

const parentBlock = document.querySelector('.parent_block')
const childBlock = document.querySelector('.child_block')

let position = 0;

parentBlock.style.position = 'relative';
childBlock.style.position = 'absolute';

function move() {
    if (position >= 448) {
        return;
    }
    position += 1;
    childBlock.style.left = `${position}px`

    requestAnimationFrame(move)
}

move()