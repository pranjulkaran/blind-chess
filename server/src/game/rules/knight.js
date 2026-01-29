export function knightRule(game,m,p){
  const fx=m.from.charCodeAt(0), fy=+m.from[1];
  const tx=m.to.charCodeAt(0), ty=+m.to[1];

  const dx=Math.abs(tx-fx);
  const dy=Math.abs(ty-fy);

  return (dx===2&&dy===1)||(dx===1&&dy===2);
}
