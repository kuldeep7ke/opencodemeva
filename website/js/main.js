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

  // "See the command" — update the code block per OS.
  const get = document.getElementById('get-text');
  if (get) {
    const commands = {
      windows: ['git clone https://github.com/kuldeep7ke/opencodemeva.git', 'cd opencodemeva', '.\\install.ps1', '# or preview first:', '# node src/cli.js install --dry-run'],
      linux: ['git clone https://github.com/kuldeep7ke/opencodemeva.git', 'cd opencodemeva', './install.sh', '# or preview first:', '# node src/cli.js install --dry-run']
    };
    document.querySelectorAll('[data-get]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const text = commands[btn.dataset.get];
        if (text) get.textContent = text.join('\n');
      });
    });
  }

  applyTheme(document.documentElement.dataset.theme || 'light');
})();