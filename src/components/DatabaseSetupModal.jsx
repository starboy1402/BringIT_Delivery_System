/**
 * @file DatabaseSetupModal - Backend status, Option B setup instructions, and demo personas
 */

import { useState } from 'react';
import { Database, Copy, Check, ExternalLink, Sparkles, UserCheck, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '@/contexts';
import { Button } from '@/components/ui/Button';

export function DatabaseSetupModal({ isOpen, onClose }) {
  const { isSupabaseConfigured, user, demoUsers, switchDemoUser } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyEnv = () => {
    const envTemplate = `VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-key-here`;
    navigator.clipboard.writeText(envTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-[8px_8px_0_0_#0f172a] dark:shadow-[8px_8px_0_0_#020617] max-w-xl w-full p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 border-2 border-slate-900 dark:border-emerald-500 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
              Backend Status & Setup (Option B)
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {isSupabaseConfigured ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Supabase Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Interactive Demo Mode Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-4 mb-6 text-sm text-slate-600 dark:text-slate-300">
          <p>
            The app currently runs in <strong>resilient interactive mode</strong> with full CUET mock campus data, requests, and chat.
          </p>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-2 border-slate-900/30 dark:border-slate-800 rounded-xl space-y-3">
            <div className="font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Option B: Connect a Fresh Supabase Project
            </div>
            <ol className="list-decimal list-inside space-y-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <li>
                Create a free project at{' '}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-bold underline inline-flex items-center gap-0.5"
                >
                  supabase.com <ExternalLink className="w-3 h-3" />
                </a>.
              </li>
              <li>
                Go to the <strong>SQL Editor</strong> tab in your Supabase dashboard, open the file{' '}
                <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">supabase_setup.sql</code> in your repo, paste it, and click <strong>Run</strong>.
              </li>
              <li>
                Go to <strong>Project Settings &gt; API</strong> and copy your <code>Project URL</code> and <code>anon public key</code>.
              </li>
              <li>
                Paste them into a <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">.env.local</code> file in this folder and in Vercel project environment variables.
              </li>
            </ol>
          </div>
        </div>

        {/* Quick Demo Personas */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
          <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-500" /> Switch Demo Persona
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {demoUsers.slice(0, 4).map((u) => {
              const isActive = user?.id === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => switchDemoUser(u.id)}
                  className={`p-2.5 text-left rounded-xl border-2 transition-all flex items-center justify-between ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 font-bold shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {u.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {u.hall.split(' ')[0]} • {u.deliveriesCompleted} deliveries
                    </div>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-3">
          <Button variant="secondary" onClick={handleCopyEnv} className="w-full sm:w-auto text-xs">
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied .env Template!' : 'Copy .env Template'}
          </Button>
          <Button variant="primary" onClick={onClose} className="w-full sm:w-auto text-xs">
            Close & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
