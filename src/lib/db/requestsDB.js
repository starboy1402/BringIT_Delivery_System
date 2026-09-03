/**
 * @file Requests database module (Supabase + LocalStore Fallback)
 *
 * CRUD operations for delivery requests, plus actions like
 * accept, mark-in-progress, complete, cancel, rate, and report.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { mapRequest } from './helpers';
import { addNotification } from './notificationsDB';
import { usersDB } from './usersDB';
import { localStore } from './localStore';

// ─── Badge helpers ──────────────────────────────────────

function computeBadges(profile) {
    const badges = [...(profile.badges || [])];
    const deliveries = profile.deliveriesCompleted;
    const rating = profile.rating;

    if (deliveries >= 5 && !badges.includes('Quick Courier')) {
        badges.push('Quick Courier');
    }
    if (deliveries >= 10 && !badges.includes('Reliable')) {
        badges.push('Reliable');
    }
    if (deliveries >= 25 && !badges.includes('Elite Traveler')) {
        badges.push('Elite Traveler');
    }
    if (deliveries >= 50 && !badges.includes('Legendary')) {
        badges.push('Legendary');
    }
    if (rating >= 4.8 && deliveries >= 5 && !badges.includes('5-Star Hero')) {
        badges.push('5-Star Hero');
    }
    return [...new Set(badges)];
}

async function refreshUserBadges(userId) {
    const profile = await usersDB.getUser(userId);
    if (!profile) return;
    const newBadges = computeBadges(profile);
    if (JSON.stringify(newBadges) !== JSON.stringify(profile.badges)) {
        await usersDB.updateProfile(userId, { badges: newBadges });
    }
}

// ─── Request operations ─────────────────────────────────

export const requestsDB = {
    /**
     * Get all requests, optionally filtered and sorted newest-first.
     */
    async getAll(filters, { limit = 30, offset = 0 } = {}) {
        if (!isSupabaseConfigured) {
            return localStore.getRequests(filters, { limit, offset });
        }

        try {
            let query = supabase
                .from('requests')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (filters?.status && filters.status !== 'All') {
                query = query.eq('status', filters.status);
            }

            if (filters?.urgency && filters.urgency !== 'All') {
                query = query.eq('urgency', filters.urgency);
            }

            if (filters?.search) {
                const q = `%${filters.search}%`;
                query = query.or(`item.ilike.${q},pickup.ilike.${q},dropoff.ilike.${q},requester_name.ilike.${q}`);
            }

            const { data, error, count } = await query;
            if (error) {
                console.warn('getAll Supabase error, falling back to localStore:', error);
                return localStore.getRequests(filters, { limit, offset });
            }

            return { data: (data || []).map(mapRequest), total: count || 0, error: null };
        } catch (err) {
            console.warn('getAll network error, falling back to localStore:', err);
            return localStore.getRequests(filters, { limit, offset });
        }
    },

    /**
     * Get a single request by ID.
     */
    async getById(id) {
        if (!isSupabaseConfigured) {
            return localStore.getRequestById(id);
        }

        try {
            const { data, error } = await supabase
                .from('requests')
                .select('*')
                .eq('id', id)
                .single();
            if (error) {
                return localStore.getRequestById(id);
            }
            return mapRequest(data);
        } catch {
            return localStore.getRequestById(id);
        }
    },

    /**
     * Get all requests where the user is either the requester OR the deliverer.
     */
    async getByUser(userId, { limit = 100 } = {}) {
        if (!isSupabaseConfigured) {
            const { data } = localStore.getRequests({}, { limit });
            return data.filter(r => r.requesterId === userId || r.acceptedById === userId);
        }

        try {
            const { data, error } = await supabase
                .from('requests')
                .select('*')
                .or(`requester_id.eq.${userId},accepted_by_id.eq.${userId}`)
                .order('created_at', { ascending: false })
                .limit(limit);
            if (error) {
                const { data: localData } = localStore.getRequests({}, { limit });
                return localData.filter(r => r.requesterId === userId || r.acceptedById === userId);
            }
            return (data || []).map(mapRequest);
        } catch {
            const { data: localData } = localStore.getRequests({}, { limit });
            return localData.filter(r => r.requesterId === userId || r.acceptedById === userId);
        }
    },

    /**
     * Get aggregate stats: total, open, in-progress, completed.
     */
    async getStats() {
        if (!isSupabaseConfigured) {
            return localStore.getRequestStats();
        }

        try {
            const [totalRes, openRes, acceptedRes, inProgressRes, completedRes] = await Promise.all([
                supabase.from('requests').select('id', { count: 'exact', head: true }),
                supabase.from('requests').select('id', { count: 'exact', head: true }).eq('status', 'Open'),
                supabase.from('requests').select('id', { count: 'exact', head: true }).eq('status', 'Accepted'),
                supabase.from('requests').select('id', { count: 'exact', head: true }).eq('status', 'InProgress'),
                supabase.from('requests').select('id', { count: 'exact', head: true }).eq('status', 'Completed'),
            ]);

            if (totalRes.error) return localStore.getRequestStats();

            return {
                total: totalRes.count ?? 0,
                open: openRes.count ?? 0,
                inProgress: (acceptedRes.count ?? 0) + (inProgressRes.count ?? 0),
                completed: completedRes.count ?? 0,
            };
        } catch {
            return localStore.getRequestStats();
        }
    },

    /**
     * Create a new delivery request.
     */
    async create(data) {
        if (!isSupabaseConfigured) {
            return localStore.createRequest(data);
        }

        try {
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
            if (error) {
                console.warn('Supabase create error, saving locally:', error);
                return localStore.createRequest(data);
            }

            await supabase.rpc('increment_requests_posted', { user_id: data.requesterId }).catch(() => {});
            return mapRequest(row);
        } catch {
            return localStore.createRequest(data);
        }
    },

    /**
     * Accept an open request as a deliverer.
     */
    async accept(requestId, userId, userName) {
        const existing = await requestsDB.getById(requestId);
        if (!existing || existing.status !== 'Open') return null;
        if (existing.requesterId === userId) return null;

        if (!isSupabaseConfigured) {
            const updated = localStore.updateRequest(requestId, {
                status: 'Accepted',
                acceptedById: userId,
                acceptedByName: userName,
                acceptedAt: new Date().toISOString(),
            });
            await addNotification(existing.requesterId, `${userName} accepted your delivery request for "${existing.item}"`, requestId, 'success');
            return updated;
        }

        try {
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
                .eq('status', 'Open')
                .select()
                .single();
            if (error) {
                return localStore.updateRequest(requestId, {
                    status: 'Accepted',
                    acceptedById: userId,
                    acceptedByName: userName,
                    acceptedAt: new Date().toISOString(),
                });
            }

            await addNotification(existing.requesterId, `${userName} accepted your delivery request for "${existing.item}"`, requestId, 'success');
            return mapRequest(row);
        } catch {
            return localStore.updateRequest(requestId, {
                status: 'Accepted',
                acceptedById: userId,
                acceptedByName: userName,
                acceptedAt: new Date().toISOString(),
            });
        }
    },

    /**
     * Mark an accepted request as in-progress (item picked up).
     */
    async markInProgress(requestId, userId) {
        const existing = await requestsDB.getById(requestId);
        if (!existing || existing.status !== 'Accepted') return null;
        if (existing.acceptedById !== userId) return null;

        if (!isSupabaseConfigured) {
            const updated = localStore.updateRequest(requestId, {
                status: 'InProgress',
                inProgressAt: new Date().toISOString(),
            });
            await addNotification(existing.requesterId, `Your item "${existing.item}" has been picked up and is in transit! 🚚`, requestId, 'info');
            return updated;
        }

        try {
            const { data: row, error } = await supabase
                .from('requests')
                .update({
                    status: 'InProgress',
                    in_progress_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', requestId)
                .eq('accepted_by_id', userId)
                .select()
                .single();
            if (error) {
                return localStore.updateRequest(requestId, {
                    status: 'InProgress',
                    inProgressAt: new Date().toISOString(),
                });
            }

            await addNotification(existing.requesterId, `Your item "${existing.item}" has been picked up and is in transit! 🚚`, requestId, 'info');
            return mapRequest(row);
        } catch {
            return localStore.updateRequest(requestId, {
                status: 'InProgress',
                inProgressAt: new Date().toISOString(),
            });
        }
    },

    /**
     * Mark a request as completed (delivered).
     */
    async complete(requestId, userId, { paymentMethod = 'bKash' } = {}) {
        const existing = await requestsDB.getById(requestId);
        if (!existing || !['Accepted', 'InProgress'].includes(existing.status)) return null;
        
        // Strict Authorization: Only the requester or assigned deliverer can complete
        if (existing.requesterId !== userId && existing.acceptedById !== userId) {
            console.warn('Unauthorized complete attempt rejected for user:', userId);
            return null;
        }

        if (!isSupabaseConfigured) {
            const updated = localStore.updateRequest(requestId, {
                status: 'Completed',
                completedAt: new Date().toISOString(),
                paymentMethod,
                paymentStatus: 'Paid',
            });
            if (existing.acceptedById) {
                const deliverer = localStore.getUser(existing.acceptedById);
                if (deliverer) {
                    localStore.updateUser(deliverer.id, {
                        deliveriesCompleted: (deliverer.deliveriesCompleted || 0) + 1,
                        totalEarnings: (deliverer.totalEarnings || 0) + (Number(existing.reward) || 0),
                    });
                }
            }
            await addNotification(existing.requesterId, `Delivery completed for "${existing.item}"! Please rate your deliverer. ⭐`, requestId, 'success');
            return updated;
        }

        try {
            const { data: row, error } = await supabase
                .from('requests')
                .update({
                    status: 'Completed',
                    completed_at: new Date().toISOString(),
                    payment_method: paymentMethod,
                    payment_status: 'Paid',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', requestId)
                .select()
                .single();
            if (error) {
                console.error('Supabase complete error:', error);
                return null;
            }

            if (existing.acceptedById) {
                await supabase.rpc('increment_deliverer_stats', {
                    deliverer_id: existing.acceptedById,
                    earning_amount: existing.reward,
                }).catch(() => {});
                await refreshUserBadges(existing.acceptedById);
            }

            await addNotification(existing.requesterId, `Delivery completed for "${existing.item}"! Please rate your deliverer. ⭐`, requestId, 'success');
            return mapRequest(row);
        } catch (err) {
            console.error('Complete failed:', err);
            return null;
        }
    },

    /**
     * Cancel an open request.
     */
    async cancel(requestId, userId) {
        const existing = await requestsDB.getById(requestId);
        if (!existing || !['Open', 'Accepted'].includes(existing.status)) return null;

        // Strict Authorization: ONLY the original requester can cancel
        if (existing.requesterId !== userId) {
            console.warn('Unauthorized cancel attempt rejected for user:', userId);
            return null;
        }

        if (!isSupabaseConfigured) {
            return localStore.updateRequest(requestId, { status: 'Cancelled' });
        }

        try {
            const { data: row, error } = await supabase
                .from('requests')
                .update({
                    status: 'Cancelled',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', requestId)
                .eq('requester_id', userId)
                .select()
                .single();
            if (error) {
                console.error('Supabase cancel error:', error);
                return null;
            }
            return mapRequest(row);
        } catch (err) {
            console.error('Cancel failed:', err);
            return null;
        }
    },

    /**
     * Rate a completed delivery.
     */
    async rate(requestId, userId, rating) {
        const existing = await requestsDB.getById(requestId);
        if (!existing || existing.status !== 'Completed') return null;

        // Strict Authorization: ONLY the original requester can submit a review
        if (existing.requesterId !== userId) {
            console.warn('Unauthorized rating attempt rejected for user:', userId);
            return null;
        }

        if (!isSupabaseConfigured) {
            const updated = localStore.updateRequest(requestId, { rating });
            if (existing.acceptedById) {
                const deliverer = localStore.getUser(existing.acceptedById);
                if (deliverer) {
                    const newTotal = (deliverer.totalRatings || 0) + 1;
                    const newAvg = Number((((deliverer.rating || 5.0) * (deliverer.totalRatings || 0) + rating) / newTotal).toFixed(1));
                    localStore.updateUser(deliverer.id, { rating: newAvg, totalRatings: newTotal });
                }
            }
            return updated;
        }

        try {
            const { data: row, error } = await supabase
                .from('requests')
                .update({ rating })
                .eq('id', requestId)
                .eq('requester_id', userId)
                .select()
                .single();
            if (error) return localStore.updateRequest(requestId, { rating });

            if (existing.acceptedById) {
                await supabase.rpc('update_deliverer_rating', {
                    deliverer_id: existing.acceptedById,
                    new_rating: rating,
                }).catch(() => {});
                await refreshUserBadges(existing.acceptedById);
            }
            return mapRequest(row);
        } catch {
            return localStore.updateRequest(requestId, { rating });
        }
    },

    /**
     * Report a request.
     */
    async report(requestId, userId) {
        const existing = await requestsDB.getById(requestId);
        if (!existing) return null;
        const reportedBy = [...(existing.reportedBy || [])];
        if (reportedBy.includes(userId)) return existing;
        reportedBy.push(userId);

        if (!isSupabaseConfigured) {
            return localStore.updateRequest(requestId, { reportedBy });
        }

        try {
            const { data: row, error } = await supabase
                .from('requests')
                .update({ reported_by: reportedBy })
                .eq('id', requestId)
                .select()
                .single();
            if (error) return localStore.updateRequest(requestId, { reportedBy });
            return mapRequest(row);
        } catch {
            return localStore.updateRequest(requestId, { reportedBy });
        }
    }
};
