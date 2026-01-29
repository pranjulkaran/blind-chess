import { setupWebSocket } from './ws.js';
import { initUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    initUI();
    setupWebSocket();
});
