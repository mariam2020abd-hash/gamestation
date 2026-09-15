(() => {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const boardElement = document.getElementById('xo-board');
  const status = document.getElementById('xo-status');
  const level = document.getElementById('xo-level');
  const scores = { X: 0, O: 0, draw: 0 };
  let board, thinking, finished, timer;

  function result(cells) {
    const line = lines.find(line => cells[line[0]] && line.every(i => cells[i] === cells[line[0]]));
    if (line) return { winner: cells[line[0]], line };
    return cells.every(Boolean) ? { winner: 'draw', line: [] } : null;
  }

  function minimax(cells, player) {
    const end = result(cells);
    if (end) return end.winner === 'O' ? 1 : end.winner === 'X' ? -1 : 0;
    const values = [];
    cells.forEach((cell, i) => {
      if (cell) return;
      cells[i] = player;
      values.push(minimax(cells, player === 'O' ? 'X' : 'O'));
      cells[i] = '';
    });
    return player === 'O' ? Math.max(...values) : Math.min(...values);
  }

  function computerMove() {
    const empty = board.map((cell, i) => cell ? -1 : i).filter(i => i !== -1);
    if (level.value === 'easy') return empty[Math.floor(Math.random() * empty.length)];
    let best = -Infinity, move = empty[0];
    for (const i of empty) {
      board[i] = 'O';
      const score = minimax(board, 'X');
      board[i] = '';
      if (score > best) { best = score; move = i; }
    }
    return move;
  }

  function render(end) {
    [...boardElement.children].forEach((cell, i) => {
      cell.textContent = board[i];
      cell.dataset.mark = board[i];
      cell.setAttribute('aria-label', `الصف ${Math.floor(i / 3) + 1}، العمود ${i % 3 + 1}: ${board[i] || 'فارغ'}`);
      cell.setAttribute('aria-disabled', String(Boolean(board[i]) || thinking || finished));
      cell.classList.toggle('winning', Boolean(end?.line.includes(i)));
    });
  }

  function complete() {
    const end = result(board);
    if (!end) return false;
    finished = true;
    scores[end.winner]++;
    document.getElementById('xo-wins').textContent = scores.X;
    document.getElementById('xo-losses').textContent = scores.O;
    document.getElementById('xo-draws').textContent = scores.draw;
    status.textContent = end.winner === 'X' ? 'فزت! ثلاث علامات على خط واحد 🎉' : end.winner === 'O' ? 'فاز الكمبيوتر. جرّب جولة جديدة!' : 'تعادل! جرّب جولة جديدة.';
    render(end);
    return true;
  }

  function choose(i) {
    if (finished || thinking || board[i]) return;
    board[i] = 'X';
    if (complete()) return;
    thinking = true;
    status.textContent = 'الكمبيوتر يفكّر…';
    render();
    timer = setTimeout(() => {
      board[computerMove()] = 'O';
      thinking = false;
      if (complete()) return;
      status.textContent = 'دورك! اختر مربعًا فارغًا.';
      render();
    }, 400);
  }

  function reset() {
    clearTimeout(timer);
    board = Array(9).fill('');
    thinking = false;
    finished = false;
    status.textContent = 'دورك! اختر مربعًا فارغًا.';
    render();
  }

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'xo-cell';
    cell.addEventListener('click', () => choose(i));
    boardElement.append(cell);
  }
  document.getElementById('xo-reset').addEventListener('click', reset);
  level.addEventListener('change', reset);
  reset();
})();
