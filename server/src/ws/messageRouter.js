import { getSessionByWs, getSession } from "../session/sessionManager.js";
import { joinQueue, leaveQueue } from "../lobby/matchmakingManager.js";
import { createRoom, joinRoom, getRoom } from "../lobby/lobbyManager.js";
import GameManager from "../game/gameManager.js";
import { isRateLimited } from "./rateLimiter.js";

const gameManagers = new Map();

function handleMatchmaking(session, msg) {
    if (isRateLimited(session.id)) {
        return session.ws.send(JSON.stringify({ type: "ERROR", payload: { message: "Rate limit exceeded." } }));
    }

    switch (msg.type) {
        case "QUEUE":
            const match = joinQueue(session.id);
            if (!match) {
                session.ws.send(JSON.stringify({ type: "QUEUED" }));
                return;
            }
            
            const { roomId, players } = match;
            const whiteSession = getSession(players.white);
            const blackSession = getSession(players.black);

            if (!whiteSession || !blackSession) {
                console.error("Could not find sessions for matched players.");
                // Logic to requeue or notify players might be needed here
                return;
            }

            const room = createRoom(roomId);
            joinRoom(room.id, whiteSession.id);
            joinRoom(room.id, blackSession.id);

            const onGameEnd = () => {
                gameManagers.delete(roomId);
                // Optionally, perform more cleanup like closing WebSockets or notifying about game end.
                console.log(`Game in room ${roomId} has ended.`);
            };

            const playersWs = { white: whiteSession.ws, black: blackSession.ws };
            const gameManager = new GameManager(playersWs, onGameEnd);
            gameManagers.set(roomId, gameManager);

            whiteSession.ws.send(JSON.stringify({ type: "MATCH_FOUND", payload: { roomId, color: 'white' } }));
            blackSession.ws.send(JSON.stringify({ type: "MATCH_FOUND", payload: { roomId, color: 'black' } }));
            break;
        
        case "LEAVE_QUEUE":
            leaveQueue(session.id);
            break;
    }
}

function handleGameAction(session, msg) {
    if (isRateLimited(session.id)) {
        return session.ws.send(JSON.stringify({ type: "ERROR", payload: { message: "Rate limit exceeded." } }));
    }

    const { roomId } = msg.payload;
    if (!roomId) {
        return session.ws.send(JSON.stringify({ type: "ERROR", payload: { message: "Missing roomId." } }));
    }
    
    const gameManager = gameManagers.get(roomId);
    if (!gameManager) {
        return session.ws.send(JSON.stringify({ type: "ERROR", payload: { message: "Game not found." } }));
    }

    switch (msg.type) {
        case "MOVE":
            gameManager.handleMove(session.ws, msg.payload.move);
            break;
        // Other game actions like resign, draw offer can be handled here
    }
}

export function routeMessage(ws, msg) {
    const session = getSessionByWs(ws);
    if (!session) {
        ws.send(JSON.stringify({ type: "ERROR", payload: { message: "No session. Please reconnect." } }));
        return;
    }

    switch(msg.type) {
        case "QUEUE":
        case "LEAVE_QUEUE":
            handleMatchmaking(session, msg);
            break;
        case "MOVE":
            handleGameAction(session, msg);
            break;
        default:
            session.ws.send(JSON.stringify({ type: "ERROR", payload: { message: `Unknown message type: ${msg.type}` } }));
            break;
    }
}
