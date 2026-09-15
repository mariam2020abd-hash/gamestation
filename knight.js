(() => {
  'use strict';
  const core = window.KnightCore, levels = window.KnightLevels;
  const $ = id => document.getElementById(id);
  let storage;
  try { storage = window.localStorage; } catch {}
  let progress = core.loadProgress(storage, levels.length);
  let index = 0, state, suggested = null, focusCell = 0;
  const board = $('knight-board');
  const coordinate = p => String.fromCharCode(65 + p % 6) + (6 - Math.floor(p / 6));
  const badgesText = badges => '◆'.repeat(badges) + '◇'.repeat(3 - badges);
  const cells = Array.from({ length: 36 }, (_, p) => {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.dataset.position = p;
    const symbol = document.createElement('span'); symbol.className = 'cell-symbol'; symbol.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span'); label.className = 'cell-coordinate'; label.setAttribute('aria-hidden', 'true'); label.textContent = coordinate(p);
    cell.append(symbol, label);
    cell.addEventListener('click', () => choose(p));
    cell.addEventListener('focus', () => setBoardFocus(p));
    cell.addEventListener('keydown', event => {
      const offsets = { ArrowUp: -6, ArrowDown: 6, ArrowLeft: -1, ArrowRight: 1 };
      if (!(event.key in offsets)) return;
      event.preventDefault();
      const next = p + offsets[event.key];
      if (next < 0 || next >= 36 || (Math.abs(offsets[event.key]) === 1 && Math.floor(next / 6) !== Math.floor(p / 6))) return;
      cells[next].focus();
    });
    return cell;
  });
  board.replaceChildren(...cells);
  function setBoardFocus(p) {
    focusCell = p;
    cells.forEach((cell, i) => cell.tabIndex = i === p ? 0 : -1);
  }
  function renderMap() {
    $('journey-progress').textContent = `${Object.keys(progress.scores).length} من ${levels.length} مراحل مكتملة`;
    $('level-list').replaceChildren(...levels.map((level, i) => {
      const score = progress.scores[i], locked = i >= progress.unlocked;
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'level-card' + (!score && !locked ? ' next' : ''); button.disabled = locked;
      const number = document.createElement('span'); number.className = 'level-index'; number.textContent = String(i + 1).padStart(2,'0');
      const award = document.createElement('span'); award.className = 'level-award'; award.setAttribute('aria-hidden','true'); award.textContent = locked ? '🔒' : score ? badgesText(score.badges) : '↙';
      const title = document.createElement('strong'); title.textContent = level.name;
      const detail = document.createElement('small'); detail.textContent = locked ? 'أكمل المرحلة السابقة' : score ? `أفضل عدد: ${score.moves} قفزات` : 'ابدأ التحدّي';
      button.setAttribute('aria-label', `المرحلة ${i + 1}: ${level.name}. ${locked ? 'مغلقة' : score ? `${score.badges} شارات، أقل حركات ${score.moves}` : 'متاحة'}`);
      button.append(number, award, title, detail);
      button.addEventListener('click', () => start(i));
      return button;
    }));
  }
  function showMap(focus = true) {
    $('play-panel').hidden = true; $('level-map').hidden = false;
    renderMap();
    if (focus) $('map-title').focus();
  }
  function start(nextIndex) {
    if (nextIndex < 0 || nextIndex >= progress.unlocked || nextIndex >= levels.length) return;
    index = nextIndex; state = core.initial(levels[index]); suggested = null; focusCell = state.position;
    $('level-map').hidden = true; $('play-panel').hidden = false; $('result').hidden = true;
    $('level-number').textContent = `المرحلة ${index + 1} من ${levels.length}`;
    $('level-title').textContent = levels[index].name;
    $('level-tip').textContent = levels[index].tip;
    $('game-status').textContent = levels[index].tip;
    render(); $('level-title').focus();
  }
  function render(landed = null, collected = false) {
    const level = levels[index], legal = core.destinations(level, state), open = state.collected === core.fullMask(level);
    for (let p = 0; p < 36; p++) {
      const cell = cells[p], starIndex = level.stars.indexOf(p);
      const star = starIndex >= 0 && !(state.collected & (1 << starIndex));
      let symbol = '', description = 'فارغ';
      cell.className = 'knight-cell' + ((Math.floor(p / 6) + p % 6) % 2 ? ' alternate' : '');
      if (level.blocks.includes(p)) { symbol = '▧'; description = 'عائق، ممنوع الهبوط'; cell.classList.add('block'); }
      if (star) { symbol = '★'; description = 'نجمة'; cell.classList.add('star'); }
      if (p === level.exit) { symbol = open ? '▣' : '▥'; description = open ? 'بوابة مفتوحة' : 'بوابة مغلقة'; cell.classList.add('exit'); cell.classList.toggle('open', open); }
      if (p === state.position) { symbol = '♞'; description = 'الحصان' + (p === level.exit ? ' عند البوابة' : ''); cell.classList.add('horse'); }
      if (legal.includes(p)) { cell.classList.add('reachable'); description += '، متاح للقفز'; }
      if (p === suggested) { cell.classList.add('hinted'); description += '، القفزة المقترحة'; }
      cell.classList.toggle('has-symbol', !!symbol);
      if (p === landed) { cell.classList.add('landed'); if (collected) cell.classList.add('collected'); }
      cell.firstElementChild.textContent = symbol;
      cell.setAttribute('aria-label', `${coordinate(p)}: ${description}`);
      cell.setAttribute('aria-disabled', String(!legal.includes(p)));
    }
    setBoardFocus(focusCell);
    $('move-count').textContent = state.moves;
    $('star-count').textContent = `${level.stars.filter((_, i) => state.collected & (1 << i)).length} / ${level.stars.length}`;
    $('optimal-count').textContent = level.optimal;
    $('undo').disabled = !state.history.length || core.won(level,state);
    $('hint').disabled = core.won(level,state);
    $('hint-note').textContent = state.hinted ? 'استخدمت تلميحًا: أعلى تقييم لهذه المحاولة شارتان.' : 'التلميح يجعل أعلى تقييم للمحاولة شارتين.';
  }
  function choose(p) {
    const level = levels[index];
    if (!state || core.won(level,state)) return;
    const next = core.move(level, state, p);
    if (next === state) { $('game-status').textContent = 'اختر مربعًا مضيئًا؛ الحصان يتحرك مربعين ثم مربعًا جانبيًا.'; return; }
    const collected = next.collected !== state.collected;
    state = next; suggested = null; focusCell = p; render(p,collected);
    if (core.won(level,state)) { finish(); return; }
    $('game-status').textContent = collected ? (state.collected === core.fullMask(level) ? 'اكتملت النجوم! البوابة مفتوحة الآن، اقفز إليها.' : 'جمعت نجمة! تابع إلى النجوم المتبقية.') : `قفزة إلى ${coordinate(p)}. اختر وجهتك التالية.`;
  }
  function finish() {
    const level = levels[index], badges = core.rating(state.moves,level.optimal,state.hinted);
    progress = core.complete(progress,index,state.moves,badges,levels.length);
    if (!core.saveProgress(storage,progress)) $('storage-status').textContent = 'الحفظ غير متاح في هذا المتصفح. تقدّمك محفوظ لهذه الجلسة فقط.';
    const last = index === levels.length - 1;
    $('result-title').textContent = last ? 'أكملت رحلة الحصان!' : 'وصلت إلى البوابة!';
    $('result-badges').textContent = badgesText(badges);
    $('result-badges').setAttribute('aria-label', `${badges} من 3 شارات`);
    $('result-summary').textContent = `أنهيت المرحلة في ${state.moves} قفزات. الحل الأمثل: ${level.optimal}.` + (last ? ' ثماني محطات، ورحلة تستحق الإعادة.' : ' المرحلة التالية متاحة الآن.');
    $('next-level').hidden = last;
    $('result').hidden = false;
    $('game-status').textContent = 'أحسنت! جمعت النجوم ووصلت إلى البوابة.';
    $('result-title').focus();
  }
  $('undo').addEventListener('click', () => {
    if (core.won(levels[index],state)) return;
    state = core.undo(state); suggested = null; focusCell = state.position; render();
    $('game-status').textContent = 'تراجعت عن القفزة الأخيرة.';
  });
  $('hint').addEventListener('click', () => {
    const path = core.solve(levels[index],state);
    if (!path?.length) { $('game-status').textContent = 'لا يوجد طريق من هذا الموضع. جرّب التراجع أو إعادة المرحلة.'; return; }
    state = { ...state, hinted: true }; suggested = path[0]; render();
    $('game-status').textContent = `القفزة المقترحة: ${coordinate(suggested)}. مميزة بإطار وردي وعلامة ✧.`;
  });
  $('restart').addEventListener('click', () => start(index));
  $('replay').addEventListener('click', () => start(index));
  $('next-level').addEventListener('click', () => start(index + 1));
  $('back-map').addEventListener('click', () => showMap());
  $('result-map').addEventListener('click', () => showMap());
  showMap(false);
})();
