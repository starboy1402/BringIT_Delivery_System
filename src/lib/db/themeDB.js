/**
 * @file Theme persistence
 *
 * Reads/writes the user's dark/light preference to localStorage.
 */

import { STORAGE_KEYS } from './helpers';

export const themeDB = {
    /**
     * Get the saved theme. Falls back to the OS preference, then 'light'.
     * @returns {'dark'|'light'}
     */
    get() {
        const stored = localStorage.getItem(STORAGE_KEYS.THEME);
        if (stored === 'dark' || stored === 'light') return stored;
        // Use OS-level preference if nothing is saved
        if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    },

    /**
     * Save the user's theme choice.
     * @param {'dark'|'light'} mode
     */
    set(mode) {
        localStorage.setItem(STORAGE_KEYS.THEME, mode);
    },
};
