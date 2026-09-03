/**
 * @file ProgressStepper - Visual delivery progress tracker
 */

import { PlusCircle, Check, Truck, Star, XCircle, Clock } from 'lucide-react';
import { timeAgo } from '@/utils/timeAgo';
import { cn } from '@/utils/cn';

export function ProgressStepper({ request = {}, status: statusProp }) {
  const req = typeof request === 'object' && request !== null ? request : {};
  const currentStatus = req.status || statusProp || 'Open';

  const createdAt = req.createdAt || req.created_at || new Date().toISOString();
  const acceptedAt = req.acceptedAt || req.accepted_at;
  const inProgressAt = req.inProgressAt || req.in_progress_at;
  const completedAt = req.completedAt || req.completed_at;
  const updatedAt = req.updatedAt || req.updated_at;

  const isAccepted = Boolean(acceptedAt || ['Accepted', 'InProgress', 'Completed'].includes(currentStatus));
  const isInProgress = Boolean(inProgressAt || ['InProgress', 'Completed'].includes(currentStatus));
  const isCompleted = Boolean(completedAt || currentStatus === 'Completed');

  const steps = [
    { label: 'Broadcast Posted', icon: <PlusCircle className="w-4 h-4" />, time: createdAt, done: true },
    { label: 'Accepted by Courier', icon: <Check className="w-4 h-4" />, time: acceptedAt, done: isAccepted },
    { label: 'In Transit on Route', icon: <Truck className="w-4 h-4" />, time: inProgressAt, done: isInProgress },
    { label: 'Delivered at Hall Gate', icon: <Star className="w-4 h-4" />, time: completedAt, done: isCompleted },
  ];

  if (currentStatus === 'Cancelled') {
    steps.splice(steps.findIndex((s) => !s.done) || steps.length, 0, {
      label: 'Request Cancelled',
      icon: <XCircle className="w-4 h-4" />,
      time: updatedAt,
      done: true,
    });
  }

  const activeIdx = [...steps].reverse().findIndex(s => s.done);
  const currentStepIdx = activeIdx === -1 ? 0 : (steps.length - 1 - activeIdx);

  return (
    <div className="space-y-0 pl-1" role="list" aria-label="Delivery progress">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        const isCancelled = step.label === 'Request Cancelled';
        const isCurrent = step.done && idx === currentStepIdx && currentStatus !== 'Completed' && currentStatus !== 'Cancelled';

        return (
          <div key={idx} className="flex gap-4 relative group" role="listitem">
            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  'absolute left-[15px] top-[32px] bottom-0 w-[2px] transition-colors duration-300',
                  step.done && steps[idx + 1]?.done
                    ? isCancelled
                      ? 'bg-rose-500'
                      : 'bg-emerald-500'
                    : 'bg-slate-200 dark:bg-slate-800'
                )}
              />
            )}

            {/* Circle / Icon */}
            <div
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 z-10 transition-all border-2 border-slate-900',
                step.done
                  ? isCancelled
                    ? 'bg-rose-500 text-white shadow-[2px_2px_0_0_#0f172a]'
                    : isCurrent
                      ? 'bg-emerald-500 text-slate-950 shadow-[2px_2px_0_0_#0f172a] animate-pulse'
                      : 'bg-emerald-500 text-slate-950 shadow-[2px_2px_0_0_#0f172a]'
                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'
              )}
            >
              {step.done ? <Check className="w-4 h-4 stroke-[3]" /> : step.icon}
            </div>

            {/* Text Content */}
            <div className={cn('pb-7 transition-opacity duration-300', !step.done && 'opacity-45')}>
              <div
                className={cn(
                  'text-xs sm:text-sm font-heading font-extrabold tracking-tight leading-none mb-1',
                  isCancelled ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white',
                  isCurrent && 'text-emerald-600 dark:text-emerald-400'
                )}
              >
                {step.label}
              </div>
              {step.time && step.done && (
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {timeAgo(step.time)}
                  {step.label.includes('Accepted') && req.acceptedByName && (
                    <span className="flex items-center gap-1">
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        by {req.acceptedByName}
                      </span>
                    </span>
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
