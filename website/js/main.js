(function () {
  const themeToggle = document.getElementById('theme-toggle');
  const moon = document.getElementById('icon-moon');
  const sun = document.getElementById('icon-sun');

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('ocm_theme', theme); } catch { /* storage unavailable (file:// or private mode) */ }
    if (themeToggle) {
      const dark = theme === 'dark';
      if (moon) moon.classList.toggle('hidden', dark);
      if (sun) sun.classList.toggle('hidden', !dark);
      if (themeToggle) themeToggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  applyTheme(document.documentElement.dataset.theme || 'light');
})();