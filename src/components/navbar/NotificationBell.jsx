/**
 * @file NotificationBell - Desktop notification dropdown
 *
 * Shows a bell icon with an unread count badge.
 * Clicking opens a dropdown panel listing recent notifications.
 */

import { Bell } from 'lucide-react';
import { cn } from '@/utils/cn';
import { timeAgo } from '@/utils/timeAgo';

/**
 * Map notification type to an emoji icon.
 * @param {'success'|'warning'|'info'} type
 */
function getNotifIcon(type) {
    if (type === 'success') return '✅';
    if (type === 'warning') return '⚠️';
    return '💬';
}

export function NotificationBell({
    notifications,
    unreadCount,
    isOpen,
    onToggle,
    onMarkAllRead,
    onClickNotification,
}) {
    return (
        <div className="relative">
            {/* Bell button */}
            <button
                onClick={onToggle}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 relative transition-colors"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                aria-expanded={isOpen}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold animate-scale-in">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {isOpen && (
                <div
                    className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50 animate-scale-in"
                    role="menu"
                >
                    {/* Header */}
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <span className="font-semibold text-gray-800 dark:text-white">Notifications</span>
                        {unreadCount > 0 && (
                            <button onClick={onMarkAllRead} className="text-xs text-green-600 dark:text-green-400 hover:underline">
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification items */}
                    {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-400 text-sm">No notifications yet</div>
                    ) : (
                        notifications.slice(0, 15).map((n) => (
                            <button
                                key={n.id}
                                className={cn(
                                    'p-3 border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors w-full text-left',
                                    !n.read && 'bg-green-50/50 dark:bg-green-900/10'
                                )}
                                onClick={() => onClickNotification(n)}
                                role="menuitem"
                            >
                                <p className="text-sm text-gray-700 dark:text-gray-200">
                                    {getNotifIcon(n.type)} {n.text}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
