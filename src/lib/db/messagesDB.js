/**
 * @file Messages database module (Supabase)
 *
 * Handles the in-app chat between requester and deliverer.
 * Messages are scoped to a specific request.
 * All functions are async.
 */

import { supabase } from '@/lib/supabase';
import { mapMessage, mapRequest } from './helpers';
import { addNotification } from './notificationsDB';

export const messagesDB = {
    /**
     * Get all messages for a specific request, sorted oldest-first
     * so the chat reads top-to-bottom chronologically.
     *
     * @param {string} requestId
     * @returns {Promise<Array>}
     */
    async getByRequest(requestId) {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('request_id', requestId)
            .order('created_at', { ascending: true });
        if (error) { console.error('getByRequest error:', error); return []; }
        return (data || []).map(mapMessage);
    },

    /**
     * Send a new message in a request's chat.
     * Automatically notifies the other party.
     *
     * @param {Object} data - { requestId, senderId, senderName, text }
     * @returns {Promise<Object>} The created message
     */
    async send(data) {
        const { data: row, error } = await supabase
            .from('messages')
            .insert({
                request_id: data.requestId,
                sender_id: data.senderId,
                sender_name: data.senderName,
                text: data.text,
            })
            .select()
            .single();
        if (error) { console.error('send error:', error); return null; }

        // Notify the other party in the conversation
        const { data: reqRow } = await supabase
            .from('requests')
            .select('*')
            .eq('id', data.requestId)
            .single();

        if (reqRow) {
            const request = mapRequest(reqRow);
            const recipientId =
                request.requesterId === data.senderId
                    ? request.acceptedById
                    : request.requesterId;

            if (recipientId) {
                await addNotification(
                    recipientId,
                    `${data.senderName} sent you a message about "${request.item}"`,
                    data.requestId,
                    'info'
                );
            }
        }

        return mapMessage(row);
    },
};
