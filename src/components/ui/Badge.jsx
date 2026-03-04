/**
 * @file Badge components
 *
 * Small colored labels for displaying status, urgency, or other metadata.
 * - Badge:        Generic colored pill
 * - StatusBadge:  Shows request status (Open, Accepted, InProgress, etc.)
 * - UrgencyBadge: Shows urgency level (High, Medium, Low)
 */

import { cn } from '@/utils/cn';

const TYPE_STYLES = {
    neutral: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
    success: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
    warning: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400',
    danger: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
    info: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400',
};

/**
 * A small colored pill label.
 * @param {'neutral'|'success'|'warning'|'danger'|'info'|'purple'} [type='neutral']
 */
export function Badge({ children, type = 'neutral' }) {
    return (
        <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', TYPE_STYLES[type] || TYPE_STYLES.neutral)}>
            {children}
        </span>
    );
}

/** Shows a request's current status as a colored badge. */
export function StatusBadge({ status }) {
    const STATUS_MAP = {
        Open: { type: 'success', label: '● Open' },
        Accepted: { type: 'info', label: '● Accepted' },
        InProgress: { type: 'warning', label: '● In Progress' },
        Completed: { type: 'purple', label: '✓ Completed' },
        Cancelled: { type: 'danger', label: '✕ Cancelled' },
    };
    const config = STATUS_MAP[status] || STATUS_MAP.Open;
    return <Badge type={config.type}>{config.label}</Badge>;
}

/** Shows a request's urgency level as a colored badge. */
export function UrgencyBadge({ urgency }) {
    const URGENCY_MAP = { High: 'danger', Medium: 'warning', Low: 'success' };
    return <Badge type={URGENCY_MAP[urgency] || 'neutral'}>{urgency}</Badge>;
}
