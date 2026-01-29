import { pawnRule } from "./rules/pawn.js";
import { rookRule } from "./rules/rook.js";
import { knightRule } from "./rules/knight.js";
import { bishopRule } from "./rules/bishop.js";
import { queenRule } from "./rules/queen.js";
import { kingRule } from "./rules/king.js";

const ruleMap={
  pawn:pawnRule,
  rook:rookRule,
  knight:knightRule,
  bishop:bishopRule,
  queen:queenRule,
  king:kingRule
};

export function validateMove(game,move,sessionId){

  if(game.currentPlayerSession()!==sessionId)
    return {ok:false,reason:"NOT_YOUR_TURN"};

  const piece=game.board[move.from];
  if(!piece) return {ok:false};

  if(piece.color!==game.turn)
    return {ok:false,reason:"WRONG_COLOR"};

  const target=game.board[move.to];
  if(target && target.color===piece.color)
    return {ok:false,reason:"OWN_PIECE"};

  const rule=ruleMap[piece.type];
  if(!rule(game,move,piece))
    return {ok:false,reason:"ILLEGAL"};

  return {ok:true};
}
