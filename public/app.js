const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const flashEl = document.getElementById('turn-flash');

let turn = 'white';
let phase = 'LOCK'; 
let selectedTile = null;

let pieces = {
    "0,0":{type:'rook',color:'black'}, "1,0":{type:'knight',color:'black'}, "2,0":{type:'bishop',color:'black'}, "3,0":{type:'queen',color:'black'}, "4,0":{type:'king',color:'black'}, "5,0":{type:'bishop',color:'black'}, "6,0":{type:'knight',color:'black'}, "7,0":{type:'rook',color:'black'},
    "0,1":{type:'pawn',color:'black'}, "1,1":{type:'pawn',color:'black'}, "2,1":{type:'pawn',color:'black'}, "3,1":{type:'pawn',color:'black'}, "4,1":{type:'pawn',color:'black'}, "5,1":{type:'pawn',color:'black'}, "6,1":{type:'pawn',color:'black'}, "7,1":{type:'pawn',color:'black'},
    "0,6":{type:'pawn',color:'white'}, "1,6":{type:'pawn',color:'white'}, "2,6":{type:'pawn',color:'white'}, "3,6":{type:'pawn',color:'white'}, "4,6":{type:'pawn',color:'white'}, "5,6":{type:'pawn',color:'white'}, "6,6":{type:'pawn',color:'white'}, "7,6":{type:'pawn',color:'white'},
    "0,7":{type:'rook',color:'white'}, "1,7":{type:'knight',color:'white'}, "2,7":{type:'bishop',color:'white'}, "3,7":{type:'queen',color:'white'}, "4,7":{type:'king',color:'white'}, "5,7":{type:'bishop',color:'white'}, "6,7":{type:'knight',color:'white'}, "7,7":{type:'rook',color:'white'}
};

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
    triggerFlash();
    render();
}

function render() {
    document.querySelectorAll('.piece').forEach(p => p.remove());
    document.querySelectorAll('.tile').forEach(t => t.classList.remove('visible', 'selected', 'revealed', 'valid-move', 'has-enemy'));

    for (const [coord, p] of Object.entries(pieces)) {
        const [x, y] = coord.split(',').map(Number);
        const tile = document.getElementById(`tile-${x}-${y}`);
        const isOwn = p.color === turn;
        const isSeen = selectedTile && canSee(selectedTile, coord) && p.color !== turn;

        if (isOwn) tile.classList.add('visible');
        if (isOwn || isSeen) {
            const el = document.createElement('div');
            el.className = 'piece';
            el.style.backgroundImage = `url(https://upload.wikimedia.org/wikipedia/commons/${getImg(p)})`;
            tile.appendChild(el);
            if (isSeen) tile.classList.add('revealed');
        }
    }

    if (selectedTile) {
        document.getElementById(`tile-${selectedTile}`).classList.add('selected');
        // ALWAYS SHOW ALL VALID MOVES IN COLOR
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const target = `${x},${y}`;
                if (isValidMove(pieces[selectedTile], selectedTile, target)) {
                    const tEl = document.getElementById(`tile-${target}`);
                    tEl.classList.add('valid-move');
                    if (pieces[target]) tEl.classList.add('has-enemy');
                }
            }
        }
    }
}

function handleClick(x, y) {
    const coord = `${x},${y}`;
    if (phase === 'LOCK') {
        if (pieces[coord]?.color === turn) {
            // Check if piece can even move
            const moves = getValidMoves(coord);
            if (moves.length === 0) {
                statusEl.innerText = "NO MOVES! CHOOSE ANOTHER";
                return;
            }
            selectedTile = coord; phase = 'MOVE';
            statusEl.innerText = `${turn} to move`;
            render();
        }
    } else {
        const active = pieces[selectedTile];
        if (isValidMove(active, selectedTile, coord)) {
            if (pieces[coord]?.type === 'king') { alert(turn.toUpperCase() + " WINS!"); location.reload(); }
            pieces[coord] = active;
            delete pieces[selectedTile];
            nextTurn();
        } else if (pieces[coord]?.color === turn) {
            // Re-select logic
            const moves = getValidMoves(coord);
            if (moves.length > 0) { selectedTile = coord; render(); }
        }
    }
}

function getValidMoves(coord) {
    const moves = [];
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (isValidMove(pieces[coord], coord, `${x},${y}`)) moves.push(`${x},${y}`);
        }
    }
    return moves;
}

function nextTurn() {
    turn = turn === 'white' ? 'black' : 'white';
    phase = 'LOCK';
    selectedTile = null;
    statusEl.innerText = `${turn}: LOCK`;
    triggerFlash();
    render();
}

function triggerFlash() {
    flashEl.innerText = `${turn.toUpperCase()}'S TURN`;
    flashEl.classList.remove('flash-anim');
    void flashEl.offsetWidth; // Trigger reflow
    flashEl.classList.add('flash-anim');
}

// Logic helpers from previous versions...
function canSee(start, end) {
    const [x1, y1] = start.split(',').map(Number);
    const [x2, y2] = end.split(',').map(Number);
    if (Math.abs(x1 - x2) > 2 || Math.abs(y1 - y2) > 2) return false;
    return isPathClear(x1, y1, x2, y2) || (Math.abs(x1-x2) === 1 && Math.abs(y1-y2) === 1);
}

function isValidMove(p, from, to) {
    if (!p) return false;
    const [x1, y1] = from.split(',').map(Number);
    const [x2, y2] = to.split(',').map(Number);
    const dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1);
    if (x1 === x2 && y1 === y2 || pieces[to]?.color === p.color) return false;
    switch(p.type) {
        case 'pawn': 
            const d = p.color === 'white' ? -1 : 1;
            if (x1 === x2 && y2 - y1 === d && !pieces[to]) return true;
            if (x1 === x2 && y1 === (p.color === 'white' ? 6 : 1) && y2 - y1 === 2*d && !pieces[`${x1},${y1+d}`] && !pieces[to]) return true;
            if (dx === 1 && y2 - y1 === d && pieces[to]) return true;
            return false;
        case 'rook': return (x1 === x2 || y1 === y2) && isPathClear(x1, y1, x2, y2);
        case 'bishop': return dx === dy && isPathClear(x1, y1, x2, y2);
        case 'queen': return (x1 === x2 || y1 === y2 || dx === dy) && isPathClear(x1, y1, x2, y2);
        case 'knight': return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
        case 'king': return dx <= 1 && dy <= 1;
    }
}

function isPathClear(x1, y1, x2, y2) {
    const dx = Math.sign(x2 - x1), dy = Math.sign(y2 - y1);
    let cx = x1 + dx, cy = y1 + dy;
    while (cx !== x2 || cy !== y2) {
        if (pieces[`${cx},${cy}`]) return false;
        cx += dx; cy += dy;
    }
    return true;
}

function getImg(p) {
    const m = { 'white-pawn': '4/45/Chess_plt45.svg', 'white-rook': '7/72/Chess_rlt45.svg', 'white-knight': '7/70/Chess_nlt45.svg', 'white-bishop': 'b/b1/Chess_blt45.svg', 'white-queen': '1/15/Chess_qlt45.svg', 'white-king': '4/42/Chess_klt45.svg', 'black-pawn': 'c/c7/Chess_pdt45.svg', 'black-rook': 'f/ff/Chess_rdt45.svg', 'black-knight': 'e/ef/Chess_ndt45.svg', 'black-bishop': '9/98/Chess_bdt45.svg', 'black-queen': '4/47/Chess_qdt45.svg', 'black-king': 'f/f0/Chess_kdt45.svg' };
    return m[`${p.color}-${p.type}`];
}

init();