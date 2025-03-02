import { createPuzzle } from './puzzle.js';
import { startTimer, resetTimer } from './time.js';
import { loadWords, showWordList, words } from './words.js';
import './selection.js';

const mainScreen = document.getElementById('main-screen');
const gameScreen = document.getElementById('game-screen');
const rankingScreen = document.getElementById('ranking-screen');
const startButton = document.getElementById('start-button');
const resetButton = document.getElementById('reset-button');
const backButton = document.getElementById('back-button');
const saveButton = document.getElementById('save-button');
const instructionsButton = document.getElementById('instructions-button');
const instructionsModal = document.getElementById('instructions-modal');
const closeInstructionsButton = document.getElementById('close-instructions-button');
const timerElement = document.getElementById('timer');
const timerBar = document.getElementById('timer-bar');
const pointsElement = document.getElementById('points');
const wordListContainer = document.getElementById('words');
const rankingList = document.getElementById('ranking-list');
const finalRankingList = document.getElementById('final-ranking-list');
const initialsInput = document.getElementById('initials-input');
const initialsField = document.getElementById('initials');
const canvas = document.getElementById('puzzle-canvas');
const ctx = canvas.getContext('2d');

let wordsFoundInLast30Seconds = 0;
let lastWordFoundTime = 0;
let timer;
let points = 0;
let ranking = JSON.parse(localStorage.getItem('ranking')) || [];
let selectedCells = [];

// Inicializa el juego
function initGame() {
    points = 0;
    updatePoints();
    loadWords().then(() => {
        createPuzzle();
        showWordList();
        timer = startTimer(timerElement, 120, onTimeUp, updateTimerBar);
    }).catch(error => {
        console.error('Error al iniciar el juego:', error);
        alert('Error al cargar las palabras. Por favor, recarga la página.');
    });
}

// Reinicia el juego
export function resetGame() {
    clearInterval(timer);
    resetTimer(timerElement, 120, timerBar);
    words.length = 0;
    selectedCells = [];
    wordsFoundInLast30Seconds = 0;
    lastWordFoundTime = 0;
    initGame();
}

// Cuando se acaba el tiempo
function onTimeUp() {
    gameScreen.classList.add('hidden');
    rankingScreen.classList.remove('hidden');
    checkRanking();
    updateFinalRanking();
}

// Actualiza los puntos
function updatePoints() {
    pointsElement.textContent = `Puntos: ${points}`;
}

// Actualiza la barra de tiempo
function updateTimerBar(timeLeft) {
    timerBar.value = timeLeft;
    if (timeLeft <= 10) {
        timerElement.style.color = 'red';
        timerElement.style.animation = 'blink 1s infinite';
    } else {
        timerElement.style.color = '';
        timerElement.style.animation = '';
    }
}

// Verifica si el puntaje entra en el ranking
function checkRanking() {
    if (ranking.length < 5 || points > ranking[ranking.length - 1].points) {
        initialsInput.classList.remove('hidden');
    }
}

// Actualiza el ranking
function updateRanking() {
    rankingList.innerHTML = ranking
        .map((entry, index) => `<li>${index + 1}. ${entry.initials} - ${entry.points}</li>`)
        .join('');
}

// Actualiza el ranking final
function updateFinalRanking() {
    finalRankingList.innerHTML = ranking
        .map((entry, index) => `<li>${index + 1}. ${entry.initials} - ${entry.points}</li>`)
        .join('');
}

// Aumenta el tiempo
export function increaseTime(seconds) {
    const currentTime = parseInt(timerElement.textContent.replace('Tiempo: ', '').replace('s', ''));
    const newTime = currentTime + seconds;

    timerElement.textContent = `Tiempo: ${newTime}s`;
    timerBar.max = newTime;
    timerBar.value = newTime;

    const rewardSound = document.getElementById('reward-sound');
    if (rewardSound) {
        rewardSound.currentTime = 0;
        rewardSound.play();
    }
}

// Añade puntos
export function addPoints(wordLength) {
    points += wordLength * 10;
    updatePoints();
    const currentTime = Date.now();
    if (currentTime - lastWordFoundTime <= 30000) {
        wordsFoundInLast30Seconds++;
    } else {
        wordsFoundInLast30Seconds = 1;
    }
    lastWordFoundTime = currentTime;

    if (wordsFoundInLast30Seconds === 3) {
        increaseTime(20);
        wordsFoundInLast30Seconds = 0;
    }
}

// Event listeners
startButton.addEventListener('click', () => {
    mainScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    initGame();
});

resetButton.addEventListener('click', resetGame);

backButton.addEventListener('click', () => {
    rankingScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
    updateRanking();
});

saveButton.addEventListener('click', () => {
    const initials = initialsField.value.toUpperCase();
    if (initials.length > 0 && initials.length <= 4) {
        ranking.push({ initials, points });
        ranking.sort((a, b) => b.points - a.points);
        ranking = ranking.slice(0, 5);
        localStorage.setItem('ranking', JSON.stringify(ranking));
        initialsInput.classList.add('hidden');
        updateFinalRanking();
    }
});

// Muestra el modal de instrucciones
instructionsButton.addEventListener('click', () => {
    instructionsModal.classList.remove('hidden');
});

// Oculta el modal de instrucciones
closeInstructionsButton.addEventListener('click', () => {
    instructionsModal.classList.add('hidden');
});

// Cierra el modal si se hace clic fuera del contenido
window.addEventListener('click', (event) => {
    if (event.target === instructionsModal) {
        instructionsModal.classList.add('hidden');
    }
});

updateRanking();