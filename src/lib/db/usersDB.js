/**
 * @file Users database module (Supabase)
 *
 * Manages user profiles: fetching, updating, bookmarks, and leaderboard.
 * All functions are async — they query Supabase instead of localStorage.
 *
 * Authentication (signup, login, logout) is handled in AuthContext.
 */

import { supabase } from '@/lib/supabase';
import { mapProfile, mapRequest } from './helpers';

export const usersDB = {
    // ─── Profile ──────────────────────────────────────────

    /**
     * Get a user profile by their ID.
     * @param {string} userId
     * @returns {Promise<Object|null>}
     */
    async getUser(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) { console.error('getUser error:', error); return null; }
        return mapProfile(data);
    },

    /**
     * Update a user's profile fields (e.g. phone, hall).
     * @param {string} userId
     * @param {Object} updates - camelCase key-value pairs to merge
     * @returns {Promise<Object|null>} Updated profile, or null on error
     */
    async updateProfile(userId, updates) {
        // Convert camelCase keys to snake_case for Supabase
        const dbUpdates = {};
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.hall !== undefined) dbUpdates.hall = updates.hall;
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.studentId !== undefined) dbUpdates.student_id = updates.studentId;
        if (updates.department !== undefined) dbUpdates.department = updates.department;
        if (updates.batch !== undefined) dbUpdates.batch = updates.batch;
        if (updates.email !== undefined) dbUpdates.email = updates.email;
        if (updates.badges !== undefined) dbUpdates.badges = updates.badges;
        if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
        if (updates.totalRatings !== undefined) dbUpdates.total_ratings = updates.totalRatings;
        if (updates.deliveriesCompleted !== undefined) dbUpdates.deliveries_completed = updates.deliveriesCompleted;
        if (updates.requestsPosted !== undefined) dbUpdates.requests_posted = updates.requestsPosted;
        if (updates.totalEarnings !== undefined) dbUpdates.total_earnings = updates.totalEarnings;
        if (updates.bookmarkedRequests !== undefined) dbUpdates.bookmarked_requests = updates.bookmarkedRequests;

        const { data, error } = await supabase
            .from('profiles')
            .update(dbUpdates)
            .eq('id', userId)
            .select()
            .single();
        if (error) { console.error('updateProfile error:', error); return null; }
        return mapProfile(data);
    },

    // ─── Bookmarks ────────────────────────────────────────

    /**
     * Toggle a bookmark on/off for a request.
     * @returns {Promise<boolean>} true if now bookmarked, false if removed
     */
    async toggleBookmark(userId, requestId) {
        const user = await usersDB.getUser(userId);
        if (!user) return false;

        const bookmarks = user.bookmarkedRequests || [];
        const isCurrentlyBookmarked = bookmarks.includes(requestId);

        const newBookmarks = isCurrentlyBookmarked
            ? bookmarks.filter((id) => id !== requestId)
            : [...bookmarks, requestId];

        await supabase
            .from('profiles')
            .update({ bookmarked_requests: newBookmarks })
            .eq('id', userId);

        return !isCurrentlyBookmarked;
    },

    /**
     * Check if a request is bookmarked by a user.
     * @returns {Promise<boolean>}
     */
    async isBookmarked(userId, requestId) {
        const user = await usersDB.getUser(userId);
        return user?.bookmarkedRequests?.includes(requestId) || false;
    },

    /**
     * Get all bookmarked requests for a user.
     * @param {string} userId
     * @returns {Promise<Array>} Full request objects
     */
    async getBookmarkedRequests(userId) {
        const user = await usersDB.getUser(userId);
        if (!user || !user.bookmarkedRequests?.length) return [];

        // Fetch all bookmarked requests by their IDs
        const { data, error } = await supabase
            .from('requests')
            .select('*')
            .in('id', user.bookmarkedRequests);
        if (error) { console.error('getBookmarkedRequests error:', error); return []; }
        return (data || []).map(mapRequest);
    },

    // ─── Leaderboard ──────────────────────────────────────

    /**
     * Get users ranked by deliveries completed (then by rating).
     * Only includes users who have completed at least 1 delivery.
     * @returns {Promise<Array>} Sorted user list
     */
    async getLeaderboard() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .gt('deliveries_completed', 0)
            .order('deliveries_completed', { ascending: false })
            .order('rating', { ascending: false });
        if (error) { console.error('getLeaderboard error:', error); return []; }
        return (data || []).map(mapProfile);
    },

    /**
     * Count total registered users.
     * @returns {Promise<number>}
     */
    async getAllUsersCount() {
        const { count, error } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true });
        if (error) { console.error('getAllUsersCount error:', error); return 0; }
        return count || 0;
    },
};
