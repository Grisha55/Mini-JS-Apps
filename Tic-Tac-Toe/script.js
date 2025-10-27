const $cells = document.querySelectorAll('.cell');
const $status = document.getElementById('status');
const $restartBtn = document.getElementById('restart');

const winningConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;

updateStatus();

$cells.forEach((cell, idx) => {
  cell.addEventListener('click', () => handleCellClick(cell, idx));
});

function handleCellClick(cell, index) {
  if (board[index] !== '' || !gameActive) {
    return;
  }

  board[index] = currentPlayer;
  cell.textContent = currentPlayer;

  checkResult();
}

function checkResult() {
  let gameWon = false;

  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];

    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      gameWon = true;
      break;
    }
  }

  if (gameWon) {
    $status.textContent = `Игрок ${currentPlayer} победил!`;
    gameActive = false;
    return;
  }

  if (!board.includes('')) {
    $status.textContent = 'Ничья!';
    gameActive = false;
    return;
  }

  changePlayer();
}

function changePlayer() {
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatus();
}

function updateStatus() {
  if (gameActive) {
    $status.textContent = `Ход игрока: ${currentPlayer}`;
  }
}

function clearBoard() {
  board = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = 'X';
  gameActive = true;

  $cells.forEach((cell) => {
    cell.textContent = '';
  });

  updateStatus();
}

$restartBtn.addEventListener('click', clearBoard);
