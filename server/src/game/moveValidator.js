import { getSquarePath } from '../utils/path.js';

export function validateMove(chess, playerColor, clientMove, revealedPieces) {
    if (chess.turn() !== playerColor.charAt(0)) {
        return "Not your turn.";
    }

    const possibleMoves = chess.moves({ square: clientMove.from, verbose: true });
    const intendedMove = possibleMoves.find(m => m.to === clientMove.to);

    if (!intendedMove) {
        return "Illegal move.";
    }

    // For non-knight moves, check for blocking pieces between from and to.
    const piece = chess.get(clientMove.from);
    if (piece.type !== 'n') {
        const path = getSquarePath(clientMove.from, clientMove.to);
        for (const square of path) {
            const pieceOnPath = chess.get(square);
            if (pieceOnPath && pieceOnPath.color !== playerColor.charAt(0) && !revealedPieces[playerColor].has(square)) {
                return "Move blocked by a hidden piece.";
            }
        }
    }

    clientMove.san = intendedMove.san;

    return null; // No error
}
