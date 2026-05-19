/* ===========================================================================
 * Кастомні доповнення до Unfold admin:
 * - Плаваюча кнопка переключення теми (light / dark / system / auto)
 * - Кастомний event 'budmaster:theme' для синхронізації графіків
 *
 * Зберігаємо вибір у localStorage під ключем 'theme' (той самий, що використовує
 * Unfold), тож наш тоггл і вбудований в Unfold перемикач у дропдауні профілю
 * показують той самий стан.
 * =========================================================================== */
(function () {
    'use strict';

    const STORAGE_KEY = 'theme';
    const MODES = ['light', 'dark', 'auto'];
    const ICONS = { light: 'light_mode', dark: 'dark_mode', auto: 'computer' };
    const LABELS = { light: 'Світла', dark: 'Темна', auto: 'Авто' };

    function getMode() {
        const v = localStorage.getItem(STORAGE_KEY);
        return MODES.includes(v) ? v : 'auto';
    }

    function applyTheme(mode) {
        const root = document.documentElement;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = mode === 'dark' || (mode === 'auto' && prefersDark);
        root.classList.toggle('dark', isDark);
        localStorage.setItem(STORAGE_KEY, mode);
        window.dispatchEvent(new CustomEvent('budmaster:theme', { detail: { mode, isDark } }));
    }

    function nextMode(current) {
        const i = MODES.indexOf(current);
        return MODES[(i + 1) % MODES.length];
    }

    function renderBtn(btn, mode) {
        btn.innerHTML = `<span class="material-symbols-outlined">${ICONS[mode]}</span><span class="bm-theme-label">${LABELS[mode]}</span>`;
    }

    function buildToggle() {
        if (document.getElementById('bm-theme-toggle')) return;

        const btn = document.createElement('button');
        btn.id = 'bm-theme-toggle';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Переключити тему');
        renderBtn(btn, getMode());

        btn.addEventListener('click', () => {
            const m = nextMode(getMode());
            applyTheme(m);
            renderBtn(btn, m);
        });

        document.body.appendChild(btn);
    }

    // Стилі
    const style = document.createElement('style');
    style.textContent = `
        #bm-theme-toggle {
            position: fixed;
            top: 14px;
            right: 18px;
            z-index: 9999;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 7px 13px;
            border-radius: 6px;
            background: rgba(245, 158, 11, 0.12);
            color: #d97706;
            border: 1px solid rgba(245, 158, 11, 0.35);
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            font-family: 'Inter', system-ui, sans-serif;
            transition: background .15s, border-color .15s;
            user-select: none;
        }
        #bm-theme-toggle:hover { background: rgba(245, 158, 11, 0.22); border-color: rgba(245, 158, 11, 0.55); }
        #bm-theme-toggle .material-symbols-outlined { font-size: 18px; }
        .dark #bm-theme-toggle { background: rgba(245, 158, 11, 0.18); color: #fbbf24; border-color: rgba(245, 158, 11, 0.45); }
        .dark #bm-theme-toggle:hover { background: rgba(245, 158, 11, 0.3); }
        @media (max-width: 768px) {
            #bm-theme-toggle .bm-theme-label { display: none; }
            #bm-theme-toggle { padding: 7px 9px; top: 10px; right: 12px; }
        }
    `;
    document.head.appendChild(style);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildToggle);
    } else {
        buildToggle();
    }
})();
