/**
 * @file Skeleton loading components
 *
 * Placeholder shapes shown while data is loading.
 * Uses a CSS shimmer animation defined in index.css.
 */

import { cn } from '@/utils/cn';
import { Card } from './Card';

/** A single shimmer rectangle. Pass className to control size. */
export function Skeleton({ className = '' }) {
    return <div className={cn('skeleton rounded-lg', className)} />;
}

/** A full card-shaped skeleton (avatar + title + body). */
export function SkeletonCard() {
    return (
        <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-9 h-9 rounded-full" />
                <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-20 w-full rounded-xl mb-3" />
            <div className="flex justify-between">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24 rounded-full" />
            </div>
        </Card>
    );
}
