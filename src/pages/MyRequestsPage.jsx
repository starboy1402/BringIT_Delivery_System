/**
 * @file MyRequestsPage - User's posted requests, deliveries, and bookmarks
 *
 * Accepts initialTab prop from route definition.
 * Uses useNavigate() for routing.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Package, Truck, Bookmark, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '@/contexts';
import { requestsDB, usersDB } from '@/lib/db';
import { timeAgo } from '@/utils/timeAgo';
import { Button, Card, StatusBadge, EmptyState, StarRating, Skeleton } from '@/components/ui';

export function MyRequestsPage({ initialTab = 'posted' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(initialTab);

  // Async state
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
    { key: 'posted', label: `Requests (${posted.length})`, icon: <Package className="w-4 h-4" /> },
    { key: 'delivering', label: `Deliveries (${delivering.length})`, icon: <Truck className="w-4 h-4" /> },
    { key: 'bookmarks', label: `Saved (${bookmarks.length})`, icon: <Bookmark className="w-4 h-4" /> },
  ];

  const emptyConfig = {
    posted: { icon: <Package className="w-8 h-8" />, title: 'No requests yet', desc: 'Post your first delivery request!', actionLabel: 'Post Request', path: '/create' },
    delivering: { icon: <Truck className="w-8 h-8" />, title: 'No deliveries yet', desc: 'Accept a delivery from the feed to get started.', actionLabel: 'Browse Feed', path: '/feed' },
    bookmarks: { icon: <Bookmark className="w-8 h-8" />, title: 'No saved requests', desc: 'Bookmark requests from the feed to save them here.', actionLabel: 'Browse Feed', path: '/feed' },
  };

  const getStatusColor = (status) => {
    const colors = {
      Open: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      Completed: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      Cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    };
    return colors[status] || 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 page-enter">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Activity</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Track your requests, deliveries, and saved items</p>

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-6 max-w-xl overflow-x-auto" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            role="tab"
            aria-selected={tab === t.key}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap px-3 ${tab === t.key
              ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : current.length === 0 ? (
        <EmptyState
          icon={emptyConfig[tab].icon}
          title={emptyConfig[tab].title}
          desc={emptyConfig[tab].desc}
          action={<Button onClick={() => navigate(emptyConfig[tab].path)}>{emptyConfig[tab].actionLabel}</Button>}
        />
      ) : (
        <div className="space-y-3">
          {current.map((req) => (
            <Card key={req.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => navigate(`/request/${req.id}`)}>
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${getStatusColor(req.status)}`}>
                    {req.status === 'Completed' ? <Check className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 dark:text-white">{req.item}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {req.pickup} → {req.dropoff}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{timeAgo(req.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-green-700 dark:text-green-400 font-bold text-sm">{req.reward}</div>
                  {req.rating && <StarRating rating={req.rating} />}
                  <StatusBadge status={req.status} />
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
