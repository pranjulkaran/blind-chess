/**
 * BLIND CHESS: CUSTOM ENGINE
 * Coordinates: [x,y] where 0,0 is Top-Left (Black Side) and 7,7 is Bottom-Right (White Side)
 */

const boardEl = document.getElementById('board');
const logEl = document.getElementById('game-log');
const phaseDisplay = document.getElementById('phase-display');
const turnDisplay = document.getElementById('turn-display');

// --- GAME STATE ---
let turn = 'white';
let phase = 'LOCK'; // Phases: LOCK -> MOVE
let selectedTile = null; // The coordinate of the "Locked" piece

// Initial piece placement
let pieces = {
    // Black Pieces (Rows 0 and 1)
    "0,0": { type: 'rook', color: 'black' }, "1,0": { type: 'knight', color: 'black' }, "2,0": { type: 'bishop', color: 'black' }, "3,0": { type: 'queen', color: 'black' }, "4,0": { type: 'king', color: 'black' }, "5,0": { type: 'bishop', color: 'black' }, "6,0": { type: 'knight', color: 'black' }, "7,0": { type: 'rook', color: 'black' },
    "0,1": { type: 'pawn', color: 'black' }, "1,1": { type: 'pawn', color: 'black' }, "2,1": { type: 'pawn', color: 'black' }, "3,1": { type: 'pawn', color: 'black' }, "4,1": { type: 'pawn', color: 'black' }, "5,1": { type: 'pawn', color: 'black' }, "6,1": { type: 'pawn', color: 'black' }, "7,1": { type: 'pawn', color: 'black' },
    
    // White Pieces (Rows 6 and 7)
    "0,6": { type: 'pawn', color: 'white' }, "1,6": { type: 'pawn', color: 'white' }, "2,6": { type: 'pawn', color: 'white' }, "3,6": { type: 'pawn', color: 'white' }, "4,6": { type: 'pawn', color: 'white' }, "5,6": { type: 'pawn', color: 'white' }, "6,6": { type: 'pawn', color: 'white' }, "7,6": { type: 'pawn', color: 'white' },
    "0,7": { type: 'rook', color: 'white' }, "1,7": { type: 'knight', color: 'white' }, "2,7": { type: 'bishop', color: 'white' }, "3,7": { type: 'queen', color: 'white' }, "4,7": { type: 'king', color: 'white' }, "5,7": { type: 'bishop', color: 'white' }, "6,7": { type: 'knight', color: 'white' }, "7,7": { type: 'rook', color: 'white' },
};

// --- BOARD INITIALIZATION ---
function initBoard() {
    boardEl.innerHTML = '';
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const tile = document.createElement('div');
            tile.className = `tile ${(x + y) % 2 === 0 ? 'light' : 'dark'}`;
            tile.id = `tile-${x}-${y}`;
            tile.onclick = () => handleTileClick(x, y);
            boardEl.appendChild(tile);
        }
    }
    render();
}

// --- RENDERING (THE FOG OF WAR) ---
function render() {
    // Remove all old piece elements
    document.querySelectorAll('.piece').forEach(el => el.remove());
    document.querySelectorAll('.tile').forEach(el => el.classList.remove('selected', 'revealed'));

    for (const [coord, piece] of Object.entries(pieces)) {
        const [x, y] = coord.split(',').map(Number);
        
        const isOwnPiece = piece.color === turn;
        const isVisibleEnemy = selectedTile && isWithinRevealRange(selectedTile, coord) && piece.color !== turn;

        if (isOwnPiece || isVisibleEnemy) {
            const pieceEl = document.createElement('div');
            pieceEl.className = 'piece';
            pieceEl.style.backgroundImage = `url(https://upload.wikimedia.org/wikipedia/commons/${getPieceImage(piece.type, piece.color)})`;
            document.getElementById(`tile-${x}-${y}`).appendChild(pieceEl);
            
            if (isVisibleEnemy) {
                document.getElementById(`tile-${x}-${y}`).classList.add('revealed');
            }
        }
    }

    if (selectedTile) {
        const [sx, sy] = selectedTile.split(',');
        document.getElementById(`tile-${sx}-${sy}`).classList.add('selected');
    }
}

// --- MOVE VALIDATION LOGIC ---
function isValidMove(piece, from, to) {
    const [x1, y1] = from.split(',').map(Number);
    const [x2, y2] = to.split(',').map(Number);
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);

    if (x1 === x2 && y1 === y2) return false;

    switch (piece.type) {
        case 'pawn':
            const dir = piece.color === 'white' ? -1 : 1;
            const startRow = piece.color === 'white' ? 6 : 1;
            // Forward 1
            if (x1 === x2 && y2 - y1 === dir && !pieces[`${x2},${y2}`]) return true;
            // Forward 2
            if (x1 === x2 && y1 === startRow && y2 - y1 === 2 * dir && !pieces[`${x2},${y1+dir}`] && !pieces[`${x2},${y2}`]) return true;
            // Capture
            if (dx === 1 && y2 - y1 === dir && pieces[`${x2},${y2}`]) return true;
            return false;

        case 'rook':
            return (x1 === x2 || y1 === y2) && isPathClear(x1, y1, x2, y2);
        case 'bishop':
            return (dx === dy) && isPathClear(x1, y1, x2, y2);
        case 'queen':
            return (x1 === x2 || y1 === y2 || dx === dy) && isPathClear(x1, y1, x2, y2);
        case 'knight':
            return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
        case 'king':
            return dx <= 1 && dy <= 1;
    }
    return false;
}

function isPathClear(x1, y1, x2, y2) {
    const stepX = x2 === x1 ? 0 : (x2 > x1 ? 1 : -1);
    const stepY = y2 === y1 ? 0 : (y2 > y1 ? 1 : -1);
    let curX = x1 + stepX;
    let curY = y1 + stepY;
    while (curX !== x2 || curY !== y2) {
        if (pieces[`${curX},${curY}`]) return false;
        curX += stepX;
        curY += stepY;
    }
    return true;
}

function isWithinRevealRange(lockedCoord, targetCoord) {
    const [x1, y1] = lockedCoord.split(',').map(Number);
    const [x2, y2] = targetCoord.split(',').map(Number);
    // Revealed if in the 8 squares around the locked piece
    return Math.abs(x1 - x2) <= 1 && Math.abs(y1 - y2) <= 1;
}

// --- INTERACTION HANDLERS ---
function handleTileClick(x, y) {
    const coord = `${x},${y}`;
    const pieceAtTile = pieces[coord];

    if (phase === 'LOCK') {
        if (pieceAtTile && pieceAtTile.color === turn) {
            selectedTile = coord;
            phase = 'MOVE';
            log(`${turn} locked ${pieceAtTile.type} at ${coord}`);
            updateUI();
            render();
        }
    } else {
        const movingPiece = pieces[selectedTile];
        if (isValidMove(movingPiece, selectedTile, coord)) {
            executeMove(selectedTile, coord);
        } else {
            // If they click another of their own pieces, let them change the locked piece
            if (pieceAtTile && pieceAtTile.color === turn) {
                selectedTile = coord;
                log(`Changed lock to ${pieceAtTile.type} at ${coord}`);
                render();
            } else {
                log(`Invalid move for ${movingPiece.type}!`);
            }
        }
    }
}

function executeMove(from, to) {
    const movingPiece = pieces[from];
    const target = pieces[to];

    if (target) {
        log(`CAPTURE: ${movingPiece.color} ${movingPiece.type} took ${target.type}`);
        if (target.type === 'king') {
            alert(`GAME OVER! ${turn.toUpperCase()} WINS!`);
            location.reload();
            return;
        }
    }

    pieces[to] = movingPiece;
    delete pieces[from];

    // Reset for next turn
    turn = turn === 'white' ? 'black' : 'white';
    phase = 'LOCK';
    selectedTile = null;
    
    log(`Turn changed to ${turn}`);
    updateUI();
    render();
}

// --- HELPERS ---
function updateUI() {
    phaseDisplay.innerText = `${turn.toUpperCase()}: ${phase}`;
    turnDisplay.innerText = `Current Player: ${turn.charAt(0).toUpperCase() + turn.slice(1)}`;
}

function log(msg) {
    const div = document.createElement('div');
    div.innerText = `> ${msg}`;
    logEl.prepend(div);
}

function getPieceImage(type, color) {
    const map = {
        'white-pawn': '4/45/Chess_plt45.svg', 'white-rook': '7/72/Chess_rlt45.svg', 'white-knight': '7/70/Chess_nlt45.svg',
        'white-bishop': 'b/b1/Chess_blt45.svg', 'white-queen': '1/15/Chess_qlt45.svg', 'white-king': '4/42/Chess_klt45.svg',
        'black-pawn': 'c/c7/Chess_pdt45.svg', 'black-rook': 'f/ff/Chess_rdt45.svg', 'black-knight': 'e/ef/Chess_ndt45.svg',
        'black-bishop': '9/98/Chess_bdt45.svg', 'black-queen': '4/47/Chess_qdt45.svg', 'black-king': 'f/f0/Chess_kdt45.svg'
    };
    return map[`${color}-${type}`];
}

initBoard();