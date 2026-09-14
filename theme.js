(() => {
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let preference;
  try {
    const saved = localStorage.getItem('gamestation-theme');
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch {}

  function applyTheme() {
    const theme = preference || (systemTheme.matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;
    const label = theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن';
    toggle.querySelector('.theme-label').textContent = label;
    toggle.querySelector('.theme-icon').textContent = theme === 'dark' ? '☀' : '☾';
    toggle.setAttribute('aria-label', `تفعيل ${label}`);
    toggle.hidden = false;
  }

  applyTheme();
  systemTheme.addEventListener('change', applyTheme);
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    document.querySelector('.theme-toggle').addEventListener('click', () => {
      preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('gamestation-theme', preference); } catch {}
      applyTheme();
    });
  });
})();
