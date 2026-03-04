/**
 * @file Requests database module (Supabase)
 *
 * CRUD operations for delivery requests, plus actions like
 * accept, mark-in-progress, complete, cancel, rate, and report.
 * All functions are async — they query Supabase.
 */

import { supabase } from '@/lib/supabase';
import { mapRequest, mapProfile } from './helpers';
import { addNotification } from './notificationsDB';

// ─── Badge helpers ──────────────────────────────────────

/**
 * Award badges to a deliverer based on their stats.
 * Returns the updated badges array (doesn't write to DB).
 *
 * @param {Object} profile - The user profile (camelCase)
 * @returns {string[]} Updated badges array
 */
function computeBadges(profile) {
    const badges = [...(profile.badges || [])];
    if (profile.deliveriesCompleted >= 10 && !badges.includes('Reliable')) {
        badges.push('Reliable');
    }
    if (profile.deliveriesCompleted >= 20 && !badges.includes('Top Deliverer')) {
        badges.push('Top Deliverer');
    }
    if (profile.rating >= 4.8 && !badges.includes('5-Star')) {
        badges.push('5-Star');
    }
    return badges;
}

// ─── Request operations ─────────────────────────────────

export const requestsDB = {
    /**
     * Get all requests, optionally filtered and sorted newest-first.
     *
     * @param {Object} [filters]
     * @param {string} [filters.status]  - 'Open' | 'Accepted' | etc.
     * @param {string} [filters.urgency] - 'High' | 'Medium' | 'Low'
     * @param {string} [filters.search]  - Free text search
     * @returns {Promise<Array>}
     */
    async getAll(filters) {
        let query = supabase
            .from('requests')
            .select('*')
            .order('created_at', { ascending: false });

        // Apply status filter
        if (filters?.status && filters.status !== 'All') {
            query = query.eq('status', filters.status);
        }

        // Apply urgency filter
        if (filters?.urgency && filters.urgency !== 'All') {
            query = query.eq('urgency', filters.urgency);
        }

        const { data, error } = await query;
        if (error) { console.error('getAll error:', error); return []; }

        let results = (data || []).map(mapRequest);

        // Apply text search on the client side (matches item, pickup, dropoff, requester name)
        if (filters?.search) {
            const q = filters.search.toLowerCase();
            results = results.filter(
                (r) =>
                    r.item.toLowerCase().includes(q) ||
                    r.pickup.toLowerCase().includes(q) ||
                    r.dropoff.toLowerCase().includes(q) ||
                    r.requesterName.toLowerCase().includes(q)
            );
        }

        return results;
    },

    /**
     * Get a single request by ID.
     * @param {string} id
     * @returns {Promise<Object|null>}
     */
    async getById(id) {
        const { data, error } = await supabase
            .from('requests')
            .select('*')
            .eq('id', id)
            .single();
        if (error) { console.error('getById error:', error); return null; }
        return mapRequest(data);
    },

    /**
     * Get all requests where the user is either the requester OR the deliverer.
     * @param {string} userId
     * @returns {Promise<Array>}
     */
    async getByUser(userId) {
        const { data, error } = await supabase
            .from('requests')
            .select('*')
            .or(`requester_id.eq.${userId},accepted_by_id.eq.${userId}`)
            .order('created_at', { ascending: false });
        if (error) { console.error('getByUser error:', error); return []; }
        return (data || []).map(mapRequest);
    },

    /**
     * Get aggregate stats: total, open, in-progress, completed.
     * @returns {Promise<{ total: number, open: number, inProgress: number, completed: number }>}
     */
    async getStats() {
        // Fetch all statuses in one query and count client-side
        const { data, error } = await supabase
            .from('requests')
            .select('status');
        if (error) { console.error('getStats error:', error); return { total: 0, open: 0, inProgress: 0, completed: 0 }; }

        const rows = data || [];
        return {
            total: rows.length,
            open: rows.filter((r) => r.status === 'Open').length,
            inProgress: rows.filter((r) => r.status === 'InProgress' || r.status === 'Accepted').length,
            completed: rows.filter((r) => r.status === 'Completed').length,
        };
    },

    /**
     * Create a new delivery request.
     * Also increments the requester's requestsPosted count.
     *
     * @param {Object} data - { item, pickup, dropoff, reward, urgency, details, requesterId, requesterName }
     * @returns {Promise<Object>} The created request
     */
    async create(data) {
        const { data: row, error } = await supabase
            .from('requests')
            .insert({
                item: data.item,
                pickup: data.pickup,
                dropoff: data.dropoff,
                reward: data.reward,
                urgency: data.urgency,
                details: data.details,
                requester_id: data.requesterId,
                requester_name: data.requesterName,
                status: 'Open',
            })
            .select()
            .single();
        if (error) { console.error('create error:', error); return null; }

        // Increment requester's post count
        const { data: profile } = await supabase
            .from('profiles')
            .select('requests_posted')
            .eq('id', data.requesterId)
            .single();
        if (profile) {
            await supabase
                .from('profiles')
                .update({ requests_posted: (profile.requests_posted || 0) + 1 })
                .eq('id', data.requesterId);
        }

        return mapRequest(row);
    },

    /**
     * Accept an open request as a deliverer.
     * Prevents self-acceptance and double-acceptance.
     *
     * @param {string} requestId
     * @param {string} userId
     * @param {string} userName
     * @returns {Promise<Object|null>} Updated request, or null on failure
     */
    async accept(requestId, userId, userName) {
        // First check the request is still Open and not by same user
        const existing = await requestsDB.getById(requestId);
        if (!existing || existing.status !== 'Open') return null;
        if (existing.requesterId === userId) return null;

        const { data: row, error } = await supabase
            .from('requests')
            .update({
                status: 'Accepted',
                accepted_by_id: userId,
                accepted_by_name: userName,
                accepted_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', requestId)
            .select()
            .single();
        if (error) { console.error('accept error:', error); return null; }

        // Notify the requester
        await addNotification(
            existing.requesterId,
            `${userName} accepted your delivery request for "${existing.item}"`,
            requestId,
            'success'
        );

        return mapRequest(row);
    },

    /**
     * Mark an accepted request as "in progress" (deliverer picked up the item).
     * Only the accepted deliverer can do this.
     */
    async markInProgress(requestId, userId) {
        const existing = await requestsDB.getById(requestId);
        if (!existing || existing.status !== 'Accepted') return null;
        if (existing.acceptedById !== userId) return null;

        const { data: row, error } = await supabase
            .from('requests')
            .update({
                status: 'InProgress',
                in_progress_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', requestId)
            .select()
            .single();
        if (error) { console.error('markInProgress error:', error); return null; }

        await addNotification(
            existing.requesterId,
            `Your item "${existing.item}" is on its way! 🚀`,
            requestId,
            'info'
        );

        return mapRequest(row);
    },

    /**
     * Mark a request as completed. Optionally records payment info.
     * Awards badges to the deliverer and sends a notification.
     *
     * @param {string}  requestId
     * @param {string}  userId
     * @param {string}  [paymentMethod] - 'bKash' | 'Nagad' | 'Cash'
     */
    async markCompleted(requestId, userId, paymentMethod) {
        const existing = await requestsDB.getById(requestId);
        if (!existing) return null;
        if (existing.requesterId !== userId && existing.acceptedById !== userId) return null;

        const updates = {
            status: 'Completed',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        if (paymentMethod) {
            updates.payment_method = paymentMethod;
            updates.payment_status = 'Paid';
        }

        const { data: row, error } = await supabase
            .from('requests')
            .update(updates)
            .eq('id', requestId)
            .select()
            .single();
        if (error) { console.error('markCompleted error:', error); return null; }

        // Update deliverer stats + award badges
        if (existing.acceptedById) {
            const { data: delivererRow } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', existing.acceptedById)
                .single();

            if (delivererRow) {
                const deliverer = mapProfile(delivererRow);
                deliverer.deliveriesCompleted += 1;
                deliverer.totalEarnings += parseFloat(existing.reward) || 0;
                const newBadges = computeBadges(deliverer);

                await supabase
                    .from('profiles')
                    .update({
                        deliveries_completed: deliverer.deliveriesCompleted,
                        total_earnings: deliverer.totalEarnings,
                        badges: newBadges,
                    })
                    .eq('id', existing.acceptedById);
            }
        }

        // Notify the other party
        const notifyUserId =
            existing.requesterId === userId ? existing.acceptedById : existing.requesterId;
        if (notifyUserId) {
            await addNotification(
                notifyUserId,
                `Delivery for "${existing.item}" has been completed! 🎉`,
                requestId,
                'success'
            );
        }

        return mapRequest(row);
    },

    /**
     * Cancel a request. Only the original requester can cancel.
     */
    async cancel(requestId, userId) {
        const existing = await requestsDB.getById(requestId);
        if (!existing || existing.requesterId !== userId) return null;

        const { data: row, error } = await supabase
            .from('requests')
            .update({
                status: 'Cancelled',
                updated_at: new Date().toISOString(),
            })
            .eq('id', requestId)
            .select()
            .single();
        if (error) { console.error('cancel error:', error); return null; }

        // Notify deliverer if one was assigned
        if (existing.acceptedById) {
            await addNotification(
                existing.acceptedById,
                `The request for "${existing.item}" has been cancelled by the requester.`,
                requestId,
                'warning'
            );
        }

        return mapRequest(row);
    },

    /**
     * Rate a completed delivery. Updates the deliverer's average rating
     * and potentially awards a 5-Star badge.
     *
     * @param {string} requestId
     * @param {number} rating - 1 to 5
     */
    async rate(requestId, rating) {
        const existing = await requestsDB.getById(requestId);
        if (!existing || existing.status !== 'Completed') return null;

        const { data: row, error } = await supabase
            .from('requests')
            .update({ rating })
            .eq('id', requestId)
            .select()
            .single();
        if (error) { console.error('rate error:', error); return null; }

        // Update the deliverer's average rating
        if (existing.acceptedById) {
            const { data: delivererRow } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', existing.acceptedById)
                .single();

            if (delivererRow) {
                const deliverer = mapProfile(delivererRow);
                const newTotal = deliverer.totalRatings + 1;
                const newRating = Math.round(((deliverer.rating * deliverer.totalRatings + rating) / newTotal) * 10) / 10;
                deliverer.rating = newRating;
                deliverer.totalRatings = newTotal;
                const newBadges = computeBadges(deliverer);

                await supabase
                    .from('profiles')
                    .update({
                        rating: newRating,
                        total_ratings: newTotal,
                        badges: newBadges,
                    })
                    .eq('id', existing.acceptedById);
            }

            await addNotification(
                existing.acceptedById,
                `You received a ${rating}-star rating for delivering "${existing.item}" ⭐`,
                requestId,
                'success'
            );
        }

        return mapRequest(row);
    },

    /**
     * Report a request as suspicious. Each user can only report once.
     * @returns {Promise<boolean>} true if reported, false if already reported
     */
    async report(requestId, userId) {
        const existing = await requestsDB.getById(requestId);
        if (!existing) return false;

        const reportedBy = existing.reportedBy || [];
        if (reportedBy.includes(userId)) return false;

        const { error } = await supabase
            .from('requests')
            .update({ reported_by: [...reportedBy, userId] })
            .eq('id', requestId);
        if (error) { console.error('report error:', error); return false; }

        return true;
    },
};
