export function visibleSquares(game,color){

  const vis=new Set();

  for(const [sq,p] of Object.entries(game.board)){
    if(p.color!==color) continue;

    vis.add(sq);

    attackSquares(game,sq,p)
      .forEach(s=>vis.add(s));
  }

  return vis;
}

function attackSquares(game,from,piece){
  const list=[];
  const fx=from.charCodeAt(0), fy=+from[1];

  const push=(x,y)=>{
    if(x<97||x>104||y<1||y>8) return;
    list.push(String.fromCharCode(x)+y);
  };

  if(piece.type==="knight"){
    [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]]
      .forEach(([dx,dy])=>push(fx+dx,fy+dy));
  }

  if(piece.type==="king"){
    for(let dx=-1;dx<=1;dx++)
      for(let dy=-1;dy<=1;dy++)
        if(dx||dy) push(fx+dx,fy+dy);
  }

  if(piece.type==="pawn"){
    const d=piece.color==="white"?1:-1;
    push(fx+1,fy+d);
    push(fx-1,fy+d);
  }

  const slide=(dirs)=>{
    for(const [dx,dy] of dirs){
      let x=fx+dx,y=fy+dy;
      while(x>=97&&x<=104&&y>=1&&y<=8){
        const sq=String.fromCharCode(x)+y;
        list.push(sq);
        if(game.board[sq]) break;
        x+=dx;y+=dy;
      }
    }
  };

  if(piece.type==="rook") slide([[1,0],[-1,0],[0,1],[0,-1]]);
  if(piece.type==="bishop") slide([[1,1],[1,-1],[-1,1],[-1,-1]]);
  if(piece.type==="queen") slide([[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]);

  return list;
}
