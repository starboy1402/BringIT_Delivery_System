/**
 * @file ProfilePage - User profile with stats, edit, and delivery history
 *
 * Uses useNavigate() for routing.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Package, Check, Truck, Edit3, ChevronRight } from 'lucide-react';
import { useAuth, useToast } from '@/contexts';
import { usersDB, requestsDB } from '@/lib/db';
import { Button, Card, StatusBadge, StarRating, EmptyState, Skeleton } from '@/components/ui';
import { Avatar } from '@/components/ui/Avatar';
import { HALLS, INPUT_CLASS } from '@/constants';

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Async state
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
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
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
    showToast('Profile updated!');
  };

  const STAT_CARDS = [
    { value: freshUser.deliveriesCompleted, label: 'Deliveries', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    { value: freshUser.requestsPosted, label: 'Requests', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { value: `৳${freshUser.totalEarnings}`, label: 'Earned', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 page-enter">
      {/* Profile Card */}
      <Card className="mb-8">
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar name={freshUser.name} size="xl" color="green" />
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{freshUser.name}</h2>
              <p className="text-gray-500 dark:text-gray-400">
                {freshUser.department} {freshUser.batch} • {freshUser.hall}
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">ID: {freshUser.studentId}</p>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-gray-800 dark:text-white">{freshUser.rating}</span>
                <span className="text-gray-400 text-sm">({freshUser.totalRatings} reviews)</span>
              </div>
              {freshUser.badges?.length > 0 && (
                <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mt-3">
                  {freshUser.badges.map((b) => (
                    <span key={b} className="text-xs px-2.5 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full font-medium">
                      🏅 {b}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-row md:flex-col gap-3 min-w-[150px]">
              {STAT_CARDS.map((s, i) => (
                <div key={i} className={`${s.bg} p-4 rounded-xl text-center flex-1`}>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Edit / Info Footer */}
        {editing ? (
          <form
            onSubmit={handleEditSubmit}
            className="border-t border-gray-100 dark:border-gray-700 px-8 py-5 bg-gray-50 dark:bg-gray-700/30 space-y-4 animate-fade-in"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input id="profile-phone" name="phone" defaultValue={freshUser.phone} className={INPUT_CLASS} />
              </div>
              <div>
                <label htmlFor="profile-hall" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hall</label>
                <select id="profile-hall" name="hall" defaultValue={freshUser.hall} className={INPUT_CLASS}>
                  {HALLS.map((h) => <option key={h}>{h}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
              <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </form>
        ) : (
          <div className="border-t border-gray-100 dark:border-gray-700 px-8 py-4 bg-gray-50 dark:bg-gray-700/30 flex justify-between items-center text-sm">
            <div className="text-gray-600 dark:text-gray-300 flex items-center gap-4">
              <span>📱 {freshUser.phone}</span>
              <span>📧 {freshUser.email}</span>
            </div>
            <button
              onClick={() => setEditing(true)}
              className="text-green-600 dark:text-green-400 font-medium hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
        )}
      </Card>

      {/* Active Deliveries */}
      {activeDeliveries.length > 0 && (
        <DeliverySection
          title="Active Deliveries"
          deliveries={activeDeliveries}
          onClickItem={(id) => navigate(`/request/${id}`)}
          iconBg="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
          icon={<Package className="w-5 h-5" />}
        />
      )}

      {/* Completed Deliveries */}
      {completedDeliveries.length > 0 && (
        <DeliverySection
          title="Completed Deliveries"
          deliveries={completedDeliveries}
          onClickItem={(id) => navigate(`/request/${id}`)}
          iconBg="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
          icon={<Check className="w-5 h-5" />}
          showRating
        />
      )}

      {/* Empty State */}
      {activeDeliveries.length === 0 && completedDeliveries.length === 0 && (
        <EmptyState
          icon={<Truck className="w-8 h-8" />}
          title="No delivery history"
          desc="Accept requests from the feed to start earning!"
          action={<Button onClick={() => navigate('/feed')}>Browse Requests</Button>}
        />
      )}
    </div>
  );
}

// ───── DeliverySection ─────

/** @param {{ title: string, deliveries: object[], onClickItem: (id: string) => void, iconBg: string, icon: React.ReactNode, showRating?: boolean }} props */
function DeliverySection({ title, deliveries, onClickItem, iconBg, icon, showRating = false }) {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {deliveries.map((req) => (
          <Card key={req.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => onClickItem(req.id)}>
            <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${iconBg}`}>{icon}</div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{req.item}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">For: {req.requesterName}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-bold text-green-700 dark:text-green-400 text-sm">{req.reward}</div>
                {showRating && req.rating && <StarRating rating={req.rating} />}
                <StatusBadge status={req.status} />
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
