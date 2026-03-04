/**
 * @file Button component
 *
 * A styled button with multiple variants (primary, secondary, outline, etc.)
 * and built-in disabled state handling.
 */

import { cn } from '@/utils/cn';

const BASE_STYLES =
    'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]';

const VARIANT_STYLES = {
    primary: 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg',
    secondary:
        'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600',
    outline:
        'bg-transparent border-2 border-green-600 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20',
    danger:
        'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800',
    ghost: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
};

/**
 * @param {Object} props
 * @param {'primary'|'secondary'|'outline'|'danger'|'ghost'} [props.variant='primary']
 * @param {string}  [props.className]
 * @param {boolean} [props.disabled]
 * @param {'button'|'submit'} [props.type='button']
 */
export function Button({
    children,
    variant = 'primary',
    className = '',
    onClick,
    type = 'button',
    disabled = false,
}) {
    return (
        <button
            type={type}
            disabled={disabled}
            className={cn(BASE_STYLES, VARIANT_STYLES[variant], className)}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
