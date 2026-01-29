export function initialBoard() {
  const b = {};

  const back = ["rook","knight","bishop","queen","king","bishop","knight","rook"];

  for (let i=0;i<8;i++) {
    b[`${file(i)}2`] = {type:"pawn",color:"white"};
    b[`${file(i)}7`] = {type:"pawn",color:"black"};

    b[`${file(i)}1`] = {type:back[i],color:"white"};
    b[`${file(i)}8`] = {type:back[i],color:"black"};
  }

  return b;
}

export function file(i){
  return "abcdefgh"[i];
}

export function cloneBoard(b){
  return JSON.parse(JSON.stringify(b));
}
