/**
 * @file MyRequestsPage - User's posted requests, deliveries, and saved bookmarks
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, Bookmark, ChevronRight, PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts';
import { requestsDB, usersDB } from '@/lib/db';
import { timeAgo } from '@/utils/timeAgo';
import { Button, StatusBadge, EmptyState, SkeletonList } from '@/components/ui';

export function MyRequestsPage({ initialTab = 'posted' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(initialTab);

  const [posted, setPosted] = useState([]);
  const [delivering, setDelivering] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [allReqs, bm] = await Promise.all([
          requestsDB.getByUser(user.id),
          usersDB.getBookmarkedRequests(user.id),
        ]);
        if (cancelled) return;
        setPosted(allReqs.filter((r) => r.requesterId === user.id));
        setDelivering(allReqs.filter((r) => r.acceptedById === user.id));
        setBookmarks(bm);
      } catch (err) {
        console.error('MyRequests load error:', err);
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  if (!user) return null;

  const current = tab === 'posted' ? posted : tab === 'delivering' ? delivering : bookmarks;

  const TABS = [
    { key: 'posted', label: `Posted (${posted.length})`, icon: <Package className="w-4 h-4" /> },
    { key: 'delivering', label: `Delivering (${delivering.length})`, icon: <Truck className="w-4 h-4" /> },
    { key: 'bookmarks', label: `Saved (${bookmarks.length})`, icon: <Bookmark className="w-4 h-4" /> },
  ];

  const emptyConfig = {
    posted: {
      icon: <Package className="w-8 h-8 text-emerald-500" />,
      title: 'No Broadcast Requests Yet',
      desc: 'Post your first errand request and a commuter will pick it up on their way!',
      actionLabel: 'Post Request',
      path: '/create',
    },
    delivering: {
      icon: <Truck className="w-8 h-8 text-blue-500" />,
      title: 'No Active Delivery Missions',
      desc: 'Browse the campus board to find deliveries that match your bus route.',
      actionLabel: 'Browse Board',
      path: '/feed',
    },
    bookmarks: {
      icon: <Bookmark className="w-8 h-8 text-amber-500" />,
      title: 'No Saved Dispatches',
      desc: 'Bookmark requests from the board to track or deliver later.',
      actionLabel: 'Browse Board',
      path: '/feed',
    },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            My Dispatch Activity
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your requests, in-transit missions, and saved bookmarks
          </p>
        </div>

        <Button onClick={() => navigate('/create')} variant="primary" className="text-xs self-start sm:self-center">
          <PlusCircle className="w-4 h-4" /> Post New Need
        </Button>
      </div>

      {/* ── Segmented Tab Switcher ── */}
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 rounded-2xl max-w-md mb-8">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-heading font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                active
                  ? 'bg-emerald-500 text-slate-950 border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── List Content ── */}
      {loading ? (
        <SkeletonList count={3} />
      ) : current.length === 0 ? (
        <div className="p-8 bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-[4px_4px_0_0_#0f172a]">
          <EmptyState
            icon={emptyConfig[tab].icon}
            title={emptyConfig[tab].title}
            desc={emptyConfig[tab].desc}
            action={
              <Button onClick={() => navigate(emptyConfig[tab].path)} variant="primary">
                {emptyConfig[tab].actionLabel}
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {current.map((req) => (
            <div
              key={req.id}
              onClick={() => navigate(`/request/${req.id}`)}
              className="p-5 bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-[3px_3px_0_0_#0f172a] hover:shadow-[5px_5px_0_0_#0f172a] dark:hover:shadow-[5px_5px_0_0_#10b981] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="truncate flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <StatusBadge status={req.status} />
                  <span className="font-mono text-[11px] text-slate-400">
                    {timeAgo(req.createdAt)}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-base text-slate-950 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                  {req.item}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300">{req.pickup}</span>
                  <span>&rarr;</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{req.dropoff}</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="text-right">
                  <div className="text-[10px] font-heading font-extrabold uppercase text-slate-400">
                    Bounty
                  </div>
                  <div className="font-heading font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                    ৳{req.reward}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
