import crypto from "crypto";

const rooms=new Map();

export function createRoom(owner){
  const id=crypto.randomUUID();

  rooms.set(id,{
    id,
    players:[owner],
    spectators:[]
  });

  return id;
}

export function joinRoom(roomId,sessionId){
  const r=rooms.get(roomId);
  if(!r) return false;

  if(r.players.length<2){
    r.players.push(sessionId);
    return "player";
  }

  r.spectators.push(sessionId);
  return "spectator";
}

export function getRoom(id){
  return rooms.get(id);
}

export function isSpectator(roomId,sessionId){
  return rooms.get(roomId)
    ?.spectators.includes(sessionId);
}
