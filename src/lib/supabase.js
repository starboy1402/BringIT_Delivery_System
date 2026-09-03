/**
 * @file Supabase client
 *
 * Creates a Supabase client instance when environment variables are provided.
 * When variables are absent, initializes a fallback client so the app runs in
 * offline/demo mode without throwing fatal crashes.
 */

import { createClient } from '@supabase/supabase-js';

const rawUrl =
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL;

const rawKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
    rawUrl &&
    rawKey &&
    !rawUrl.includes('your-project-id') &&
    rawUrl.startsWith('http')
);

const supabaseUrl = isSupabaseConfigured
    ? rawUrl
    : 'https://placeholder.supabase.co';

const supabaseAnonKey = isSupabaseConfigured
    ? rawKey
    : 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        storageKey: 'bringit-auth',
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});
