const store=new Map();
// gameId -> snapshot

export function saveGame(game){
  store.set(game.id,{
    board:game.board,
    turn:game.turn,
    clocks:game.clocks,
    version:game.version,
    status:game.status
  });
}

export function loadGame(id){
  return store.get(id)||null;
}
