import { dictionary } from './dictionary.js';

const gameBoard = document.getElementById("gameBoard");

let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

const width = 3;
const height = 3;
const gameGrid = [];

function findDictEntriesWithPrefix(prefix) {
  return dictionary.filter(dictEntry => dictEntry[0].toLowerCase().startsWith(prefix.toLowerCase()));
}

function initializeGrid() {
  for (let i = 0; i < 3; i++) {
    let row = [];
    for (let j = 0; j < 3; j++) {
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
  x: 1,
  y: 1,
};
document.addEventListener('keydown', (event) => {
  switch(event.key) {
  case 'ArrowUp':
    cursor.y -= 1;
    break;
  case 'ArrowDown':
    cursor.y += 1;
    break;
  case 'ArrowLeft':
    cursor.x -= 1;
    break;
  case 'ArrowRight':
    cursor.x += 1;
    break;
  }
  console.log(cursor);
  drawBoard();
});
const drawBoard = () => {

  gameBoard.innerHTML = '';

  const playerCurrentLetter = gameGrid[cursor.y][cursor.x];

  gameBoard.style.gridTemplateColumns = repeatString("1fr", gameGrid.length);

  for(var y=0;y<height;y++) {
    for(var x=0;x<width;x++) {
      const div = document.createElement("div");
      div.classList.add("item");
      if(cursor.x == x && cursor.y == y) {
        div.classList.add("cursorItem");
      } else {
        if(findDictEntriesWithPrefix(playerCurrentLetter + gameGrid[x][y]).length > 0) {
          div.classList.add("validMove");
        }
      }
      div.innerHTML = gameGrid[x][y];

      gameBoard.appendChild(div);
    }
  }
};


initializeGrid();
drawBoard();
