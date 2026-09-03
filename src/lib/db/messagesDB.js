/**
 * @file Messages database module (Supabase + LocalStore Fallback)
 *
 * Handles the in-app chat between requester and deliverer.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { mapMessage, mapRequest } from './helpers';
import { addNotification } from './notificationsDB';
import { localStore } from './localStore';

export const messagesDB = {
    /**
     * Get all messages for a specific request.
     */
    async getByRequest(requestId) {
        if (!isSupabaseConfigured) {
            return localStore.getMessages(requestId);
        }

        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('request_id', requestId)
                .order('created_at', { ascending: true });
            if (error) return localStore.getMessages(requestId);
            return (data || []).map(mapMessage);
        } catch {
            return localStore.getMessages(requestId);
        }
    },

    /**
     * Send a new message in a request's chat.
     */
    async send(data) {
        if (!isSupabaseConfigured) {
            const msg = localStore.createMessage(data);
            const req = localStore.getRequestById(data.requestId);
            if (req) {
                const recipientId = req.requesterId === data.senderId ? req.acceptedById : req.requesterId;
                if (recipientId) {
                    await addNotification(
                        recipientId,
                        `${data.senderName} sent you a message about "${req.item}"`,
                        data.requestId,
                        'info'
                    );
                }
            }
            return msg;
        }

        try {
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
            if (error) {
                return localStore.createMessage(data);
            }

            const { data: reqRow } = await supabase
                .from('requests')
                .select('*')
                .eq('id', data.requestId)
                .single();

            if (reqRow) {
                const request = mapRequest(reqRow);
                const recipientId = request.requesterId === data.senderId ? request.acceptedById : request.requesterId;
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
        } catch {
            return localStore.createMessage(data);
        }
    },
};
