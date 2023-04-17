const messageContainer = document.querySelector(".message-container");
const messageElement = document.querySelector(".message");
const startBtn = document.querySelector(".start-btn");
const gameBoard = document.querySelector(".game-board");
const squares = document.querySelectorAll(".square");
const levelSelect = document.querySelector(".level-select");

let mode = "unmasked";
let displayDuration = 650;

levelSelect.addEventListener("change", (e) => {
  const level = e.target.value;
  if (level === "level1") {
    mode = "unmasked";
  } else {
    mode = "masked";
    if (level === "level2") {
      displayDuration = 650;
    } else if (level === "level3") {
      displayDuration = 430;
    } else if (level === "level4") {
      displayDuration = 210;
    }
  }
});

startBtn.addEventListener("click", startGame);

function generateNumbers() {
  const maxNumbers = Math.floor(Math.random() * 4) + 6; // Randomly select the number of squares that will be filled (6 to 9)
  let nums = Array.from({ length: maxNumbers }, (_, i) => i + 1);
  let numbers = [];

  while (nums.length) {
    const randomIndex = Math.floor(Math.random() * nums.length);
    numbers.push(nums[randomIndex]);
    nums.splice(randomIndex, 1);
  }

  return numbers;
}

function startGame() {
  hideMessage();
  squares.forEach((square) => {
    square.textContent = "";
    square.style.backgroundColor = "#000";
    square.dataset.number = ""; // Reset dataset.number for all squares
  });

  const numbers = generateNumbers();

  numbers.forEach((number) => {
    let added = false;
    while (!added) {
      const randomIndex = Math.floor(Math.random() * squares.length);
      const square = squares[randomIndex];
      if (!square.textContent) {
        square.textContent = number;
        square.dataset.number = number;
        added = true;
      }
    }
  });

  if (mode === "masked") {
    setTimeout(() => {
      squares.forEach((square) => {
        if (square.textContent) {
          square.textContent = "";
          square.style.backgroundColor = "white";
        }
      });
    }, displayDuration);
  }
}

let currentNumber = 1;

function showMessage(message) {
  messageElement.textContent = message;
  messageContainer.style.display = "flex";
  gameBoard.style.pointerEvents = "none";
}

function hideMessage() {
  messageContainer.style.display = "none";
  gameBoard.style.pointerEvents = "auto";
}

function squareClickHandler(e) {
  e.stopPropagation(); // Add this line to stop event propagation

  const maxNumber = Math.max(...Array.from(squares).filter(square => square.dataset.number).map(square => parseInt(square.dataset.number)));

  if (parseInt(this.dataset.number) === currentNumber) {
    this.textContent = "";
    this.style.backgroundColor = "#000";
    this.dataset.number = "";
    currentNumber++;

    if (currentNumber > maxNumber) {
      showMessage("You Win!");
      currentNumber = 1;
      setTimeout(() => {
        hideMessage();
        startGame();
      }, 2000);
    }
  } else if (this.dataset.number) {
    showMessage("You Lose!");
    currentNumber = 1;
    setTimeout(() => {
      hideMessage();
      startGame();
    }, 2000);
  }
}



squares.forEach((square) => {
  square.addEventListener("click", squareClickHandler);
});

startGame();
