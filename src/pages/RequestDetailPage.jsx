/**
 * @file RequestDetailPage - Full request mission control view with actions, chat, and bKash payment
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Check, XCircle, Truck, MessageCircle, Send, Flag,
  ChevronLeft, CreditCard, Smartphone, Star, Map, User, Sparkles, Copy
} from 'lucide-react';
import { useAuth, useToast, useModal } from '@/contexts';
import { requestsDB, messagesDB, usersDB } from '@/lib/db';
import { useRealtime } from '@/hooks/useRealtime';
import { timeAgo } from '@/utils/timeAgo';
import { cn } from '@/utils/cn';
import { Button, Card, UrgencyBadge, StatusBadge, StarRating, Skeleton } from '@/components/ui';
import { Avatar } from '@/components/ui/Avatar';
import { BookmarkButton } from '@/components/BookmarkButton';
import { ProgressStepper } from '@/components/ProgressStepper';
import { PAYMENT_METHODS } from '@/constants';

export function RequestDetailPage() {
  const { id: requestId } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser, isSupabaseConfigured } = useAuth();
  const { showToast } = useToast();
  const { confirm } = useModal();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msgs, setMsgs] = useState([]);
  const [msgText, setMsgText] = useState('');
  const [ratingValue, setRatingValue] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const chatEndRef = useRef(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const [req, messages] = await Promise.all([
      requestsDB.getById(requestId),
      messagesDB.getByRequest(requestId),
    ]);
    setRequest(req);
    setMsgs(messages);
    setLoading(false);
  }, [requestId]);

  useEffect(() => { reload(); }, [reload]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  useRealtime(
    `messages:${requestId}`,
    { event: 'INSERT', table: 'messages', filter: `request_id=eq.${requestId}` },
    (payload) => {
      const mapped = {
        id: payload.new.id,
        requestId: payload.new.request_id,
        senderId: payload.new.sender_id,
        senderName: payload.new.sender_name,
        text: payload.new.text,
        createdAt: payload.new.created_at,
      };
      setMsgs(prev => {
        if (prev.some(m => m.id === mapped.id)) return prev;
        return [...prev, mapped];
      });
    }
  );

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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-40" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-8" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
              </div>
            </Card>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center page-enter">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl mx-auto flex items-center justify-center mb-6">
          <Truck className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Request Not Found
        </h2>
        <p className="text-slate-500 mb-8">This delivery dispatch might have been removed or fulfilled.</p>
        <Button onClick={() => navigate('/feed')} variant="secondary">Back to Feed</Button>
      </div>
    );
  }

  const isRequester = user?.id === request.requesterId;
  const isDeliverer = user?.id === request.acceptedById;
  const canAccept = user && !isRequester && request.status === 'Open';
  const canMarkProgress = (isDeliverer || !isSupabaseConfigured) && request.status === 'Accepted';
  const canComplete = ['Accepted', 'InProgress'].includes(request.status);
  const canCancel = (isRequester || !isSupabaseConfigured) && ['Open', 'Accepted'].includes(request.status);
  const canRate = isRequester && request.status === 'Completed' && !request.rating;

  const handleAccept = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    confirm({
      title: 'Accept Delivery Mission?',
      message: `You'll be responsible for picking up "${request.item}" from ${request.pickup} and delivering it to ${request.dropoff}. Bounty: ৳${request.reward}`,
      confirmText: 'Accept Mission',
      variant: 'primary',
      onConfirm: async () => {
        await requestsDB.accept(requestId, user.id, user.name);
        showToast('Mission Accepted! Please coordinate via live chat. 🚀');
        await reload();
        await refreshUser();
      },
    });
  };

  const handleProgress = async () => {
    if (!user) return;
    try {
      await requestsDB.markInProgress(requestId, user.id);
      showToast('Status updated: In Transit 🚚');
      await reload();
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleComplete = () => {
    confirm({
      title: 'Confirm Delivery Completion?',
      message: `Has "${request.item}" been safely handed over at ${request.dropoff}? Settle ৳${request.reward} via ${paymentMethod}.`,
      confirmText: 'Confirm Completed',
      variant: 'primary',
      onConfirm: async () => {
        await requestsDB.complete(requestId, user?.id || 'usr-101', { paymentMethod });
        showToast('Delivery completed! Bounty awarded. 🎉');
        await reload();
        await refreshUser();
      },
    });
  };

  const handleCancel = () => {
    confirm({
      title: 'Cancel this request?',
      message: 'Are you sure you want to withdraw this request from the campus board?',
      confirmText: 'Yes, Cancel Request',
      variant: 'danger',
      onConfirm: async () => {
        await requestsDB.cancel(requestId, user?.id);
        showToast('Request cancelled');
        await reload();
      },
    });
  };

  const handleRate = async () => {
    if (ratingValue === 0) {
      showToast('Please select a star rating first', 'warning');
      return;
    }
    await requestsDB.rate(requestId, user.id, ratingValue);
    showToast('Rating submitted! Thank you. ⭐');
    await reload();
  };

  const handleSendMsg = async (e) => {
    e.preventDefault();
    if (!msgText.trim() || !user) return;

    const text = msgText.trim();
    setMsgText('');
    await messagesDB.send({
      requestId,
      senderId: user.id,
      senderName: user.name,
      text,
    });
    const updatedMsgs = await messagesDB.getByRequest(requestId);
    setMsgs(updatedMsgs);
  };

  const sendQuickReply = async (text) => {
    if (!user) return;
    await messagesDB.send({
      requestId,
      senderId: user.id,
      senderName: user.name,
      text,
    });
    const updatedMsgs = await messagesDB.getByRequest(requestId);
    setMsgs(updatedMsgs);
  };

  const handleCopyNumber = (num) => {
    navigator.clipboard.writeText(num);
    setCopiedPhone(true);
    showToast('Number copied to clipboard!');
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-enter">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/feed')}
          className="inline-flex items-center gap-1.5 text-xs font-heading font-bold text-slate-500 hover:text-slate-950 dark:hover:text-white uppercase tracking-wider transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Return to Board
        </button>
        <div className="flex items-center gap-2">
          <BookmarkButton requestId={requestId} />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* ── Left Column: Dispatch Details & Timeline ── */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Info Bento Card */}
          <div className="p-6 sm:p-8 bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-[5px_5px_0_0_#0f172a] dark:shadow-[5px_5px_0_0_#020617] space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-900 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <StatusBadge status={request.status} />
                <UrgencyBadge urgency={request.urgency} />
              </div>
              <span className="font-mono text-xs font-bold text-slate-400">
                Posted {timeAgo(request.createdAt)}
              </span>
            </div>

            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                {request.item}
              </h1>
              {request.details && (
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {request.details}
                </p>
              )}
            </div>

            {/* Route Map Card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-2 border-slate-900/30 dark:border-slate-800 rounded-xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 border border-blue-400 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-heading font-extrabold text-slate-400">
                    Pickup Location
                  </div>
                  <div className="font-heading font-bold text-sm sm:text-base text-slate-950 dark:text-white">
                    {request.pickup}
                  </div>
                </div>
              </div>

              <div className="ml-4 pl-4 border-l-2 border-dashed border-slate-300 dark:border-slate-700 py-1">
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  Direct Campus Bus / Traveler Commute
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-400 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-heading font-extrabold text-slate-400">
                    Destination Dropoff
                  </div>
                  <div className="font-heading font-bold text-sm sm:text-base text-slate-950 dark:text-white">
                    {request.dropoff}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Stepper */}
            <div className="pt-2">
              <h3 className="font-heading font-bold text-sm text-slate-950 dark:text-white uppercase tracking-wider mb-4">
                Dispatch Lifecycle
              </h3>
              <ProgressStepper request={request} />
            </div>
          </div>

          {/* Payment & Settlement Card */}
          <div className="p-6 bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-[4px_4px_0_0_#0f172a] dark:shadow-[4px_4px_0_0_#020617] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-500" />
                <h3 className="font-heading font-bold text-base text-slate-950 dark:text-white">
                  Payment Settlement
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                Reward: ৳{request.reward}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              The requester transfers the reward directly to the deliverer upon receipt of the item at the hall gate.
            </p>

            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`py-2 px-3 rounded-xl border-2 font-heading font-bold text-xs transition-all ${
                    paymentMethod === m.id
                      ? 'border-slate-900 bg-slate-950 text-emerald-400 dark:border-emerald-400 shadow-[2px_2px_0_0_#0f172a]'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {delivererProfile?.phone && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Deliverer's {paymentMethod} Number:
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                    {delivererProfile.phone}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyNumber(delivererProfile.phone)}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold font-heading hover:bg-slate-100 flex items-center gap-1"
                >
                  {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedPhone ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}
          </div>

          {/* Rating Section (If completed) */}
          {request.status === 'Completed' && (
            <div className="p-6 bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-[4px_4px_0_0_#0f172a] dark:shadow-[4px_4px_0_0_#020617]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-950 dark:text-white">
                    Delivery Rating & Review
                  </h3>
                  <p className="text-xs text-slate-500">How was the speed and communication?</p>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-5 h-5 fill-amber-500" />
                  <span className="font-heading font-extrabold text-lg">{request.rating || '5.0'}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── Right Column: Mission Action Bar & Live Chat ── */}
        <div className="lg:col-span-5 space-y-6">

          {/* Action Dispatch Box */}
          <div className="p-6 bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-[5px_5px_0_0_#0f172a] dark:shadow-[5px_5px_0_0_#020617] space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-heading font-extrabold text-slate-400 uppercase tracking-wider">
                Bounty Escrow
              </span>
              <div className="text-2xl font-heading font-extrabold text-emerald-600 dark:text-emerald-400">
                ৳{request.reward}
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2.5">
              {canAccept && (
                <Button onClick={handleAccept} variant="primary" className="w-full py-3.5 text-base">
                  <Truck className="w-5 h-5" /> Accept Mission
                </Button>
              )}

              {canMarkProgress && (
                <Button onClick={handleProgress} variant="primary" className="w-full py-3.5 text-base bg-amber-400 hover:bg-amber-300">
                  <Truck className="w-5 h-5" /> Mark Picked Up / In Transit
                </Button>
              )}

              {canComplete && request.status !== 'Completed' && (
                <Button onClick={handleComplete} variant="primary" className="w-full py-3.5 text-base">
                  <Check className="w-5 h-5" /> Confirm Delivery Handover
                </Button>
              )}

              {canCancel && (
                <Button onClick={handleCancel} variant="outline" className="w-full text-xs">
                  <XCircle className="w-4 h-4 text-rose-500" /> Cancel Request
                </Button>
              )}
            </div>

            {/* Requester / Deliverer Profile Badges */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Requester</span>
                <span className="font-heading font-bold text-slate-900 dark:text-white">
                  {request.requesterName} ({requesterProfile?.department || 'CUET'})
                </span>
              </div>
              {request.acceptedByName && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Deliverer</span>
                  <span className="font-heading font-bold text-emerald-600 dark:text-emerald-400">
                    {request.acceptedByName} ({delivererProfile?.department || 'CUET'})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Live Chat Thread Card */}
          <div className="bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-[5px_5px_0_0_#0f172a] dark:shadow-[5px_5px_0_0_#020617] flex flex-col h-[480px] overflow-hidden">
            <div className="p-4 border-b-2 border-slate-900 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold border border-slate-900">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                    Mission Chat
                  </h3>
                  <p className="text-[10px] text-slate-400">Live communication thread</p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Quick reply suggestions */}
            <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {["At the shop now!", "On the campus bus 🚌", "Reached hall entrance!"].map((t) => (
                <button
                  key={t}
                  onClick={() => sendQuickReply(t)}
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-emerald-500 flex-shrink-0"
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-slate-50/50 dark:bg-[#070b12]">
              {msgs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                  <MessageCircle className="w-6 h-6 mb-1 text-slate-300" />
                  No messages yet. Say hello or coordinate pickup!
                </div>
              ) : (
                msgs.map((m) => {
                  const isMe = m.senderId === user?.id;
                  return (
                    <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] font-bold text-slate-400 mb-0.5 px-1">
                        {m.senderName}
                      </span>
                      <div
                        className={`max-w-[85%] px-3.5 py-2 rounded-xl text-xs font-medium border-2 ${
                          isMe
                            ? 'bg-emerald-500 text-slate-950 border-slate-900 shadow-[2px_2px_0_0_#0f172a]'
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-900 dark:border-slate-700 shadow-[2px_2px_0_0_#0f172a] dark:shadow-[2px_2px_0_0_#020617]'
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="text-[9px] text-slate-400 mt-0.5 px-1 font-mono">
                        {timeAgo(m.createdAt)}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMsg} className="p-3 border-t-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#0d131f] flex gap-2">
              <input
                type="text"
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                placeholder="Type dispatch message..."
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border-2 border-slate-900/60 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!msgText.trim()}
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-heading font-bold text-xs rounded-xl border-2 border-slate-900 hover:bg-emerald-400 disabled:opacity-40 transition-colors shadow-[2px_2px_0_0_#0f172a]"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </main>
  );
}
