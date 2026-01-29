export function kingRule(game,m,p){

  const fx=m.from.charCodeAt(0), fy=+m.from[1];
  const tx=m.to.charCodeAt(0), ty=+m.to[1];

  const dx=Math.abs(tx-fx);
  const dy=Math.abs(ty-fy);

  if(dx<=1 && dy<=1) return true;

  // castling
  if(dy===0 && dx===2){
    if(game.moved.has(m.from)) return false;

    const rookSq = tx>fx
      ? "h"+m.from[1]
      : "a"+m.from[1];

    if(game.moved.has(rookSq)) return false;

    return true;
  }

  return false;
}
