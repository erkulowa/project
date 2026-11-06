// ELEMENTS

const playerCount = document.querySelector('#playerCount');
const playerStatus = document.querySelector('#playerStatus');
const hostSpeech = document.querySelector('#hostSpeech');
const crowd = document.querySelector('#crowd');


// VARIABLES

const TOTAL_PLAYERS = 120;
const TOTAL_GAMES = 2;
const CROWD_SIZE = 16;


// SHOW PLAYER STATUS

function showStatus() {
    const number = getPlayerNumber();
    const cleared = getClearedGames().length;
    const vote = localStorage.getItem('voteResult');

    if (vote && JSON.parse(vote).winner === 'stop') {
        playerStatus.textContent = 'GAME OVER';
        hostSpeech.textContent = 'The players voted. The game has ended.';
        return;
    }

    playerStatus.textContent =
        'ALIVE · ' + cleared + ' / ' + TOTAL_GAMES + ' TRIALS';

    hostSpeech.textContent = cleared === TOTAL_GAMES
        ? 'Well played, player ' + number + '. It is time to vote.'
        : 'Welcome, player ' + number + '. Choose a door.';
}


// COUNT PLAYERS

function countPlayers() {
    let count = 0;

    const counter = setInterval(function () {
        count += 3;
        playerCount.textContent = count;

        if (count >= TOTAL_PLAYERS) {
            clearInterval(counter);
        }
    }, 25);
}


// CREATE PLAYERS ON THE FLOOR

function createCrowd() {
    for (let i = 0; i < CROWD_SIZE; i++) {
        const player = document.createElement('span');
        const depth = Math.random();

        player.className = 'crowd-player';
        player.style.left = (i + Math.random()) * (100 / CROWD_SIZE) + '%';
        player.style.top = 20 + depth * 45 + '%';
        player.style.opacity = 0.45 + depth * 0.4;
        player.style.setProperty('--scale', 0.7 + depth * 0.4);
        player.style.animationDelay = -Math.random() * 3 + 's';

        crowd.append(player);
    }
}


// START

showPlayerBadge();
showStatus();
countPlayers();
createCrowd();
