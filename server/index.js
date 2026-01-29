import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { initWebSocketGateway } from './src/ws/gateway.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Serve static files from the 'public' directory, which is one level up from 'server'
app.use(express.static(path.join(__dirname, '../public')));

initWebSocketGateway(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
