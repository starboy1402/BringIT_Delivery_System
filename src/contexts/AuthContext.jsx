/**
 * @file Auth context (Supabase + LocalStore Demo Fallback)
 *
 * Manages authentication state using Supabase when configured,
 * or realistic student persona switching in Demo Mode.
 */

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { mapProfile } from '@/lib/db/helpers';
import { localStore } from '@/lib/db/localStore';

const AuthContext = createContext({
    user: null,
    loading: true,
    isSupabaseConfigured: false,
    demoUsers: [],
    signInWithGoogle: async () => { },
    signInWithDemo: (userId) => { },
    switchDemoUser: (userId) => { },
    signOut: async () => { },
    refreshUser: async () => { },
});

async function fetchProfile(userId) {
    if (!isSupabaseConfigured) {
        return localStore.getUser(userId);
    }
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) {
            return localStore.getUser(userId);
        }
        return mapProfile(data);
    } catch {
        return localStore.getUser(userId);
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = useCallback(async (userId) => {
        const profile = await fetchProfile(userId);
        setUser(profile || (isSupabaseConfigured ? null : localStore.getActiveUser()));
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!isSupabaseConfigured) {
            // Offline / Demo Mode: load active mock persona
            const demoUser = localStore.getActiveUser();
            setUser(demoUser);
            setLoading(false);
            return;
        }

        // Live Supabase Mode
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                loadProfile(session.user.id);
            } else {
                // If not logged in on live Supabase, check if a demo session was active
                const demoId = localStorage.getItem('bringit_active_demo_session');
                if (demoId) {
                    setUser(localStore.getUser(demoId));
                }
                setLoading(false);
            }
        }).catch(() => {
            setUser(localStore.getActiveUser());
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    if (session?.user) {
                        setTimeout(() => loadProfile(session.user.id), 0);
                    }
                } else if (event === 'SIGNED_OUT') {
                    localStorage.removeItem('bringit_active_demo_session');
                    setUser(null);
                    setLoading(false);
                }
            }
        );

        return () => subscription?.unsubscribe?.();
    }, [loadProfile]);

    const signInWithGoogle = useCallback(async () => {
        if (!isSupabaseConfigured) {
            // In demo mode, sign in as default student
            const defaultUser = localStore.getUsers()[0];
            setUser(defaultUser);
            return;
        }
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/feed',
                },
            });
            if (error) console.error('Google sign-in error:', error);
        } catch (err) {
            console.warn('OAuth redirect failed, falling back to demo login:', err);
            const defaultUser = localStore.getUsers()[0];
            setUser(defaultUser);
        }
    }, []);

    const signInWithDemo = useCallback((userId) => {
        const target = localStore.getUser(userId) || localStore.getUsers()[0];
        localStore.setActiveUser(target.id);
        localStorage.setItem('bringit_active_demo_session', target.id);
        setUser(target);
    }, []);

    const switchDemoUser = useCallback((userId) => {
        signInWithDemo(userId);
    }, [signInWithDemo]);

    const signOut = useCallback(async () => {
        if (isSupabaseConfigured) {
            try { await supabase.auth.signOut(); } catch {}
        }
        localStorage.removeItem('bringit_active_demo_session');
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        if (!user) return;
        if (!isSupabaseConfigured) {
            const fresh = localStore.getUser(user.id);
            if (fresh) setUser(fresh);
            return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const profile = await fetchProfile(session.user.id);
            if (profile) setUser(profile);
        } else {
            const fresh = localStore.getUser(user.id);
            if (fresh) setUser(fresh);
        }
    }, [user]);

    const value = useMemo(() => ({
        user,
        loading,
        isSupabaseConfigured,
        demoUsers: localStore.getUsers(),
        signInWithGoogle,
        signInWithDemo,
        switchDemoUser,
        signOut,
        refreshUser,
    }), [user, loading, signInWithGoogle, signInWithDemo, switchDemoUser, signOut, refreshUser]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
