(() => {
  const store = window.profileStore;
  const form = document.getElementById('profile-form');
  const edit = document.getElementById('profile-edit');
  const status = document.getElementById('profile-status');
  const favoriteStatus = document.getElementById('favorite-status');
  const warning = 'تعذّر الحفظ في المتصفح. التغييرات متاحة في هذه الصفحة فقط وستُفقد عند مغادرتها.';
  const avatarLabels = { '🎮': 'يد تحكم', '🚀': 'صاروخ', '🌙': 'هلال', '⭐': 'نجمة', '🎲': 'نرد', '🎯': 'هدف' };

  function render() {
    const profile = store.get();
    const favorite = profile.favorites.includes('memory');
    document.querySelectorAll('[data-favorite]').forEach(button => {
      button.hidden = false;
      button.setAttribute('aria-pressed', String(favorite));
      button.textContent = favorite ? '♥ إزالة من المفضلة' : '♡ أضف للمفضلة';
      button.setAttribute('aria-label', `${favorite ? 'إزالة تحدّي الذاكرة من' : 'إضافة تحدّي الذاكرة إلى'} المفضلة`);
    });
    if (!form) return;
    document.getElementById('profile-name').textContent = profile.name;
    const avatar = document.getElementById('profile-avatar');
    avatar.textContent = profile.avatar;
    avatar.setAttribute('aria-label', avatarLabels[profile.avatar]);
    document.getElementById('profile-empty').hidden = favorite;
    document.getElementById('profile-favorite-card').hidden = !favorite;
  }

  document.querySelectorAll('[data-favorite]').forEach(button => button.addEventListener('click', () => {
    const favorite = store.get().favorites.includes('memory');
    const saved = store.save({ favorites: favorite ? [] : ['memory'] });
    render();
    favoriteStatus.textContent = saved ? (favorite ? 'أُزيل تحدّي الذاكرة من المفضلة.' : 'أُضيف تحدّي الذاكرة إلى المفضلة.') : warning;
    if (form && favorite) document.querySelector('#profile-empty a').focus();
  }));

  if (form) {
    const input = document.getElementById('profile-name-input');
    const error = document.getElementById('profile-name-error');
    function clearError() { input.removeAttribute('aria-invalid'); error.textContent = ''; }
    function closeEditor() { form.reset(); clearError(); form.hidden = true; edit.hidden = false; edit.focus(); }
    edit.hidden = false;
    edit.addEventListener('click', () => {
      const profile = store.get();
      input.value = profile.name;
      form.querySelectorAll('[name="avatar"]').forEach(radio => { radio.checked = radio.value === profile.avatar; });
      clearError();
      status.textContent = store.available() ? '' : warning;
      form.hidden = false;
      edit.hidden = true;
      input.focus();
    });
    input.addEventListener('input', clearError);
    document.getElementById('profile-cancel').addEventListener('click', closeEditor);
    form.addEventListener('submit', event => {
      event.preventDefault();
      const name = input.value.trim();
      if (!name || name.length > 30) {
        input.setAttribute('aria-invalid', 'true');
        error.textContent = 'أدخل اسمًا من حرف واحد إلى ٣٠ حرفًا.';
        status.textContent = 'راجع الاسم المعروض قبل الحفظ.';
        input.focus();
        return;
      }
      const saved = store.save({ name, avatar: form.querySelector('[name="avatar"]:checked').value });
      render();
      closeEditor();
      status.textContent = saved ? 'تم حفظ ملفك في هذا المتصفح.' : warning;
    });
  }
  render();
  if (!store.available()) (status || favoriteStatus).textContent = warning;
})();
