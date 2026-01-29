const activeTimers = new Map();
// gameId -> interval

export function startTimer(game, onTimeout) {
  stopTimer(game.id);

  const tick = () => {
    if (game.status !== "ACTIVE") return;

    const side = game.turn;
    game.clocks[side]--;

    if (game.clocks[side] <= 0) {
      game.status = "TIMEOUT";
      onTimeout(game, side);
      stopTimer(game.id);
    }
  };

  const interval = setInterval(tick, 1000);
  activeTimers.set(game.id, interval);
}

export function stopTimer(gameId) {
  const i = activeTimers.get(gameId);
  if (i) {
    clearInterval(i);
    activeTimers.delete(gameId);
  }
}
