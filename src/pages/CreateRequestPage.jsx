/**
 * @file CreateRequestPage - Post a new delivery request
 *
 * Uses useNavigate() for routing.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, PlusCircle, AlertCircle } from 'lucide-react';
import { useAuth, useToast } from '@/contexts';
import { requestsDB } from '@/lib/db';
import { Button, Card } from '@/components/ui';
import { PICKUP_LOCATIONS, HALLS, INPUT_CLASS } from '@/constants';

export function CreateRequestPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setError('');

    const form = new FormData(e.currentTarget);
    const item = form.get('item')?.trim();
    const reward = form.get('reward');

    if (!item) {
      setError('Please describe what you need');
      return;
    }
    if (!reward || Number(reward) < 10) {
      setError('Reward must be at least 10 BDT');
      return;
    }
    if (Number(reward) > 10000) {
      setError('Reward cannot exceed 10,000 BDT');
      return;
    }

    setSubmitting(true);
    const result = await requestsDB.create({
      item,
      pickup: form.get('pickup'),
      dropoff: form.get('dropoff'),
      reward: Number(reward),
      urgency: form.get('urgency'),
      details: form.get('details')?.trim() || '',
      requesterId: user.id,
      requesterName: user.name,
    });
    setSubmitting(false);

    if (!result) {
      setError('Failed to post request. Check your connection or try again.');
      return;
    }

    showToast('Request posted successfully! 🎉');
    navigate('/feed');
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 page-enter">
      <button
        onClick={() => navigate('/feed')}
        className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mb-6 hover:text-green-600 dark:hover:text-green-400 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Feed
      </button>

      <Card>
        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Post a Delivery Request</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Describe what you need and a traveler will help.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2 animate-scale-in" role="alert">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="create-item" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">What do you need? *</label>
              <input id="create-item" name="item" type="text" className={INPUT_CLASS} placeholder="e.g. Scientific Calculator, Pizza, Lab Coat" required />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="create-pickup" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Pickup Location *</label>
                <select id="create-pickup" name="pickup" className={INPUT_CLASS}>
                  {PICKUP_LOCATIONS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="create-dropoff" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Dropoff Location *</label>
                <select id="create-dropoff" name="dropoff" className={INPUT_CLASS}>
                  {HALLS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="create-reward" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Reward (BDT) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">৳</span>
                  <input id="create-reward" name="reward" type="number" min="10" max="10000" className={`${INPUT_CLASS} pl-10`} placeholder="e.g. 50" required />
                </div>
                <p className="text-xs text-gray-400 mt-1">💡 Higher rewards get accepted faster (10 - 10,000 BDT)</p>
              </div>
              <div>
                <label htmlFor="create-urgency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Urgency *</label>
                <select id="create-urgency" name="urgency" defaultValue="Medium" className={INPUT_CLASS}>
                  <option value="Low">Low - No rush</option>
                  <option value="Medium">Medium - Within today</option>
                  <option value="High">High - ASAP!</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="create-details" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Additional Details</label>
              <textarea
                id="create-details"
                name="details"
                rows={4}
                className={`${INPUT_CLASS} resize-none`}
                placeholder="Specific shop name, brand, size, color, special instructions..."
              />
            </div>

            <div className="pt-2 flex gap-3">
              <Button type="submit" className="flex-1 py-2.5" disabled={submitting}>
                <PlusCircle className="w-5 h-5" /> {submitting ? 'Posting...' : 'Post Request'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/feed')} className="px-6">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </main>
  );
}
