import { Chess } from 'chess.js';
import { getBoardForPlayer, revealPiecesAfterMove } from './visibilityEngine.js';
import { validateMove } from './moveValidator.js';

const GAME_TIME_MS = 1000 * 60 * 5; // 5 minutes per player

class GameManager {
    constructor(players, onEnd) {
        this.players = players; // { white: ws, black: ws }
        this.onEnd = onEnd;
        this.chess = new Chess();
        this.revealedPieces = { white: new Set(), black: new Set() };
        this.timers = { white: GAME_TIME_MS, black: GAME_TIME_MS };
        this.lastMoveTime = Date.now();

        this.initializeGame();
        this.gameTimer = setInterval(() => this.updateTimers(), 1000);
    }

    initializeGame() {
        this.broadcastGameState();
    }

    updateTimers() {
        const now = Date.now();
        const elapsed = now - this.lastMoveTime;
        this.lastMoveTime = now;

        const activePlayer = this.chess.turn() === 'w' ? 'white' : 'black';
        this.timers[activePlayer] -= elapsed;

        if (this.timers[activePlayer] <= 0) {
            this.endGame(activePlayer === 'white' ? 'black' : 'white', 'timeout');
        }
    }

    handleMove(ws, clientMove) {
        const playerColor = this.getPlayerColor(ws);
        const error = validateMove(this.chess, playerColor, clientMove, this.revealedPieces);

        if (error) {
            return this.sendError(ws, error);
        }

        const result = this.chess.move(clientMove.san);
        if (!result) {
            return this.sendError(ws, "Invalid move execution.");
        }

        revealPiecesAfterMove(this.chess, this.revealedPieces, playerColor, clientMove.from, result.piece);
        if (result.captured) {
            const opponentColor = playerColor === 'white' ? 'black' : 'white';
            this.sendMessage(this.players[opponentColor], 'PIECE_LOST', { pieceType: result.captured.toUpperCase() });
        }

        this.broadcastGameState();

        if (this.chess.isGameOver()) {
            this.endGame(this.chess.turn() === 'w' ? 'black' : 'white', 'checkmate');
        }
    }

    broadcastGameState() {
        for (const color of ['white', 'black']) {
            if (this.players[color]) {
                const board = getBoardForPlayer(this.chess, this.revealedPieces, color);
                this.sendMessage(this.players[color], 'GAME_STATE_UPDATE', {
                    board,
                    turn: this.chess.turn(),
                    color,
                    timers: this.timers
                });
            }
        }
    }

    getPlayerColor(ws) {
        return this.players.white === ws ? 'white' : 'black';
    }

    sendMessage(ws, type, payload) {
        if (ws.readyState === 1) { // OPEN
            ws.send(JSON.stringify({ type, payload }));
        }
    }

    sendError(ws, message) {
        this.sendMessage(ws, 'ERROR', { message });
    }

    broadcastMessage(type, payload) {
        Object.values(this.players).forEach(ws => {
            if (ws) this.sendMessage(ws, type, payload);
        });
    }

    endGame(winner, reason) {
        clearInterval(this.gameTimer);
        this.broadcastMessage('GAME_OVER', { winner, reason });
        if (this.onEnd) {
            this.onEnd();
        }
    }
}

export default GameManager;
