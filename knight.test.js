const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('./knight-core.js');
const levels = require('./knight-levels.js');

test('movement respects corners, edges, obstacles and locked gates', () => {
  const level = { start: 0, stars: [35], blocks: [], exit: 34 };
  const sorted = s => core.destinations(level,s).sort((a,b)=>a-b);
  assert.deepEqual(sorted(core.initial(level)),[8,13]);
  assert.deepEqual(sorted({position:5,collected:0}),[9,16]);
  assert.deepEqual(sorted({position:2,collected:0}),[6,10,13,15]);
  level.blocks = [1,6,8];
  assert.deepEqual(sorted(core.initial(level)),[13]);
  level.exit = 13;
  assert.deepEqual(sorted(core.initial(level)),[]);
  assert.deepEqual(sorted({position:0,collected:1}),[13]);
  const state = core.initial(level);
  for (const p of [-1,36,1,8,13]) assert.equal(core.move(level,state,p),state);
});

test('eight authored levels are valid and match their difficulty bands', () => {
  const bands = [[2,4],[2,4],[5,7],[5,7],[8,10],[8,10],[11,14],[11,14]];
  levels.forEach((level,i) => {
    const positions = [level.start,level.exit,...level.stars,...level.blocks];
    assert.equal(new Set(positions).size,positions.length);
    assert.ok(positions.every(p=>Number.isInteger(p)&&p>=0&&p<36));
    assert.equal(level.stars.length,i<2?1:i<4?2:3);
    assert.equal(level.blocks.length,Math.floor(i/2)*2);
    const path = core.solve(level);
    assert.ok(path);
    assert.equal(path.length,level.optimal);
    assert.ok(path.length >= bands[i][0] && path.length <= bands[i][1]);
    let state = core.initial(level);
    for (const p of path) state = core.move(level,state,p);
    assert.ok(core.won(level,state));
    assert.deepEqual(core.solve(level,state),[]);
    assert.deepEqual(core.destinations(level,state),[]);
  });
});

test('collect once, undo restores stars and gate, restart clears the attempt', () => {
  const level = levels[0];
  let state = core.move(level,core.initial(level),21);
  assert.equal(state.collected,1);
  assert.ok(core.destinations(level,state).includes(level.exit));
  state = core.undo({ ...state, hinted: true });
  assert.equal(state.position,level.start);
  assert.equal(state.collected,0);
  assert.equal(state.moves,0);
  assert.equal(state.hinted,true);
  for (const p of [21,32,21]) state = core.move(level,state,p);
  assert.equal(state.collected,1);
  const beforeWin = state;
  state = core.move(level,state,17);
  assert.ok(core.won(level,state));
  assert.deepEqual(core.undo(state),beforeWin);
  assert.deepEqual(core.initial(level),{position:32,collected:0,moves:0,hinted:false,history:[]});
});

test('hints solve all reachable states, including detours', () => {
  for (const level of levels) {
    const queue = [core.initial(level)], seen = new Set();
    for (let i=0; i<queue.length; i++) {
      const state = queue[i], key = `${state.position}:${state.collected}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const path = core.solve(level,state);
      assert.ok(path,`unsolvable state ${key}`);
      let solved = state;
      for (const p of path) solved = core.move(level,solved,p);
      assert.ok(core.won(level,solved));
      if (path.length) assert.ok(core.destinations(level,state).includes(path[0]));
      for (const p of core.destinations(level,state)) queue.push(core.move(level,state,p));
    }
  }
});

test('ratings apply thresholds and hint cap', () => {
  for (const [moves,hinted,expected] of [[8,false,3],[9,false,2],[10,false,2],[11,false,1],[8,true,2],[11,true,1]])
    assert.equal(core.rating(moves,8,hinted),expected);
});

test('progress unlocks sequentially, persists and keeps independent best scores', () => {
  let saved;
  const storage = {getItem:()=>saved,setItem:(_,value)=>saved=value};
  let progress = core.loadProgress(storage,8);
  assert.equal(progress.unlocked,1);
  progress = core.complete(progress,0,2,2,8);
  progress = core.complete(progress,0,4,3,8);
  assert.deepEqual(progress.scores[0],{moves:2,badges:3});
  assert.equal(progress.unlocked,2);
  assert.ok(core.saveProgress(storage,progress));
  assert.deepEqual(core.loadProgress(storage,8),progress);
  for (let i=1;i<8;i++) progress = core.complete(progress,i,levels[i].optimal,3,8);
  assert.equal(progress.unlocked,8);
  assert.equal(Object.keys(progress.scores).length,8);
});

test('blocked and corrupt storage are safe', () => {
  const empty = {scores:{},unlocked:1};
  const broken = {getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
  assert.deepEqual(core.loadProgress(broken,8),empty);
  assert.equal(core.saveProgress(broken,empty),false);
  assert.deepEqual(core.loadProgress(undefined,8),empty);
  for (const value of ['{','null','[]','{"unlocked":99}','{"scores":{"0":{"badges":5,"moves":2}}}','{"scores":{"2":{"badges":3,"moves":2}}}'])
    assert.deepEqual(core.loadProgress({getItem:()=>value},8),empty);
});
