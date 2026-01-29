const lastMove=new Map();

export function allowMove(sessionId){

  const now=Date.now();
  const last=lastMove.get(sessionId)||0;

  if(now-last<300) return false;

  lastMove.set(sessionId,now);
  return true;
}
