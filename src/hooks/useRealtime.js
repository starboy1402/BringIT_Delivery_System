import { useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Hook to subscribe to realtime changes for a specific table and filter.
 * 
 * @param {string} channelName - Unique name for the channel
 * @param {Object} config - { event: 'INSERT'|'UPDATE'|'DELETE'|'*', table: string, filter: string }
 * @param {Function} callback - Function to run when a change occurs
 */
export function useRealtime(channelName, { event = '*', table, filter }, callback) {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        if (!isSupabaseConfigured) return;

        try {
            const channel = supabase
                .channel(channelName)
                .on(
                    'postgres_changes',
                    { event, schema: 'public', table, filter },
                    (payload) => callbackRef.current?.(payload)
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        } catch (err) {
            console.warn('Realtime subscription error:', err);
        }
    }, [channelName, event, table, filter]);
}
