/**
 * @file Notifications database module (Supabase + LocalStore Fallback)
 *
 * Handles creating, reading, and marking notifications as read.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { mapNotification } from './helpers';
import { localStore } from './localStore';

/**
 * Create a new notification for a user.
 */
export async function addNotification(userId, text, requestId, type = 'info') {
    if (!isSupabaseConfigured) {
        return localStore.addNotification({ userId, text, requestId, type });
    }

    try {
        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                text,
                read: false,
                request_id: requestId,
                type,
            });
        if (error) {
            localStore.addNotification({ userId, text, requestId, type });
        }
    } catch {
        localStore.addNotification({ userId, text, requestId, type });
    }
}

/** All notification operations */
export const notificationsDB = {
    /**
     * Get all notifications for a user, newest first.
     */
    async getByUser(userId) {
        if (!isSupabaseConfigured) {
            return localStore.getNotifications(userId);
        }

        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (error) return localStore.getNotifications(userId);
            return (data || []).map(mapNotification);
        } catch {
            return localStore.getNotifications(userId);
        }
    },

    /**
     * Mark a single notification as read.
     */
    async markRead(notifId) {
        if (!isSupabaseConfigured) {
            return localStore.markNotificationAsRead(notifId);
        }

        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', notifId);
            if (error) localStore.markNotificationAsRead(notifId);
        } catch {
            localStore.markNotificationAsRead(notifId);
        }
    },

    /**
     * Mark ALL notifications as read for a user.
     */
    async markAllRead(userId) {
        if (!isSupabaseConfigured) {
            return localStore.markAllNotificationsAsRead(userId);
        }

        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', userId)
                .eq('read', false);
            if (error) localStore.markAllNotificationsAsRead(userId);
        } catch {
            localStore.markAllNotificationsAsRead(userId);
        }
    },

    /**
     * Count how many unread notifications a user has.
     */
    async unreadCount(userId) {
        if (!isSupabaseConfigured) {
            return localStore.getUnreadNotifsCount(userId);
        }

        try {
            const { count, error } = await supabase
                .from('notifications')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('read', false);
            if (error) return localStore.getUnreadNotifsCount(userId);
            return count || 0;
        } catch {
            return localStore.getUnreadNotifsCount(userId);
        }
    },
};
