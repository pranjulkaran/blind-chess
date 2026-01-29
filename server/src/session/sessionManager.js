import crypto from "crypto";

const sessions=new Map();
// sessionId -> {id, userId, ws, lastSeen}

export function createSession(ws){
  const id=crypto.randomUUID();

  const s={
    id,
    userId:crypto.randomUUID(),
    ws,
    lastSeen:Date.now()
  };

  sessions.set(id,s);
  return s;
}

export function getSession(id){
  return sessions.get(id);
}

export function attachSocket(sessionId,ws){
  const s=sessions.get(sessionId);
  if(!s) return null;

  s.ws=ws;
  s.lastSeen=Date.now();
  return s;
}

export function detachSocket(ws){
  for(const s of sessions.values()){
    if(s.ws===ws){
      s.ws=null;
      s.lastSeen=Date.now();
    }
  }
}
