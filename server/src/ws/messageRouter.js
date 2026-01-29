import {
  createSession,
  attachSocket
} from "../session/sessionManager.js";

import {
  createRoom,
  joinRoom
} from "../lobby/lobbyManager.js";

import {
  joinQueue,
  leaveQueue
} from "../lobby/matchmakingManager.js";

import {
  maybeStartGame,
  handleMove
} from "../game/gameManager.js";

const socketSession=new Map();

export function routeMessage(ws,msg){

  switch(msg.type){

    case "HELLO":{
      const s=createSession(ws);
      socketSession.set(ws,s);

      ws.send(JSON.stringify({
        type:"SESSION",
        payload:{sessionId:s.id}
      }));
      break;
    }

    case "QUEUE":{
      const s=socketSession.get(ws);

      const res=joinQueue(s.id);

      if(res?.matched){
        joinRoom(res.roomId,res.players[1]);

        ws.send(JSON.stringify({
          type:"MATCH_FOUND",
          payload:{roomId:res.roomId}
        }));
      }else{
        ws.send(JSON.stringify({
          type:"QUEUED"
        }));
      }
      break;
    }

    case "LEAVE_QUEUE":{
      const s=socketSession.get(ws);
      leaveQueue(s.id);
      break;
    }

    case "MOVE":{
      const s=socketSession.get(ws);

      const r=handleMove(
        msg.payload.roomId,
        s.id,
        msg.payload.move
      );

      ws.send(JSON.stringify({
        type:"MOVE_RESULT",
        payload:r
      }));
      break;
    }
  }
}
