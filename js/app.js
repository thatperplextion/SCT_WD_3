import { createEmptyBoard, checkWinner, isDraw, makeMove } from './gameLogic.js';
import { chooseAIMove } from './ai.js';
import * as ui from './ui.js';
import * as storage from './storage.js';

const defaultState = () => ({
  board:createEmptyBoard(),
  currentPlayer:'X',
  winner:null,
  gameOver:false,
  mode:'pvp',
  difficulty:'medium',
  scores:{X:0,O:0,D:0},
  history:[],
  stats:{played:0,X:0,O:0,D:0},
});

let state = storage.loadState() || defaultState();
let isThinking = false;

function save(){ storage.saveState(state); }

function render(){
  ui.renderBoard(state.board, handleCellClick);
  ui.setStatus(statusText());
  ui.updateScores(state.scores);
  ui.setControlsVisibility(state.mode==='pvc');
  ui.updateStatsContent(state.stats);
}

function statusText(){
  if(state.winner) return `Player ${state.winner} Wins!`;
  if(state.gameOver && isDraw(state.board)) return "It's a Draw!";
  return `Current Turn: ${state.currentPlayer}`;
}

function pushHistory(){
  state.history.push({board:state.board.slice(),currentPlayer:state.currentPlayer});
  if(state.history.length>20) state.history.shift();
}

export async function handleCellClick(index, cellEl){
  if(isThinking) return;
  if(state.gameOver) return;
  if(state.board[index]) return;

  pushHistory();
  const next = makeMove(state.board,index,state.currentPlayer);
  if(!next) return;
  state.board = next;
  ui.popCell(index);
  const res = checkWinner(state.board);
  if(res){
    state.winner = res.winner; state.gameOver = true;
    state.scores[res.winner]++;
    state.stats.played++; state.stats[res.winner]++;
    ui.highlightWinning(res.combo);
  } else if(isDraw(state.board)){
    state.gameOver = true; state.scores.D++; state.stats.played++; state.stats.D++;
    ui.shakeBoard();
  } else {
    state.currentPlayer = state.currentPlayer==='X'?'O':'X';
  }
  save(); render();

  // If it's AI mode and now AI's turn
  if(state.mode==='pvc' && !state.gameOver && state.currentPlayer==='O'){
    isThinking = true; ui.setStatus('Computer is thinking...');
    const move = await chooseAIMove(state.board, state.difficulty, 'O', 'X');
    isThinking = false;
    if(move!=null){
      // ensure not overwritten
      handleCellClick(move, document.querySelector(`[data-index='${move}']`));
    }
  }
}

function newGame(keepScores=true){
  ui.clearHighlights();
  state.board = createEmptyBoard();
  state.currentPlayer = 'X';
  state.winner = null; state.gameOver=false; state.history=[];
  if(!keepScores) state.scores={X:0,O:0,D:0};
  save(); render();
}

function undo(){
  if(state.history.length===0 || state.gameOver) return;
  // In AI mode undo two moves if possible
  if(state.mode==='pvc'){
    // undo last two states
    const last = state.history.pop();
    const prev = state.history.pop() || last;
    state.board = prev.board; state.currentPlayer = prev.currentPlayer; state.gameOver=false; state.winner=null;
  } else {
    const last = state.history.pop();
    state.board = last.board; state.currentPlayer = last.currentPlayer; state.gameOver=false; state.winner=null;
  }
  save(); render();
}

function resetScores(){
  state.scores={X:0,O:0,D:0}; state.stats={played:0,X:0,O:0,D:0}; save(); render();
}

function bindUI(){
  document.getElementById('modeSelect').addEventListener('change',(e)=>{
    state.mode = e.target.value; save(); render();
  });
  document.getElementById('difficultySelect').addEventListener('change',(e)=>{ state.difficulty = e.target.value; save(); });
  document.getElementById('newGameBtn').addEventListener('click',()=>newGame(true));
  document.getElementById('resetScoresBtn').addEventListener('click',()=>resetScores());
  document.getElementById('undoBtn').addEventListener('click',()=>undo());
  document.getElementById('themeToggle').addEventListener('click',()=>{
    document.body.classList.toggle('theme-light');
    const pressed = document.body.classList.contains('theme-light');
    document.getElementById('themeToggle').setAttribute('aria-pressed', pressed);
    // persist theme
    state.theme = pressed? 'light':'dark'; save();
  });
}

function restoreUIFromState(){
  const modeSel = document.getElementById('modeSelect');
  const diffSel = document.getElementById('difficultySelect');
  if(modeSel) modeSel.value = state.mode||'pvp';
  if(diffSel) diffSel.value = state.difficulty||'medium';
  if(state.theme==='light') document.body.classList.add('theme-light');
}

function init(){
  bindUI(); restoreUIFromState(); render();
}

window.addEventListener('load', init);
window.handleCellClick = handleCellClick; // expose for AI callbacks
