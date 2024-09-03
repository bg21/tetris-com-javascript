const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const ROWS = 20;
const COLS = 15;
const BLOCK_SIZE = 30;
const COLORS = ['cyan', 'blue', 'orange', 'yellow', 'green', 'purple', 'red'];

const shapes = [
    [[1, 1, 1, 1]], // I
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]], // Z
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]]  // J
];

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let currentShape, currentColor, currentX, currentY;
let score = 0;
let level = 1;
const scoreToLevelUp = 300;
const baseSpeed = 700;
const speedDecreaseInterval = 100;
const minInterval = 100;
let lastFrameTime = 0;

// Modal functionality
const welcomeModal = document.getElementById('welcomeModal');
const gameOverModal = document.getElementById('gameOverModal');
const startWelcomeButton = document.getElementById('startWelcomeButton');
const restartModalButton = document.getElementById('restartModalButton');
const finalScoreElement = document.getElementById('finalScore');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level'); // Adicione o elemento de nível

function showModal(modal) {
    modal.style.display = 'flex';
}

function hideModal(modal) {
    modal.style.display = 'none';
}

function updateGameSpeed() {
    const newInterval = Math.max(baseSpeed - (level - 1) * speedDecreaseInterval, minInterval);
    return newInterval;
}

function startGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  currentShape = getRandomShape();
  currentColor = getRandomColor();
  currentX = Math.floor(COLS / 2) - Math.floor(currentShape[0].length / 2);
  currentY = 0;
  score = 0; // Inicializa a pontuação
  scoreElement.textContent = score; // Atualiza o display da pontuação
  level = 1;
  levelElement.textContent = level;
  canvas.width = COLS * BLOCK_SIZE;
  canvas.height = ROWS * BLOCK_SIZE;
  lastFrameTime = 0;
  hideModal(welcomeModal);
  requestAnimationFrame(gameLoop);
}


function restartGame() {
    startGame();
    hideModal(gameOverModal);
}

function drawBlock(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    context.strokeStyle = 'black';
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawShape(shape, offsetX, offsetY, color) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                drawBlock(offsetX + col, offsetY + row, color);
            }
        }
    }
}

function clearBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function drawBoard() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col]) {
                drawBlock(col, row, COLORS[board[row][col] - 1]);
            }
        }
    }
}

function draw() {
    clearBoard();
    drawBoard();
    drawShape(currentShape, currentX, currentY, currentColor);
}

function getRandomShape() {
    return shapes[Math.floor(Math.random() * shapes.length)];
}

function getRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function rotateShape(shape) {
    const newShape = [];
    for (let y = 0; y < shape[0].length; y++) {
        newShape[y] = [];
        for (let x = 0; x < shape.length; x++) {
            newShape[y][x] = shape[shape.length - x - 1][y];
        }
    }
    return newShape;
}

function collision(offsetX, offsetY, shape) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col] && (
                offsetX + col < 0 || 
                offsetX + col >= COLS || 
                offsetY + row >= ROWS || 
                board[offsetY + row][offsetX + col])
            ) {
                return true;
            }
        }
    }
    return false;
}

function placeShape() {
    for (let row = 0; row < currentShape.length; row++) {
        for (let col = 0; col < currentShape[row].length; col++) {
            if (currentShape[row][col]) {
                board[currentY + row][currentX + col] = COLORS.indexOf(currentColor) + 1;
            }
        }
    }
    clearLines();
    currentShape = getRandomShape();
    currentColor = getRandomColor();
    currentX = Math.floor(COLS / 2) - Math.floor(currentShape[0].length / 2);
    currentY = 0;
    if (collision(currentX, currentY, currentShape)) {
        showGameOver();
        return false;
    }
    return true;
}

function clearLines() {
  for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row].every(cell => cell)) {
          board.splice(row, 1);
          board.unshift(Array(COLS).fill(0));
          score += 100;
          scoreElement.textContent = score; // Atualiza o display da pontuação
          if (score % scoreToLevelUp === 0) {
              level++;
              levelElement.textContent = level;
          }
      }
  }
}


function moveDown() {
    if (!collision(currentX, currentY + 1, currentShape)) {
        currentY++;
    } else {
        placeShape();
    }
}

function handleKeyPress(event) {
    switch (event.key) {
        case 'ArrowLeft':
            if (!collision(currentX - 1, currentY, currentShape)) {
                currentX--;
            }
            break;
        case 'ArrowRight':
            if (!collision(currentX + 1, currentY, currentShape)) {
                currentX++;
            }
            break;
        case 'ArrowDown':
            moveDown();
            break;
        case 'ArrowUp':
            const rotatedShape = rotateShape(currentShape);
            if (!collision(currentX, currentY, rotatedShape)) {
                currentShape = rotatedShape;
            }
            break;
    }
    draw();
}

function showGameOver() {
    finalScoreElement.textContent = `Score: ${score}`;
    showModal(gameOverModal);
}

function gameLoop(timestamp) {
    const newInterval = updateGameSpeed();
    if (timestamp - lastFrameTime >= newInterval) {
        lastFrameTime = timestamp;
        moveDown();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', handleKeyPress);
startWelcomeButton.addEventListener('click', startGame);
restartModalButton.addEventListener('click', restartGame);
