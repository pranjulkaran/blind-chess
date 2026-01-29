let ws=null;
const listeners={};

export function connect(){

  ws=new WebSocket("ws://localhost:3000");

  ws.onopen=()=>{
    send("HELLO");

    setInterval(()=>{
      send("PING");
    },5000);
  };

  ws.onmessage=(e)=>{
    const msg=JSON.parse(e.data);
    dispatch(msg.type,msg.payload);
  };

  ws.onclose=()=>{
    setTimeout(connect,1000);
  };
}

export function send(type,payload={}){
  ws?.send(JSON.stringify({type,payload}));
}

export function on(type,cb){
  listeners[type]=cb;
}

function dispatch(type,payload){
  if(listeners[type])
    listeners[type](payload);
}
