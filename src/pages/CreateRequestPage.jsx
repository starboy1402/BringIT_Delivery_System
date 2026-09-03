/**
 * @file CreateRequestPage - Two-column form with live reactive card preview
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, PlusCircle, AlertCircle, Sparkles, MapPin, Eye } from 'lucide-react';
import { useAuth, useToast } from '@/contexts';
import { requestsDB } from '@/lib/db';
import { validateRequest } from '@/utils/validation';
import { Button, StatusBadge, UrgencyBadge } from '@/components/ui';
import { PICKUP_LOCATIONS, HALLS } from '@/constants';

const INPUT_STYLES =
  'w-full px-4 py-2.5 bg-white dark:bg-[#0d131f] border-2 border-slate-900/80 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-[2px_2px_0_0_#0f172a] dark:shadow-[2px_2px_0_0_#020617]';

export function CreateRequestPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Live preview state
  const [item, setItem] = useState('');
  const [pickup, setPickup] = useState(PICKUP_LOCATIONS[0]);
  const [dropoff, setDropoff] = useState(user?.hall || HALLS[0]);
  const [reward, setReward] = useState('70');
  const [urgency, setUrgency] = useState('Medium');
  const [details, setDetails] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setError('');

    const data = {
      item: item.trim(),
      pickup,
      dropoff,
      reward: Number(reward),
      urgency,
      details: details.trim(),
      requesterId: user.id,
      requesterName: user.name,
    };

    const { isValid, errors } = validateRequest(data);
    if (!isValid) {
      setError(Object.values(errors)[0]);
      return;
    }

    setSubmitting(true);
    try {
      const result = await requestsDB.create(data);
      if (!result) {
        setError('Failed to broadcast request. Check your connection or try again.');
        setSubmitting(false);
        return;
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
      return;
    }
    setSubmitting(false);

    showToast('Delivery request dispatched to campus feed! 🎉');
    navigate('/feed');
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <button
        onClick={() => navigate('/feed')}
        className="inline-flex items-center gap-1 text-xs font-heading font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 uppercase tracking-wider transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Return to Feed
      </button>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-[5px_5px_0_0_#0f172a] dark:shadow-[5px_5px_0_0_#020617]">
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-heading font-extrabold uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> New Campus Dispatch
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                Post Delivery Request
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Traveling students on the campus bus or rickshaw will see this on the feed.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-scale-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-heading font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                  Item Description *
                </label>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  className={INPUT_STYLES}
                  placeholder="e.g. Casio fx-991EX Calculator, Entacyd Box, Drafting Sheet"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-heading font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                    Pickup Location *
                  </label>
                  <select
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className={INPUT_STYLES}
                  >
                    {PICKUP_LOCATIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-heading font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                    Dropoff Hall *
                  </label>
                  <select
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    className={INPUT_STYLES}
                  >
                    {HALLS.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-heading font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                    Delivery Bounty (BDT) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-heading font-bold text-slate-400">
                      ৳
                    </span>
                    <input
                      type="number"
                      min="10"
                      max="5000"
                      value={reward}
                      onChange={(e) => setReward(e.target.value)}
                      className={`${INPUT_STYLES} pl-8 font-heading font-bold`}
                      required
                    />
                  </div>
                  <div className="flex gap-1.5 mt-1.5">
                    {[50, 70, 100, 150].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setReward(String(amt))}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-heading font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-800"
                      >
                        ৳{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-heading font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                    Urgency Level *
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                    {['Low', 'Medium', 'High'].map((u) => {
                      const active = urgency === u;
                      return (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setUrgency(u)}
                          className={`py-2 rounded-xl text-xs font-heading font-bold border-2 transition-all ${
                            active
                              ? u === 'High'
                                ? 'bg-rose-500 text-white border-slate-900 shadow-[2px_2px_0_0_#0f172a]'
                                : 'bg-emerald-500 text-slate-950 border-slate-900 shadow-[2px_2px_0_0_#0f172a]'
                              : 'bg-white dark:bg-[#0d131f] text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-800'
                          }`}
                        >
                          {u}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                  Extra Details & Shop Notes
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className={`${INPUT_STYLES} resize-none`}
                  placeholder="Specific pharmacy/store name, preferred brand, room number..."
                />
              </div>

              <div className="pt-3 flex gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 text-sm py-3"
                  disabled={submitting}
                >
                  <PlusCircle className="w-5 h-5" />
                  {submitting ? 'Broadcasting...' : 'Broadcast Request'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/feed')}
                  className="text-sm px-6"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Sticky Live Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-3">
          <div className="flex items-center gap-2 text-xs font-heading font-extrabold uppercase text-slate-400 tracking-wider">
            <Eye className="w-4 h-4 text-emerald-500" /> Live Feed Preview
          </div>

          <div className="p-6 bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-[5px_5px_0_0_#0f172a] dark:shadow-[5px_5px_0_0_#020617] space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 font-heading font-extrabold text-xs flex items-center justify-center border border-slate-900">
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'CU'}
                </div>
                <div>
                  <div className="font-heading font-bold text-sm text-slate-950 dark:text-white">
                    {user?.name || 'Your Name'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Just now • {user?.department || 'CUET'}
                  </div>
                </div>
              </div>

              <div className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border-2 border-slate-900 dark:border-emerald-500 text-emerald-900 dark:text-emerald-300 font-heading font-extrabold text-sm shadow-[2px_2px_0_0_#0f172a]">
                ৳{reward || 50}
              </div>
            </div>

            <h3 className="font-heading font-bold text-lg text-slate-950 dark:text-white leading-snug">
              {item || 'Item name will appear here...'}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
              {details || 'Any additional instructions, brand names, or specifics will appear here.'}
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
                <span className="font-bold text-slate-700 dark:text-slate-300 truncate">
                  {pickup}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="font-bold text-slate-700 dark:text-slate-300 truncate">
                  {dropoff}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusBadge status="Open" />
                <UrgencyBadge urgency={urgency} />
              </div>
              <span className="text-[11px] font-mono text-slate-400">Preview Mode</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
