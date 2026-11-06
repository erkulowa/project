// ELEMENTS

const votePage = document.querySelector('#votePage');
const voteTitle = document.querySelector('#voteTitle');
const voteText = document.querySelector('#voteText');

const pigStage = document.querySelector('#pigStage');
const pigMoney = document.querySelector('#pigMoney');
const coins = document.querySelector('#coins');

const continueCount = document.querySelector('#continueCount');
const stopCount = document.querySelector('#stopCount');
const barContinue = document.querySelector('#barContinue');
const barStop = document.querySelector('#barStop');

const voteButtons = document.querySelector('#voteButtons');
const continueButton = document.querySelector('#continueButton');
const stopButton = document.querySelector('#stopButton');
const voteProgress = document.querySelector('#voteProgress');

const nextButton = document.querySelector('#nextButton');
const leaveButton = document.querySelector('#leaveButton');


// VARIABLES

const TOTAL_VOTES = 120;
const PRIZE_PER_PLAYER = 100000;
const MONEY_HEIGHT = 250;

let continueVotes = 0;
let stopVotes = 0;


// DRAW THE COUNTERS AND THE PIG

function drawVotes() {
    const counted = continueVotes + stopVotes;

    continueCount.textContent = continueVotes;
    stopCount.textContent = stopVotes;

    barContinue.style.width = continueVotes / TOTAL_VOTES * 100 + '%';
    barStop.style.width = stopVotes / TOTAL_VOTES * 100 + '%';

    // The pig fills up as the votes come in, from 15% to 100%
    const fill = 0.15 + 0.85 * counted / TOTAL_VOTES;

    pigMoney.style.transform =
        'translateY(' + (1 - fill) * MONEY_HEIGHT + 'px)';
}


// FALLING MONEY

function dropMoney(amount) {
    for (let i = 0; i < amount; i++) {
        const coin = document.createElement('span');

        coin.className = Math.random() < 0.25 ? 'coin bill' : 'coin';
        coin.style.left = 15 + Math.random() * 70 + '%';
        coin.style.animationDelay = Math.random() * 0.2 + 's';
        coin.style.setProperty('--fall-time', 1 + Math.random() * 0.8 + 's');
        coin.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
        coin.style.setProperty('--spin', Math.random() * 720 + 'deg');

        coin.onanimationend = function () {
            coin.remove();
        };

        coins.append(coin);
    }
}

function shakePig() {
    pigStage.classList.remove('shake');
    void pigStage.offsetWidth;
    pigStage.classList.add('shake');
}


// VOTE

function vote(choice) {
    voteButtons.classList.add('hidden');
    voteProgress.classList.remove('hidden');
    voteText.textContent = 'You voted ' + choice.toUpperCase() + '. Counting the votes...';

    if (choice === 'continue') {
        continueVotes = 1;
    } else {
        stopVotes = 1;
    }

    // Other players: the final score is decided first, never a tie
    let finalContinue = 40 + Math.floor(Math.random() * 41);

    if (finalContinue === TOTAL_VOTES / 2) {
        finalContinue += choice === 'continue' ? 1 : -1;
    }

    const finalStop = TOTAL_VOTES - finalContinue;

    countVotes(finalContinue, finalStop);
}

function countVotes(finalContinue, finalStop) {
    const counter = setInterval(function () {
        const batch = 1 + Math.floor(Math.random() * 4);

        for (let i = 0; i < batch; i++) {
            const leftContinue = finalContinue - continueVotes;
            const leftStop = finalStop - stopVotes;

            if (leftContinue + leftStop === 0) break;

            if (Math.random() * (leftContinue + leftStop) < leftContinue) {
                continueVotes++;
            } else {
                stopVotes++;
            }
        }

        drawVotes();
        dropMoney(batch);
        shakePig();
        playTone(1400 + Math.random() * 500, 0.07, 'triangle', 0.06);

        const counted = continueVotes + stopVotes;

        voteProgress.textContent = counted + ' / ' + TOTAL_VOTES + ' VOTES';

        if (counted === TOTAL_VOTES) {
            clearInterval(counter);

            const result = {
                winner: continueVotes > stopVotes ? 'continue' : 'stop',
                continueVotes: continueVotes,
                stopVotes: stopVotes
            };

            localStorage.setItem('voteResult', JSON.stringify(result));

            setTimeout(function () {
                showResult(result, true);
            }, 800);
        }
    }, 130);
}


// RESULT

function showResult(result, isNew) {
    continueVotes = result.continueVotes;
    stopVotes = result.stopVotes;

    drawVotes();

    voteButtons.classList.add('hidden');
    voteProgress.classList.add('hidden');

    if (result.winner === 'continue') {
        const prize = TOTAL_VOTES * PRIZE_PER_PLAYER;

        votePage.classList.add('continue-won');
        voteTitle.textContent = 'THE GAME CONTINUES';
        voteText.textContent =
            'The prize grows to ₩' + prize.toLocaleString('en-US') +
            '. Your next trial is waiting.';

        nextButton.classList.remove('hidden');

        if (isNew) {
            dropMoney(70);
            playTone(523, 0.2, 'triangle');
            playTone(784, 0.5, 'triangle', 0.2, 0.2);
        }
    } else {
        votePage.classList.add('stop-won');
        voteTitle.textContent = 'THE GAME IS OVER';
        voteText.textContent =
            'The majority chose to stop. The players go home with nothing.';

        leaveButton.classList.remove('hidden');

        if (isNew) {
            playTone(110, 1.2, 'sawtooth');
        }
    }
}


// BUTTONS

continueButton.onclick = function () {
    vote('continue');
};

stopButton.onclick = function () {
    vote('stop');
};

nextButton.onclick = function () {
    localStorage.removeItem('voteResult');
    localStorage.removeItem('clearedGames');
    window.location.href = 'games.html';
};

leaveButton.onclick = function () {
    localStorage.removeItem('voteResult');
    localStorage.removeItem('clearedGames');
    localStorage.removeItem('playerNumber');
    window.location.href = 'invitation.html';
};


// START

const savedResult = localStorage.getItem('voteResult');

showPlayerBadge();
drawVotes();

if (savedResult) {
    showResult(JSON.parse(savedResult), false);
}
