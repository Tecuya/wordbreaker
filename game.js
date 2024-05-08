import { dictionary } from './dictionary.js';

const gameBoard = document.getElementById("gameBoard");
const currentLetters = document.getElementById("currentLetters");
const dictionaryMatches = document.getElementById("dictionaryMatches");
const madeWords = document.getElementById('madeWords');
const currentWordLog = document.getElementById('currentWordLog');
const scoreDiv = document.getElementById('score');
const gameOverModal = document.getElementById("gameOverModal");
const gameOverModalClose = document.getElementById("gameOverModalClose");
const gameOverModalStats = document.getElementById("gameOverModalStats");
const rulesLink = document.getElementById('rulesLink');
const rulesModal = document.getElementById("rulesModal");
const rulesModalClose = document.getElementById("rulesModalClose");
const rulesModalVars = document.getElementById("rulesModalVars");

let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

const gridSize = {x: 11, y: 9};
const startPosition = {x: 5, y: 4};

const cursorCost = 0.5;
const resetCost = 5;
const notWordCost = 0;
const arbitraryLetterCost = 3;
const minWordLength = 3;
const scoreGoal = 100;
const lengthScale = 2; // note theres a hard-coded 2 unicode superscript

var score = 0;

var gameGrid = [];

const cursor = {
  x: startPosition.x,
  y: startPosition.y,
};

const viewport = {
  x1: 0,
  y1: 0,
  x2: gridSize.x-1,
  y2: gridSize.y-1,
};

let selectedLetters = '';
var madeWordsList = [];
var currentWordCost = 0;
var currentWordLogList = [];

const dictEntryLength = 80;

function findDictEntriesWithPrefix(prefix) {
  return dictionary.filter(dictEntry => dictEntry[0].toLowerCase().startsWith(prefix.toLowerCase()));
}

function findDictEntriesWithExactMatch(word) {
  return dictionary.filter(dictEntry => dictEntry[0].toLowerCase() == word.toLowerCase());
}

function formatDictEntries(entries) {
  var response = "";
  var lastEntry = "";
  entries.slice(0, dictEntryLength).forEach((entry) => {
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
  for (let i = 0; i < gridSize.x; i++) {
    let row = [];
    for (let j = 0; j < gridSize.y; j++) {
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

function openGameOverModal() {
  gameOverModal.style.display = "block";
}

function openRulesModal() {
  rulesModal.style.display = "block";
}

const drawRules = () => {
  var rules = "";
  rules += "<table>";
  rules += "<b>Grid Size:</b> "+gridSize.x+" x "+gridSize.y+"<br />";
  rules += "<b>Start Position:</b> "+(startPosition.x+1)+", "+(startPosition.y+1)+"<br />";
  rules += "<b>Arbitrary Letter Cost:</b> "+arbitraryLetterCost+"<br />";
  rules += "<b>Reset Board Cost:</b> "+resetCost+"<br />";
  rules += "<b>Cursor Movement Cost:</b> "+cursorCost+"<br />";
  rules += "<b>Min Word Length:</b> "+minWordLength+"<br />";
  rules += "<b>Game Over Points:</b> "+scoreGoal+"<br />";
  rules += "<b>Word Length Exponent:</b> "+lengthScale+"<br />";
  rulesModalVars.innerHTML = rules;
};

const draw = () => {

  gameBoard.innerHTML = '';

  var currentLettersString = selectedLetters;

  if(selectedLetters.length >= minWordLength) {
    const matchingEntries4 = entriesMinusCurrentWords(findDictEntriesWithExactMatch(selectedLetters));
    if(matchingEntries4.length > 0) {
      currentLettersString += ' ('+explainScore()+')';
    }
  }

  currentLetters.innerHTML = currentLettersString;

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
      madeWords.innerHTML += "<i>" + word.word + "</i> (" + word.scoring + ")<br />";
    } else {
      madeWords.innerHTML += word.word + " (" + word.scoring + ")<br />";
    }
  });

  var cwl = "<h2>Word Cost</h2><p>Total cost: <b>"+currentWordCost+"</b></p><div>";
  currentWordLogList.forEach((log) => {
    cwl += log + "<br />";
  });
  cwl += "</div>";

  currentWordLog.innerHTML = cwl;

  scoreDiv.innerHTML = "<h2>Score</h2>";
  scoreDiv.innerHTML += "Points: <b>" + (score).toFixed(2) + "</b><br>";
  scoreDiv.innerHTML += "Remaining: <b>" + (scoreGoal - score).toFixed(2) + "</b><br>";
  scoreDiv.innerHTML += "Word Count: <b>" + madeWordsList.length + "</b><br>";
  scoreDiv.innerHTML += "Score: <b>" + (score/madeWordsList.length).toFixed(2) + "</b><br>";

  if(score > scoreGoal) {

    var stats = "<h2>Final Score: " + (score/madeWordsList.length).toFixed(2) + "</h2>";

    stats += "<h3>Word List</h3>";
    [].concat(madeWordsList).reverse().forEach((word) => {
      stats += word.word + " (" + word.scoring + ")<br />";
    });

    gameOverModalStats.innerHTML = stats;

    openGameOverModal();
  }
};

function fullReset() {
    selectedLetters = "";
    initializeGrid();
    cursor.x = startPosition.x;
    cursor.y = startPosition.y;
    score = 0;
    madeWordsList = [];
    currentWordCost = 0;
    currentWordLogList = [];
    dictionaryMatches.innerHTML = "";
}

function findNearestVisibleLetterPosition(letter) {
    let nearestPosition = null;
    let shortestDistance = Number.MAX_VALUE;
    for (let y = 0; y < gridSize.y; y++) {
        for (let x = 0; x < gridSize.x; x++) {
            if (gameGrid[x][y].visible && gameGrid[x][y].letter === letter) {
                const distance = Math.abs(x - cursor.x) + Math.abs(y - cursor.y);
                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    nearestPosition = { x: x, y: y, distance: distance };
                }
            }
        }
    }
    return nearestPosition;
}

function moveCursorToNearestLetter(position) {
    // Update the cursor position to the nearest letter's coordinates
    cursor.x = position.x;
    cursor.y = position.y;
}
rulesLink.onclick = function() {
  openRulesModal();
}

gameOverModalClose.onclick = function() {
  fullReset();
  draw();
  gameOverModal.style.display = "none";
}

rulesModalClose.onclick = function() {
  draw();
  rulesModal.style.display = "none";
}

const scoreCurrentWord = () => {
  return parseFloat(((selectedLetters.length**lengthScale)/currentWordCost).toFixed(2));
};

const explainScore = () => {
  return selectedLetters.length+"²/"+currentWordCost+" = "+scoreCurrentWord();
};

document.addEventListener('keydown', (event) => {
  switch(event.key) {
  case '0':
    fullReset();
    break;
  case '1':
    incrementWordCost(resetCost, "reset");
    cursor.x = startPosition.x;
    cursor.y = startPosition.y;
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
    if(selectedLetters.length < minWordLength) {
      incrementWordCost(0, "word too short");
      break;
    }
    const matchingEntries2 = entriesMinusCurrentWords(findDictEntriesWithExactMatch(selectedLetters));
    if(matchingEntries2.length > 0) {
      dictionaryMatches.innerHTML = formatDictEntries(matchingEntries2);
      const scoreDiff = scoreCurrentWord();
      madeWordsList.unshift({
        word: selectedLetters,
        scoring: explainScore(),
        reusable: false,
      });
      score += scoreDiff;
      selectedLetters = "";
      currentWordCost = 0;
      currentWordLogList = [];
    } else {
      incrementWordCost(notWordCost, "not a word");
    }
    break;
  case 'Backspace':
    selectedLetters = selectedLetters.substring(0, selectedLetters.length - 1);
    const matches = entriesMinusCurrentWords(findDictEntriesWithPrefix(selectedLetters));
    dictionaryMatches.innerHTML = formatDictEntries(matches);
    incrementWordCost(0, "backspace");
    break;
  }

  if(/^[a-zA-Z]$/.test(event.key)) {
    // Check if the typed letter is visible on the screen and move the cursor if it is
    const typedLetter = event.key.toUpperCase();
    const nearestVisibleLetterPosition = findNearestVisibleLetterPosition(typedLetter);
    if (nearestVisibleLetterPosition) {
      const moveCost = nearestVisibleLetterPosition.distance*cursorCost;
      if(moveCost < arbitraryLetterCost) {
        moveCursorToNearestLetter(nearestVisibleLetterPosition);
        testAndAcceptNewLetter(gameGrid[nearestVisibleLetterPosition.x][nearestVisibleLetterPosition.y].letter);
        incrementWordCost(moveCost, "typed cursor to " + typedLetter);
      } else {
        testAndAcceptNewLetter(typedLetter);
        incrementWordCost(arbitraryLetterCost, "arbitrary letter " + typedLetter);
      }
    } else {
      testAndAcceptNewLetter(typedLetter);
      incrementWordCost(arbitraryLetterCost, "arbitrary letter " + typedLetter);
    }
  }

  draw();
});
initializeGrid();
drawRules();
draw();
