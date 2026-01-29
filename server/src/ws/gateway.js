import { WebSocketServer } from "ws";
import { routeMessage } from "./messageRouter.js";
import { detachSocket } from "../session/sessionManager.js";

export function initWebSocketGateway(server){

  const wss=new WebSocketServer({server});

  wss.on("connection",(ws)=>{

    ws.on("message",(raw)=>{
      try{
        const msg=JSON.parse(raw);
        routeMessage(ws,msg);
      }catch{}
    });

    ws.on("close",()=>{
      detachSocket(ws);
    });

    ws.send(JSON.stringify({type:"CONNECTED"}));
  });

  console.log("WS ready");
}
