(() => {
  const key = 'gamestation-profile';
  const avatars = ['🎮', '🚀', '🌙', '⭐', '🎲', '🎯'];
  const defaults = () => ({ name: 'لاعب جديد', avatar: avatars[0], favorites: [] });
  function normalize(value) {
    const result = defaults();
    if (!value || typeof value !== 'object' || Array.isArray(value)) return result;
    if (typeof value.name === 'string' && value.name.trim().length >= 1 && value.name.trim().length <= 30) result.name = value.name.trim();
    if (avatars.includes(value.avatar)) result.avatar = value.avatar;
    if (Array.isArray(value.favorites) && value.favorites.includes('memory')) result.favorites = ['memory'];
    return result;
  }
  let state = defaults();
  let available = true;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      try { state = normalize(JSON.parse(raw)); } catch { state = defaults(); }
    }
  } catch { available = false; }
  window.profileStore = {
    get: () => ({ ...state, favorites: [...state.favorites] }),
    available: () => available,
    save(patch) {
      state = normalize({ ...state, ...patch });
      try { localStorage.setItem(key, JSON.stringify(state)); available = true; }
      catch { available = false; }
      return available;
    }
  };
})();
