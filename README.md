# Blind Chess

This is a unique, two-player online chess game where you can't see all of your opponent's pieces. It's a game of partial information, where you must use deduction and intuition to uncover your opponent's moves and capture their king.

## Features

*   **Real-time Gameplay:** Play against another person in real-time using a WebSocket-based server.
*   **Partial Information:** You can only see your own pieces and the squares they can move to.
*   **Fog of War:** The rest of the board is shrouded in a "fog of war," hiding your opponent's pieces.

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v14 or later)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
3.  Install the server dependencies:
    ```bash
    npm install
    ```

### Running the Application

1.  Start the server from the `server` directory:
    ```bash
    npm start
    ```
2.  Open your web browser and navigate to `http://localhost:3000`.

## System Architecture

The application is composed of a frontend and a backend, running as a single monolithic process.

*   **Frontend:** A static web application served from the `public` directory. It is responsible for rendering the game board, handling user input, and communicating with the backend via WebSockets.
*   **Backend:** A Node.js server that manages game logic, player sessions, and real-time communication.

## File Structure

```
.
├── public
│   ├── css
│   │   └── style.css
│   ├── js
│   │   ├── app.js
│   │   ├── ui.js
│   │   └── ws.js
│   └── index.html
└── server
    ├── src
    │   ├── auth
    │   │   └── auth.js
    │   ├── game
    │   │   ├── gameInstance.js
    │   │   ├── gameManager.js
    │   │   ├── moveValidator.js
    │   │   ├── visibilityEngine.js
    │   │   └── rules
    │   │       ├── bishop.js
    │   │       ├── king.js
    │   │       ├── knight.js
    │   │       ├── pawn.js
    │   │       ├── queen.js
    │   │       └── rook.js
    │   ├── lobby
    │   │   ├── lobbyManager.js
    │   │   └── matchmakingManager.js
    │   ├── session
    │   │   └── sessionManager.js
    │   ├── state
    │   │   ├── boardState.js
    │   │   ├── diffEngine.js
    │   │   └── persistence.js
    │   ├── timer
    │   │   └── timerService.js
    │   └── ws
    │       ├── gateway.js
    │       ├── messageRouter.js
    │       └── rateLimiter.js
    ├── index.js
    └── package.json
```

### Frontend (`public/`)

*   `index.html`: The main entry point for the web application.
*   `css/style.css`: Styles for the game board and UI elements.
*   `js/app.js`: Initializes the frontend, including the UI and WebSocket connection.
*   `js/ui.js`: Manages all DOM manipulation, such as rendering the board, updating status messages, and displaying captured pieces.
*   `js/ws.js`: Handles the WebSocket connection and communication with the backend.

### Backend (`server/`)

*   `index.js`: The entry point for the server. It starts an Express server to serve the frontend and initializes the WebSocket gateway.
*   `package.json`: Defines the server's dependencies and scripts.
*   `src/`: Contains the core logic of the backend.
    *   `ws/gateway.js`: Manages WebSocket connections, creating and destroying sessions.
    *   `ws/messageRouter.js`: Routes incoming messages from clients to the appropriate handlers.
    *   `session/sessionManager.js`: Manages player sessions.
    *   `lobby/matchmakingManager.js`: Matches players in the queue to start new games.
    *   `game/gameManager.js`: Manages the lifecycle of a game, including moves, timers, and game-end conditions.

## System Flow

1.  **Connection:** A user opens the web application, and the frontend establishes a WebSocket connection with the server.
2.  **Session Creation:** The `gateway.js` on the backend creates a new session for the user.
3.  **Matchmaking:** The user clicks a button to join the queue. The `messageRouter.js` routes this request to the `matchmakingManager.js`.
4.  **Game Start:** When two players are in the queue, the `matchmakingManager.js` matches them, creates a new `GameManager` instance, and notifies both players that a match has been found.
5.  **Gameplay:**
    *   Players make moves, which are sent to the backend via WebSockets.
    *   The `messageRouter.js` routes the move to the correct `GameManager` instance.
    *   The `gameManager.js` validates the move using the `moveValidator.js` and updates the game state.
    *   The `visibilityEngine.js` calculates the board state for each player, showing only the visible pieces.
    *   The backend sends the updated game state to both players.
6.  **Game End:** When the game is over (e.g., checkmate, timeout), the `gameManager.js` notifies both players of the result. The `onEnd` callback is triggered, which cleans up the game instance.
