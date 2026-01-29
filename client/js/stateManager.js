export const state={
  sessionId:null,
  roomId:null,
  color:null,
  board:{},
  version:0
};

export function applyDiff(diff){
  for(const sq in diff){
    if(diff[sq]===null)
      delete state.board[sq];
    else
      state.board[sq]=diff[sq];
  }
}

export function setSession(id){
  state.sessionId=id;
}

export function setRoom(id){
  state.roomId=id;
}
