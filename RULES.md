# Blind Chess Rules

## 1. OBJECTIVE

- Capture the opponent’s king, OR
- Have a better material score when time expires.

There is **no check**, **no checkmate**, and **no stalemate**. The king is a high-value piece with a loss condition attached to it.

## 2. COMPONENTS

- Standard 8×8 chessboard
- Standard chess pieces per side: 1 King, 1 Queen, 2 Rooks, 2 Bishops, 2 Knights, 8 Pawns
- A digital system is required to mediate the game and hide information.

## 3. INITIAL SETUP

- The game begins with the standard chess starting layout.
- Each player can only see their own pieces. All opponent pieces are invisible.
- The system privately tracks the true, complete state of the board.

## 4. TURN STRUCTURE

- On your turn, you may move one of your pieces according to its standard movement rules.
- Your turn ends after your move. There are no multi-move turns or passes.

## 5. MOVEMENT RULES

- All pieces move exactly as in standard chess.
- **Illegal Moves:** If your move is blocked by a hidden opponent piece, the move fails. Your piece does not move, and you receive no information about what blocked it.

## 6. VISIBILITY RULES

### 6.1 Default Visibility
- You can always see all of your own pieces.
- You can never see opponent pieces by default.

### 6.2 Reveal by Movement (Line of Sight)
- When you successfully move a piece, it can reveal opponent pieces along its line of sight from its **starting square**.
- The **first** opponent piece along any valid line of movement is revealed.
- **No X-Ray Vision:** A piece’s line of sight is blocked by the first piece it reveals. It cannot see or reveal any other pieces behind that first one on the same line.
- **Example:** A Rook on a1 moves to a4. If there is a hidden opponent Pawn on a5 and a hidden Bishop on a7, only the Pawn on a5 is revealed. The Bishop on a7 remains hidden.

### 6.3 Knight Exception
- A Knight's move only reveals the piece on its destination square. It does not reveal any pieces on intermediate squares as it has no "line of sight."

### 6.4 Destination Reveal
- The piece on your destination square is revealed only if your move is successful (i.e., you land on it).

## 7. CAPTURE RULES

- If your piece successfully moves to a square occupied by an opponent piece, the opponent's piece is captured and removed from the game.
- **Information for the Defender:** The player whose piece was captured is told only the *type* of piece that was lost (e.g., "You lost a Knight"). They are not told which piece captured it or from where.
- **Information for the Attacker:** The attacking player sees their own piece move and knows what they captured.

## 8. KING RULES

- The King moves normally but can move into what would traditionally be "check."
- The game ends instantly the moment a King is captured.

## 9. CASTLING

- Castling is allowed but fails if there is a hidden opponent piece on any of the squares the King must pass through. This failure is silent and reveals nothing.
- If castling is successful, any opponent pieces on the squares the King passed through are revealed.

## 10. PAWNS

- Pawns move and capture as normal. Promotion is allowed.
- A pawn's forward movement can reveal a piece directly in front of it.
- **En Passant:** This is a legal move. A successful en passant capture reveals to the defender only that a pawn was lost.

## 11. BELIEF BOARD (HYPOTHESIS SYSTEM)

- Each player has a private, client-side "Belief Board" to place hypothetical opponent pieces.
- This system is for personal note-taking and does not affect the actual game state in any way.

## 12. TIME CONTROL & SCORING

- The game is timed. If a player's clock runs out, the game ends.
- The winner is determined by material score if time expires.
- **Material Score:** Queen=9, Rook=5, Bishop=3, Knight=3, Pawn=1. King capture is an instant win.

## 13. DRAW CONDITIONS

A draw can occur by:
- Mutual agreement between players.
- Insufficient material for either player to force a King capture.
- Equal material scores when time expires.

## 14. PROHIBITIONS

- Players must not use any external means to gain an advantage, such as looking at the opponent's screen or accessing the true board state.

## 15. WINNING THE GAME

You win if you:
1. Capture the opponent's King.
2. Have a higher material score when time runs out.
3. The opponent resigns.