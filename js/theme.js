/**
 * ==========================================================================
 * THEME, DESIGN TOKENS & CUSTOM DESKTOP CURSOR CONTROLLER
 * ==========================================================================
 */

const USER_THEME_PREF_KEY = 'nexvora_user_theme_pref';

export class ThemeController {
  constructor() {
    this.currentTheme = 'light';
    this.cursorInitialized = false;
  }

  init(themeSettings = {}) {
    const savedPref = localStorage.getItem(USER_THEME_PREF_KEY);
    const defaultTheme = themeSettings.default_theme || 'light';
    this.setTheme(savedPref || defaultTheme, false);

    if (themeSettings.accent_color) {
      document.documentElement.style.setProperty('--accent-primary', themeSettings.accent_color);
    }
    if (themeSettings.secondary_accent) {
      document.documentElement.style.setProperty('--accent-secondary', themeSettings.secondary_accent);
    }

    const toggleBtn = document.getElementById('themeToggleBtn');
    if (toggleBtn && !toggleBtn.dataset.bound) {
      toggleBtn.dataset.bound = 'true';
      toggleBtn.addEventListener('click', () => {
        const next = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(next, true);
      });
    }

    if (themeSettings.enable_custom_cursor !== false) {
      this.initCustomCursor();
    }
  }

  setTheme(themeName, persistUserChoice = true) {
    this.currentTheme = themeName === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    if (persistUserChoice) {
      localStorage.setItem(USER_THEME_PREF_KEY, this.currentTheme);
    }

    const toggleBtn = document.getElementById('themeToggleBtn');
    if (toggleBtn) {
      const isDark = this.currentTheme === 'dark';
      toggleBtn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      toggleBtn.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      toggleBtn.innerHTML = isDark
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    }
  }

  initCustomCursor() {
    if (this.cursorInitialized) return;
    if (window.matchMedia('(hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const cursor = document.getElementById('customCursor');
    if (!cursor) return;
    this.cursorInitialized = true;

    window.addEventListener('mousemove', (e) => {
      cursor.classList.add('is-active');
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    }, { passive: true });

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, input, select, textarea, .card-3d')) {
        cursor.classList.add('is-hovering');
      } else {
        cursor.classList.remove('is-hovering');
      }
    }, { passive: true });
  }
}

export const themeController = new ThemeController();
