import { createPuzzle } from './puzzle.js';

// Inicializa words como un array vacío
export let words = [];
export let foundWords = []; // Almacena las palabras encontradas

// Carga las palabras desde el archivo palabras.txt
export async function loadWords() {
    try {
        const response = await fetch('./palabras.txt');
        if (!response.ok) throw new Error('Error al cargar el archivo de palabras');
        const text = await response.text();
        const allWords = text.split('\n')
            .map(w => w.trim().toUpperCase()) // Limpia y convierte a mayúsculas
            .filter(w => w.length > 0); // Filtra palabras vacías

        if (allWords.length === 0) throw new Error('El archivo de palabras está vacío');

        // Mezcla las palabras y selecciona las primeras 10
        words = shuffleArray(allWords).slice(0, 10);
        foundWords = []; // Reinicia las palabras encontradas

        // Muestra la lista de palabras y crea el puzzle
        showWordList();
        createPuzzle();
    } catch (error) {
        console.error('Error al cargar las palabras:', error);
        alert('No se pudieron cargar las palabras. Usando lista predeterminada.');

        // Usa una lista predeterminada si hay un error
        words = shuffleArray(["JUEGO", "CODIGO", "PUZZLE", "DIVERSION", "JAVASCRIPT", "HTML", "CSS", "LOGICA", "RETOS", "PROGRAMAR"]).slice(0, 10);
        foundWords = []; // Reinicia las palabras encontradas
        showWordList();
        createPuzzle();
    }
}

// Mezcla un array (algoritmo de Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Intercambia elementos
    }
    return array;
}

// Muestra la lista de palabras
export function showWordList() {
    const wordsList = document.getElementById('words');
    if (wordsList) {
        wordsList.innerHTML = words.map(word => {
            const isFound = foundWords.includes(word);
            return `<li class="${isFound ? 'found' : ''}">${word}</li>`;
        }).join('');
    } else {
        console.error('No se encontró el elemento con id "words"');
    }
}

// Elimina una palabra de la lista
export function removeWord(word) {
    foundWords.push(word); // Añade la palabra a la lista de encontradas
    showWordList();

    // Si se han encontrado todas las palabras, cargar 10 nuevas
    if (foundWords.length === words.length) {
        setTimeout(() => {
            alert("¡Has encontrado todas las palabras! Cargando nuevas palabras...");
            loadWords();
        }, 500);
    }
}

// Carga 10 nuevas palabras aleatorias y regenera la sopa de letras
async function loadNewWords() {
    try {
        const response = await fetch('./palabras.txt');
        const text = await response.text();
        const allWords = text.split('\n')
            .map(w => w.trim().toUpperCase())
            .filter(w => w.length > 0); // Filtra palabras vacías

        if (allWords.length === 0) throw new Error('El archivo de palabras está vacío');

        // Mezcla las palabras y selecciona las primeras 10
        words = shuffleArray(allWords).slice(0, 10);
        foundWords = []; // Reinicia las palabras encontradas

        // Muestra la lista de palabras y crea el puzzle
        showWordList();
        createPuzzle();
    } catch (error) {
        console.error('Error al cargar nuevas palabras:', error);
        alert('No hay más palabras disponibles. ¡Has ganado!');
    }
}
