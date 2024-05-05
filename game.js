import { dictionary } from './dictionary.js';

const gameBoard = document.getElementById("gameBoard");
const currentLetters = document.getElementById("currentLetters");
const dictionaryMatches = document.getElementById("dictionaryMatches");

let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

const gridSize = {x: 30, y: 30};
const startPosition = {x: 15, y: 15};

var gameGrid = [];

function findDictEntriesWithPrefix(prefix) {
  return dictionary.filter(dictEntry => dictEntry[0].toLowerCase().startsWith(prefix.toLowerCase()));
}

function initializeGrid() {
  gameGrid = [];
  for (let i = 0; i < gridSize.y; i++) {
    let row = [];
    for (let j = 0; j < gridSize.x; j++) {
        let randomIndex = Math.floor(Math.random() * letters.length);
        row.push(letters[randomIndex]);
    }
    gameGrid.push(row);
  }
}

function repeatString(str, n) {
  return new Array(n).fill(str).join(" ");
}

const cursor = {
  x: startPosition.x,
  y: startPosition.y,
};
let selectedLetters = ''; // Global string to store selected letters

document.addEventListener('keydown', (event) => {
  switch(event.key) {
    case 'r':
      initializeGrid();
      break;
    case 'ArrowUp':
      cursor.y = Math.max(0, cursor.y - 1);
      break;
    case 'ArrowDown':
    cursor.y = Math.min(gridSize.y - 1, cursor.y + 1);
      break;
    case 'ArrowLeft':
      cursor.x = Math.max(0, cursor.x - 1);
      break;
    case 'ArrowRight':
    cursor.x = Math.min(gridSize.x - 1, cursor.x + 1);
      break;
    case 'Enter':
      selectedLetters += gameGrid[cursor.x][cursor.y];
      const matchingEntries = findDictEntriesWithPrefix(selectedLetters);
      dictionaryMatches.innerHTML = JSON.stringify(matchingEntries[0]);
      break;
  }
  draw();
});

const draw = () => {

  gameBoard.innerHTML = '';
  currentLetters.innerHTML = selectedLetters; // Render the selected letters into the "currentLetters" div

  const cursorCurrentLetter = gameGrid[cursor.x][cursor.y];

  gameBoard.style.gridTemplateColumns = repeatString("1fr", 3);

  for(var y=cursor.y-1;y<cursor.y+2;y++) {
    for(var x=cursor.x-1;x<cursor.x+2;x++) {
      const div = document.createElement("div");
      div.classList.add("item");

      if(cursor.x == x && cursor.y == y) {
        div.classList.add("cursorItem");
      }

      const wordSoFar = selectedLetters + gameGrid[x][y];
      const matchingEntries = findDictEntriesWithPrefix(wordSoFar);
      if(matchingEntries.length > 0) {
        div.classList.add("validMove");
      }
      div.innerHTML = gameGrid[x][y];

      gameBoard.appendChild(div);
    }
  }
};


initializeGrid();
draw();
