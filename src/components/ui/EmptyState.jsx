/**
 * @file EmptyState component
 *
 * A centered placeholder shown when a list has no items.
 * Displays an icon, title, description, and an optional action button.
 */

export function EmptyState({ icon, title, desc, action }) {
    return (
        <div className="text-center py-16 animate-fade-in">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-gray-500">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{desc}</p>
            {action}
        </div>
    );
}
