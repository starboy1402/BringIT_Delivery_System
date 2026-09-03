/**
 * @file Card component
 *
 * Neo-brutalist bento box container with dark border, hard offset shadow, and hover elevation.
 */

import { cn } from '@/utils/cn';

/**
 * @param {Object} props
 * @param {string}   [props.className]
 * @param {Function} [props.onClick]
 * @param {boolean}  [props.interactive=false] - Whether it should hover/lift
 */
export function Card({ children, className = '', onClick, interactive = false }) {
    const isInteractive = Boolean(onClick || interactive);
    
    return (
        <div
            className={cn(
                'relative bg-white dark:bg-[#0d131f] border-2 border-slate-900/90 dark:border-slate-700/90 rounded-2xl shadow-[4px_4px_0_0_#0f172a] dark:shadow-[4px_4px_0_0_#020617] overflow-hidden transition-all duration-200',
                isInteractive && 'cursor-pointer hover:shadow-[6px_6px_0_0_#0f172a] dark:hover:shadow-[6px_6px_0_0_#10b981] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_0_#0f172a] group',
                className
            )}
            onClick={onClick}
        >
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
