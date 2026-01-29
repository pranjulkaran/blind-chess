import { createRoom } from "./lobbyManager.js";

const queue = new Set();

export function joinQueue(sessionId) {
    if (queue.has(sessionId)) {
        return null; // Already in queue
    }

    queue.add(sessionId);

    if (queue.size >= 2) {
        const [player1, player2] = Array.from(queue).slice(0, 2);
        queue.delete(player1);
        queue.delete(player2);

        const roomId = createRoom(player1);
        const players = Math.random() < 0.5 
            ? { white: player1, black: player2 } 
            : { black: player1, white: player2 };

        return { matched: true, roomId, players };
    }

    return null; // Not enough players to match
}

export function leaveQueue(sessionId) {
    queue.delete(sessionId);
}
