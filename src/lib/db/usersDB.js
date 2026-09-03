/**
 * @file Users database module (Supabase + LocalStore Fallback)
 *
 * Manages user profiles: fetching, updating, bookmarks, and leaderboard.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { mapProfile, mapRequest, toSnakeCase } from './helpers';
import { localStore } from './localStore';

export const usersDB = {
    // ─── Profile ──────────────────────────────────────────

    /**
     * Get a user profile by their ID.
     */
    async getUser(userId) {
        if (!isSupabaseConfigured) {
            return localStore.getUser(userId);
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            if (error) return localStore.getUser(userId);
            return mapProfile(data);
        } catch {
            return localStore.getUser(userId);
        }
    },

    /**
     * Update a user's profile fields.
     */
    async updateProfile(userId, updates) {
        if (!isSupabaseConfigured) {
            return localStore.updateUser(userId, updates);
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(toSnakeCase(updates))
                .eq('id', userId)
                .select()
                .single();
            if (error) return localStore.updateUser(userId, updates);
            return mapProfile(data);
        } catch {
            return localStore.updateUser(userId, updates);
        }
    },

    // ─── Bookmarks ────────────────────────────────────────

    /**
     * Toggle a bookmark on/off for a request.
     */
    async toggleBookmark(userId, requestId) {
        const user = await usersDB.getUser(userId);
        if (!user) return false;

        const bookmarks = user.bookmarkedRequests || [];
        const isCurrentlyBookmarked = bookmarks.includes(requestId);
        const newBookmarks = isCurrentlyBookmarked
            ? bookmarks.filter((id) => id !== requestId)
            : [...bookmarks, requestId];

        await usersDB.updateProfile(userId, { bookmarkedRequests: newBookmarks });
        return !isCurrentlyBookmarked;
    },

    /**
     * Check if a request is bookmarked by a user.
     */
    async isBookmarked(userId, requestId) {
        const user = await usersDB.getUser(userId);
        return user?.bookmarkedRequests?.includes(requestId) || false;
    },

    /**
     * Get all bookmarked requests for a user.
     */
    async getBookmarkedRequests(userId) {
        const user = await usersDB.getUser(userId);
        if (!user || !user.bookmarkedRequests?.length) return [];

        if (!isSupabaseConfigured) {
            const allReqs = localStore.getRequests({}, { limit: 100 }).data;
            return allReqs.filter(r => user.bookmarkedRequests.includes(r.id));
        }

        try {
            const { data, error } = await supabase
                .from('requests')
                .select('*')
                .in('id', user.bookmarkedRequests);
            if (error) {
                const allReqs = localStore.getRequests({}, { limit: 100 }).data;
                return allReqs.filter(r => user.bookmarkedRequests.includes(r.id));
            }
            return (data || []).map(mapRequest);
        } catch {
            const allReqs = localStore.getRequests({}, { limit: 100 }).data;
            return allReqs.filter(r => user.bookmarkedRequests.includes(r.id));
        }
    },

    // ─── Leaderboard ──────────────────────────────────────

    /**
     * Get users ranked by deliveries completed (then by rating).
     */
    async getLeaderboard({ limit = 50 } = {}) {
        if (!isSupabaseConfigured) {
            return localStore.getUsers()
                .filter(u => (u.deliveriesCompleted || 0) > 0)
                .sort((a, b) => (b.deliveriesCompleted || 0) - (a.deliveriesCompleted || 0) || (b.rating || 0) - (a.rating || 0))
                .slice(0, limit);
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .gt('deliveries_completed', 0)
                .order('deliveries_completed', { ascending: false })
                .order('rating', { ascending: false })
                .limit(limit);
            if (error) {
                return localStore.getUsers()
                    .filter(u => (u.deliveriesCompleted || 0) > 0)
                    .sort((a, b) => (b.deliveriesCompleted || 0) - (a.deliveriesCompleted || 0) || (b.rating || 0) - (a.rating || 0))
                    .slice(0, limit);
            }
            return (data || []).map(mapProfile);
        } catch {
            return localStore.getUsers()
                .filter(u => (u.deliveriesCompleted || 0) > 0)
                .sort((a, b) => (b.deliveriesCompleted || 0) - (a.deliveriesCompleted || 0) || (b.rating || 0) - (a.rating || 0))
                .slice(0, limit);
        }
    },

    /**
     * Count total registered users.
     */
    async getAllUsersCount() {
        if (!isSupabaseConfigured) {
            return localStore.countUsers();
        }

        try {
            const { count, error } = await supabase
                .from('profiles')
                .select('id', { count: 'exact', head: true });
            if (error) return localStore.countUsers();
            return count || 0;
        } catch {
            return localStore.countUsers();
        }
    },
};
