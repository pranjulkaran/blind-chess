import { send } from "./wsClient.js";
import { state } from "./stateManager.js";

let selected=null;

export function initInput(){

  document.getElementById("board")
  .addEventListener("click",(e)=>{

    const tile=e.target.closest(".tile");
    if(!tile) return;

    const sq=tile.dataset.square;

    if(!selected){
      selected=sq;
      tile.classList.add("selected");
      return;
    }

    send("MOVE",{
      roomId:state.roomId,
      move:{from:selected,to:sq}
    });

    selected=null;
  });
}
