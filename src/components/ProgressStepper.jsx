/**
 * @file ProgressStepper - Visual delivery progress tracker
 */

import { PlusCircle, Check, Truck, Star, XCircle } from 'lucide-react';
import { timeAgo } from '@/utils/timeAgo';
import { cn } from '@/utils/cn';

export function ProgressStepper({ request }) {
  const steps = [
    { label: 'Posted', icon: <PlusCircle className="w-4 h-4" />, time: request.createdAt, done: true },
    { label: 'Accepted', icon: <Check className="w-4 h-4" />, time: request.acceptedAt, done: !!request.acceptedAt },
    { label: 'In Progress', icon: <Truck className="w-4 h-4" />, time: request.inProgressAt, done: !!request.inProgressAt },
    { label: 'Completed', icon: <Star className="w-4 h-4" />, time: request.completedAt, done: !!request.completedAt },
  ];

  if (request.status === 'Cancelled') {
    steps.splice(steps.findIndex((s) => !s.done) || steps.length, 0, {
      label: 'Cancelled',
      icon: <XCircle className="w-4 h-4" />,
      time: request.updatedAt,
      done: true,
    });
  }

  return (
    <div className="space-y-0" role="list" aria-label="Delivery progress">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        const isCancelled = step.label === 'Cancelled';
        return (
          <div key={idx} className="flex gap-3 relative" role="listitem">
            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  'absolute left-[15px] top-[32px] bottom-0 w-0.5',
                  step.done
                    ? isCancelled
                      ? 'bg-red-300 dark:bg-red-700'
                      : 'bg-green-300 dark:bg-green-700'
                    : 'bg-gray-200 dark:bg-gray-600'
                )}
              />
            )}
            {/* Circle */}
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all',
                step.done
                  ? isCancelled
                    ? 'bg-red-500 text-white'
                    : 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500'
              )}
            >
              {step.icon}
            </div>
            {/* Text */}
            <div className={cn('pb-6', !step.done && 'opacity-50')}>
              <div
                className={cn(
                  'text-sm font-semibold',
                  isCancelled ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                )}
              >
                {step.label}
              </div>
              {step.time && step.done && (
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {timeAgo(step.time)}
                  {step.label === 'Accepted' && request.acceptedByName && (
                    <span> · by {request.acceptedByName}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
