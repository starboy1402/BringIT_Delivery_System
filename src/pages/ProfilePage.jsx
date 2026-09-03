/**
 * @file ProfilePage - Campus Courier ID Card & Dispatch History
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Package, Check, Truck, Edit3, MapPin, Award, Phone, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAuth, useToast } from '@/contexts';
import { usersDB, requestsDB } from '@/lib/db';
import { Button, StatusBadge, SkeletonProfile, SkeletonList } from '@/components/ui';
import { Avatar } from '@/components/ui/Avatar';
import { HALLS } from '@/constants';

const INPUT_STYLES =
  'w-full px-3.5 py-2 bg-white dark:bg-[#0d131f] border-2 border-slate-900/80 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none';

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [freshUser, setFreshUser] = useState(user);
  const [completedDeliveries, setCompletedDeliveries] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [profile, reqs] = await Promise.all([
          usersDB.getUser(user.id),
          requestsDB.getByUser(user.id),
        ]);
        if (cancelled) return;
        setFreshUser(profile || user);
        setCompletedDeliveries(reqs.filter((r) => r.acceptedById === user.id && r.status === 'Completed'));
        setActiveDeliveries(reqs.filter((r) => r.acceptedById === user.id && ['Accepted', 'InProgress'].includes(r.status)));
      } catch (err) {
        console.error('Profile load error:', err);
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <SkeletonProfile />
        <div className="space-y-4">
          <SkeletonList count={2} />
        </div>
      </div>
    );
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    await usersDB.updateProfile(user.id, {
      phone: form.get('phone'),
      hall: form.get('hall'),
    });
    await refreshUser();
    setSaving(false);
    setEditing(false);
    showToast('Profile updated successfully!');
  };

  const STAT_CARDS = [
    {
      value: freshUser.deliveriesCompleted,
      label: 'Delivered',
      badge: 'Courier Trips',
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      value: freshUser.requestsPosted,
      label: 'Broadcasts',
      badge: 'Needs Posted',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      value: `৳${freshUser.totalEarnings}`,
      label: 'Earned',
      badge: 'Campus Bounty',
      color: 'text-fuchsia-600 dark:text-fuchsia-400',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 page-enter">
      
      {/* ── Campus Dispatcher ID Card ── */}
      <div className="p-6 sm:p-8 bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-[6px_6px_0_0_#0f172a] dark:shadow-[6px_6px_0_0_#020617] mb-8 space-y-6">
        
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-900 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-4">
            <div className="p-1 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-900 shadow-[3px_3px_0_0_#0f172a]">
              <Avatar name={freshUser.name} size="xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                  {freshUser.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-heading font-extrabold border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified CUETian
                </span>
              </div>
              <p className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 mt-1">
                ID: {freshUser.studentId || '1904001'} • {freshUser.department} {freshUser.batch} • {freshUser.hall}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span>{freshUser.rating || '5.0'}</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  ({freshUser.totalRatings || 0} reviews)
                </span>
                {freshUser.phone && (
                  <span className="text-[11px] text-slate-500 ml-2 flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3" /> {freshUser.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={() => setEditing(!editing)}
            className="text-xs self-start sm:self-center"
          >
            <Edit3 className="w-3.5 h-3.5" /> {editing ? 'Close Edit' : 'Edit Profile'}
          </Button>
        </div>

        {/* Edit Details Form */}
        {editing && (
          <form
            onSubmit={handleEditSubmit}
            className="p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-900/40 dark:border-slate-800 rounded-xl space-y-3 animate-slide-up"
          >
            <div className="font-heading font-bold text-xs uppercase text-slate-400">
              Update Contact & Hall
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-heading font-bold uppercase text-slate-500 mb-1">
                  Phone (bKash/Contact)
                </label>
                <input
                  name="phone"
                  defaultValue={freshUser.phone}
                  className={INPUT_STYLES}
                  placeholder="01712345678"
                />
              </div>
              <div>
                <label className="block text-[11px] font-heading font-bold uppercase text-slate-500 mb-1">
                  Current Hall
                </label>
                <select name="hall" defaultValue={freshUser.hall} className={INPUT_STYLES}>
                  {HALLS.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="submit" variant="primary" disabled={saving} className="text-xs">
                {saving ? 'Saving...' : 'Save Updates'}
              </Button>
            </div>
          </form>
        )}

        {/* Stats Bento Tiles */}
        <div className="grid grid-cols-3 gap-3">
          {STAT_CARDS.map((s, i) => (
            <div
              key={i}
              className="p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-900/40 dark:border-slate-800 rounded-xl text-center"
            >
              <div className={`font-heading font-extrabold text-2xl sm:text-3xl ${s.color}`}>
                {s.value}
              </div>
              <div className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-slate-400 mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Badges and Achievements */}
        {freshUser.badges?.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-heading font-extrabold uppercase text-slate-400 tracking-wider">
              Earned Badges
            </div>
            <div className="flex flex-wrap gap-2">
              {freshUser.badges.map((b) => (
                <div
                  key={b}
                  className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400/80 rounded-xl text-amber-900 dark:text-amber-300 text-xs font-heading font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  {b}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Delivery Activity Tabs ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-slate-800 pb-2">
          <h2 className="font-heading font-extrabold text-lg text-slate-950 dark:text-white uppercase tracking-wider">
            Recent Delivery Missions
          </h2>
          <span className="font-mono text-xs text-slate-400">
            {completedDeliveries.length + activeDeliveries.length} Total
          </span>
        </div>

        {activeDeliveries.length === 0 && completedDeliveries.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-[4px_4px_0_0_#0f172a] text-slate-400 text-xs">
            <Truck className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No delivery missions yet. Check the board to pick up your first campus errand!
          </div>
        ) : (
          <div className="space-y-3">
            {[...activeDeliveries, ...completedDeliveries].map((req) => (
              <div
                key={req.id}
                onClick={() => navigate(`/request/${req.id}`)}
                className="p-4 bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-xl shadow-[3px_3px_0_0_#0f172a] hover:shadow-[5px_5px_0_0_#0f172a] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="truncate pr-4">
                  <div className="font-heading font-bold text-sm text-slate-950 dark:text-white truncate">
                    {req.item}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {req.pickup} &rarr; {req.dropoff}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="font-heading font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    ৳{req.reward}
                  </div>
                  <StatusBadge status={req.status} />
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}