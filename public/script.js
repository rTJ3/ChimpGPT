// Variables
const gameBoard = document.querySelector('.game-board');
const startBtn = document.querySelector('.start-btn');
const resetBtn = document.querySelector('.reset-btn');
const scoreDisplay = document.querySelector('.score');
let score = 0;

// Functions
function generateGameTiles() {
  gameBoard.innerHTML = '';
  for (let i = 1; i <= 9; i++) {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    tile.dataset.number = i;
    gameBoard.appendChild(tile);
  }
}

function displayNumbers() {
  const tiles = document.querySelectorAll('.tile');
  tiles.forEach(tile => {
    tile.textContent = tile.dataset.number;
  });
}

function hideNumbers() {
  const tiles = document.querySelectorAll('.tile');
  tiles.forEach(tile => {
    tile.textContent = '';
  });
}

function randomizeTiles() {
  const tiles = [...gameBoard.children];
  while (tiles.length) {
    const randomIndex = Math.floor(Math.random() * tiles.length);
    gameBoard.appendChild(tiles.splice(randomIndex, 1)[0]);
  }
}

function handleClick(event) {
  const clickedTile = event.target;
  if (clickedTile.classList.contains('tile')) {
    clickedTile.textContent = clickedTile.dataset.number;
    validateInput(clickedTile);
  }
}

function validateInput(tile) {
    if (parseInt(tile.dataset.number) === score + 1) {
      score++;
      updateScore();
      if (score === 9) {
        setTimeout(() => {
          const playerName = prompt('Enter your name:');
          gameWon(playerName, score);
        }, 500);
      }
    } else {
      alert('Incorrect! Try again.');
      resetGame();
    }
  }
  

function updateScore() {
  scoreDisplay.textContent = score;
}

function startGame() {
  generateGameTiles();
  randomizeTiles();
  displayNumbers();
  setTimeout(() => {
    hideNumbers();
    gameBoard.addEventListener('click', handleClick);
  }, 2000);
}

function resetGame() {
  score = 0;
  updateScore();
  startGame();
}

function gameWon(playerName, score) {
    alert(`Congratulations, ${playerName}! You won with a score of ${score}.`);
    updateLeaderboard(playerName, score);
    fetchLeaderboard();
  }
  

// Event Listeners
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

function fetchLeaderboard() {
    fetch('/leaderboard')
      .then(response => response.json())
      .then(leaderboard => {
        // Display leaderboard data
        const leaderboardList = document.querySelector('.leaderboard-list');
        leaderboardList.innerHTML = '';
        leaderboard.forEach((entry, index) => {
          const listItem = document.createElement('li');
          listItem.textContent = `${index + 1}. ${entry.playerName}: ${entry.score}`;
          leaderboardList.appendChild(listItem);
        });
      });
  }
  
  
  function updateLeaderboard(playerName, score) {
    const newEntry = {
      playerName: playerName,
      score: score
    };
    fetch('/leaderboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newEntry)
    })
      .then(response => response.text())
      .then(message => {
        console.log(message);
       
      });  }