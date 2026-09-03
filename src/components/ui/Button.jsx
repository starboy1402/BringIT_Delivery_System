/**
 * @file Button component
 *
 * Neo-brutalist tactile button with bold typography, hard offset shadows, and active physical click states.
 */

import { cn } from '@/utils/cn';

const BASE_STYLES =
    'relative px-4 py-2.5 rounded-xl font-heading font-bold text-sm tracking-tight transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 select-none';

const VARIANT_STYLES = {
    primary:
        'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-2 border-slate-900 dark:border-slate-700 shadow-[3px_3px_0_0_#0f172a] dark:shadow-[3px_3px_0_0_#020617] hover:shadow-[5px_5px_0_0_#0f172a] dark:hover:shadow-[5px_5px_0_0_#10b981] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_#0f172a]',
    secondary:
        'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-2 border-slate-900 dark:border-slate-700 shadow-[3px_3px_0_0_#0f172a] dark:shadow-[3px_3px_0_0_#020617] hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-[5px_5px_0_0_#0f172a] dark:hover:shadow-[5px_5px_0_0_#334155] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_#0f172a]',
    outline:
        'bg-transparent text-slate-800 dark:text-slate-200 border-2 border-slate-900/40 dark:border-slate-600 hover:border-emerald-600 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300',
    danger:
        'bg-rose-500 hover:bg-rose-400 text-white border-2 border-slate-900 dark:border-slate-700 shadow-[3px_3px_0_0_#0f172a] hover:shadow-[5px_5px_0_0_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_#0f172a]',
    ghost:
        'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
};

/**
 * @param {Object} props
 * @param {'primary'|'secondary'|'outline'|'danger'|'ghost'} [props.variant='primary']
 * @param {string}  [props.className]
 * @param {boolean} [props.disabled]
 * @param {React.ElementType} [props.as='button']
 */
export function Button({
    children,
    variant = 'primary',
    className = '',
    as: Component = 'button',
    ...props
}) {
    return (
        <Component
            className={cn(BASE_STYLES, VARIANT_STYLES[variant], className)}
            {...props}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
        </Component>
    );
}
