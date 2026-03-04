/**
 * @file Notifications database module (Supabase)
 *
 * Handles creating, reading, and marking notifications as read.
 * Notifications are created automatically by other modules
 * (e.g. when a request is accepted or a message is sent).
 * All functions are async.
 */

import { supabase } from '@/lib/supabase';
import { mapNotification } from './helpers';

/**
 * Create a new notification for a user.
 * Called internally by requestsDB and messagesDB.
 *
 * @param {string} userId    - Who receives the notification
 * @param {string} text      - The notification message
 * @param {string} requestId - Related request ID (for linking)
 * @param {string} type      - 'info' | 'success' | 'warning'
 */
export async function addNotification(userId, text, requestId, type = 'info') {
    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            text,
            read: false,
            request_id: requestId,
            type,
        });
    if (error) console.error('addNotification error:', error);
}

/** All notification operations */
export const notificationsDB = {
    /**
     * Get all notifications for a user, newest first.
     * @param {string} userId
     * @returns {Promise<Array>} Sorted notifications
     */
    async getByUser(userId) {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) { console.error('getByUser error:', error); return []; }
        return (data || []).map(mapNotification);
    },

    /**
     * Mark a single notification as read.
     * @param {string} notifId
     */
    async markRead(notifId) {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notifId);
        if (error) console.error('markRead error:', error);
    },

    /**
     * Mark ALL notifications as read for a user.
     * @param {string} userId
     */
    async markAllRead(userId) {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', userId)
            .eq('read', false);
        if (error) console.error('markAllRead error:', error);
    },

    /**
     * Count how many unread notifications a user has.
     * @param {string} userId
     * @returns {Promise<number>}
     */
    async unreadCount(userId) {
        const { count, error } = await supabase
            .from('notifications')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('read', false);
        if (error) { console.error('unreadCount error:', error); return 0; }
        return count || 0;
    },
};
