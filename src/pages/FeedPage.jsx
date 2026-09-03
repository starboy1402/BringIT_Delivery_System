/**
 * @file FeedPage - Browse and search all delivery requests
 *
 * Neo-brutalist mission control feed with instant search, route visualizers,
 * and quick dispatch filters.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PlusCircle, Filter, ChevronRight, MapPin, Sparkles, X, ArrowUpDown } from 'lucide-react';
import { useAuth } from '@/contexts';
import { requestsDB, usersDB } from '@/lib/db';
import { timeAgo } from '@/utils/timeAgo';
import { cn } from '@/utils/cn';
import { Button, Card, StatusBadge, UrgencyBadge, EmptyState, SkeletonCard } from '@/components/ui';
import { BookmarkButton } from '@/components/BookmarkButton';

export function FeedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Async state
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, completed: 0 });
  const [userDeliveries, setUserDeliveries] = useState(0);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 30;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [result, s] = await Promise.all([
          requestsDB.getAll(
            { status: statusFilter, urgency: urgencyFilter, search: debouncedSearch },
            { limit: PAGE_SIZE, offset: 0 }
          ),
          requestsDB.getStats(),
        ]);
        if (cancelled) return;

        let filteredData = result.data;
        if (selectedLocation !== 'All') {
          filteredData = filteredData.filter(
            r => r.pickup.toLowerCase().includes(selectedLocation.toLowerCase()) ||
                 r.dropoff.toLowerCase().includes(selectedLocation.toLowerCase())
          );
        }

        setRequests(filteredData);
        setHasMore(result.data.length < result.total);
        setStats(s);

        if (user) {
          const profile = await usersDB.getUser(user.id);
          if (!cancelled && profile) {
            setUserDeliveries(profile.deliveriesCompleted || 0);
            setBookmarkedIds(profile.bookmarkedRequests || []);
          }
        }
      } catch (err) {
        console.error('Feed load error:', err);
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [debouncedSearch, statusFilter, urgencyFilter, selectedLocation, user]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const result = await requestsDB.getAll(
        { status: statusFilter, urgency: urgencyFilter, search: debouncedSearch },
        { limit: PAGE_SIZE, offset: requests.length }
      );
      setRequests(prev => [...prev, ...result.data]);
      setHasMore(requests.length + result.data.length < result.total);
    } catch (err) {
      console.error('Load more error:', err);
    }
    setLoadingMore(false);
  };

  const STAT_CARDS = [
    { label: 'Open Requests', value: stats.open, color: 'text-emerald-600 dark:text-emerald-400', badge: 'Ready for Pickup' },
    { label: 'In Transit', value: stats.inProgress, color: 'text-blue-600 dark:text-blue-400', badge: 'On Bus / Route' },
    { label: 'Delivered', value: stats.completed, color: 'text-fuchsia-600 dark:text-fuchsia-400', badge: 'Fulfilled' },
    { label: 'Your Deliveries', value: user ? userDeliveries : 0, color: 'text-amber-600 dark:text-amber-400', badge: 'Rank Progress' },
  ];

  const STATUS_OPTIONS = ['All', 'Open', 'Accepted', 'InProgress', 'Completed'];
  const URGENCY_OPTIONS = ['All', 'High', 'Medium', 'Low'];
  const LOCATION_CHIPS = ['All', 'GEC Circle', 'New Market', 'Chawkbazar', 'Pahartali', '2 No Gate'];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-enter">
      
      {/* ── Stats Bento Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map((s, i) => (
          <div
            key={i}
            className="p-5 bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-[3px_3px_0_0_#0f172a] dark:shadow-[3px_3px_0_0_#020617]"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-heading font-extrabold text-slate-400 tracking-wider">
                {s.label}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                {s.badge}
              </span>
            </div>
            <div className={`text-3xl font-heading font-extrabold ${s.color}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Header & Action Bar ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Campus Dispatch Board
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Active deliveries across CUET halls and Chittagong city routes
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items, locations..."
              className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-[2px_2px_0_0_#0f172a] dark:shadow-[2px_2px_0_0_#020617]"
              aria-label="Search requests"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs px-3 py-2.5"
            aria-label="Toggle filters"
            aria-expanded={showFilters}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">{showFilters ? 'Hide Filters' : 'Filters'}</span>
          </Button>

          <Button
            onClick={() => navigate('/create')}
            variant="primary"
            className="text-xs px-4 py-2.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Request</span>
          </Button>
        </div>
      </div>

      {/* ── Quick Location Chips ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 no-scrollbar">
        <span className="text-xs font-heading font-extrabold uppercase text-slate-400 mr-1 flex items-center gap-1 flex-shrink-0">
          <MapPin className="w-3 h-3" /> Area:
        </span>
        {LOCATION_CHIPS.map((loc) => {
          const active = selectedLocation === loc;
          return (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-heading font-bold border-2 transition-all flex-shrink-0',
                active
                  ? 'bg-slate-950 text-emerald-400 border-slate-950 dark:bg-emerald-500 dark:text-slate-950 dark:border-emerald-400 shadow-[2px_2px_0_0_#0f172a]'
                  : 'bg-white dark:bg-[#0d131f] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
              )}
            >
              {loc}
            </button>
          );
        })}
      </div>

      {/* ── Filter Dropdown Panel ── */}
      {showFilters && (
        <div className="p-5 mb-8 bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-[4px_4px_0_0_#0f172a] dark:shadow-[4px_4px_0_0_#020617] animate-fade-in space-y-4">
          <div className="flex flex-wrap gap-6 items-center justify-between">
            <div>
              <label className="text-xs font-heading font-extrabold uppercase text-slate-400 mb-2 block">
                Status
              </label>
              <div className="flex gap-1.5 flex-wrap" role="radiogroup">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-heading font-bold border-2 transition-all',
                      statusFilter === s
                        ? 'bg-emerald-500 text-slate-950 border-slate-900 shadow-[2px_2px_0_0_#0f172a]'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                    )}
                  >
                    {s === 'InProgress' ? 'In Progress' : s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-heading font-extrabold uppercase text-slate-400 mb-2 block">
                Urgency
              </label>
              <div className="flex gap-1.5" role="radiogroup">
                {URGENCY_OPTIONS.map((u) => (
                  <button
                    key={u}
                    onClick={() => setUrgencyFilter(u)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-heading font-bold border-2 transition-all',
                      urgencyFilter === u
                        ? 'bg-emerald-500 text-slate-950 border-slate-900 shadow-[2px_2px_0_0_#0f172a]'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                    )}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setStatusFilter('All');
                setUrgencyFilter('All');
                setSelectedLocation('All');
              }}
              className="text-xs self-end"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      )}

      {/* ── Request Cards Grid ── */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<Search className="w-8 h-8 text-emerald-500" />}
          title="No requests match criteria"
          desc="Try adjusting your search query, location filter, or post the first request!"
          action={
            <Button
              onClick={() => { setSearch(''); setStatusFilter('All'); setUrgencyFilter('All'); setSelectedLocation('All'); }}
              variant="primary"
            >
              Clear All Filters
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                isBookmarked={bookmarkedIds.includes(req.id)}
                onClick={() => navigate(`/request/${req.id}`)}
              />
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-12">
              <Button variant="secondary" onClick={loadMore} disabled={loadingMore} className="px-8 py-3">
                {loadingMore ? 'Loading more requests...' : 'Load More Dispatches'}
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

// ───── RequestCard (Neo-brutalist Bento Tile) ─────

function RequestCard({ request: req, isBookmarked, onClick }) {
  return (
    <div
      onClick={onClick}
      className="p-5 bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-[4px_4px_0_0_#0f172a] dark:shadow-[4px_4px_0_0_#020617] hover:shadow-[6px_6px_0_0_#0f172a] dark:hover:shadow-[6px_6px_0_0_#10b981] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col h-full group"
    >
      {/* Top row: Requester + Reward Badge */}
      <div className="flex justify-between items-start mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-emerald-400 dark:bg-emerald-500 dark:text-slate-950 font-heading font-extrabold text-xs flex items-center justify-center border border-slate-900">
            {req.requesterName ? req.requesterName.substring(0, 2).toUpperCase() : 'CU'}
          </div>
          <div>
            <div className="font-heading font-bold text-xs text-slate-950 dark:text-white truncate max-w-[130px]">
              {req.requesterName}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {timeAgo(req.createdAt)}
            </div>
          </div>
        </div>

        {/* Bounty / Reward Badge */}
        <div className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border-2 border-slate-900 dark:border-emerald-500 text-emerald-900 dark:text-emerald-300 font-heading font-extrabold text-sm shadow-[2px_2px_0_0_#0f172a] dark:shadow-[2px_2px_0_0_#020617]">
          ৳{req.reward}
        </div>
      </div>

      {/* Item Headline */}
      <h3 className="font-heading font-bold text-base text-slate-950 dark:text-white mb-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
        {req.item}
      </h3>
      {req.details && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
          {req.details}
        </p>
      )}

      {/* Route Bento Pill */}
      <div className="mt-auto mb-4 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
          <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
            {req.pickup}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
          <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
            {req.dropoff}
          </span>
        </div>
      </div>

      {/* Card Footer: Badges & Bookmark */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <StatusBadge status={req.status} />
          <UrgencyBadge urgency={req.urgency} />
        </div>
        <div className="flex items-center gap-2">
          <BookmarkButton requestId={req.id} isBookmarked={isBookmarked} />
          <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
