// ELEMENTS

const playerGrid = document.querySelector('#playerGrid');
const playerWorld = document.querySelector('#playerWorld');

const joinButton = document.querySelector('#joinButton');
const booth = document.querySelector('#booth');
const closeButton = document.querySelector('#closeButton');

const camera = document.querySelector('#camera');
const canvas = document.querySelector('#canvas');
const photoPreview = document.querySelector('#photoPreview');
const cameraPlaceholder = document.querySelector('#cameraPlaceholder');

const instruction = document.querySelector('#instruction');
const cameraMessage = document.querySelector('#cameraMessage');
const cameraFlash = document.querySelector('#cameraFlash');

const captureButton = document.querySelector('#captureButton');
const photoUpload = document.querySelector('#photoUpload');

const cameraButtons = document.querySelector('#cameraButtons');
const reviewButtons = document.querySelector('#reviewButtons');

const retakeButton = document.querySelector('#retakeButton');
const deleteButton = document.querySelector('#deleteButton');
const confirmButton = document.querySelector('#confirmButton');

const numberScreen = document.querySelector('#numberScreen');
const numberDisplay = document.querySelector('#numberDisplay');

const dossier = document.querySelector('#dossier');
const dossierClose = document.querySelector('#dossierClose');
const dossierPhoto = document.querySelector('#dossierPhoto');
const dossierNumber = document.querySelector('#dossierNumber');
const dossierAge = document.querySelector('#dossierAge');
const dossierJob = document.querySelector('#dossierJob');
const dossierStatus = document.querySelector('#dossierStatus');


// VARIABLES

let cameraStream = null;
let photo = '';
let assignedNumber = '';

const usedNumbers = new Set();

const playerImages = [
    '../images/067.webp',
    '../images/218.webp',
    '../images/456.webp'
];

const CARD_WIDTH = 150;
const CARD_HEIGHT = 175;
const COLUMNS = 15;
const WALL_PADDING = 80;

const occupations = [
    'Driver',
    'Teacher',
    'Fisherman',
    'Cook',
    'Accountant',
    'Courier',
    'Factory worker',
    'Student'
];


// CREATE PLAYER WALL

function createPlayers() {
    for (let i = 1; i <= 120; i++) {
        const number = String(i).padStart(3, '0');

        usedNumbers.add(number);

        addPlayer(number, playerImages[i % playerImages.length]);
    }

    // Start with the center of the wall visible
    playerWorld.scrollLeft =
        (playerWorld.scrollWidth - playerWorld.clientWidth) / 2;

    playerWorld.scrollTop =
        (playerWorld.scrollHeight - playerWorld.clientHeight) / 2;
}


// FIT THE WALL AROUND ITS PLAYERS

function resizeWall() {
    const rows = Math.ceil(playerGrid.children.length / COLUMNS);

    const width = (COLUMNS - 1) * (CARD_WIDTH - 1) +
        CARD_WIDTH * 1.5;

    const height = (rows - 1) * (CARD_HEIGHT / 2 - 1) +
        CARD_HEIGHT;

    playerGrid.style.width = width + WALL_PADDING * 2 + 'px';
    playerGrid.style.height = height + WALL_PADDING * 2 + 'px';
}


// ADD PLAYER IN A DIAMOND MOSAIC

function addPlayer(number, image, isNew = false) {
    const player = document.createElement('div');
    player.className = 'player';

    if (isNew) {
        player.classList.add('new-player');
    }

    const photoElement = document.createElement('img');
    photoElement.src = image;
    photoElement.alt = 'Player ' + number;
    photoElement.draggable = false;

    const numberElement = document.createElement('span');
    numberElement.className = 'player-number';
    numberElement.textContent = number;

    player.append(photoElement, numberElement);

    player.onclick = function () {
        if (!wasDragged) {
            openDossier(number, image, isNew);
        }
    };

    const index = playerGrid.children.length;
    const row = Math.floor(index / COLUMNS);
    const column = index % COLUMNS;

    // Move every second row halfway across
    const x = column * (CARD_WIDTH - 1) +
        (row % 2) * (CARD_WIDTH / 2);

    // Half-height vertical spacing makes diamond rows overlap
    const y = row * (CARD_HEIGHT / 2 - 1);

    player.style.left = x + WALL_PADDING + 'px';
    player.style.top = y + WALL_PADDING + 'px';

    playerGrid.append(player);
    resizeWall();

    return player;
}


// PLAYER DOSSIER

function openDossier(number, image, isNew) {
    const id = Number(number);

    dossierPhoto.src = image;
    dossierPhoto.alt = 'Player ' + number;
    dossierNumber.textContent = number;

    if (isNew) {
        dossierAge.textContent = 'CLASSIFIED';
        dossierJob.textContent = 'New player';
        dossierStatus.textContent = 'JUST JOINED';
    } else {
        dossierAge.textContent = 19 + (id * 7) % 48;
        dossierJob.textContent = occupations[id % occupations.length];
        dossierStatus.textContent = 'ALIVE';
    }

    dossier.classList.remove('hidden');
}

dossierClose.onclick = function () {
    dossier.classList.add('hidden');
};

dossier.onclick = function (event) {
    if (event.target === dossier) {
        dossier.classList.add('hidden');
    }
};


// OPEN PHOTO BOOTH

joinButton.onclick = async function () {
    booth.classList.remove('hidden');

    instruction.textContent = 'PLEASE LOOK INTO THE CAMERA.';
    cameraMessage.textContent = 'SMILE.';

    cameraPlaceholder.classList.remove('hidden');

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false
        });

        camera.srcObject = cameraStream;
        await camera.play();

        cameraPlaceholder.classList.add('hidden');
    } catch (error) {
        cameraMessage.textContent =
            'CAMERA UNAVAILABLE. UPLOAD A PHOTO.';
    }
};


// STOP CAMERA

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(function (track) {
            track.stop();
        });

        cameraStream = null;
    }

    camera.srcObject = null;
}


// CLOSE PHOTO BOOTH

closeButton.onclick = function () {
    stopCamera();
    booth.classList.add('hidden');
    resetPhoto();
};


// TAKE PHOTO

captureButton.onclick = function () {
    if (!cameraStream || !camera.videoWidth) {
        cameraMessage.textContent = 'PLEASE ENABLE YOUR CAMERA.';
        return;
    }

    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;

    const context = canvas.getContext('2d');

    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(camera, 0, 0);

    photo = canvas.toDataURL('image/jpeg', 0.9);

    showPhoto(photo);

    cameraFlash.classList.remove('active');
    void cameraFlash.offsetWidth;
    cameraFlash.classList.add('active');

    playCameraSound();
};


// UPLOAD PHOTO

photoUpload.onchange = function () {
    const file = photoUpload.files[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
        cameraMessage.textContent = 'PLEASE CHOOSE AN IMAGE.';
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        photo = reader.result;
        showPhoto(photo);
    };

    reader.readAsDataURL(file);
};


// SHOW PHOTO

function showPhoto(image) {
    photoPreview.src = image;
    photoPreview.classList.remove('hidden');

    camera.classList.add('hidden');
    cameraPlaceholder.classList.add('hidden');

    cameraButtons.classList.add('hidden');
    reviewButtons.classList.remove('hidden');

    cameraMessage.textContent = 'IS THIS YOU?';
}


// RETAKE PHOTO

retakeButton.onclick = function () {
    resetPhoto();

    instruction.textContent = 'PLEASE LOOK INTO THE CAMERA.';
    cameraMessage.textContent = cameraStream ? 'SMILE.' : 'UPLOAD A PHOTO.';
};


// DELETE PHOTO

deleteButton.onclick = function () {
    resetPhoto();
    cameraMessage.textContent = 'PHOTO DELETED. TRY AGAIN.';
};


// RESET PHOTO

function resetPhoto() {
    photo = '';

    photoPreview.src = '';
    photoPreview.classList.add('hidden');

    camera.classList.toggle('hidden', !cameraStream);
    cameraPlaceholder.classList.toggle('hidden', Boolean(cameraStream));

    cameraButtons.classList.remove('hidden');
    reviewButtons.classList.add('hidden');

    photoUpload.value = '';
}


// CONFIRM PHOTO

confirmButton.onclick = function () {
    if (!photo) return;

    stopCamera();
    booth.classList.add('hidden');

    assignPlayerNumber();
};


// GET RANDOM FREE NUMBER

function getFreeNumber() {
    const availableNumbers = [];

    for (let i = 1; i <= 456; i++) {
        const number = String(i).padStart(3, '0');

        if (!usedNumbers.has(number)) {
            availableNumbers.push(number);
        }
    }

    if (availableNumbers.length === 0) {
        return null;
    }

    return availableNumbers[
        Math.floor(Math.random() * availableNumbers.length)
    ];
}


// ASSIGN NUMBER ANIMATION

function assignPlayerNumber() {
    assignedNumber = getFreeNumber();

    if (!assignedNumber) {
        alert('All player numbers have been assigned.');
        return;
    }

    numberScreen.classList.remove('hidden');

    let count = 0;

    const animation = setInterval(function () {
        numberDisplay.textContent = String(
            Math.floor(Math.random() * 456) + 1
        ).padStart(3, '0');

        count++;

        if (count >= 20) {
            clearInterval(animation);

            numberDisplay.textContent = assignedNumber;
            usedNumbers.add(assignedNumber);
            localStorage.setItem('playerNumber', assignedNumber);

            setTimeout(function () {
                numberScreen.classList.add('hidden');

                // Add the new player at the end of the wall
                const newPlayer = addPlayer(
                    assignedNumber,
                    photo,
                    true
                );

                // Move the view to the new player
                newPlayer.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center'
                });

                photo = '';
            }, 1000);
        }
    }, 100);
}


// DRAG WALL WITH MOUSE

let isDragging = false;
let wasDragged = false;
let startX = 0;
let startY = 0;
let scrollLeft = 0;
let scrollTop = 0;

playerWorld.onmousedown = function (event) {
    isDragging = true;
    wasDragged = false;

    startX = event.clientX;
    startY = event.clientY;

    scrollLeft = playerWorld.scrollLeft;
    scrollTop = playerWorld.scrollTop;
};

window.onmouseup = function () {
    isDragging = false;
};

playerWorld.onmousemove = function (event) {
    if (!isDragging) return;

    // Small movements still count as a click
    if (Math.hypot(event.clientX - startX, event.clientY - startY) > 5) {
        wasDragged = true;
    }

    playerWorld.scrollLeft = scrollLeft - (event.clientX - startX);
    playerWorld.scrollTop = scrollTop - (event.clientY - startY);
};


// CAMERA SOUND

function playCameraSound() {
    const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const volume = audioContext.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
        300,
        audioContext.currentTime + 0.12
    );

    volume.gain.setValueAtTime(0.3, audioContext.currentTime);
    volume.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.15
    );

    oscillator.connect(volume);
    volume.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.15);

    oscillator.onended = function () {
        audioContext.close();
    };
}


// START

createPlayers();