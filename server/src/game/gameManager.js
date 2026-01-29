import { GameInstance } from "./gameInstance.js";
import { validateMove } from "./moveValidator.js";
import { getRoom, isSpectator } from "../lobby/lobbyManager.js";
import { startTimer, stopTimer } from "../timer/timerService.js";
import { allowMove } from "../utils/rateLimiter.js";
import { saveGame } from "../state/persistence.js";

const games=new Map();

export function maybeStartGame(roomId){
  const r=getRoom(roomId);
  if(!r||r.players.length<2) return null;

  if(games.has(roomId)) return games.get(roomId);

  const g=new GameInstance(r.players[0],r.players[1]);
  games.set(roomId,g);

  startTimer(g,()=>{});
  return g;
}

export function handleMove(roomId,sessionId,move){

  if(!allowMove(sessionId))
    return {ok:false,reason:"RATE_LIMIT"};

  const g=games.get(roomId);
  if(!g) return {ok:false};

  if(isSpectator(roomId,sessionId))
    return {ok:false,reason:"SPECTATOR"};

  const val=validateMove(g,move,sessionId);
  if(!val.ok) return val;

  const target=g.board[move.to];

  stopTimer(g.id);
  g.applyMove(move);

  if(target?.type==="king")
    g.status="FINISHED";

  startTimer(g,()=>{});

  saveGame(g);

  return {
    ok:true,
    version:g.version,
    turn:g.turn,
    clocks:g.clocks,
    status:g.status
  };
}
