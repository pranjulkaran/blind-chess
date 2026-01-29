export function bishopRule(game,m,p){
  const fx=m.from.charCodeAt(0), fy=+m.from[1];
  const tx=m.to.charCodeAt(0), ty=+m.to[1];

  if(Math.abs(tx-fx)!==Math.abs(ty-fy)) return false;

  const dx=Math.sign(tx-fx);
  const dy=Math.sign(ty-fy);

  let x=fx+dx,y=fy+dy;
  while(x!==tx){
    if(game.board[String.fromCharCode(x)+y]) return false;
    x+=dx;y+=dy;
  }

  return true;
}
