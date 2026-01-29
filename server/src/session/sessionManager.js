import crypto from "crypto";

const sessions = new Map();

export function createSession(ws) {
    const session = {
        id: crypto.randomUUID(),
        ws,
    };
    sessions.set(session.id, session);
    return session;
}

export function getSession(sessionId) {
    return sessions.get(sessionId);
}

export function getSessionByWs(ws) {
    for (const session of sessions.values()) {
        if (session.ws === ws) {
            return session;
        }
    }
    return null;
}

export function removeSession(sessionId) {
    sessions.delete(sessionId);
}
