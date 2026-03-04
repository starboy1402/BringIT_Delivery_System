/**
 * @file LeaderboardPage - Top deliverers ranked by performance
 *
 * Public page — no auth required. Uses new db imports.
 */

import { useState, useEffect } from 'react';
import { Star, Trophy } from 'lucide-react';
import { usersDB } from '@/lib/db';
import { Card, EmptyState, Skeleton } from '@/components/ui';
import { Avatar } from '@/components/ui/Avatar';

export function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await usersDB.getLeaderboard();
        if (!cancelled) { setLeaderboard(data); }
      } catch (err) {
        console.error('Leaderboard load error:', err);
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const getRankStyle = (idx) => {
    if (idx === 0) return { bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800', badge: '🥇', ring: 'ring-2 ring-yellow-400', color: 'green' };
    if (idx === 1) return { bg: 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600', badge: '🥈', ring: 'ring-2 ring-gray-300', color: 'gray' };
    if (idx === 2) return { bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800', badge: '🥉', ring: 'ring-2 ring-orange-300', color: 'green' };
    return { bg: '', badge: `#${idx + 1}`, ring: '', color: 'green' };
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 page-enter">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Leaderboard</h2>
        <p className="text-gray-500 dark:text-gray-400">Top deliverers in the CUET community</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : leaderboard.length === 0 ? (
        <EmptyState
          icon={<Trophy className="w-8 h-8" />}
          title="No deliveries yet"
          desc="Be the first to make a delivery and top the leaderboard!"
        />
      ) : (
        <div className="space-y-3">
          {leaderboard.map((u, idx) => {
            const style = getRankStyle(idx);
            return (
              <Card key={u.id} className={`${style.bg} hover:shadow-md transition-all`}>
                <div className="p-5 flex items-center gap-4">
                  {/* Rank */}
                  <div className="text-2xl font-bold w-10 text-center flex-shrink-0">
                    {idx < 3 ? style.badge : <span className="text-gray-400 dark:text-gray-500 text-lg">{style.badge}</span>}
                  </div>

                  {/* Avatar */}
                  <div className={`flex-shrink-0 ${style.ring} rounded-full`}>
                    <Avatar name={u.name} size="md" color={style.color} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 dark:text-white">{u.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {u.department} {u.batch} • {u.hall}
                    </div>
                    {u.badges?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {u.badges.slice(0, 3).map((b) => (
                          <span key={b} className="text-[10px] px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full font-medium">
                            🏅 {b}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-center hidden sm:block">
                      <div className="text-xs text-gray-400 dark:text-gray-500">Rating</div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-gray-900 dark:text-white">{u.rating}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-400 dark:text-gray-500">Deliveries</div>
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">{u.deliveriesCompleted}</div>
                    </div>
                    <div className="text-center hidden sm:block">
                      <div className="text-xs text-gray-400 dark:text-gray-500">Earned</div>
                      <div className="font-bold text-gray-700 dark:text-gray-200">৳{u.totalEarnings}</div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
