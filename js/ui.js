import { WIN_COMBOS } from './gameLogic.js';

const boardEl = () => document.getElementById('board');
const statusEl = () => document.getElementById('status');

export function renderBoard(board, onCell){
  const boardNode = boardEl();
  boardNode.innerHTML='';
  board.forEach((v,i)=>{
    const cell = document.createElement('button');
    cell.className='cell';
    cell.setAttribute('role','gridcell');
    cell.setAttribute('aria-label',`Cell ${i+1} ${v||'empty'}`);
    cell.dataset.index = i;
    cell.tabIndex = 0;
    cell.innerText = v;
    cell.addEventListener('click',()=>onCell(i,cell));
    cell.addEventListener('keydown',(e)=>{
      if(e.key==='Enter' || e.key===' ') { e.preventDefault(); onCell(i,cell); }
    });
    boardNode.appendChild(cell);
  });
}

export function setStatus(text){
  const el = statusEl();
  el.textContent = text;
}

export function updateScores(scores){
  document.getElementById('scoreX').textContent = scores.X||0;
  document.getElementById('scoreO').textContent = scores.O||0;
  document.getElementById('scoreD').textContent = scores.D||0;
}

export function highlightWinning(combo){
  if(!combo) return;
  combo.forEach(i=>{
    const c = document.querySelector(`[data-index='${i}']`);
    if(c){ c.classList.add('win','winner-animate'); }
  });
}

export function clearHighlights(){
  document.querySelectorAll('.cell.win').forEach(n=>n.classList.remove('win','winner-animate'));
}

export function popCell(index){
  const c = document.querySelector(`[data-index='${index}']`);
  if(!c) return;
  c.classList.add('pop');
  setTimeout(()=>c.classList.remove('pop'),220);
}

export function shakeBoard(){
  const b = boardEl();
  b.animate([{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(0)'}],{duration:400});
}

export function setControlsVisibility(isAI){
  document.getElementById('difficultyLabel').classList.toggle('hidden', !isAI);
}

export function updateStatsContent(stats){
  const el = document.getElementById('statsContent');
  el.innerHTML = `Games Played: ${stats.played||0}<br/>X Wins: ${stats.X||0}<br/>O Wins: ${stats.O||0}<br/>Draws: ${stats.D||0}<br/>Win Rate X: ${stats.played?Math.round((stats.X||0)/stats.played*100):0}%`;
}
