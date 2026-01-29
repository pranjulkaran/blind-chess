import { rookRule } from "./rook.js";
import { bishopRule } from "./bishop.js";

export function queenRule(g,m,p){
  return rookRule(g,m,p)||bishopRule(g,m,p);
}
