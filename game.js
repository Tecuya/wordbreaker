import { dictionary } from './dictionary.js';

const gameBoard = document.getElementById("gameBoard");
const currentLetters = document.getElementById("currentLetters");
const dictionaryMatches = document.getElementById("dictionaryMatches");
const madeWords = document.getElementById('madeWords');
const currentWordLog = document.getElementById('currentWordLog');
const scoreDiv = document.getElementById('score');

let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

const gridSize = {x: 10, y: 10};
const startPosition = {x: 5, y: 5};

const cursorCost = 1;
const viewportCost = 2;
const resetCost = 10;
const notWordCost = 10;

var score = 0;
var keypresses = 0;

var gameGrid = [];

function findDictEntriesWithPrefix(prefix) {
  return dictionary.filter(dictEntry => dictEntry[0].toLowerCase().startsWith(prefix.toLowerCase()));
}

function findDictEntriesWithExactMatch(word) {
  return dictionary.filter(dictEntry => dictEntry[0].toLowerCase() == word.toLowerCase());
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

const viewport = {
  x1: cursor.x-1,
  y1: cursor.y-1,
  x2: cursor.x+1,
  y2: cursor.y+1,
};

let selectedLetters = ''; // Global string to store selected letters
var madeWordsList = [];
var currentWordCost = 0;
var currentWordLogList = [];

function incrementWordCost(amount, action) {
  currentWordCost += amount;
  currentWordLogList.unshift(action + " (" + amount + ")");
}

document.addEventListener('keydown', (event) => {
  switch(event.key) {
  case 'r':
    keypresses += 1;
    incrementWordCost(resetCost, "reset");
    cursor.x = startPosition.x;
    cursor.y = startPosition.y;
    viewport.x1 = cursor.x - 1;
    viewport.y1 = cursor.y - 1;
    viewport.x2 = cursor.x+1;
    viewport.y2 = cursor.y+1;
    initializeGrid();
    break;
  case 'ArrowUp':
    keypresses += 1;
    incrementWordCost(cursorCost, "cursor up");
    cursor.y = Math.max(0, cursor.y - 1);
    break;
  case 'ArrowDown':
    keypresses += 1;
    incrementWordCost(cursorCost, "cursor down");
    cursor.y = Math.min(gridSize.y - 1, cursor.y + 1);
    break;
  case 'ArrowLeft':
    keypresses += 1;
    incrementWordCost(cursorCost, "cursor left");
    cursor.x = Math.max(0, cursor.x - 1);
    break;
  case 'ArrowRight':
    keypresses += 1;
    incrementWordCost(cursorCost, "cursor right");
    cursor.x = Math.min(gridSize.x - 1, cursor.x + 1);
    break;
  case ' ':
    keypresses += 1;
    const prospectiveLetters = selectedLetters + gameGrid[cursor.x][cursor.y];
    const matchingEntries3 = findDictEntriesWithExactMatch(prospectiveLetters);
    if(matchingEntries3.length > 0) { 
      dictionaryMatches.innerHTML = JSON.stringify(matchingEntries3[0]);
      selectedLetters = prospectiveLetters;
    } else { 
      const matchingEntries = findDictEntriesWithPrefix(prospectiveLetters);
      if(matchingEntries.length > 0) { 
        dictionaryMatches.innerHTML = JSON.stringify(matchingEntries[0]);
        selectedLetters = prospectiveLetters;
      }
    }
    break;
  case 'Enter':
    keypresses += 1;
    const matchingEntries2 = findDictEntriesWithExactMatch(selectedLetters);
    if(matchingEntries2.length > 0) { 
      dictionaryMatches.innerHTML = JSON.stringify(matchingEntries2[0]);
      madeWordsList.unshift(selectedLetters + " ("+selectedLetters.length*10+"/"+currentWordCost+" = "+(selectedLetters.length*10/currentWordCost).toFixed(2)+")");
      score += selectedLetters.length*10/currentWordCost;
      selectedLetters = "";
      currentWordCost = 0;
      currentWordLogList = [];
    } else {
      incrementWordCost(notWordCost, "not a word");
    }
  }

  if(cursor.x <= viewport.x1 && viewport.x1 > 0) {
    incrementWordCost(viewportCost, "viewport left");
    viewport.x1 -= 1;
  }
  if(cursor.x >= viewport.x2 && viewport.x2 < gridSize.x-1) {
    incrementWordCost(viewportCost, "viewport right");
    viewport.x2 += 1;
  }
  if(cursor.y <= viewport.y1 && viewport.y1 > 0) {
    incrementWordCost(viewportCost, "viewport up");
    viewport.y1 -= 1;
  }
  if(cursor.y >= viewport.y2 && viewport.y2 < gridSize.y-1) {
    incrementWordCost(viewportCost, "viewport down");
    viewport.y2 += 1;
  }
  draw();
});

const validMoveCache = {};

const draw = () => {

  gameBoard.innerHTML = '';
  currentLetters.innerHTML = selectedLetters; // Render the selected letters into the "currentLetters" div

  const cursorCurrentLetter = gameGrid[cursor.x][cursor.y];

  gameBoard.style.gridTemplateColumns = repeatString("1fr", viewport.x2 - viewport.x1 + 1);

  for(var y=viewport.y1;y<=viewport.y2;y++) {
    for(var x=viewport.x1;x<=viewport.x2;x++) {
      const div = document.createElement("div");
      div.classList.add("item");

      if(cursor.x == x && cursor.y == y) {
        div.classList.add("cursorItem");
      }

      const wordSoFar = selectedLetters + gameGrid[x][y];
      if(!validMoveCache.hasOwnProperty(wordSoFar)) {
        const matchingEntries = findDictEntriesWithPrefix(wordSoFar);
        validMoveCache[wordSoFar] = (matchingEntries.length > 0);
      }
      if(validMoveCache[wordSoFar]) {
        div.classList.add("validMove");
      }


      div.innerHTML = gameGrid[x][y];

      gameBoard.appendChild(div);
    }
  }

  madeWords.innerHTML = "<h2>Word List</h2>";
  madeWordsList.forEach((word) => {
    madeWords.innerHTML += word + "<br />";
  });

  currentWordLog.innerHTML = "<h2>Current Word</h2><p>Total cost: <b>"+currentWordCost+"</b></p>";
  currentWordLogList.forEach((log) => {
    currentWordLog.innerHTML += log + "<br />";
  });

  scoreDiv.innerHTML = "<h2>Score</h2>";
  scoreDiv.innerHTML += "Score Total: " + score.toFixed(2) + " /<br>";
  scoreDiv.innerHTML += "Keypresses: "+keypresses + " = <br>";
  if(keypresses > 0) { 
    scoreDiv.innerHTML += "<h3>"+(score/keypresses).toFixed(2)+"</h3>";
  }
};


initializeGrid();
draw();
