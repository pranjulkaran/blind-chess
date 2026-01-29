import { WebSocketServer } from 'ws';
import { routeMessage } from './messageRouter.js';
import { createSession, removeSession } from '../session/sessionManager.js';

export function initWebSocketGateway(server) {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        const session = createSession(ws);
        console.log(`New connection, session ${session.id}`);

        ws.on('message', (raw) => {
            try {
                const msg = JSON.parse(raw);
                routeMessage(ws, msg);
            } catch (error) {
                console.error(`Error parsing message from session ${session.id}:`, error);
            }
        });

        ws.on('close', () => {
            console.log(`Connection closed, removing session ${session.id}`);
            removeSession(session.id);
        });

        ws.send(JSON.stringify({ type: 'CONNECTED', payload: { sessionId: session.id } }));
    });

    console.log('WebSocket gateway initialized');
}
