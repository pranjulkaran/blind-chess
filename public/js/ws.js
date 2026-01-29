import { setPlayerColor, updateStatus, updateTurnIndicator, renderBoard, addCapturedPiece } from './ui.js';

let ws;

export function setupWebSocket() {
    ws = new WebSocket(`ws://${window.location.host}`);

    ws.onopen = () => updateStatus('Connected. Waiting for a player...');
    ws.onclose = () => updateStatus('Disconnected.');
    ws.onerror = () => updateStatus('Connection error.');

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleMessage(message);
    };
}

export function sendMove(move) {
    ws.send(JSON.stringify({ type: 'MAKE_MOVE', payload: move }));
}

function handleMessage(message) {
    switch (message.type) {
        case 'INFO':
            updateStatus(message.payload.message);
            break;
        case 'GAME_STATE_UPDATE':
            setPlayerColor(message.payload.color);
            renderBoard(message.payload.board);
            updateTurnIndicator(message.payload.turn);
            break;
        case 'PIECE_LOST':
            addCapturedPiece(message.payload.color, message.payload.pieceType);
            break;
        case 'ERROR':
            alert(`Error: ${message.payload.message}`);
            break;
        case 'GAME_OVER':
            alert(`Game Over! ${message.payload.winner} wins!`);
            break;
    }
}
