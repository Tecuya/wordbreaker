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
const resetCost = 10;
const notWordCost = 10;
const typingCost = 10;

const minWordLength = 2;

var score = 0;

var gameGrid = [];

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

let selectedLetters = '';
var madeWordsList = [];
var currentWordCost = 0;
var currentWordLogList = [];

function findDictEntriesWithPrefix(prefix) {
  return dictionary.filter(dictEntry => dictEntry[0].toLowerCase().startsWith(prefix.toLowerCase()));
}

function findDictEntriesWithExactMatch(word) {
  return dictionary.filter(dictEntry => dictEntry[0].toLowerCase() == word.toLowerCase());
}

function formatDictEntries(entries) {
  var response = "";
  var lastEntry = "";
  entries.slice(0,20).forEach((entry) => {
    if(lastEntry != entry[0]) {
      response += "<b>"+entry[0]+"</b><br>";
      lastEntry = entry[0];
    }
    response += entry[1] + " - " + entry[2].replace("\n","") + "<br />";
  });
  return response;
}

function initializeGrid() {
  gameGrid = [];
  for (let i = 0; i < gridSize.y; i++) {
    let row = [];
    for (let j = 0; j < gridSize.x; j++) {
      let randomIndex = Math.floor(Math.random() * letters.length);
      row.push({letter: letters[randomIndex], visible: false});
    }
    gameGrid.push(row);
  }
}

function repeatString(str, n) {
  return new Array(n).fill(str).join(" ");
}

function incrementWordCost(amount, action) {
  currentWordCost += amount;
  currentWordLogList.unshift(action + " (" + amount + ")");
}

function entriesMinusCurrentWords(entries) {
  const noReuseWords = madeWordsList.filter((word) => (!word.reusable)).map((word) => word.word.toLowerCase());
  return entries.filter((entry) => !noReuseWords.includes(entry[0].toLowerCase()));
}

function testAndAcceptNewLetter(newLetter) {
  const prospectiveLetters = selectedLetters + newLetter;
  const matchingEntries3 = entriesMinusCurrentWords(
    findDictEntriesWithExactMatch(prospectiveLetters)
  );

  if(matchingEntries3.length > 0) {
    dictionaryMatches.innerHTML = formatDictEntries(matchingEntries3);
    selectedLetters = prospectiveLetters;
  } else {
    const matchingEntries = entriesMinusCurrentWords(
      findDictEntriesWithPrefix(prospectiveLetters)
    );
    if(matchingEntries.length > 0) {
      dictionaryMatches.innerHTML = formatDictEntries(matchingEntries);
      selectedLetters = prospectiveLetters;
    }
  }
}

const validMoveCache = {};

const draw = () => {

  gameBoard.innerHTML = '';
  currentLetters.innerHTML = selectedLetters;

  const cursorCurrentLetter = gameGrid[cursor.x][cursor.y].letter;

  gameBoard.style.gridTemplateColumns = repeatString("1fr", viewport.x2 - viewport.x1 + 1);

  for(var y=viewport.y1;y<=viewport.y2;y++) {
    for(var x=viewport.x1;x<=viewport.x2;x++) {

      if(
        (x == cursor.x || x == cursor.x + 1 || x == cursor.x - 1) &&
          (y == cursor.y || y == cursor.y + 1 || y == cursor.y - 1))
      {
        gameGrid[x][y].visible = true;
      }

      const div = document.createElement("div");
      div.classList.add("item");

      if(cursor.x == x && cursor.y == y) {
        div.classList.add("cursorItem");
      }

      if(gameGrid[x][y].visible) {

        const wordSoFar = selectedLetters + gameGrid[x][y].letter;
        if(!validMoveCache.hasOwnProperty(wordSoFar)) {
          const matchingEntries = findDictEntriesWithPrefix(wordSoFar);
          validMoveCache[wordSoFar] = (matchingEntries.length > 0);
        }
        if(validMoveCache[wordSoFar]) {
          div.classList.add("validMove");
        }

        div.innerHTML = gameGrid[x][y].letter;
      } else {
        div.innerHTML = "";
      }

      gameBoard.appendChild(div);
    }
  }

  madeWords.innerHTML = "<h2>Word List</h2>";
  madeWordsList.forEach((word) => {
    if(word.reusable) {
      madeWords.innerHTML += "<i>" + word.word + "</i>" + word.scoring + "<br />";
    } else {
      madeWords.innerHTML += word.word + " " + word.scoring + "<br />";
    }
  });

  var cwl = "<h2>Current Word</h2><p>Total cost: <b>"+currentWordCost+"</b></p><div>";
  currentWordLogList.forEach((log) => {
    cwl += log + "<br />";
  });
  cwl += "</div>";

  currentWordLog.innerHTML = cwl;

  scoreDiv.innerHTML = "<h2>Score</h2>";
  scoreDiv.innerHTML += "Score Total: <b>" + score.toFixed(2) + "</b><br>";
  scoreDiv.innerHTML += "Word Count: <b>" + madeWordsList.length + "</b><br>";
  scoreDiv.innerHTML += "Average: <b>" + (score/madeWordsList.length).toFixed(2) + "</b><br>";
};

document.addEventListener('keydown', (event) => {
  switch(event.key) {
  case '0':
    selectedLetters = "";
    initializeGrid();
    cursor.x = startPosition.x;
    cursor.y = startPosition.y;
    viewport.x1 = cursor.x - 1;
    viewport.y1 = cursor.y - 1;
    viewport.x2 = cursor.x+1;
    viewport.y2 = cursor.y+1;
    score = 0;
    madeWordsList = [];
    currentWordCost = 0;
    currentWordLogList = [];
    dictionaryMatches.innerHTML = "";
    break;
  case '1':
    incrementWordCost(resetCost, "reset");
    cursor.x = startPosition.x;
    cursor.y = startPosition.y;
    viewport.x1 = cursor.x - 1;
    viewport.y1 = cursor.y - 1;
    viewport.x2 = cursor.x+1;
    viewport.y2 = cursor.y+1;
    initializeGrid();
    madeWordsList.forEach((word) => {
      word.reusable = true;
    });
    break;
  case 'ArrowUp':
    incrementWordCost(cursorCost, "cursor up");
    cursor.y = Math.max(0, cursor.y - 1);
    break;
  case 'ArrowDown':
    incrementWordCost(cursorCost, "cursor down");
    cursor.y = Math.min(gridSize.y - 1, cursor.y + 1);
    break;
  case 'ArrowLeft':
    incrementWordCost(cursorCost, "cursor left");
    cursor.x = Math.max(0, cursor.x - 1);
    break;
  case 'ArrowRight':
    incrementWordCost(cursorCost, "cursor right");
    cursor.x = Math.min(gridSize.x - 1, cursor.x + 1);
    break;
  case ' ':
    testAndAcceptNewLetter(gameGrid[cursor.x][cursor.y].letter);
    break;
  case 'Enter':
    const matchingEntries2 = entriesMinusCurrentWords(findDictEntriesWithExactMatch(selectedLetters));

    if(selectedLetters.length < minWordLength) {
      incrementWordCost(0, "word too short");
      break;
    }
    if(matchingEntries2.length > 0) {
      dictionaryMatches.innerHTML = formatDictEntries(matchingEntries2);
      madeWordsList.unshift({
        word: selectedLetters,
        scoring: "("+selectedLetters.length*10+"/"+currentWordCost+" = "+(selectedLetters.length*10/currentWordCost).toFixed(2)+")",
        reusable: false,
      });
      score += selectedLetters.length*10/currentWordCost;
      selectedLetters = "";
      currentWordCost = 0;
      currentWordLogList = [];
    } else {
      incrementWordCost(notWordCost, "not a word");
    }
    break;
  case 'Backspace':
    selectedLetters = selectedLetters.substring(0, selectedLetters.length - 1);
    incrementWordCost(cursorCost, "backspace");
    break;
  }

  if(/^[a-zA-Z]$/.test(event.key)) {
    testAndAcceptNewLetter(event.key.toUpperCase());
    incrementWordCost(typingCost, "typed "+event.key);
  }

  if(cursor.x <= viewport.x1 && viewport.x1 > 0) {
    viewport.x1 -= 1;
  }
  if(cursor.x >= viewport.x2 && viewport.x2 < gridSize.x-1) {
    viewport.x2 += 1;
  }
  if(cursor.y <= viewport.y1 && viewport.y1 > 0) {
    viewport.y1 -= 1;
  }
  if(cursor.y >= viewport.y2 && viewport.y2 < gridSize.y-1) {
    viewport.y2 += 1;
  }
  draw();
});

initializeGrid();
draw();
