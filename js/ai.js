import { getAvailableMoves, makeMove, checkWinner, isDraw, cloneBoard } from './gameLogic.js';

function scoreFor(board, player, depth){
  const res = checkWinner(board);
  if(res){
    return res.winner===player ? 10-depth : depth-10;
  }
  if(isDraw(board)) return 0;
  return 0;
}

export function getEasyMove(board){
  const moves = getAvailableMoves(board);
  return moves[Math.floor(Math.random()*moves.length)];
}

export function getMediumMove(board, aiPlayer, humanPlayer){
  // Try win -> block -> random; with some randomness
  const moves = getAvailableMoves(board);
  // win if possible
  for(const m of moves){
    const b = makeMove(board,m,aiPlayer);
    if(checkWinner(b)) return m;
  }
  // block
  for(const m of moves){
    const b = makeMove(board,m,humanPlayer);
    if(checkWinner(b)) return m;
  }
  // otherwise random
  return getEasyMove(board);
}

export function getHardMove(board, aiPlayer, humanPlayer){
  // Minimax with depth
  function minimax(b, depth, isMax){
    const winnerRes = checkWinner(b);
    if(winnerRes) return scoreFor(b, aiPlayer, depth);
    if(isDraw(b)) return 0;
    const moves = getAvailableMoves(b);
    if(isMax){
      let best=-Infinity;
      for(const m of moves){
        const n = makeMove(b,m,aiPlayer);
        const val = minimax(n, depth+1, false);
        best = Math.max(best,val);
      }
      return best;
    } else {
      let best=Infinity;
      for(const m of moves){
        const n = makeMove(b,m,humanPlayer);
        const val = minimax(n, depth+1, true);
        best = Math.min(best,val);
      }
      return best;
    }
  }

  const moves = getAvailableMoves(board);
  let bestScore=-Infinity; let bestMove=moves[0];
  for(const m of moves){
    const n = makeMove(board,m,aiPlayer);
    const val = minimax(n,0,false);
    if(val>bestScore){ bestScore=val; bestMove=m }
  }
  return bestMove;
}

export async function chooseAIMove(board, mode, aiPlayer, humanPlayer){
  // a small delay for UX
  await new Promise(r=>setTimeout(r, 220));
  if(mode==='easy') return getEasyMove(board);
  if(mode==='medium'){
    // 70% optimal (minimax of depth-limited), 30% random
    if(Math.random()<0.3) return getEasyMove(board);
    // try medium heuristic first then fallback to minimax
    const med = getMediumMove(board, aiPlayer, humanPlayer);
    return med ?? getHardMove(board, aiPlayer, humanPlayer);
  }
  return getHardMove(board, aiPlayer, humanPlayer);
}
