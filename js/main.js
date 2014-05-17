'use strict';

var $class = function(name, elem) {
    elem = (elem === undefined) ? document : elem;
    return elem.getElementsByClassName(name);
};

var $each = function(items, func) {
    for (var i = 0; i < items.length; i++) {
        func.bind(items[i])();
    };
};

var readCookie = function(name) {
    var cookies = document.cookie.split(';');
    var nameEq = name + '=';
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        // Strip whitespace
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1);
        };
        if (cookie.indexOf(nameEq) == 0) {
            return cookie.substring(nameEq.length);
        };
    };
};

var setCookie = function(key, value, expires) {
    var d = new Date();
    d.setDate(d.getDate() + expires);
    var cookieString = key + '=' + escape(value) + '; expires=' + d.toUTCString() + '; path=/';
    document.cookie = cookieString;
};

var cellElems = [];
var grid;
var score = 0;

var initGrid = function() {
    grid = [];
    for (var i = 0; i < 4; i++) {
        grid.push([0, 0, 0, 0]);
    };
    score = 0;
};

window.addEventListener('load', function() {
    // Load cells
    var gridElem = $class('grid')[0];
    var row = [];
    $each($class('cell', gridElem), function() {
        row.push(this);
        if (row.length == 4) {
            cellElems.push(row);
            row = [];
        };
    });

    newGame();
});

var shiftRow = function(row) {
    var orig = row.slice(0);
    // Get rid of zeros
    var offset = 0;
    var i = 0;
    while (i + offset < row.length) {
        if (row[i + offset] == 0) {
            offset++;
        } else {
            row[i] = row[i + offset];
            i++;
        };
    };
    while (i < row.length) {
        row[i++] = 0;
    };
    // Join matching numbers
    for (i = 0; i < row.length - 1; i++) {
        if (row[i + 1] == row[i] && row[i] != 0) {
            row[i] *= 2;
            score += row[i];
            for (var j = i + 1; j < row.length - 1; j++) {
                row[j] = row[j + 1];
            };
            row[row.length - 1] = 0;
        };
    };
    // Check to see if row was changed
    for (i = 0; i < row.length; i++) {
        if (orig[i] != row[i]) {
            return true;
        };
    };
    return false;
};

var isGameOver = function() {
    for (var r = 0; r < 4; r++) {
        for (var c = 0; c < 4; c++) {
            // Check for empty cells
            if (grid[r][c] == 0) {
                return false;
            };
            // Check cell below
            if (r <3 && grid[r][c] == grid[r + 1][c]) {
                return false;
            };
            // Check cell to right
            if (c <3 && grid[r][c] == grid[r][c + 1]) {
                return false;
            };
        };
    };
    return true;
};

var checkGameOver = function() {
    if (isGameOver()) {
        alert('Game over.');
        newGame();
    };
};

var newGame = function() {
    updateHighScore();
    initGrid();
    random2();
    random2();
    updateGrid();
};

var updateHighScore = function() {
    var highscore = 0;
    var high = readCookie('score');
    if (high) {
        highscore = parseInt(high);
    };
    if (score > highscore) {
        setCookie('score', score);
        highscore = score;
    };
    $class('best')[0].innerText = highscore;
};

var moveUp = function() {
    var didMove = false;
    for (var c = 0; c < 4; c++) {
        var row = [];
        for (var r = 0; r < 4; r++) {
            row.push(grid[r][c]);
        };
        if (shiftRow(row)) {
            didMove = true;
        };
        for (var r = 0; r < 4; r++) {
            grid[r][c] = row[r];
        };
    };
    if (didMove) {
        random2();
        updateGrid();
    };
};

var moveDown = function() {
    var didMove = false;
    for (var c = 0; c < 4; c++) {
        var row = [];
        for (var r = 3; r >= 0; r--) {
            row.push(grid[r][c]);
        };
        if (shiftRow(row)) {
            didMove = true;
        };
        row.reverse();
        for (var r = 3; r >= 0; r--) {
            grid[r][c] = row[r];
        };
    };
    if (didMove) {
        random2();
        updateGrid();
    };
};

var moveLeft = function() {
    var didMove = false;
    for (var r = 0; r < 4; r++) {
        if (shiftRow(grid[r])) {
            didMove = true;
        };
    };
    if (didMove) {
        random2();
        updateGrid();
    };
};

var moveRight = function() {
    var didMove = false;
    for (var r = 0; r < 4; r++) {
        var row = grid[r];
        row.reverse();
        if (shiftRow(row)) {
            didMove = true;
        };
        grid[r] = row.reverse();
    };

    if (didMove) {
        random2();
        updateGrid();
    };
};

var random2 = function() {
    var emptyPos = [];
    for (var r = 0; r < 4; r++) {
        for (var c = 0; c < 4; c++) {
            if (grid[r][c] == 0) {
                emptyPos.push([r, c]);
            };
        };
    };
    if (emptyPos.length > 0) {
        var pos = emptyPos[Math.floor(Math.random() * emptyPos.length)];
        var value = Math.random() < 0.9 ? 2 : 4;
        grid[pos[0]][pos[1]] = value;
    };
};

var updateGrid = function() {
    $class('score')[0].innerText = score;
    updateHighScore();
    for (var c = 0; c < 4; c++) {
        for (var r = 0; r < 4; r++) {
            var value = grid[r][c];
            var cell = cellElems[r][c];
            if (value == 0) {
                cell.className = 'cell';
                cell.innerText = '';
            } else {
                cell.className = 'cell cell-' + value;
                cell.innerText = value;
            };
        };
    };
    checkGameOver();
};

window.addEventListener('keydown', function(evt) {
    var keycode = event.which | event.keyCode;
    var left = 37, up = 38, right = 39, down = 40;
    if (keycode == up) {
        moveUp();
    } else if (keycode == down) {
        moveDown();
    } else if (keycode == left) {
        moveLeft();
    } else if (keycode == right) {
        moveRight();
    };
});
