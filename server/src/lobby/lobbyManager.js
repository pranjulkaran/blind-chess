import crypto from "crypto";

const rooms = new Map();

export function createRoom(owner) {
    const id = crypto.randomUUID();
    rooms.set(id, {
        id,
        players: [owner],
        spectators: [],
    });
    return id;
}

export function joinRoom(roomId, sessionId) {
    const room = rooms.get(roomId);
    if (!room) return false;

    if (room.players.length < 2) {
        room.players.push(sessionId);
        return "player";
    }

    room.spectators.push(sessionId);
    return "spectator";
}

export function getRoom(id) {
    return rooms.get(id);
}

export function getPlayers(roomId) {
    const room = getRoom(roomId);
    return room ? room.players : [];
}

export function getSpectators(roomId) {
    const room = getRoom(roomId);
    return room ? room.spectators : [];
}

export function isSpectator(roomId, sessionId) {
    return getSpectators(roomId).includes(sessionId);
}

export function removeRoom(roomId) {
    rooms.delete(roomId);
}

// Optional: Clean up empty rooms periodically
setInterval(() => {
    for (const [id, room] of rooms.entries()) {
        if (room.players.length === 0 && room.spectators.length === 0) {
            removeRoom(id);
        }
    }
}, 1000 * 60 * 10); // Every 10 minutes
