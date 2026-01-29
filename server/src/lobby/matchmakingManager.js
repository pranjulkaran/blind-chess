import crypto from "crypto";
import { createRoom } from "./lobbyManager.js";

const queue=[];

export function joinQueue(sessionId){

  if(queue.includes(sessionId))
    return null;

  queue.push(sessionId);

  if(queue.length>=2){
    const a=queue.shift();
    const b=queue.shift();

    const roomId=createRoom(a);

    return {
      matched:true,
      roomId,
      players:[a,b]
    };
  }

  return {matched:false};
}

export function leaveQueue(sessionId){
  const i=queue.indexOf(sessionId);
  if(i!==-1) queue.splice(i,1);
}
