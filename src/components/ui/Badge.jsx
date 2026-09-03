/**
 * @file Badge components
 *
 * Small glowing labels matching the premium design system.
 */

import { cn } from '@/utils/cn';

const TYPE_STYLES = {
    neutral: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
    success: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    warning: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    danger: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
    info: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    purple: 'bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-500/20',
};

/**
 * A small glowing pill label.
 * @param {'neutral'|'success'|'warning'|'danger'|'info'|'purple'} [type='neutral']
 */
export function Badge({ children, type = 'neutral', className }) {
    return (
        <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 w-fit', TYPE_STYLES[type] || TYPE_STYLES.neutral, className)}>
            {children}
        </span>
    );
}

/** Shows a request's current status as a colored badge. */
export function StatusBadge({ status }) {
    const STATUS_MAP = {
        Open: { type: 'success', icon: <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-ring" /> },
        Accepted: { type: 'info', icon: <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> },
        InProgress: { type: 'warning', icon: <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse-ring" /> },
        Completed: { type: 'purple', icon: <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500" /> },
        Cancelled: { type: 'danger', icon: <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> },
    };
    const config = STATUS_MAP[status] || STATUS_MAP.Open;
    return (
        <Badge type={config.type}>
            {config.icon}
            {status}
        </Badge>
    );
}

/** Shows a request's urgency level as a colored badge. */
export function UrgencyBadge({ urgency }) {
    const URGENCY_MAP = { High: 'danger', Medium: 'warning', Low: 'success' };
    return <Badge type={URGENCY_MAP[urgency] || 'neutral'}>{urgency}</Badge>;
}
