(function (root) {
  'use strict';
  const SIZE = 6;
  const offsets = [[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]];
  const fullMask = level => (1 << level.stars.length) - 1;
  const initial = level => ({ position: level.start, collected: 0, moves: 0, hinted: false, history: [] });
  function destinations(level, state) {
    if (won(level, state)) return [];
    const row = Math.floor(state.position / SIZE), col = state.position % SIZE;
    return offsets.map(([dr, dc]) => [row + dr, col + dc])
      .filter(([r,c]) => r >= 0 && r < SIZE && c >= 0 && c < SIZE)
      .map(([r,c]) => r * SIZE + c)
      .filter(p => !level.blocks.includes(p) && (p !== level.exit || state.collected === fullMask(level)));
  }
  function advance(level, state, position) {
    const index = level.stars.indexOf(position);
    return { position, collected: state.collected | (index < 0 ? 0 : 1 << index) };
  }
  function won(level, state) { return state.position === level.exit && state.collected === fullMask(level); }
  function move(level, state, position) {
    if (!destinations(level, state).includes(position)) return state;
    return { ...state, ...advance(level, state, position), moves: state.moves + 1,
      history: [...state.history, { position: state.position, collected: state.collected, moves: state.moves }] };
  }
  function undo(state) {
    if (!state.history.length) return state;
    return { ...state, ...state.history[state.history.length - 1], history: state.history.slice(0,-1) };
  }
  function solve(level, state = initial(level)) {
    const key = s => s.position + ':' + s.collected;
    const queue = [{ position: state.position, collected: state.collected, parent: -1 }];
    const seen = new Set([key(state)]);
    for (let head = 0; head < queue.length; head++) {
      const current = queue[head];
      if (won(level, current)) {
        const path = [];
        for (let i = head; queue[i].parent !== -1; i = queue[i].parent) path.push(queue[i].position);
        return path.reverse();
      }
      for (const position of destinations(level, current)) {
        const next = advance(level, current, position);
        if (!seen.has(key(next))) { seen.add(key(next)); queue.push({ ...next, parent: head }); }
      }
    }
    return null;
  }
  function rating(moves, optimal, hinted) {
    return Math.min(moves <= optimal ? 3 : moves <= optimal + 2 ? 2 : 1, hinted ? 2 : 3);
  }
  const STORAGE_KEY = 'gamestation-knight-v1';
  function cleanProgress(value, count) {
    const scores = {};
    for (let i = 0; i < count; i++) {
      const score = value?.scores?.[i];
      if (score && Number.isInteger(score.badges) && score.badges >= 1 && score.badges <= 3 &&
          Number.isSafeInteger(score.moves) && score.moves > 0) scores[i] = { badges: score.badges, moves: score.moves };
      else break; // Only a continuous sequence of completed levels unlocks the next one.
    }
    return { scores, unlocked: Math.min(count, Object.keys(scores).length + 1) };
  }
  function loadProgress(storage, count) {
    try { return cleanProgress(JSON.parse(storage.getItem(STORAGE_KEY)), count); }
    catch { return cleanProgress(null, count); }
  }
  function saveProgress(storage, progress) {
    try { storage.setItem(STORAGE_KEY, JSON.stringify(progress)); return true; } catch { return false; }
  }
  function complete(progress, index, moves, badges, count) {
    const old = progress.scores[index];
    return cleanProgress({ scores: { ...progress.scores, [index]: {
      badges: Math.max(old?.badges || 0, badges), moves: Math.min(old?.moves ?? Infinity, moves)
    } } }, count);
  }
  const api = { SIZE, fullMask, initial, destinations, won, move, undo, solve, rating, cleanProgress, loadProgress, saveProgress, complete };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.KnightCore = api;
})(globalThis);
