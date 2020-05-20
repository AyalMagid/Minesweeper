'use strict'
var gBoard = []
const MINE = '💣'
const FLAG = '🚩'
var gameStartedInterval


// This is an object by which the board size is set
var gLevel = {

    SIZE: 4,
    MINES: 2

}

var gGame = {
    // Boolean, when true we let the user play
    isOn: false,
    // How many cells are shown
    shownCount: 0,
    // How many cells are marked (with a flag)
    markedCount: 0,
    //  How many seconds passed
    secsPassed: 0,
    // how many lives? 
    lives: 3
}

function init() {

    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3
    }

    clearInterval(gameStartedInterval)
    var elTimer = document.querySelector('.timer')
    elTimer.innerText = 'Time : ' + 0
    buildBoard(gBoard)
    renderBoard(gBoard)
    console.log(gBoard)
}

// updating the board by difficuly
function setMode(elBtn) {
    var currMode = elBtn.className;
    switch (currMode) {
        case 'easy':
            gLevel = { SIZE: 4, MINES: 2 }
            init()
            break;
        case 'med':
            gLevel = { SIZE: 8, MINES: 12 }
            init()
            break;
        case 'hard':
            gLevel = { SIZE: 12, MINES: 30 }
            init()
    }
}

// Builds the board Set mines at random locations
function buildBoard(board) {

    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {

            board[i][j] = {

                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }

    // placing mines
    i = 0
    while (i < gLevel.MINES) {
        var rndIdxRow = getRandomIntInclusive(0, gLevel.SIZE - 1)
        var colIdxRow = getRandomIntInclusive(0, gLevel.SIZE - 1)
        if (gBoard[rndIdxRow][colIdxRow].isMine) continue
        gBoard[rndIdxRow][colIdxRow].isMine = true
        i++
    }

    // updating minds count for each cell when board is ready, might change after first clik
    updateMindsCount()

    return board
}


//  Render the board as a <table> to the page
function renderBoard(gBoard) {
    var strHtml = '';
    for (var i = 0; i < gBoard.length; i++) {
        var row = gBoard[i];
        strHtml += '<tr>';
        for (var j = 0; j < gBoard.length; j++) {
            var cell = row[j];
            // figure class name
            var className = 'hidden'
            var tdId = `cell-${i}-${j}`;
            strHtml += `<td id="${tdId}" class="${className}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, ${i}, ${j})">
                        </td>`
        }
        strHtml += '</tr>';
    }
    var elBoard = document.querySelector('.game-board');
    elBoard.innerHTML = strHtml;
}

// updating minds count after first click

function updateMindsCount() {

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var mines = setMinesNegsCount(gBoard, i, j)
            gBoard[i][j].minesAroundCount = mines
        }
    }
}

// Count mines around each cell and set the cell's minesAroundCount
function setMinesNegsCount(gBoard, cellI, cellJ) {

    var minesCount = 0

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;
            if (i === cellI && j === cellJ) continue;
            if (gBoard[i][j].isMine === true) minesCount++
        }
    }
    return minesCount
}

// Called when a cell (td) is clicked
function cellClicked(elCell, i, j) {

    var cellContent = (gBoard[i][j].isMine) ? MINE : gBoard[i][j].minesAroundCount

    // updating game started and time is taken
    if (!gGame.isOn) gameStarted()
    // first click - if mind moves it, updating minds count... if is showncount = 0 its first click
    updateMindsCount()

    if (elCell.classList.contains('hidden')) {

        if ((cellContent === MINE) && (!elCell.classList.contains('flipped'))) {
            // bombed()
            gGame.lives--
            console.log(gGame.lives, 'more lives has left')
            if (!gGame.lives) gameOver()
        }
        if (cellContent === 0) {
            searchAroundEmptyCells(i, j)
            // while cellcontent is 0 recursion?
        }
        flipCell(elCell, i, j)
        console.log(checkWinner())
    }
}

// "flipping cells" = changing classes and rendering content 
function flipCell(elCell, cellI, cellJ) {

    if ((gBoard[cellI][cellJ].isMarked) || (elCell.classList.contains('flipped'))) return
    elCell.classList.remove('hidden')
    elCell.classList.add('flipped')
    elCell.innerText = (!gBoard[cellI][cellJ].isMine) ? gBoard[cellI][cellJ].minesAroundCount : MINE
    // model
    gBoard[cellI][cellJ].isShown = true
    gGame.shownCount++
}

// searching for empty cells around clicked cell
function searchAroundEmptyCells(cellI, cellJ) {

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;
            if (i === cellI && j === cellJ) continue;

            var elCell = document.querySelector(`#cell-${i}-${j}`)
            if (!gBoard[i][j].minesAroundCount) {

                if (elCell.classList.contains('hidden')) {
                    flipCell(elCell, i, j)
                    searchAroundEmptyCells(i, j)
                }
            } else if (gBoard[i][j].minesAroundCount > 0) {

                if (elCell.classList.contains('hidden')) {
                    flipCell(elCell, i, j)
                }
            }

        }
    }
}

// Called on right click to mark a cell (suspected to be a mine)
// how to hide the context menu on right click?

function cellMarked(elCell, cellI, cellJ) {
    // updating game started and time is taken
    if (!gGame.isOn) gameStarted()
    if (gBoard[cellI][cellJ].isShown) return
    if (gBoard[cellI][cellJ].isMarked) {
        gBoard[cellI][cellJ].isMarked = false
        elCell.innerText = ' '
        gGame.markedCount--
    }
    else {
        gBoard[cellI][cellJ].isMarked = true
        elCell.innerText = FLAG
        gGame.markedCount++
        checkWinner()
    }
}


// updating game is on + starting timer
function gameStarted() {

    if (!gGame.isOn) {
        gGame.isOn = true
        gGame.secsPassed = Date.now()
    }

    gameStartedInterval = setInterval(() => {

        var timer = Math.floor((Date.now() - gGame.secsPassed) / 1000)
        var elTimer = document.querySelector('.timer')
        elTimer.innerText = 'Time : ' + timer
    }, 1000)
}

// Game ends when all mines are marked, and all the other cells are shown
function checkWinner() {

    var detectedMines = 0
    var otherCells = (gLevel.SIZE ** 2) - gLevel.MINES

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine && gBoard[i][j].isMarked) detectedMines++
            if ((gGame.shownCount === otherCells) && (detectedMines === gLevel.MINES)) {
                clearInterval(gameStartedInterval)
                return true
            }
        }
    }
    return false
}

// render you loose and stops interval
function gameOver() {
    console.log('you loose')
    clearInterval(gameStartedInterval)
}

// help functions

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}




