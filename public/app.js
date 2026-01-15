const boardEl = document.getElementById('board');
const notationGrid = document.getElementById('notation-grid');
const timerText = document.getElementById('timer-display');
const overlay = document.getElementById('privacy-overlay');
const setupOverlay = document.getElementById('setup-overlay');
const victoryOverlay = document.getElementById('victory-overlay');
const graveyardEl = document.getElementById('graveyard');

let turn = 'white', selectedTile = null, revealedSquares = new Set(), isGameOver = false;
let timerMode = 'fixed', timeLeft = 0, timerInterval = null, totalCaptured = 0;
let movedPieces = new Set(), enPassantTarget = null, gameStartTime = null;

let pieces = {
    "0,0":{type:'rook',color:'black'}, "1,0":{type:'knight',color:'black'}, "2,0":{type:'bishop',color:'black'}, "3,0":{type:'queen',color:'black'}, "4,0":{type:'king',color:'black'}, "5,0":{type:'bishop',color:'black'}, "6,0":{type:'knight',color:'black'}, "7,0":{type:'rook',color:'black'},
    "0,1":{type:'pawn',color:'black'}, "1,1":{type:'pawn',color:'black'}, "2,1":{type:'pawn',color:'black'}, "3,1":{type:'pawn',color:'black'}, "4,1":{type:'pawn',color:'black'}, "5,1":{type:'pawn',color:'black'}, "6,1":{type:'pawn',color:'black'}, "7,1":{type:'pawn',color:'black'},
    "0,6":{type:'pawn',color:'white'}, "1,6":{type:'pawn',color:'white'}, "2,6":{type:'pawn',color:'white'}, "3,6":{type:'pawn',color:'white'}, "4,6":{type:'pawn',color:'white'}, "5,6":{type:'pawn',color:'white'}, "6,6":{type:'pawn',color:'white'}, "7,6":{type:'pawn',color:'white'},
    "0,7":{type:'rook',color:'white'}, "1,7":{type:'knight',color:'white'}, "2,7":{type:'bishop',color:'white'}, "3,7":{type:'queen',color:'white'}, "4,7":{type:'king',color:'white'}, "5,7":{type:'bishop',color:'white'}, "6,7":{type:'knight',color:'white'}, "7,7":{type:'rook',color:'white'}
};

let boardHistory = [JSON.parse(JSON.stringify(pieces))], historyIndex = -1, lastMove = { from: null, to: null }, moveCount = 1;

function startGame(mode) {
    timerMode = mode;
    setupOverlay.classList.add('hidden');
    gameStartTime = Date.now();
    init();
}

function init() {
    boardEl.innerHTML = '';
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const t = document.createElement('div');
            t.id = `tile-${x}-${y}`;
            t.className = `tile ${(x + y) % 2 === 0 ? 'light' : 'dark'}`;
            t.onclick = () => handleClick(x, y);
            boardEl.appendChild(t);
        }
    }
    render();
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = (timerMode === 'blitz') ? 15 : (timerMode === 'dynamic') ? (totalCaptured >= 20 ? 20 : totalCaptured >= 10 ? 40 : 60) : 60;
    timerText.innerText = `TIME: ${timeLeft}s`;
    timerInterval = setInterval(() => {
        if (overlay.classList.contains('hidden') && !isGameOver) {
            timeLeft--;
            timerText.innerText = `TIME: ${timeLeft}s`;
            if (timeLeft <= 5) timerText.classList.add('urgent');
            if (timeLeft <= 0) handleTimeout();
        }
    }, 1000);
}

function handleTimeout() {
    if (selectedTile) { delete pieces[selectedTile]; totalCaptured++; boardHistory.push(JSON.parse(JSON.stringify(pieces))); }
    startTurnTransition();
}

function handleClick(x, y) {
    if (historyIndex !== -1 || isGameOver) return;
    const coord = `${x},${y}`;
    if (!selectedTile) {
        if (pieces[coord]?.color === turn) {
            if (getValidMoves(coord).length === 0) return;
            selectedTile = coord;
            revealedSquares = new Set(getAttackSquares(coord));
            render();
        }
    } else {
        const active = pieces[selectedTile];
        const moves = getValidMoves(selectedTile);
        if (moves.includes(coord)) {
            const [x1, y1] = selectedTile.split(',').map(Number);
            const [x2, y2] = coord.split(',').map(Number);

            // Castling logic
            if (active.type === 'king' && Math.abs(x2-x1) === 2) {
                const isK = x2 > x1;
                const rF = isK ? `7,${y1}` : `0,${y1}`, rT = isK ? `5,${y1}` : `3,${y1}`;
                pieces[rT] = pieces[rF]; delete pieces[rF];
            }
            // En Passant
            if (active.type === 'pawn' && coord === enPassantTarget) {
                const vY = turn === 'white' ? y2+1 : y2-1;
                addGrave(pieces[`${x2},${vY}`]); delete pieces[`${x2},${vY}`]; totalCaptured++;
            }
            
            enPassantTarget = (active.type === 'pawn' && Math.abs(y2-y1) === 2) ? `${x1},${(y1+y2)/2}` : null;

            if (pieces[coord]) {
                addGrave(pieces[coord]);
                if (pieces[coord].type === 'king') {
                    updateNotationGrid(active, selectedTile, coord, pieces[coord]);
                    pieces[coord] = active; delete pieces[selectedTile];
                    boardHistory.push(JSON.parse(JSON.stringify(pieces)));
                    endGame(); return;
                }
                totalCaptured++;
            }

            if (active.type === 'pawn' && (y2 === 0 || y2 === 7)) active.type = 'queen';

            updateNotationGrid(active, selectedTile, coord, pieces[coord]);
            lastMove = { from: selectedTile, to: coord };
            pieces[coord] = active; delete pieces[selectedTile];
            movedPieces.add(selectedTile);
            boardHistory.push(JSON.parse(JSON.stringify(pieces)));
            startTurnTransition();
        }
    }
}

function endGame() {
    isGameOver = true;
    clearInterval(timerInterval);
    const duration = Math.floor((Date.now() - gameStartTime) / 1000);
    const m = Math.floor(duration/60), s = duration % 60;
    victoryOverlay.classList.remove('hidden');
    document.getElementById('winner-text').innerText = `${turn.toUpperCase()} WINS`;
    document.getElementById('match-stats').innerText = `Moves: ${moveCount} | Time: ${m}:${s < 10 ? '0' : ''}${s}`;
    render();
}

function startReplay() {
    victoryOverlay.classList.add('hidden');
    historyIndex = 0;
    document.getElementById('history-label').innerText = "MOVE 0";
    render();
}

function addGrave(p) {
    const div = document.createElement('div');
    div.className = 'grave-icon';
    div.style.backgroundImage = `url(https://upload.wikimedia.org/wikipedia/commons/${getImg(p)})`;
    graveyardEl.appendChild(div);
}

function startTurnTransition() {
    clearInterval(timerInterval);
    turn = turn === 'white' ? 'black' : 'white';
    document.getElementById('next-player-name').innerText = `${turn.toUpperCase()}'S TURN`;
    overlay.classList.remove('hidden');
    selectedTile = null; revealedSquares.clear();
}

function revealBoard() { 
    overlay.classList.add('hidden'); 
    document.body.setAttribute('data-turn', turn); 
    startTimer(); 
    render(); 
}

function isValidMove(p, from, to) {
    const [x1, y1] = from.split(',').map(Number), [x2, y2] = to.split(',').map(Number);
    const dx = Math.abs(x2-x1), dy = Math.abs(y2-y1);
    if (pieces[to]?.color === p.color) return false;
    switch(p.type) {
        case 'pawn':
            const d = p.color === 'white' ? -1 : 1;
            if (x1 === x2 && y2 - y1 === d && !pieces[to]) return true;
            if (x1 === x2 && y1 === (p.color === 'white' ? 6 : 1) && y2 - y1 === 2 * d && !pieces[`${x1},${y1+d}`] && !pieces[to]) return true;
            if (dx === 1 && y2 - y1 === d && (pieces[to] || to === enPassantTarget)) return true;
            return false;
        case 'king':
            if (dx <= 1 && dy <= 1) return true;
            if (dy === 0 && dx === 2 && !movedPieces.has(from)) {
                const isK = x2 > x1;
                const rS = isK ? `7,${y1}` : `0,${y1}`;
                return pieces[rS]?.type === 'rook' && !movedPieces.has(rS) && isPathClear(x1, y1, isK ? 7 : 0, y1);
            }
            return false;
        case 'rook': return (x1===x2 || y1===y2) && isPathClear(x1,y1,x2,y2);
        case 'bishop': return dx===dy && isPathClear(x1,y1,x2,y2);
        case 'queen': return (x1===x2 || y1===y2 || dx===dy) && isPathClear(x1,y1,x2,y2);
        case 'knight': return (dx===2 && dy===1) || (dx===1 && dy===2);
    }
}

function isPathClear(x1,y1,x2,y2) {
    const dx = Math.sign(x2-x1), dy = Math.sign(y2-y1);
    let cx = x1+dx, cy = y1+dy;
    while(cx!==x2 || cy!==y2) { if (pieces[`${cx},${cy}`]) return false; cx+=dx; cy+=dy; }
    return true;
}

function getValidMoves(coord) {
    let list = [];
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if (isValidMove(pieces[coord], coord, `${x},${y}`)) list.push(`${x},${y}`);
    return list;
}

function getAttackSquares(from) {
    const p = pieces[from]; const [x1, y1] = from.split(',').map(Number);
    let attacks = [];
    const pushIfEnemy = (x, y) => { if (pieces[`${x},${y}`]?.color && pieces[`${x},${y}`].color !== p.color) attacks.push(`${x},${y}`); };
    if (p.type === "pawn") {
        const d = p.color === "white" ? -1 : 1;
        [x1-1, x1+1].forEach(x => { if (x>=0 && x<8) pushIfEnemy(x, y1+d); });
    } else if (p.type === "knight") {
        [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]].forEach(([dx, dy]) => { if (x1+dx>=0 && x1+dx<8 && y1+dy>=0 && y1+dy<8) pushIfEnemy(x1+dx, y1+dy); });
    } else {
        const dirs = (p.type === "rook") ? [[1,0],[-1,0],[0,1],[0,-1]] : (p.type === "bishop") ? [[1,1],[1,-1],[-1,1],[-1,-1]] : [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
        for (const [dx, dy] of dirs) {
            let x = x1+dx, y = y1+dy;
            while (x>=0 && x<8 && y>=0 && y<8) {
                if (pieces[`${x},${y}`]) { if (pieces[`${x},${y}`].color !== p.color) attacks.push(`${x},${y}`); break; }
                if (p.type === "king") break;
                x+=dx; y+=dy;
            }
        }
    }
    return attacks;
}

function updateNotationGrid(p, from, to, cap) {
    const pChar = { 'pawn': '', 'rook': 'R', 'knight': 'N', 'bishop': 'B', 'queen': 'Q', 'king': 'K' }[p.type];
    const notation = `${pChar}${cap ? 'x' : ''}${toAlgebraic(to)}`;
    const hIdx = boardHistory.length;
    if (turn === 'white') {
        const num = document.createElement('div'); num.className = 'move-num'; num.innerText = moveCount;
        const wCell = document.createElement('div'); wCell.className = 'move-cell';
        wCell.innerHTML = `<span class="white-private">${notation}</span><span class="white-mask mask">Moved</span>`;
        wCell.onclick = () => jumpToHistory(hIdx);
        const bCell = document.createElement('div'); bCell.id = `black-move-${moveCount}`; bCell.className = 'move-cell';
        notationGrid.appendChild(num); notationGrid.appendChild(wCell); notationGrid.appendChild(bCell);
    } else {
        const bCell = document.getElementById(`black-move-${moveCount}`);
        bCell.innerHTML = `<span class="black-private">${notation}</span><span class="black-mask mask">Moved</span>`;
        bCell.onclick = () => jumpToHistory(hIdx);
        moveCount++;
    }
}

function jumpToHistory(index) { historyIndex = index; document.getElementById('history-label').innerText = `MOVE ${index}`; render(); }
function navigateHistory(dir) {
    if (dir === -1) { if (historyIndex === -1) historyIndex = boardHistory.length - 1; else if (historyIndex > 0) historyIndex--; }
    else { if (historyIndex === boardHistory.length - 1) historyIndex = -1; else if (historyIndex !== -1) historyIndex++; }
    document.getElementById('history-label').innerText = historyIndex === -1 ? "LIVE" : `MOVE ${historyIndex}`;
    render();
}
function toAlgebraic(coord) { const [x, y] = coord.split(',').map(Number); return ['a','b','c','d','e','f','g','h'][x] + (8 - y); }

function render() {
    document.querySelectorAll('.piece').forEach(p => p.remove());
    document.querySelectorAll('.tile').forEach(t => t.classList.remove('visible', 'selected', 'revealed', 'valid-move', 'has-piece', 'last-move'));
    const dBoard = (historyIndex === -1) ? pieces : boardHistory[historyIndex];
    
    if (historyIndex === -1 && lastMove.from && lastMove.to) {
        document.getElementById(`tile-${lastMove.from.replace(',','-')}`).classList.add('last-move');
        document.getElementById(`tile-${lastMove.to.replace(',','-')}`).classList.add('last-move');
    }

    for (const [coord, p] of Object.entries(dBoard)) {
        const tile = document.getElementById(`tile-${coord.replace(',','-')}`);
        if (isGameOver || p.color === turn || (historyIndex === -1 && revealedSquares.has(coord))) {
            tile.classList.add(p.color === turn ? 'visible' : 'revealed');
            const el = document.createElement('div'); el.className = 'piece';
            el.style.backgroundImage = `url(https://upload.wikimedia.org/wikipedia/commons/${getImg(p)})`;
            tile.appendChild(el);
        }
    }
    if (selectedTile && historyIndex === -1 && !isGameOver) {
        document.getElementById(`tile-${selectedTile.replace(',','-')}`).classList.add('selected');
        getValidMoves(selectedTile).forEach(m => {
            const t = document.getElementById(`tile-${m.replace(',','-')}`); t.classList.add('valid-move');
            if (pieces[m] && pieces[m].color !== turn) t.classList.add('has-piece');
            if (m === enPassantTarget) t.classList.add('has-piece');
        });
    }
}

function getImg(p) {
    const m = { 'white-pawn': '4/45/Chess_plt45.svg', 'white-rook': '7/72/Chess_rlt45.svg', 'white-knight': '7/70/Chess_nlt45.svg', 'white-bishop': 'b/b1/Chess_blt45.svg', 'white-queen': '1/15/Chess_qlt45.svg', 'white-king': '4/42/Chess_klt45.svg', 'black-pawn': 'c/c7/Chess_pdt45.svg', 'black-rook': 'f/ff/Chess_rdt45.svg', 'black-knight': 'e/ef/Chess_ndt45.svg', 'black-bishop': '9/98/Chess_bdt45.svg', 'black-queen': '4/47/Chess_qdt45.svg', 'black-king': 'f/f0/Chess_kdt45.svg' };
    return m[`${p.color}-${p.type}`];
}