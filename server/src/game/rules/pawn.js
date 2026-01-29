export function pawnRule(game,m,p){

  const dir=p.color==="white"?1:-1;

  const fx=m.from.charCodeAt(0), fy=+m.from[1];
  const tx=m.to.charCodeAt(0), ty=+m.to[1];

  const dx=tx-fx;
  const dy=ty-fy;

  const target=game.board[m.to];

  if(dx===0 && !target){
    if(dy===dir) return true;

    if((fy===2&&p.color==="white"||
        fy===7&&p.color==="black")
        && dy===2*dir){
      return true;
    }
  }

  if(Math.abs(dx)===1 && dy===dir){
    if(target) return true;
    if(m.to===game.enPassant) return true;
  }

  return false;
}
