const KEY = 'tic_tac_toe_v1';

export function loadState(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return null;
    return JSON.parse(raw);
  }catch(e){return null}
}

export function saveState(state){
  try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){}
}

export function clearState(){
  try{ localStorage.removeItem(KEY); }catch(e){}
}
