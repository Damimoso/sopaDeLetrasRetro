import { words, removeWord, showWordList } from './words.js';
import { addPoints } from './main.js';
import { createPuzzle, getGrid, getCSSVariable, getLetterAt, drawGrid } from './puzzle.js';

const canvas = document.getElementById('puzzle-canvas');
const ctx = canvas.getContext('2d');
const cellSize = canvas.width / 12; // Tamaño de cada celda
const detectionRadius = cellSize * 0.3; // Radio de detección reducido (30% del tamaño de la celda)

let isSelecting = false;
let selectedCells = [];
let currentColor = getRandomColor(); // Color aleatorio para la selección actual
let selectionTimeout = null; // Timeout para eliminar la línea de selección

// Obtiene la celda desde la posición del evento
function getCellFromPosition(event) {
    const rect = canvas.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (row < 0 || row >= 12 || col < 0 || col >= 12) {
        return { row: -1, col: -1 };
    }

    return { row, col };
}

// Verifica si el cursor está cerca del centro de una celda
function isNearCellCenter(x, y, row, col) {
    const centerX = (col + 0.5) * cellSize;
    const centerY = (row + 0.5) * cellSize;
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    return distance <= detectionRadius;
}

// Genera un color aleatorio
function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgba(${r}, ${g}, ${b}, 0.5)`; // Color semitransparente
}

// Dibuja la selección (línea entre letras)
function drawSelection() {
    if (selectedCells.length < 2) return;

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 3;
    ctx.beginPath();

    // Mueve el cursor al centro de la primera letra seleccionada
    const firstCell = selectedCells[0];
    const firstX = (firstCell.col + 0.5) * cellSize;
    const firstY = (firstCell.row + 0.5) * cellSize;
    ctx.moveTo(firstX, firstY);

    // Dibuja una línea hasta el centro de cada letra seleccionada
    for (let i = 1; i < selectedCells.length; i++) {
        const cell = selectedCells[i];
        const x = (cell.col + 0.5) * cellSize;
        const y = (cell.row + 0.5) * cellSize;
        ctx.lineTo(x, y);
    }

    ctx.stroke();
}

// Elimina la línea de selección después de un tiempo
function clearSelectionAfterTimeout() {
    if (selectionTimeout) {
        clearTimeout(selectionTimeout); // Limpia el timeout anterior
    }
    selectionTimeout = setTimeout(() => {
        restoreSelection(); // Restaura la selección después de 1 segundo
    }, 1000); // 1000 ms = 1 segundo
}

// Dibuja una celda
function drawCell(row, col, letter, colorVariable) {
    const x = col * cellSize;
    const y = row * cellSize;

    ctx.fillStyle = getCSSVariable(colorVariable || '--cell-bg');
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

// Valida la selección
function validateSelection() {
    if (selectedCells.length === 0) return;
    if (selectedCells.length < 2) {
        restoreSelection();
        return;
    }

    if (!isStraightLine(selectedCells)) {
        highlightSelection(selectedCells, '--cell-error');
        setTimeout(() => restoreSelection(), 1000);
        playSound('error');
        return;
    }

    const selectedWord = selectedCells.map(cell => cell.letter).join('').toUpperCase();

    if (words.includes(selectedWord)) {
        highlightSelection(selectedCells, '--cell-found');
        removeWord(selectedWord); // Elimina la palabra encontrada
        addPoints(selectedWord.length);
        playSound('correct');

        setTimeout(() => restoreSelection(), 1500);
    } else {
        highlightSelection(selectedCells, '--cell-error');
        setTimeout(() => restoreSelection(), 1500);
        playSound('error');
    }
}

// Verifica si las celdas seleccionadas forman una línea recta (horizontal, vertical o diagonal)
function isStraightLine(cells) {
    if (cells.length < 2) return false;

    const firstCell = cells[0];
    const lastCell = cells[cells.length - 1];

    const rowDiff = Math.abs(firstCell.row - lastCell.row);
    const colDiff = Math.abs(firstCell.col - lastCell.col);

    // Permite líneas horizontales, verticales y diagonales (45°)
    return (
        firstCell.row === lastCell.row || // Horizontal
        firstCell.col === lastCell.col || // Vertical
        rowDiff === colDiff // Diagonal (45°)
    );
}

// Restaura la selección
function restoreSelection() {
    selectedCells.forEach(cell => {
        drawCell(cell.row, cell.col, cell.letter, '--cell-bg');
    });
    selectedCells = [];
    currentColor = getRandomColor(); // Asigna un nuevo color para la próxima selección
    drawGrid(); // Redibuja la cuadrícula para eliminar la línea de selección
}

// Resalta la selección
function highlightSelection(cells, colorVariable) {
    cells.forEach(cell => {
        drawCell(cell.row, cell.col, cell.letter, colorVariable);
    });
}

// Reproduce un sonido
function playSound(type) {
    const audio = document.getElementById(`${type}-sound`);
    if (audio) {
        try {
            audio.currentTime = 0;
            audio.play();
        } catch (error) {
            console.error(`Error al reproducir el sonido: ${error.message}`);
        }
    } else {
        console.error(`No se encontró el archivo de sonido: ${type}-sound`);
    }
}

// Event listeners
canvas.addEventListener('mousedown', startSelection);
canvas.addEventListener('touchstart', startSelection);

canvas.addEventListener('mousemove', moveSelection);
canvas.addEventListener('touchmove', moveSelection);

canvas.addEventListener('mouseup', endSelection);
canvas.addEventListener('touchend', endSelection);

// Inicia la selección
function startSelection(event) {
    event.preventDefault();
    isSelecting = true;
    const { row, col } = getCellFromPosition(event);
    if (row >= 0 && row < 12 && col >= 0 && col < 12) {
        selectedCells = [{ row, col, letter: getLetterAt(row, col) }];
        drawSelection();
    }
}

// Mueve la selección
function moveSelection(event) {
    if (isSelecting) {
        event.preventDefault();
        const { row, col } = getCellFromPosition(event);
        if (row >= 0 && row < 12 && col >= 0 && col < 12) {
            if (selectedCells.length > 0) {
                const lastCell = selectedCells[selectedCells.length - 1];
                if (row !== lastCell.row || col !== lastCell.col) {
                    const newCell = { row, col, letter: getLetterAt(row, col) };
                    const dx = row - lastCell.row;
                    const dy = col - lastCell.col;
                    if (selectedCells.length < 2 || isSameDirection(selectedCells, dx, dy)) {
                        // Verifica si el cursor está cerca del centro de la celda
                        const rect = canvas.getBoundingClientRect();
                        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
                        const clientY = event.touches ? event.touches[0].clientY : event.clientY;
                        const x = (clientX - rect.left) * (canvas.width / rect.width);
                        const y = (clientY - rect.top) * (canvas.height / rect.height);

                        if (isNearCellCenter(x, y, row, col)) {
                            selectedCells.push(newCell);
                            drawSelection();
                            clearSelectionAfterTimeout(); // Reinicia el timeout
                        }
                    }
                }
            }
        }
    }
}

// Verifica si la selección es en la misma dirección
function isSameDirection(cells, dx, dy) {
    if (cells.length < 2) return true;

    const firstCell = cells[0];
    const lastCell = cells[cells.length - 1];

    const rowDiff = Math.abs(firstCell.row - lastCell.row);
    const colDiff = Math.abs(firstCell.col - lastCell.col);

    // Permite líneas horizontales, verticales y diagonales (45°)
    return (
        (dx === 0 && dy !== 0) || // Horizontal
        (dy === 0 && dx !== 0) || // Vertical
        (Math.abs(dx) === Math.abs(dy)) // Diagonal (45°)
    );
}

// Finaliza la selección
function endSelection() {
    if (isSelecting) {
        isSelecting = false;
        validateSelection();
    }
}

// Reinicia la selección
export function resetSelection() {
    selectedCells = [];
    currentColor = getRandomColor(); // Asigna un nuevo color para la próxima selección
}