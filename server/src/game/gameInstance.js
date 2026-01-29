import crypto from "crypto";
import { initialBoard, cloneBoard } from "../state/boardState.js";

export class GameInstance{

  constructor(p1,p2){
    this.id=crypto.randomUUID();

    this.players={white:p1,black:p2};
    this.turn="white";

    this.board=initialBoard();
    this.prevBoard=cloneBoard(this.board);

    this.version=1;
    this.history=[];
    this.status="ACTIVE";

    this.clocks={white:300,black:300};

    this.moved=new Set();
    this.enPassant=null;

    this.playerViews={white:{},black:{}};
  }

  currentPlayerSession(){
    return this.players[this.turn];
  }

  applyMove(m){
    const piece=this.board[m.from];
    if(!piece) return false;

    this.prevBoard=cloneBoard(this.board);

    // en passant capture
    if(piece.type==="pawn" && m.to===this.enPassant){
      const dir=piece.color==="white"?-1:1;
      const capSq=m.to[0]+(Number(m.to[1])+dir);
      delete this.board[capSq];
    }

    // castling rook move
    if(piece.type==="king" && Math.abs(
      m.from.charCodeAt(0)-m.to.charCodeAt(0)
    )===2){
      const rank=m.from[1];
      if(m.to[0]==="g"){
        this.board["f"+rank]=this.board["h"+rank];
        delete this.board["h"+rank];
      }else{
        this.board["d"+rank]=this.board["a"+rank];
        delete this.board["a"+rank];
      }
    }

    delete this.board[m.from];
    this.board[m.to]=piece;

    // promotion
    if(piece.type==="pawn"){
      if(m.to[1]==="8"||m.to[1]==="1")
        piece.type=m.promotion||"queen";
    }

    // set en passant target
    this.enPassant=null;
    if(piece.type==="pawn" &&
      Math.abs(m.from[1]-m.to[1])===2){
      const mid=(+m.from[1]+ +m.to[1])/2;
      this.enPassant=m.from[0]+mid;
    }

    this.moved.add(m.from);

    this.history.push(m);
    this.turn=this.turn==="white"?"black":"white";
    this.version++;

    return true;
  }
}
