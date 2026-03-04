/**
 * @file Theme context (dark / light mode)
 *
 * Persists the user's theme choice in localStorage and applies
 * the 'dark' class to <html> so Tailwind dark: variants work.
 *
 * Usage: const { dark, toggle } = useTheme();
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { themeDB } from '@/lib/db';

const ThemeContext = createContext({ dark: false, toggle: () => { } });

/** Wrap your app with this to enable dark mode toggling. */
export function ThemeProvider({ children }) {
    // Initialize from saved preference
    const [dark, setDark] = useState(() => themeDB.get() === 'dark');

    // Whenever `dark` changes, update the DOM and localStorage
    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        themeDB.set(dark ? 'dark' : 'light');
    }, [dark]);

    /** Toggle between dark and light mode. */
    const toggle = useCallback(() => setDark((prev) => !prev), []);

    return (
        <ThemeContext.Provider value={{ dark, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
}

/** Hook to access and toggle dark mode. */
export const useTheme = () => useContext(ThemeContext);
