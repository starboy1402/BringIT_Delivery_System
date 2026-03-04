/**
 * @file FeedPage - Browse and search all delivery requests
 *
 * Uses useNavigate() for routing. No navigate prop needed.
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Package, Search, PlusCircle, Filter, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts';
import { requestsDB, usersDB } from '@/lib/db';
import { timeAgo } from '@/utils/timeAgo';
import { Button, Card, StatusBadge, UrgencyBadge, EmptyState } from '@/components/ui';
import { BookmarkButton } from '@/components/BookmarkButton';

export function FeedPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [urgencyFilter, setUrgencyFilter] = useState('All');
    const [showFilters, setShowFilters] = useState(false);

    const allRequests = useMemo(
        () => requestsDB.getAll({ status: statusFilter, urgency: urgencyFilter, search }),
        [search, statusFilter, urgencyFilter]
    );

    const stats = requestsDB.getStats();

    const STAT_CARDS = [
        { label: 'Open Requests', value: stats.open, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
        { label: 'In Progress', value: stats.inProgress, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Completed', value: stats.completed, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        { label: 'Your Deliveries', value: user ? usersDB.getUser(user.id)?.deliveriesCompleted || 0 : 0, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    ];

    const STATUS_OPTIONS = ['All', 'Open', 'Accepted', 'InProgress', 'Completed'];
    const URGENCY_OPTIONS = ['All', 'High', 'Medium', 'Low'];

    return (
        <main className="max-w-6xl mx-auto px-4 py-8 page-enter">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {STAT_CARDS.map((s, i) => (
                    <Card key={i} className={`p-4 ${s.bg} border-0`}>
                        <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">{s.label}</div>
                    </Card>
                ))}
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery Requests</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Find deliveries that match your route</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search items, locations..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                            aria-label="Search requests"
                        />
                    </div>
                    <Button variant="secondary" onClick={() => setShowFilters(!showFilters)} aria-label="Toggle filters" aria-expanded={showFilters}>
                        <Filter className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => navigate('/create')}>
                        <PlusCircle className="w-4 h-4" /> <span className="hidden sm:inline">Post</span>
                    </Button>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <Card className="p-4 mb-6 animate-fade-in">
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Status</label>
                            <div className="flex gap-1 flex-wrap" role="radiogroup" aria-label="Filter by status">
                                {STATUS_OPTIONS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                        role="radio"
                                        aria-checked={statusFilter === s}
                                    >
                                        {s === 'InProgress' ? 'In Progress' : s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Urgency</label>
                            <div className="flex gap-1" role="radiogroup" aria-label="Filter by urgency">
                                {URGENCY_OPTIONS.map((u) => (
                                    <button
                                        key={u}
                                        onClick={() => setUrgencyFilter(u)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${urgencyFilter === u
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                        role="radio"
                                        aria-checked={urgencyFilter === u}
                                    >
                                        {u}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Grid */}
            {allRequests.length === 0 ? (
                <EmptyState
                    icon={<Package className="w-8 h-8" />}
                    title="No requests found"
                    desc="Try adjusting your filters or search query."
                    action={
                        <Button onClick={() => { setSearch(''); setStatusFilter('All'); setUrgencyFilter('All'); }}>
                            Clear Filters
                        </Button>
                    }
                />
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {allRequests.map((req) => (
                        <RequestCard key={req.id} request={req} onClick={() => navigate(`/request/${req.id}`)} />
                    ))}
                </div>
            )}
        </main>
    );
}

// ───── RequestCard ─────

/** @param {{ request: object, onClick: () => void }} props */
function RequestCard({ request: req, onClick }) {
    return (
        <Card
            className="hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col group"
            onClick={onClick}
        >
            <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center font-bold text-gray-500 dark:text-gray-300 text-xs">
                            {req.requesterName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <div className="font-medium text-gray-900 dark:text-white text-sm">{req.requesterName}</div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(req.createdAt)}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <UrgencyBadge urgency={req.urgency} />
                        <BookmarkButton requestId={req.id} />
                    </div>
                </div>

                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1.5">{req.item}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{req.details}</p>

                <div className="space-y-2.5 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl text-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <MapPin className="text-green-600 dark:text-green-400 w-3 h-3" />
                        </div>
                        <div className="flex-1">
                            <span className="text-gray-400 text-xs">From</span>{' '}
                            <span className="font-medium text-gray-700 dark:text-gray-200 ml-1">{req.pickup}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <MapPin className="text-red-500 dark:text-red-400 w-3 h-3" />
                        </div>
                        <div className="flex-1">
                            <span className="text-gray-400 text-xs">To</span>{' '}
                            <span className="font-medium text-gray-700 dark:text-gray-200 ml-1">{req.dropoff}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-5 py-3.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-700/30 flex items-center justify-between">
                <div className="font-bold text-green-700 dark:text-green-400 text-sm">💰 {req.reward}</div>
                <div className="flex items-center gap-2">
                    <StatusBadge status={req.status} />
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
            </div>
        </Card>
    );
}
