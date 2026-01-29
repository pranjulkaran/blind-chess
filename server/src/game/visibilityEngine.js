import { squareToCoords, coordsToSquare } from '../utils/coords.js';

export function getBoardForPlayer(chess, revealedPieces, playerColor) {
    const board = [];
    const trueBoard = chess.board();

    for (let i = 0; i < 8; i++) {
        const row = [];
        for (let j = 0; j < 8; j++) {
            const square = trueBoard[i][j];
            if (square) {
                if (square.color === playerColor.charAt(0)) {
                    row.push(square); // Player's own piece
                } else if (revealedPieces[playerColor].has(square.square)) {
                    row.push(square); // Revealed opponent piece
                } else {
                    row.push(null); // Hidden opponent piece
                }
            } else {
                row.push(null); // Empty square
            }
        }
        board.push(row);
    }
    return board;
}

export function revealPiecesAfterMove(chess, revealedPieces, playerColor, fromSquare, pieceType) {
    const opponentColor = playerColor === 'white' ? 'black' : 'white';
    const directions = {
        'r': [[0, 1], [0, -1], [1, 0], [-1, 0]],
        'b': [[1, 1], [1, -1], [-1, 1], [-1, -1]],
        'q': [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]],
    };

    if (directions[pieceType]) {
        const startCoords = squareToCoords(fromSquare);

        for (const [dx, dy] of directions[pieceType]) {
            let [x, y] = startCoords;
            while (true) {
                x += dx;
                y += dy;
                if (x < 0 || x > 7 || y < 0 || y > 7) break; // Off board

                const currentSquare = coordsToSquare([x, y]);
                const pieceOnSquare = chess.get(currentSquare);

                if (pieceOnSquare) {
                    if (pieceOnSquare.color === opponentColor.charAt(0)) {
                        revealedPieces[playerColor].add(currentSquare);
                    }
                    break; // Line of sight is blocked
                }
            }
        }
    }
}
