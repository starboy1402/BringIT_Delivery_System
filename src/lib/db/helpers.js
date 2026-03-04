/**
 * @file Database helper utilities
 *
 * Mapper functions to convert between Supabase's snake_case column names
 * and the camelCase property names used throughout the app.
 *
 * Also keeps the THEME storage key for localStorage (theme stays local).
 */

// Theme is the only thing still stored in localStorage
export const STORAGE_KEYS = {
    THEME: 'cuet_theme',
};

// ─── Profile mappers ──────────────────────────────────

/** Convert a profiles DB row (snake_case) → app object (camelCase). */
export function mapProfile(row) {
    if (!row) return null;
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        studentId: row.student_id,
        department: row.department,
        batch: row.batch,
        hall: row.hall,
        phone: row.phone,
        rating: row.rating ?? 5.0,
        totalRatings: row.total_ratings ?? 0,
        deliveriesCompleted: row.deliveries_completed ?? 0,
        requestsPosted: row.requests_posted ?? 0,
        totalEarnings: row.total_earnings ?? 0,
        badges: row.badges ?? [],
        bookmarkedRequests: row.bookmarked_requests ?? [],
        createdAt: row.created_at,
    };
}

// ─── Request mappers ──────────────────────────────────

/** Convert a requests DB row → app object. */
export function mapRequest(row) {
    if (!row) return null;
    return {
        id: row.id,
        item: row.item,
        pickup: row.pickup,
        dropoff: row.dropoff,
        reward: `${row.reward} BDT`,
        urgency: row.urgency,
        details: row.details,
        status: row.status,
        requesterId: row.requester_id,
        requesterName: row.requester_name,
        acceptedById: row.accepted_by_id,
        acceptedByName: row.accepted_by_name,
        acceptedAt: row.accepted_at,
        inProgressAt: row.in_progress_at,
        completedAt: row.completed_at,
        paymentMethod: row.payment_method,
        paymentStatus: row.payment_status,
        rating: row.rating,
        reportedBy: row.reported_by ?? [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

// ─── Message mappers ──────────────────────────────────

/** Convert a messages DB row → app object. */
export function mapMessage(row) {
    if (!row) return null;
    return {
        id: row.id,
        requestId: row.request_id,
        senderId: row.sender_id,
        senderName: row.sender_name,
        text: row.text,
        createdAt: row.created_at,
    };
}

// ─── Notification mappers ─────────────────────────────

/** Convert a notifications DB row → app object. */
export function mapNotification(row) {
    if (!row) return null;
    return {
        id: row.id,
        userId: row.user_id,
        text: row.text,
        read: row.read,
        requestId: row.request_id,
        type: row.type,
        createdAt: row.created_at,
    };
}
