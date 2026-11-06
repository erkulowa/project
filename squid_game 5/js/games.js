// ELEMENTS

const screens = document.querySelectorAll('.screen');
const menu = document.querySelector('#menu');
const resultScreen = document.querySelector('#resultScreen');
const resultTitle = document.querySelector('#resultTitle');
const resultText = document.querySelector('#resultText');
const retryButton = document.querySelector('#retryButton');
const voteLink = document.querySelector('#voteLink');

const lightStart = document.querySelector('#lightStart');
const lightPlay = document.querySelector('#lightPlay');
const lightSignal = document.querySelector('#lightSignal');
const lightTimer = document.querySelector('#lightTimer');
const track = document.querySelector('#track');
const watcher = document.querySelector('#watcher');
const runner = document.querySelector('#runner');
const moveButton = document.querySelector('#moveButton');

const mazeStart = document.querySelector('#mazeStart');
const mazePlay = document.querySelector('#mazePlay');
const mazeTimer = document.querySelector('#mazeTimer');
const mazeCanvas = document.querySelector('#maze');
const mazeContext = mazeCanvas.getContext('2d');


// SCREENS

function showScreen(screen) {
    screens.forEach(function (item) {
        item.classList.add('hidden');
    });

    screen.classList.remove('hidden');
}

function showMenu() {
    const cleared = getClearedGames();

    [['light', '#lightState'], ['maze', '#mazeState']].forEach(function (game) {
        const state = document.querySelector(game[1]);
        const isCleared = cleared.includes(game[0]);

        state.textContent = isCleared ? 'CLEARED' : 'NOT CLEARED';
        state.classList.toggle('cleared', isCleared);
    });

    showScreen(menu);
}

document.querySelectorAll('[data-menu]').forEach(function (button) {
    button.onclick = showMenu;
});


// RESULT

let lastGame = '';

function showResult(game, won, text) {
    lastGame = game;

    if (won) {
        const cleared = getClearedGames();

        if (!cleared.includes(game)) {
            cleared.push(game);
            localStorage.setItem('clearedGames', JSON.stringify(cleared));
        }

        playTone(523, 0.2, 'triangle');
        playTone(659, 0.2, 'triangle', 0.2, 0.15);
        playTone(784, 0.4, 'triangle', 0.2, 0.3);
    } else {
        playTone(180, 0.7, 'sawtooth');
    }

    resultTitle.textContent = won ? 'CLEARED' : 'ELIMINATED';
    resultTitle.className = 'result-title ' + (won ? 'win' : 'lose');
    resultText.textContent = text;

    retryButton.classList.toggle('hidden', won);
    voteLink.classList.toggle('hidden', getClearedGames().length < 2);

    showScreen(resultScreen);
}

retryButton.onclick = function () {
    showScreen(lastGame === 'light' ? lightStart : mazeStart);
};


// RED LIGHT, GREEN LIGHT

const LIGHT_TIME = 30;
const LIGHT_SPEED = 11; // percent of the track per second
const WARNING_TIME = 450;
const GRACE_TIME = 180; // time to release the key after the light turns red

let lightRunning = false;
let lightState = 'green';
let lightPosition = 0;
let lightTimeLeft = 0;
let lightChange = null;
let lastFrame = 0;
let redSince = 0;
let isMoving = false;

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

function setLight(state) {
    lightState = state;

    watcher.className = 'watcher ' + state;
    lightSignal.className = 'signal ' + state;
    track.classList.toggle('red-light', state === 'red');

    if (state === 'green') {
        lightSignal.textContent = 'GREEN LIGHT';
        playTone(660, 0.18, 'triangle');
        lightChange = setTimeout(function () {
            setLight('warning');
        }, randomBetween(1400, 3200));
    }

    if (state === 'warning') {
        lightSignal.textContent = 'GET READY';
        playTone(440, 0.15, 'square', 0.1);
        lightChange = setTimeout(function () {
            setLight('red');
        }, WARNING_TIME);
    }

    if (state === 'red') {
        redSince = performance.now();
        lightSignal.textContent = 'RED LIGHT';
        playTone(150, 0.45, 'sawtooth');
        lightChange = setTimeout(function () {
            setLight('green');
        }, randomBetween(1200, 2400));
    }
}

function setMoving(moving) {
    isMoving = moving && lightRunning;

    runner.classList.toggle('moving', isMoving);
    moveButton.classList.toggle('active', isMoving);
}

function drawRunner() {
    // The finish line is at 79% of the track height
    runner.style.bottom = 4 + lightPosition * 0.75 + '%';
    runner.style.transform =
        'translateX(-50%) scale(' + (1.25 - lightPosition * 0.006) + ')';
}

function startLightGame() {
    lightRunning = true;
    lightPosition = 0;
    lightTimeLeft = LIGHT_TIME;
    lastFrame = performance.now();

    runner.classList.remove('caught');
    setMoving(false);
    drawRunner();
    showScreen(lightPlay);
    setLight('green');

    requestAnimationFrame(updateLightGame);
}

function updateLightGame(now) {
    if (!lightRunning) return;

    const seconds = Math.min((now - lastFrame) / 1000, 0.1);
    lastFrame = now;

    lightTimeLeft -= seconds;
    lightTimer.textContent = Math.max(lightTimeLeft, 0).toFixed(1);

    if (isMoving && lightState !== 'red') {
        lightPosition += LIGHT_SPEED * seconds;
        drawRunner();
    }

    if (isMoving && lightState === 'red' && now - redSince > GRACE_TIME) {
        endLightGame(false, 'You moved on red.');
        return;
    }

    if (lightPosition >= 100) {
        endLightGame(true, 'You crossed the line before time ran out.');
        return;
    }

    if (lightTimeLeft <= 0) {
        endLightGame(false, 'Time ran out before you reached the finish.');
        return;
    }

    requestAnimationFrame(updateLightGame);
}

function endLightGame(won, text) {
    lightRunning = false;

    clearTimeout(lightChange);
    setMoving(false);

    if (!won) {
        runner.classList.add('caught');
    }

    setTimeout(function () {
        showResult('light', won, text);
    }, 700);
}

document.querySelector('#lightCard').onclick = function () {
    showScreen(lightStart);
};

document.querySelector('#lightStartButton').onclick = startLightGame;

moveButton.onpointerdown = function () {
    setMoving(true);
};

window.addEventListener('pointerup', function () {
    setMoving(false);
});

window.addEventListener('blur', function () {
    setMoving(false);
});

moveButton.oncontextmenu = function (event) {
    event.preventDefault();
};


// MAZE ESCAPE

const COLS = 21;
const ROWS = 15;
const CELL = 40;
const MAZE_TIME = 60;
const SIGHT = 3.5;

const MAZE_KEYS = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0]
};

let mazeRunning = false;
let mazeGrid = [];
let mazeSeen = [];
let mazePlayer = { x: 1, y: 1 };
let mazeExit = { x: 1, y: 1 };
let mazeCountdown = null;
let mazeTimeLeft = 0;

mazeCanvas.width = COLS * CELL;
mazeCanvas.height = ROWS * CELL;

// Carve paths from the start, cell by cell (0 = wall, 1 = path)
function createMaze() {
    const grid = [];

    for (let y = 0; y < ROWS; y++) {
        grid.push(new Array(COLS).fill(0));
    }

    const stack = [{ x: 1, y: 1 }];
    grid[1][1] = 1;

    while (stack.length > 0) {
        const current = stack[stack.length - 1];

        const neighbours = [[0, -2], [0, 2], [-2, 0], [2, 0]]
            .map(function (step) {
                return { x: current.x + step[0], y: current.y + step[1] };
            })
            .filter(function (cell) {
                return cell.x > 0 && cell.x < COLS - 1 &&
                    cell.y > 0 && cell.y < ROWS - 1 &&
                    grid[cell.y][cell.x] === 0;
            });

        if (neighbours.length === 0) {
            stack.pop();
            continue;
        }

        const next = neighbours[Math.floor(Math.random() * neighbours.length)];

        grid[(current.y + next.y) / 2][(current.x + next.x) / 2] = 1;
        grid[next.y][next.x] = 1;
        stack.push(next);
    }

    return grid;
}

// The exit is the cell that is farthest from the start
function findExit(grid) {
    const visited = new Set(['1,1']);
    let queue = [{ x: 1, y: 1 }];
    let farthest = queue[0];

    while (queue.length > 0) {
        const nextQueue = [];

        queue.forEach(function (cell) {
            farthest = cell;

            [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (step) {
                const x = cell.x + step[0];
                const y = cell.y + step[1];
                const key = x + ',' + y;

                if (grid[y][x] === 1 && !visited.has(key)) {
                    visited.add(key);
                    nextQueue.push({ x: x, y: y });
                }
            });
        });

        queue = nextQueue;
    }

    return farthest;
}

function drawMaze() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const distance = Math.hypot(x - mazePlayer.x, y - mazePlayer.y);

            if (distance <= SIGHT) {
                mazeSeen[y][x] = true;
            }

            mazeContext.fillStyle = mazeGrid[y][x] === 1 ? '#0b8f7c' : '#ed1765';
            mazeContext.fillRect(x * CELL, y * CELL, CELL, CELL);

            if (x === mazeExit.x && y === mazeExit.y) {
                mazeContext.fillStyle = '#f2d17c';
                mazeContext.fillRect(x * CELL + 5, y * CELL + 5, CELL - 10, CELL - 10);
            }

            // Fog: cells never seen are black, seen cells stay dim
            const light = 1 - Math.max(0, distance - SIGHT + 1.5) / 1.5;
            const fog = mazeSeen[y][x] ? Math.min(0.72, 1 - light) : 1 - Math.max(light, 0);

            mazeContext.fillStyle = 'rgba(5, 8, 10, ' + fog + ')';
            mazeContext.fillRect(x * CELL, y * CELL, CELL, CELL);
        }
    }

    mazeContext.fillStyle = 'white';
    mazeContext.beginPath();
    mazeContext.arc(
        mazePlayer.x * CELL + CELL / 2,
        mazePlayer.y * CELL + CELL / 2,
        CELL * 0.33,
        0,
        Math.PI * 2
    );
    mazeContext.fill();
}

function startMazeGame() {
    mazeGrid = createMaze();
    mazeExit = findExit(mazeGrid);
    mazePlayer = { x: 1, y: 1 };
    mazeSeen = mazeGrid.map(function (row) {
        return row.map(function () {
            return false;
        });
    });

    mazeTimeLeft = MAZE_TIME;
    mazeTimer.textContent = mazeTimeLeft;
    mazeRunning = true;

    showScreen(mazePlay);
    drawMaze();

    mazeCountdown = setInterval(function () {
        mazeTimeLeft--;
        mazeTimer.textContent = mazeTimeLeft;

        if (mazeTimeLeft <= 10 && mazeTimeLeft > 0) {
            playTone(880, 0.08, 'square', 0.08);
        }

        if (mazeTimeLeft <= 0) {
            endMazeGame(false, 'Time ran out before you found the exit.');
        }
    }, 1000);
}

function moveInMaze(dx, dy) {
    if (!mazeRunning) return;

    const x = mazePlayer.x + dx;
    const y = mazePlayer.y + dy;

    if (mazeGrid[y][x] === 0) return;

    mazePlayer = { x: x, y: y };
    drawMaze();

    if (x === mazeExit.x && y === mazeExit.y) {
        endMazeGame(true, 'You escaped with ' + mazeTimeLeft + ' seconds left.');
    }
}

function endMazeGame(won, text) {
    mazeRunning = false;
    clearInterval(mazeCountdown);

    showResult('maze', won, text);
}

document.querySelector('#mazeCard').onclick = function () {
    showScreen(mazeStart);
};

document.querySelector('#mazeStartButton').onclick = startMazeGame;

document.querySelectorAll('.maze-controls button').forEach(function (button) {
    button.onclick = function () {
        moveInMaze(Number(button.dataset.dx), Number(button.dataset.dy));
    };
});


// KEYBOARD

window.addEventListener('keydown', function (event) {
    if (lightRunning && (event.code === 'Space' || event.code === 'ArrowUp')) {
        event.preventDefault();
        setMoving(true);
    }

    if (mazeRunning && MAZE_KEYS[event.code]) {
        event.preventDefault();
        moveInMaze(MAZE_KEYS[event.code][0], MAZE_KEYS[event.code][1]);
    }
});

window.addEventListener('keyup', function (event) {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
        setMoving(false);
    }
});


// START

showPlayerBadge();
showMenu();
