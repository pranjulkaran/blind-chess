export function rookRule(game,m,p){
  const [fx,fy]=[m.from.charCodeAt(0),+m.from[1]];
  const [tx,ty]=[m.to.charCodeAt(0),+m.to[1]];

  if(fx!==tx && fy!==ty) return false;

  const dx=Math.sign(tx-fx);
  const dy=Math.sign(ty-fy);

  let x=fx+dx, y=fy+dy;

  while(x!==tx || y!==ty){
    if(game.board[String.fromCharCode(x)+y]) return false;
    x+=dx; y+=dy;
  }

  return true;
}
