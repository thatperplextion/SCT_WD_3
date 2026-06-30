export const WIN_COMBOS = [
  [0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]
];

export function createEmptyBoard(){
  return Array(9).fill("");
}

export function cloneBoard(board){
  return board.slice();
}

export function getAvailableMoves(board){
  return board.map((v,i)=>v?null:i).filter(v=>v!==null);
}

export function makeMove(board, index, player){
  if(board[index]) return null;
  const next = cloneBoard(board);
  next[index]=player;
  return next;
}

export function checkWinner(board){
  for(const combo of WIN_COMBOS){
    const [a,b,c]=combo;
    if(board[a] && board[a]===board[b] && board[a]===board[c]){
      return {winner:board[a],combo};
    }
  }
  return null;
}

export function isDraw(board){
  return board.every(Boolean) && !checkWinner(board);
}
