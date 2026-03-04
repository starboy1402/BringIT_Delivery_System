/**
 * @file Auth context (Supabase + Google OAuth)
 *
 * Manages authentication state using Supabase.
 * Listens to auth state changes and fetches the user's profile.
 *
 * Usage: const { user, loading, signInWithGoogle, signOut, refreshUser } = useAuth();
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { mapProfile } from '@/lib/db/helpers';

const AuthContext = createContext({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    signOut: async () => { },
    refreshUser: async () => { },
});

/**
 * Fetch the user's profile from the profiles table.
 * Returns the camelCase-mapped profile, or null.
 */
async function fetchProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error) {
        console.error('fetchProfile error:', error);
        return null;
    }
    return mapProfile(data);
}

/** Wrap your app with this to provide authentication state. */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Helper: load profile and update state
    const loadProfile = async (userId) => {
        const profile = await fetchProfile(userId);
        setUser(profile);
        setLoading(false);
    };

    useEffect(() => {
        // 1. Check existing session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                loadProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // 2. Listen for future auth changes
        // IMPORTANT: Do NOT call Supabase queries inside this callback
        // (causes deadlocks with token refresh). Instead, just set a flag
        // and call loadProfile outside.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log('[Auth]', event, session?.user?.id ?? 'no user');
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    if (session?.user) {
                        // Use setTimeout to escape the callback before making Supabase calls
                        setTimeout(() => loadProfile(session.user.id), 0);
                    }
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setLoading(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    /**
     * Start the Google OAuth flow.
     * Supabase will redirect to Google, then back to our app.
     */
    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/feed',
            },
        });
        if (error) console.error('Google sign-in error:', error);
    };

    /** Sign out and clear user state. */
    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    /** Re-fetch the user's profile from the database. */
    const refreshUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const profile = await fetchProfile(session.user.id);
            if (profile) setUser(profile);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

/** Hook to access auth state and actions from any component. */
export const useAuth = () => useContext(AuthContext);
