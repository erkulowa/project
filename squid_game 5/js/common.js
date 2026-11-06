// PLAYER NUMBER

function getPlayerNumber() {
    return localStorage.getItem('playerNumber');
}

function showPlayerBadge() {
    const badge = document.querySelector('#playerBadge');

    badge.textContent = 'PLAYER #' + getPlayerNumber();
}


// CLEARED TRIALS

function getClearedGames() {
    return JSON.parse(localStorage.getItem('clearedGames') || '[]');
}


// SOUND

let audioContext = null;

function playTone(frequency, duration, type = 'sine', volume = 0.2, delay = 0) {
    const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    if (!audioContext) {
        audioContext = new AudioContextClass();
    }

    const start = audioContext.currentTime + delay;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);

    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(start);
    oscillator.stop(start + duration);
}
