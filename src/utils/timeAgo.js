/**
 * @file timeAgo utility
 *
 * Converts an ISO date string into a human-readable relative time
 * like "5m ago", "3h ago", "2d ago".
 *
 * @param {string} dateStr - An ISO 8601 date string
 * @returns {string} A relative time string
 */
export function timeAgo(dateStr) {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;
    const minutes = Math.floor(diffMs / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    // Older than a week → show the actual date
    return new Date(dateStr).toLocaleDateString();
}
