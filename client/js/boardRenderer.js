import { state } from "./stateManager.js";

const boardEl=document.getElementById("board");

export function render(){

  boardEl.innerHTML="";

  for(let r=8;r>=1;r--){
    for(const f of "abcdefgh"){

      const sq=f+r;
      const tile=document.createElement("div");

      tile.className="tile";
      tile.dataset.square=sq;

      // fog-of-war
      if(!state.board[sq]){
        tile.classList.add("fog");
      }

      const p=state.board[sq];
      if(p){
        const piece=document.createElement("img");
        piece.className="piece";
        piece.src=`/assets/pieces/${p.color}-${p.type}.svg`;
        tile.appendChild(piece);
      }

      boardEl.appendChild(tile);
    }
  }
}
