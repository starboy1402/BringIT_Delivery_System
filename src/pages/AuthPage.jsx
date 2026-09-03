/**
 * @file AuthPage - Accessible, production campus login & registration
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Mail, Lock, User, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth, useToast } from '@/contexts';
import { Button } from '@/components/ui/Button';

export function AuthPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInWithDemo } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        showToast('Welcome back to BringIT! 🚀');
        navigate('/feed');
      } else {
        await signUpWithEmail(email, password, { name });
        showToast('Account created successfully! Check your email to confirm or sign in. 🎉');
        navigate('/feed');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google Auth Error:', err);
      setError(
        err.message?.includes('provider is not enabled')
          ? 'Google Sign-In is not enabled yet in your Supabase dashboard. Enable Google under Authentication > Providers in Supabase with your Google Cloud credentials.'
          : err.message || 'Google sign-in failed. Please check your Supabase settings or use student email sign-in.'
      );
    }
  };

  const handleGuestDemo = () => {
    signInWithDemo('usr-101');
    showToast('Logged in as Guest Student! Exploring BringIT. 🚀');
    navigate('/feed');
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-12 page-enter">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-[6px_6px_0_0_#0f172a] dark:shadow-[6px_6px_0_0_#020617]">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl border-2 border-slate-900 flex items-center justify-center mx-auto mb-3 shadow-[3px_3px_0_0_#0f172a]">
            <Package className="w-6 h-6 text-slate-950 stroke-[2.5]" aria-hidden="true" />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            {mode === 'signin' ? 'Sign in to BringIT' : 'Create Student Account'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            CUET Peer-to-Peer Logistics & Courier Dispatch
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 rounded-xl" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signin'}
            onClick={() => { setMode('signin'); setError(null); }}
            className={`py-2 text-xs font-heading font-bold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-slate-950 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            onClick={() => { setMode('signup'); setError(null); }}
            className={`py-2 text-xs font-heading font-bold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-slate-950 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div
            role="alert"
            className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-scale-in"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {mode === 'signup' && (
            <div>
              <label
                htmlFor="auth-name"
                className="block text-xs font-heading font-extrabold uppercase text-slate-600 dark:text-slate-300 mb-1"
              >
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tanvir Rahman"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-900/60 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="block text-xs font-heading font-extrabold uppercase text-slate-600 dark:text-slate-300 mb-1"
            >
              Student Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="u1904001@student.cuet.ac.bd"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-900/60 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="block text-xs font-heading font-extrabold uppercase text-slate-600 dark:text-slate-300 mb-1"
            >
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                id="auth-password"
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-900/60 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full py-3 text-sm font-heading font-bold"
          >
            {loading ? 'Authenticating...' : mode === 'signin' ? 'Sign In to Campus Account' : 'Register Account'}
          </Button>
        </form>

        <div className="relative flex py-3 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800" aria-hidden="true" />
          <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400">Or</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800" aria-hidden="true" />
        </div>

        {/* Google OAuth button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 font-heading font-bold text-xs text-slate-800 dark:text-slate-100 shadow-[2px_2px_0_0_#0f172a] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google OAuth
        </button>

        {/* Subtle Guest Preview Option */}
        <div className="mt-5 text-center">
          <button
            onClick={handleGuestDemo}
            className="text-[11px] font-heading font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1 focus:outline-none focus-visible:underline"
          >
            <span>Visiting as a guest? Preview as Guest Student</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
            Restricted to CUET students & campus members
          </div>
        </div>

      </div>
    </main>
  );
}
