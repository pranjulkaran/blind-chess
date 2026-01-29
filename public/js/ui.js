import { sendMove } from './ws.js';
import { createBoard } from './board.js';

let selectedSquare = null;
let playerColor = 'white';

export function initUI() {
    const boardElement = document.getElementById('board');
    const beliefBoardElement = document.getElementById('belief-board');

    createBoard(boardElement, onSquareClick);
    createBoard(beliefBoardElement, null, onDropOnBeliefBoard, onBeliefBoardRightClick);
}

export function setPlayerColor(color) {
    playerColor = color;
    document.getElementById('player-white').style.fontWeight = playerColor === 'white' ? 'bold' : 'normal';
    document.getElementById('player-black').style.fontWeight = playerColor === 'black' ? 'bold' : 'normal';
}

export function updateStatus(message) {
    document.getElementById('status-messages').textContent = message;
}

export function updateTurnIndicator(turn) {
    document.getElementById('turn-indicator').textContent = `${turn === 'w' ? 'White' : 'Black'}'s Turn`;
}

export function renderBoard(board) {
    const boardElement = document.getElementById('board');
    const squares = boardElement.querySelectorAll('.square');
    squares.forEach(squareDiv => {
        squareDiv.innerHTML = '';
        const squareName = squareDiv.dataset.square;
        const [col, row] = [squareName.charCodeAt(0) - 97, 8 - parseInt(squareName.charAt(1))];
        const piece = board[row][col];

        if (piece) {
            const pieceDiv = document.createElement('div');
            pieceDiv.classList.add('piece');
            pieceDiv.dataset.color = piece.color;
            pieceDiv.dataset.type = piece.type;
            pieceDiv.style.backgroundImage = `url(./pieces/${piece.color}${piece.type.toUpperCase()}.png)`;
            
            pieceDiv.draggable = true;
            pieceDiv.addEventListener('dragstart', (e) => onDragStart(e, piece));

            squareDiv.appendChild(pieceDiv);
        }
    });
}

export function addCapturedPiece(color, pieceType) {
    const capturedPiecesContainer = document.querySelector(`#player-${color} .captured-pieces`);
    const pieceImage = document.createElement('img');
    pieceImage.src = `./pieces/${pieceType.charAt(0).toLowerCase()}${pieceType.slice(1)}.png`;
    capturedPiecesContainer.appendChild(pieceImage);
}

function onSquareClick(square) {
    const pieceElement = document.getElementById('board').querySelector(`[data-square="${square}"]`).firstChild;

    if (selectedSquare) {
        sendMove({ from: selectedSquare, to: square });
        document.getElementById('board').querySelector(`[data-square="${selectedSquare}"]`).classList.remove('selected');
        selectedSquare = null;
    } else if (pieceElement) {
        const pieceColor = pieceElement.dataset.color;
        if (pieceColor === playerColor.charAt(0)) {
            selectedSquare = square;
            document.getElementById('board').querySelector(`[data-square="${square}"]`).classList.add('selected');
        }
    }
}

function onDragStart(e, piece) {
    e.dataTransfer.setData('text/plain', JSON.stringify(piece));
}

function onDropOnBeliefBoard(e, square) {
    e.preventDefault();
    const pieceData = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    if (pieceData.color !== playerColor.charAt(0)) {
        square.innerHTML = '';
        const pieceDiv = document.createElement('div');
        pieceDiv.classList.add('piece', 'belief-piece');
        pieceDiv.style.backgroundImage = `url(./pieces/${pieceData.color}${pieceData.type.toUpperCase()}.png)`;
        square.appendChild(pieceDiv);
    }
}

function onBeliefBoardRightClick(e, square) {
    e.preventDefault();
    if (square.firstChild) {
        square.innerHTML = '';
    }
}
