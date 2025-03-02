import { words, foundWords } from './words.js';

export const gridSize = 12; // Tamaño de la cuadrícula (12x12)
export let grid = []; // Almacena la cuadrícula del puzzle
const wordColors = {}; // Almacena los colores de las palabras acertadas

// Crea el puzzle
export function createPuzzle() {
    // Verifica que words sea un array antes de usarlo
    if (!Array.isArray(words)) {
        console.error('words no es un array:', words);
        return;
    }

    // Inicializa la cuadrícula vacía
    grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));

    // Coloca las palabras en la cuadrícula
    placeWordsInGrid();

    // Rellena las celdas vacías con letras aleatorias
    fillEmptyCells();

    // Dibuja la cuadrícula en el canvas
    drawGrid();
}

// Coloca las palabras en la cuadrícula
function placeWordsInGrid() {
    // Verifica que words sea un array antes de usarlo
    if (!Array.isArray(words)) {
        console.error('words no es un array:', words);
        return;
    }

    // Coloca cada palabra en la cuadrícula
    words.forEach(word => {
        placeWordInGrid(word, grid);
    });
}

// Coloca una palabra en la cuadrícula
export function placeWordInGrid(word, grid) {
    const directions = [
        { row: 0, col: 1 }, // Horizontal
        { row: 1, col: 0 }, // Vertical
        { row: 1, col: 1 }, // Diagonal (abajo-derecha)
        { row: 1, col: -1 } // Diagonal (abajo-izquierda)
    ];

    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 100) {
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);

        if (canPlaceWord(word, row, col, direction, grid)) {
            for (let i = 0; i < word.length; i++) {
                grid[row + i * direction.row][col + i * direction.col] = word[i];
            }
            placed = true;
        }
        attempts++;
    }

    if (!placed) {
        console.error(`No se pudo colocar la palabra: ${word}`);
    }
}

// Verifica si una palabra puede colocarse en una posición
function canPlaceWord(word, row, col, direction, grid) {
    for (let i = 0; i < word.length; i++) {
        const cellRow = row + i * direction.row;
        const cellCol = col + i * direction.col;

        if (
            cellRow < 0 || cellRow >= gridSize ||
            cellCol < 0 || cellCol >= gridSize ||
            (grid[cellRow][cellCol] !== '' && grid[cellRow][cellCol] !== word[i])
        ) {
            return false;
        }
    }
    return true;
}

// Rellena las celdas vacías con letras aleatorias
function fillEmptyCells() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === '') {
                grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
}

// Dibuja la cuadrícula en el canvas
export function drawGrid() {
    const canvas = document.getElementById('puzzle-canvas');
    const ctx = canvas.getContext('2d');
    const cellSize = canvas.width / gridSize;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const x = j * cellSize;
            const y = i * cellSize;

            ctx.fillStyle = getCSSVariable('--cell-bg');
            ctx.fillRect(x, y, cellSize, cellSize);

            ctx.strokeStyle = getCSSVariable('--cell-border');
            ctx.strokeRect(x, y, cellSize, cellSize);

            ctx.fillStyle = getCSSVariable('--text-color');
            ctx.font = `16px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (grid[i][j] !== '') {
                ctx.fillText(grid[i][j], x + cellSize / 2, y + cellSize / 2);
            }
        }
    }

    // Marca las palabras encontradas
    foundWords.forEach(word => {
        markWordInGrid(word);
    });
}

// Genera un color aleatorio
function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgba(${r}, ${g}, ${b}, 0.5)`; // Color semitransparente
}

// Marca una palabra en la cuadrícula
function markWordInGrid(word) {
    const grid = getGrid();
    const directions = [
        { row: 0, col: 1 }, // Horizontal
        { row: 1, col: 0 }, // Vertical
        { row: 1, col: 1 }, // Diagonal (abajo-derecha)
        { row: 1, col: -1 } // Diagonal (abajo-izquierda)
    ];

    // Asigna un color aleatorio a la palabra si no lo tiene
    if (!wordColors[word]) {
        wordColors[word] = getRandomColor();
    }

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i] && grid[i][j] === word[0]) {
                for (const direction of directions) {
                    if (checkWordAtPosition(word, i, j, direction, grid)) {
                        for (let k = 0; k < word.length; k++) {
                            const cellRow = i + k * direction.row;
                            const cellCol = j + k * direction.col;
                            drawCell(cellRow, cellCol, grid[cellRow][cellCol], wordColors[word]);
                        }
                        return;
                    }
                }
            }
        }
    }
}

// Verifica si una palabra está en una posición específica
function checkWordAtPosition(word, row, col, direction, grid) {
    for (let i = 0; i < word.length; i++) {
        const cellRow = row + i * direction.row;
        const cellCol = col + i * direction.col;

        if (
            cellRow < 0 || cellRow >= grid.length ||
            cellCol < 0 || cellCol >= grid[0].length ||
            grid[cellRow][cellCol] !== word[i]
        ) {
            return false;
        }
    }
    return true;
}

// Dibuja una celda
export function drawCell(row, col, letter, color) {
    const canvas = document.getElementById('puzzle-canvas');
    const ctx = canvas.getContext('2d');
    const cellSize = canvas.width / gridSize;
    const x = col * cellSize;
    const y = row * cellSize;

    ctx.fillStyle = color || getCSSVariable('--cell-bg');
    ctx.fillRect(x, y, cellSize, cellSize);

    ctx.strokeStyle = getCSSVariable('--cell-border');
    ctx.strokeRect(x, y, cellSize, cellSize);

    ctx.fillStyle = getCSSVariable('--text-color');
    ctx.font = `16px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (letter) {
        ctx.fillText(letter, x + cellSize / 2, y + cellSize / 2);
    }
}

// Obtiene el valor de una variable CSS
export function getCSSVariable(variable) {
    return getComputedStyle(document.documentElement).getPropertyValue(variable);
}

// Obtiene la cuadrícula
export function getGrid() {
    return grid;
}

// Obtiene la letra en una posición específica
export function getLetterAt(row, col) {
    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
        return grid[row][col];
    }
    return '';
}