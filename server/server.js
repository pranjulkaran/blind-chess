import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always correct path
const clientDir = path.join(__dirname, "../client");

function serve(req,res){
  let file = req.url === "/" ? "/index.html" : req.url;

  const fp = path.join(clientDir, file);

  fs.readFile(fp,(err,data)=>{
    if(err){
      console.log("File not found:", fp);
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.end(data);
  });
}

const server=http.createServer(serve);
const wss=new WebSocketServer({server});

const files="abcdefgh";
const back=["rook","knight","bishop","queen","king","bishop","knight","rook"];

function initialBoard(){
  const b={};
  for(let i=0;i<8;i++){
    const f=files[i];
    b[f+"2"]={type:"pawn",color:"white"};
    b[f+"7"]={type:"pawn",color:"black"};
    b[f+"1"]={type:back[i],color:"white"};
    b[f+"8"]={type:back[i],color:"black"};
  }
  return b;
}

let waitingPlayer=null;
let game=null;

function startGame(p1,p2){
  game={
    board:initialBoard(),
    turn:"white",
    white:p1,
    black:p2
  };

  p1.color="white";
  p2.color="black";

  [p1,p2].forEach(p=>{
    p.send(JSON.stringify({
      type:"START",
      color:p.color,
      board:game.board,
      turn:game.turn
    }));
  });
}

function broadcast(msg){
  if(!game) return;
  [game.white,game.black].forEach(p=>{
    if(p.readyState===1)
      p.send(JSON.stringify(msg));
  });
}

wss.on("connection",(ws)=>{

  if(!waitingPlayer){
    waitingPlayer=ws;
    ws.send(JSON.stringify({type:"WAIT"}));
  }else{
    startGame(waitingPlayer,ws);
    waitingPlayer=null;
  }

  ws.on("message",(raw)=>{
    if(!game) return;

    const m=JSON.parse(raw);

    if(m.type==="MOVE"){
      if(ws!==game[game.turn]) return;

      const piece=game.board[m.from];
      if(!piece || piece.color!==game.turn) return;

      delete game.board[m.from];
      game.board[m.to]=piece;

      game.turn = game.turn==="white"?"black":"white";

      broadcast({
        type:"STATE",
        board:game.board,
        turn:game.turn
      });
    }
  });

  ws.on("close",()=>{
    waitingPlayer=null;
    game=null;
  });
});

server.listen(3000,()=>{
  console.log("Running → http://localhost:3000");
});
