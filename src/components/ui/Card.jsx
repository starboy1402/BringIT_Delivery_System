/**
 * @file Card component
 *
 * A white (or dark) rounded container with border and shadow.
 * Use for grouping related content on any page.
 */

import { cn } from '@/utils/cn';

/**
 * @param {Object} props
 * @param {string}   [props.className]
 * @param {Function} [props.onClick] - If provided, the card becomes clickable
 */
export function Card({ children, className = '', onClick }) {
    return (
        <div
            className={cn(
                'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden',
                onClick && 'cursor-pointer',
                className
            )}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
