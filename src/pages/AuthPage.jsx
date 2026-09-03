/**
 * @file AuthPage - BringIT Student Authentication & 1-Click Demo Login
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Sparkles, UserCheck, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';
import { useAuth, useToast } from '@/contexts';
import { Button } from '@/components/ui/Button';

export function AuthPage() {
  const { signInWithGoogle, signInWithDemo, demoUsers, isSupabaseConfigured } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('demo'); // 'demo' or 'credentials'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleDemoSelect = (userId, name) => {
    signInWithDemo(userId);
    showToast(`Logged in as ${name}! Welcome to BringIT. 🎉`);
    navigate('/feed');
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    // Fast mock login with provided email
    const defaultUser = demoUsers[0];
    signInWithDemo(defaultUser.id);
    showToast(`Signed in successfully with ${email}`);
    navigate('/feed');
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-12 page-enter">
      <div className="w-full max-w-lg p-6 sm:p-8 bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-[6px_6px_0_0_#0f172a] dark:shadow-[6px_6px_0_0_#020617]">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl border-2 border-slate-900 flex items-center justify-center mx-auto mb-3 shadow-[3px_3px_0_0_#0f172a]">
            <Package className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Welcome to Bring<span className="text-emerald-500">IT</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            CUET Peer-to-Peer Logistics & Courier Dispatch
          </p>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('demo')}
            className={`py-2 text-xs font-heading font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'demo'
                ? 'bg-emerald-500 text-slate-950 border border-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            1-Click Personas
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`py-2 text-xs font-heading font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'credentials'
                ? 'bg-slate-950 text-white dark:bg-slate-800 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Student Login
          </button>
        </div>

        {/* Tab 1: 1-Click Demo Personas */}
        {activeTab === 'demo' && (
          <div className="space-y-3">
            <div className="text-[11px] font-heading font-bold uppercase text-slate-400 tracking-wider">
              Select a test account to explore both sides:
            </div>

            <div className="space-y-2">
              {demoUsers.slice(0, 3).map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleDemoSelect(u.id, u.name)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-2 border-slate-900/60 dark:border-slate-800 hover:border-emerald-500 rounded-xl transition-all flex items-center justify-between text-left group"
                >
                  <div className="truncate">
                    <div className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      {u.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {u.department} {u.batch} • {u.hall} • {u.deliveriesCompleted} deliveries
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors flex-shrink-0">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
            </div>

            <p className="text-[11px] text-center text-slate-400 pt-2">
              ⚡ Allows instant testing of creating requests, accepting missions, and live chat.
            </p>
          </div>
        )}

        {/* Tab 2: Standard Login & Google OAuth */}
        {activeTab === 'credentials' && (
          <div className="space-y-4">
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-heading font-extrabold uppercase text-slate-500 mb-1">
                  Student Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="u1904001@student.cuet.ac.bd"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-900/60 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading font-extrabold uppercase text-slate-500 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-900/60 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full text-xs py-2.5">
                Sign In with University ID
              </Button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400">Or</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            {/* Google OAuth button */}
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 font-heading font-bold text-xs text-slate-800 dark:text-slate-100 shadow-[2px_2px_0_0_#0f172a] transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google OAuth
            </button>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Restricted to CUET students & campus members
          </div>
        </div>

      </div>
    </main>
  );
}
