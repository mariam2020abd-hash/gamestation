(() => {
  const get = id => document.getElementById(`guess-${id}`);
  const input = get('input');
  const status = get('status');
  let secret, guesses, low, high, finished, best = null;

  function reset(focus = false) {
    secret = Math.floor(Math.random() * 100) + 1;
    guesses = new Set();
    low = 1; high = 100; finished = false;
    input.value = '';
    input.disabled = false;
    input.removeAttribute('aria-invalid');
    get('submit').disabled = false;
    get('count').textContent = '0';
    get('mystery').textContent = '?';
    get('range').textContent = 'النطاق الممكن: 1 إلى 100';
    get('history').replaceChildren();
    status.textContent = 'اكتب تخمينك الأول لتبدأ.';
    if (focus) input.focus();
  }

  get('form').addEventListener('submit', event => {
    event.preventDefault();
    if (finished) return;
    const normalized = input.value.trim()
      .replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
      .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)));
    const number = Number(normalized);
    if (!/^\d+$/.test(normalized) || !Number.isInteger(number) || number < 1 || number > 100) {
      status.textContent = 'أدخل رقمًا صحيحًا من 1 إلى 100، مثل ٥٠.';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');
    if (guesses.has(number)) {
      status.textContent = 'جرّبت هذا الرقم من قبل! اختر رقمًا آخر؛ لم نحتسب محاولة إضافية.';
      input.select();
      return;
    }
    guesses.add(number);
    get('count').textContent = String(guesses.size);
    const entry = document.createElement('li');
    if (number === secret) {
      finished = true;
      status.textContent = `أحسنت! الرقم هو ${secret}. اكتشفته في ${guesses.size} محاولة 🎉`;
      get('mystery').textContent = String(secret);
      best = best === null ? guesses.size : Math.min(best, guesses.size);
      get('best').textContent = String(best);
      get('range').textContent = `الرقم السرّي: ${secret}`;
      input.disabled = true;
      get('submit').disabled = true;
      entry.textContent = `${number} — صحيح!`;
      get('reset').focus();
    } else {
      const hint = number < secret ? 'الرقم السرّي أكبر' : 'الرقم السرّي أصغر';
      if (number < secret) low = Math.max(low, number + 1);
      else high = Math.min(high, number - 1);
      status.textContent = `${hint} من ${number}. حاول مجددًا!`;
      get('range').textContent = `النطاق الممكن: ${low} إلى ${high}`;
      entry.textContent = `${number} — ${hint}`;
      input.select();
    }
    get('history').prepend(entry);
  });
  get('reset').addEventListener('click', () => reset(true));
  reset();
})();
