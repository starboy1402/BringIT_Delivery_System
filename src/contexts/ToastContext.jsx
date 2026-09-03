/**
 * @file Toast context
 *
 * Shows temporary notification messages (toasts) at the bottom-right.
 * Usage: const { showToast } = useToast();
 *        showToast('Saved!', 'success');   // types: 'success' | 'error' | 'info'
 */

import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext({ toasts: [], showToast: () => { } });

/** Wrap your app with this to enable toast notifications. */
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    /**
     * Show a toast message that auto-dismisses after 3.5 seconds.
     * @param {string} message - Text to display
     * @param {'success'|'error'|'info'} type - Determines the color
     */
    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }, []);

    // Pick background color based on type
    const bgColor = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600',
    };

    // Pick icon based on type
    const icon = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
    };

    return (
        <ToastContext.Provider value={{ toasts, showToast }}>
            {children}

            {/* Toast container — fixed at bottom-right */}
            <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm" role="status" aria-live="polite">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium animate-slide-up flex items-center gap-2 ${bgColor[toast.type] || bgColor.info}`}
                    >
                        <span>{icon[toast.type]}</span>
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

/** Hook to show toast notifications from any component. */
export const useToast = () => useContext(ToastContext);
