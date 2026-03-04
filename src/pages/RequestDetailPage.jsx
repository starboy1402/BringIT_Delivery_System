/**
 * @file RequestDetailPage - Full request view with actions, chat, and rating
 *
 * Uses useParams() to get request ID from URL instead of a prop.
 * Uses useNavigate() for routing.
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Check, XCircle, Truck, MessageCircle, Send, Flag,
  ChevronLeft, CreditCard, Smartphone, Banknote, Star,
} from 'lucide-react';
import { useAuth, useToast, useModal } from '@/contexts';
import { requestsDB, messagesDB, usersDB } from '@/lib/db';
import { timeAgo } from '@/utils/timeAgo';
import { Button, Card, UrgencyBadge, StatusBadge, StarRating } from '@/components/ui';
import { Avatar } from '@/components/ui/Avatar';
import { BookmarkButton } from '@/components/BookmarkButton';
import { ProgressStepper } from '@/components/ProgressStepper';
import { PAYMENT_METHODS } from '@/constants';

export function RequestDetailPage() {
  const { id: requestId } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const { confirm } = useModal();
  const [request, setRequest] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [msgText, setMsgText] = useState('');
  const [ratingValue, setRatingValue] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const chatEndRef = useRef(null);

  /** Reload request + messages from Supabase. */
  const reload = async () => {
    const [req, messages] = await Promise.all([
      requestsDB.getById(requestId),
      messagesDB.getByRequest(requestId),
    ]);
    setRequest(req);
    setMsgs(messages);
  };

  useEffect(() => { reload(); }, [requestId]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  // Fetch profiles for sidebar (loaded async)
  const [requesterProfile, setRequesterProfile] = useState(null);
  const [delivererProfile, setDelivererProfile] = useState(null);

  useEffect(() => {
    if (!request) return;
    usersDB.getUser(request.requesterId).then(setRequesterProfile);
    if (request.acceptedById) {
      usersDB.getUser(request.acceptedById).then(setDelivererProfile);
    } else {
      setDelivererProfile(null);
    }
  }, [request]);

  if (!request) {
    return <div className="text-center py-20 text-gray-500 dark:text-gray-400 page-enter">Request not found</div>;
  }

  // Derived permissions
  const isRequester = user?.id === request.requesterId;
  const isDeliverer = user?.id === request.acceptedById;
  const canAccept = user && !isRequester && request.status === 'Open';
  const canChat = user && (isRequester || isDeliverer) && ['Accepted', 'InProgress'].includes(request.status);
  const canMarkProgress = isDeliverer && request.status === 'Accepted';
  const canComplete = (isRequester || isDeliverer) && request.status === 'InProgress';
  const canCancel = isRequester && ['Open', 'Accepted'].includes(request.status);
  const canRate = isRequester && request.status === 'Completed' && !request.rating;

  // ───── Action Handlers ─────

  const handleAccept = () => {
    if (!user) return;
    confirm({
      title: 'Accept this delivery?',
      message: `You'll be responsible for picking up "${request.item}" from ${request.pickup} and delivering it to ${request.dropoff}. Reward: ${request.reward}`,
      confirmText: 'Accept Delivery',
      variant: 'primary',
      onConfirm: async () => {
        await requestsDB.accept(requestId, user.id, user.name);
        showToast('You accepted this delivery! 🚀');
        await reload();
        await refreshUser();
      },
    });
  };

  const handleProgress = async () => {
    if (!user) return;
    await requestsDB.markInProgress(requestId, user.id);
    showToast('Marked as in progress');
    await reload();
  };

  const handleComplete = () => {
    if (!user) return;
    if (isRequester) {
      setShowPayment(true);
    } else {
      confirm({
        title: 'Mark as completed?',
        message: 'Confirm that you have delivered the item successfully.',
        confirmText: 'Yes, Completed',
        variant: 'primary',
        onConfirm: async () => {
          await requestsDB.markCompleted(requestId, user.id);
          showToast('Delivery completed! 🎉');
          await reload();
          await refreshUser();
        },
      });
    }
  };

  const handlePayAndComplete = async () => {
    if (!user) return;
    await requestsDB.markCompleted(requestId, user.id, paymentMethod);
    showToast(`Payment via ${paymentMethod} confirmed! Delivery completed 🎉`);
    setShowPayment(false);
    await reload();
    await refreshUser();
  };

  const handleCancel = () => {
    if (!user) return;
    confirm({
      title: 'Cancel this request?',
      message: request.acceptedById
        ? 'A deliverer has already accepted this. Are you sure you want to cancel?'
        : 'This will remove your delivery request.',
      confirmText: 'Yes, Cancel',
      variant: 'danger',
      onConfirm: async () => {
        await requestsDB.cancel(requestId, user.id);
        showToast('Request cancelled', 'info');
        await reload();
      },
    });
  };

  const handleRate = async () => {
    if (ratingValue === 0) return;
    await requestsDB.rate(requestId, ratingValue);
    showToast('Rating submitted! Thank you ⭐');
    await reload();
  };

  const handleReport = () => {
    if (!user) return;
    confirm({
      title: 'Report this request?',
      message: 'Flag this request as suspicious or inappropriate. Our team will review it.',
      confirmText: 'Report',
      variant: 'danger',
      onConfirm: async () => {
        const reported = await requestsDB.report(requestId, user.id);
        showToast(reported ? 'Report submitted. Thank you.' : 'You already reported this.', 'info');
      },
    });
  };

  const handleSendMsg = async (e) => {
    e.preventDefault();
    if (!user || !msgText.trim()) return;
    await messagesDB.send({ requestId, senderId: user.id, senderName: user.name, text: msgText.trim() });
    setMsgText('');
    await reload();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 page-enter">
      <button
        onClick={() => navigate('/feed')}
        className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-6 hover:text-green-600 dark:hover:text-green-400 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Feed
      </button>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Request Details Card */}
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <Avatar name={request.requesterName} size="md" color="green" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{request.requesterName}</div>
                    <div className="text-xs text-gray-400">{timeAgo(request.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UrgencyBadge urgency={request.urgency} />
                  <StatusBadge status={request.status} />
                  <BookmarkButton requestId={request.id} />
                  {user && !isRequester && (
                    <button
                      onClick={handleReport}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                      title="Report"
                      aria-label="Report this request"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{request.item}</h1>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{request.details || 'No additional details provided.'}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Pickup</span>
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">{request.pickup}</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Dropoff</span>
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">{request.dropoff}</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Reward / Delivery Fee</div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">💰 {request.reward}</div>
                </div>
                {canAccept && (
                  <Button onClick={handleAccept} className="px-6 py-2.5">
                    <Truck className="w-5 h-5" /> Accept Delivery
                  </Button>
                )}
              </div>

              {request.paymentStatus === 'Paid' && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center gap-3 animate-fade-in">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-green-700 dark:text-green-400">Payment Confirmed</div>
                    <div className="text-xs text-green-600/70 dark:text-green-500">via {request.paymentMethod}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {(canMarkProgress || canComplete || canCancel) && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 flex flex-wrap gap-2">
                {canMarkProgress && (
                  <Button onClick={handleProgress} className="flex-1">
                    <Truck className="w-4 h-4" /> Mark In Progress
                  </Button>
                )}
                {canComplete && (
                  <Button onClick={handleComplete} className="flex-1">
                    <Check className="w-4 h-4" /> {isRequester ? 'Confirm & Pay' : 'Mark Completed'}
                  </Button>
                )}
                {canCancel && (
                  <Button variant="danger" onClick={handleCancel}>
                    <XCircle className="w-4 h-4" /> Cancel
                  </Button>
                )}
              </div>
            )}
          </Card>

          {/* Payment Modal */}
          {showPayment && (
            <Card className="animate-scale-in">
              <div className="p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" /> Select Payment Method
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">How would you like to pay the delivery reward?</p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {PAYMENT_METHODS.map((pm) => (
                    <button
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${paymentMethod === pm.id
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                    >
                      <div className={`${pm.color} mx-auto mb-2 flex justify-center`}>
                        {pm.id === 'Cash' ? <Banknote className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{pm.label}</div>
                    </button>
                  ))}
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500 dark:text-gray-400">Delivery Reward</span>
                    <span className="font-bold text-gray-900 dark:text-white">{request.reward}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Payment Method</span>
                    <span className="font-medium text-green-600 dark:text-green-400">{paymentMethod}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handlePayAndComplete} className="flex-1">
                    <Check className="w-4 h-4" /> Confirm Payment
                  </Button>
                  <Button variant="secondary" onClick={() => setShowPayment(false)}>Cancel</Button>
                </div>
              </div>
            </Card>
          )}

          {/* Rating */}
          {canRate && (
            <Card className="p-6 animate-fade-in">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Rate the Deliverer</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                How was your experience with {request.acceptedByName}?
              </p>
              <div className="flex items-center gap-4">
                <StarRating rating={ratingValue} onRate={setRatingValue} interactive />
                <Button onClick={handleRate} disabled={ratingValue === 0}>Submit Rating</Button>
              </div>
            </Card>
          )}

          {request.rating && (
            <Card className="p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Delivery Rating</h3>
              <StarRating rating={request.rating} />
            </Card>
          )}

          {/* Chat */}
          {canChat && (
            <Card>
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" /> Chat
                </h3>
              </div>
              <div className="p-4 h-64 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 space-y-3">
                {msgs.length === 0 && (
                  <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
                    No messages yet. Start the conversation!
                  </div>
                )}
                {msgs.map((m) => (
                  <div key={m.id} className={`flex ${m.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm ${m.senderId === user?.id
                        ? 'bg-green-600 text-white rounded-br-md'
                        : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white rounded-bl-md'
                        }`}
                    >
                      {m.senderId !== user?.id && (
                        <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-0.5">{m.senderName}</div>
                      )}
                      <p>{m.text}</p>
                      <div className={`text-[10px] mt-1 ${m.senderId === user?.id ? 'text-green-200' : 'text-gray-400'}`}>
                        {timeAgo(m.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendMsg} className="p-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                <input
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
                  aria-label="Chat message"
                />
                <button
                  type="submit"
                  className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors active:scale-95"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Stepper */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
              Delivery Progress
            </h3>
            <ProgressStepper request={request} />
          </Card>

          {/* Requester Info */}
          <UserSidebar label="Requester" profile={requesterProfile} color="green" />

          {/* Deliverer Info */}
          {delivererProfile && (
            <UserSidebar label="Deliverer" profile={delivererProfile} color="blue" />
          )}
        </div>
      </div>
    </div>
  );
}

// ───── UserSidebar ─────

/**
 * Displays a user profile card in the sidebar.
 * @param {{ label: string, profile: object, color: 'green' | 'blue' }} props
 */
function UserSidebar({ label, profile, color }) {
  if (!profile) return null;

  return (
    <Card className="p-5 animate-fade-in">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">{label}</h3>
      <div className="flex items-center gap-3 mb-3">
        <Avatar name={profile.name} size="lg" color={color} />
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{profile.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{profile.department} {profile.batch}</div>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="font-medium dark:text-white">{profile.rating}</span>
          <span className="text-gray-400">({profile.totalRatings})</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <MapPin className="w-4 h-4" /> {profile.hall}
        </div>
        {profile.badges?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {profile.badges.map((b) => (
              <span key={b} className="text-[10px] px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full font-medium">
                🏅 {b}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
