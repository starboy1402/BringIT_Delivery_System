/**
 * @file Modal context (confirm dialogs)
 *
 * Provides a reusable confirmation dialog that any component can trigger.
 * Usage: const { confirm } = useModal();
 *        confirm({ title: '...', message: '...', onConfirm: () => {...} });
 */

import { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext({ confirm: () => { } });

/** Wrap your app with this to enable confirmation modals. */
export function ModalProvider({ children }) {
    const [options, setOptions] = useState(null);

    /**
     * Open a confirmation dialog.
     * @param {Object} opts
     * @param {string}   opts.title       - Dialog heading
     * @param {string}   opts.message     - Body text
     * @param {Function} opts.onConfirm   - Called when user clicks confirm
     * @param {string}   [opts.confirmText] - Confirm button label (default: 'Confirm')
     * @param {string}   [opts.cancelText]  - Cancel button label (default: 'Cancel')
     * @param {'primary'|'danger'} [opts.variant] - Button color style
     */
    const confirm = useCallback((opts) => setOptions(opts), []);

    const close = () => setOptions(null);
    const handleConfirm = () => {
        options?.onConfirm();
        close();
    };

    return (
        <ModalContext.Provider value={{ confirm }}>
            {children}

            {/* Confirmation dialog overlay */}
            {options && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={close} />

                    {/* Dialog box */}
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
                        <h3 id="modal-title" className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {options.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                            {options.message}
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={close}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                {options.cancelText || 'Cancel'}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${options.variant === 'danger'
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-green-600 hover:bg-green-700'
                                    }`}
                            >
                                {options.confirmText || 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    );
}

/** Hook to open confirmation dialogs from any component. */
export const useModal = () => useContext(ModalContext);
