/**
 * @file LeaderboardPage - Gamified Podium & Campus Courier Hall of Fame
 */

import { useState, useEffect } from 'react';
import { Star, Trophy, Award, Medal, Flame } from 'lucide-react';
import { usersDB } from '@/lib/db';
import { EmptyState, SkeletonList } from '@/components/ui';
import { Avatar } from '@/components/ui/Avatar';

export function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await usersDB.getLeaderboard();
        if (!cancelled) setLeaderboard(data);
      } catch (err) {
        console.error('Leaderboard load error:', err);
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-center gap-4 h-48 items-end mb-12">
          <div className="w-24 h-32 bg-slate-200 dark:bg-slate-800 rounded-t-xl animate-pulse" />
          <div className="w-24 h-44 bg-slate-300 dark:bg-slate-700 rounded-t-xl animate-pulse" />
          <div className="w-24 h-28 bg-slate-200 dark:bg-slate-800 rounded-t-xl animate-pulse" />
        </div>
        <SkeletonList count={5} />
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 page-enter">
        <EmptyState
          icon={<Trophy className="w-8 h-8 text-amber-500" />}
          title="No Deliveries Logged Yet"
          desc="Be the first to accept an errand and take the #1 spot on the CUET Leaderboard!"
        />
      </div>
    );
  }

  const topThree = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  const podiumOrder = [
    topThree[1]
      ? {
          ...topThree[1],
          rank: 2,
          height: 'h-36',
          bg: 'bg-slate-200 dark:bg-slate-800',
          border: 'border-slate-400',
          badgeText: 'Silver Courier',
          text: 'text-slate-950 dark:text-white',
        }
      : null,
    topThree[0]
      ? {
          ...topThree[0],
          rank: 1,
          height: 'h-48',
          bg: 'bg-amber-300 dark:bg-amber-500/20',
          border: 'border-amber-500',
          badgeText: 'Gold Courier',
          text: 'text-amber-950 dark:text-amber-300',
        }
      : null,
    topThree[2]
      ? {
          ...topThree[2],
          rank: 3,
          height: 'h-28',
          bg: 'bg-orange-200 dark:bg-orange-900/30',
          border: 'border-orange-400',
          badgeText: 'Bronze Courier',
          text: 'text-orange-950 dark:text-orange-300',
        }
      : null,
  ].filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 page-enter">
      
      {/* ── Page Header ── */}
      <div className="text-center max-w-xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/50 border-2 border-slate-900 dark:border-amber-500 text-amber-900 dark:text-amber-300 text-xs font-heading font-extrabold uppercase mb-3">
          <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          Campus Courier Hall of Fame
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          Top Campus Deliverers
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Ranked by completed dispatches, campus reliability score, and student reviews.
        </p>
      </div>

      {/* ── The 3D Neo-Brutalist Podium ── */}
      <div className="flex justify-center items-end gap-3 sm:gap-6 mb-16 pt-6">
        {podiumOrder.map((user) => (
          <div
            key={user.id}
            className="flex flex-col items-center relative w-28 sm:w-44 animate-slide-up"
          >
            {/* Avatar & Crown/Award */}
            <div className="relative mb-3 flex flex-col items-center">
              {user.rank === 1 && (
                <div className="absolute -top-9 animate-bounce">
                  <Award className="w-8 h-8 text-amber-500 fill-amber-500 drop-shadow" />
                </div>
              )}
              <div className="p-1 rounded-2xl bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 shadow-[3px_3px_0_0_#0f172a] dark:shadow-[3px_3px_0_0_#020617]">
                <Avatar name={user.name} size={user.rank === 1 ? 'xl' : 'lg'} />
              </div>
            </div>

            {/* Name and deliver counts */}
            <div className="text-center mb-3 w-full px-1">
              <div className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                {user.name.split(' ')[0]}
              </div>
              <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {user.deliveriesCompleted} dispatches
              </div>
              <div className="text-[10px] text-slate-400">
                {user.rating} ★ ({user.totalRatings} reviews)
              </div>
            </div>

            {/* Podium Pedestal */}
            <div
              className={`w-full rounded-t-2xl border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0_0_#0f172a] dark:shadow-[4px_4px_0_0_#020617] flex flex-col items-center justify-start pt-3 ${user.bg} ${user.height}`}
            >
              <span className="font-heading font-black text-3xl sm:text-4xl text-slate-950 dark:text-white">
                #{user.rank}
              </span>
              <span className="text-[10px] uppercase font-heading font-extrabold text-slate-500 dark:text-slate-400 tracking-wider">
                {user.badgeText}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── The Full Rankings Table ── */}
      <div className="max-w-4xl mx-auto space-y-3">
        <div className="flex items-center justify-between px-2 mb-2 text-xs font-heading font-extrabold text-slate-400 uppercase tracking-wider">
          <span>Rank & Courier</span>
          <span className="hidden sm:inline">Stats</span>
        </div>

        {others.map((u, idx) => {
          const rank = idx + 4;
          return (
            <div
              key={u.id}
              className="p-4 bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-[3px_3px_0_0_#0f172a] dark:shadow-[3px_3px_0_0_#020617] hover:shadow-[5px_5px_0_0_#0f172a] dark:hover:shadow-[5px_5px_0_0_#10b981] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center gap-4"
            >
              {/* Rank Shield */}
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-700 flex items-center justify-center font-heading font-extrabold text-sm text-slate-700 dark:text-slate-300 flex-shrink-0">
                #{rank}
              </div>

              <Avatar name={u.name} size="md" />

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="font-heading font-bold text-sm sm:text-base text-slate-950 dark:text-white truncate">
                  {u.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {u.department} {u.batch} • {u.hall}
                </div>
              </div>

              {/* Metrics */}
              <div className="hidden sm:flex items-center gap-6 pr-4 border-r border-slate-200 dark:border-slate-800 text-right">
                <div>
                  <div className="text-[10px] uppercase font-heading font-extrabold text-slate-400">
                    Rating
                  </div>
                  <div className="flex items-center justify-end gap-1 font-heading font-bold text-xs text-slate-900 dark:text-white">
                    {u.rating} <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-heading font-extrabold text-slate-400">
                    Total Earned
                  </div>
                  <div className="font-heading font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    ৳{u.totalEarnings}
                  </div>
                </div>
              </div>

              {/* Deliveries count */}
              <div className="text-right flex-shrink-0">
                <div className="font-heading font-black text-xl text-slate-950 dark:text-white leading-none">
                  {u.deliveriesCompleted}
                </div>
                <div className="text-[10px] uppercase font-heading font-extrabold text-slate-400">
                  Deliveries
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
