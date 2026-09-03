/**
 * @file Avatar component
 *
 * A circular gradient avatar showing the first letter of a name.
 * Replaces the ~8 copy-pasted avatar implementations across the app.
 *
 * @param {Object} props
 * @param {string} props.name  - Full name (first character is displayed)
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md'] - Avatar size
 * @param {'green'|'blue'|'gray'} [props.color='green'] - Gradient color
 * @param {string} [props.className] - Extra classes
 */

import { cn } from '@/utils/cn';

const SIZE_MAP = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-24 h-24 text-3xl',
};

const COLOR_MAP = {
    green: 'from-green-400 to-green-600',
    blue: 'from-blue-400 to-blue-600',
    gray: 'from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700',
};

export function Avatar({ name, size = 'md', color = 'green', className = '' }) {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const isGray = color === 'gray';

    return (
        <div
            className={cn(
                'rounded-full flex items-center justify-center font-bold shadow bg-gradient-to-br flex-shrink-0',
                SIZE_MAP[size] || SIZE_MAP.md,
                COLOR_MAP[color] || COLOR_MAP.green,
                isGray ? 'text-gray-500 dark:text-gray-300' : 'text-white',
                className
            )}
        >
            {initial}
        </div>
    );
}
