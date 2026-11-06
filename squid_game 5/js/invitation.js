// ELEMENTS

const intro = document.querySelector('#intro');
const startButton = document.querySelector('#startButton');

const game = document.querySelector('#game');
const playArea = document.querySelector('#playArea');
const blueTtakji = document.querySelector('#blueTtakji');
const redTtakji = document.querySelector('#redTtakji');

const attempt = document.querySelector('#attempt');
const score = document.querySelector('#score');
const gameMessage = document.querySelector('#gameMessage');
const throwButton = document.querySelector('#throwButton');
const impact = document.querySelector('#impact');

const result = document.querySelector('#result');
const resultTitle = document.querySelector('#resultTitle');
const resultText = document.querySelector('#resultText');
const cardButton = document.querySelector('#cardButton');
const retryButton = document.querySelector('#retryButton');

const invitation = document.querySelector('#invitation');
const goldCard = document.querySelector('#goldCard');
const invitationCode = document.querySelector('#invitationCode');

const codeForm = document.querySelector('#codeForm');
const codeInput = document.querySelector('#codeInput');
const codeMessage = document.querySelector('#codeMessage');


// GAME VARIABLES

const WINS_NEEDED = 3;

let round = 0;
let playerWins = 0;
let recruiterWins = 0;
let isPlaying = false;
let secretCode = '';


// SOUND

let audioContext = null;

function getAudioContext() {
    const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return null;

    if (!audioContext) {
        audioContext = new AudioContextClass();
    }

    return audioContext;
}

// Low tone that rises while the ttakji is in the air

function playTensionSound() {
    const context = getAudioContext();

    if (!context) return;

    const oscillator = context.createOscillator();
    const volume = context.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(50, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
        240,
        context.currentTime + 0.65
    );

    volume.gain.setValueAtTime(0.01, context.currentTime);
    volume.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.6);
    volume.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.65);

    oscillator.connect(volume);
    volume.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.65);
}

// Heavy hit when the ttakji lands

function playImpactSound() {
    const context = getAudioContext();

    if (!context) return;

    const oscillator = context.createOscillator();
    const volume = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(150, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
        40,
        context.currentTime + 0.3
    );

    volume.gain.setValueAtTime(0.6, context.currentTime);
    volume.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.35);

    oscillator.connect(volume);
    volume.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.35);
}


// START GAME

startButton.onclick = function () {
    intro.classList.add('hidden');
    game.classList.remove('hidden');
};


// RESET ANIMATIONS

function resetThrow() {
    redTtakji.classList.remove('throw');
    blueTtakji.classList.remove('flipped');
    playArea.classList.remove('shake');
    impact.classList.remove('show');
}


// SHOW SCORE

function showScore() {
    score.textContent =
        'YOU ' + playerWins + ' : ' + recruiterWins + ' RECRUITER';
}


// THE RECRUITER TAKES ROUND 1, THE PLAYER TAKES ROUND 2

function isThrowSuccessful() {
    if (round === 1) return false;
    if (round === 2) return true;

    return Math.random() < 0.65;
}


// THROW TTAKJI

throwButton.onclick = function () {

    if (isPlaying) {
        return;
    }

    isPlaying = true;
    throwButton.disabled = true;

    round++;

    attempt.textContent = 'ROUND ' + round;
    gameMessage.textContent = 'Make your move.';

    resetThrow();

    void redTtakji.offsetWidth;

    // Throw the red Ttakji

    redTtakji.classList.add('throw');
    playTensionSound();

    setTimeout(function () {

        // Shake the scene on impact

        playArea.classList.add('shake');
        impact.classList.add('show');
        playImpactSound();

        if (isThrowSuccessful()) {

            playerWins++;
            blueTtakji.classList.add('flipped');

            gameMessage.textContent = 'YOU FLIPPED IT!';

        } else {

            recruiterWins++;

            gameMessage.textContent = 'IT DID NOT FLIP! THE RECRUITER SCORES.';

        }

        showScore();

        // Wait, then continue or show the result

        setTimeout(function () {

            if (playerWins === WINS_NEEDED || recruiterWins === WINS_NEEDED) {

                showResult();

            } else {

                resetThrow();

                throwButton.disabled = false;
                isPlaying = false;

                gameMessage.textContent =
                    'First to ' + WINS_NEEDED + ' wins. Throw again.';

            }

        }, 1000);

    }, 650);

};


// SHOW FINAL RESULT

function showResult() {

    game.classList.add('hidden');
    result.classList.remove('hidden');

    if (playerWins === WINS_NEEDED) {

        result.classList.add('win');
        resultTitle.textContent = 'YOU WON';
        resultText.textContent =
            'You passed the challenge. Your invitation awaits.';

        cardButton.classList.remove('hidden');

    } else {

        result.classList.add('lose');
        resultTitle.textContent = 'YOU LOST';
        resultText.textContent =
            'You failed the challenge. Would you like another chance?';

        retryButton.classList.remove('hidden');

    }

}


// RETRY THE GAME

retryButton.onclick = function () {

    round = 0;
    playerWins = 0;
    recruiterWins = 0;
    isPlaying = false;

    result.classList.add('hidden');
    result.classList.remove('lose');
    retryButton.classList.add('hidden');

    game.classList.remove('hidden');

    attempt.textContent = 'ROUND 1';
    gameMessage.textContent = 'Flip the blue square.';
    showScore();

    throwButton.disabled = false;

    resetThrow();

};


// SHOW GOLDEN CARD

cardButton.onclick = function () {

    result.classList.add('hidden');
    invitation.classList.remove('hidden');

    // Generate a random 8-digit code

    secretCode = String(
        Math.floor(10000000 + Math.random() * 90000000)
    );

    // Display the code as 1234 5678

    invitationCode.textContent =
        secretCode.substring(0, 4) + ' ' +
        secretCode.substring(4);

};


// FLIP THE CARD

goldCard.onclick = function () {

    goldCard.classList.toggle('open');

};


// FORMAT THE INPUT CODE

codeInput.oninput = function () {

    let code = codeInput.value.replace(/\D/g, '');

    code = code.substring(0, 8);

    if (code.length > 4) {
        code = code.substring(0, 4) + ' ' + code.substring(4);
    }

    codeInput.value = code;

    codeMessage.textContent = '';
    codeMessage.className = '';
};


// CHECK THE CODE

codeForm.onsubmit = function (event) {

    event.preventDefault();

    const enteredCode = codeInput.value.replace(/\s/g, '');

    if (enteredCode === secretCode) {

        codeMessage.textContent = 'Correct code. Welcome.';
        codeMessage.className = 'success';

        localStorage.setItem('playerNumber', '067');

        setTimeout(function () {
            window.location.href = 'index.html';
        }, 1200);

    } else {

        codeMessage.textContent = 'Incorrect code. Try again.';
        codeMessage.className = 'error';

    }

};
