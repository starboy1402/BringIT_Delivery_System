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

/** A skeleton for the profile header. */
export function SkeletonProfile() {
    return (
        <Card className="p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className="flex-1 space-y-3 w-full">
                    <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
                    <Skeleton className="h-4 w-64 mx-auto md:mx-0" />
                    <Skeleton className="h-4 w-32 mx-auto md:mx-0" />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Skeleton className="h-20 flex-1 rounded-xl" />
                    <Skeleton className="h-20 flex-1 rounded-xl" />
                    <Skeleton className="h-20 flex-1 rounded-xl" />
                </div>
            </div>
        </Card>
    );
}

/** A list of horizontal skeleton items. */
export function SkeletonList({ count = 3 }) {
    return (
        <div className="space-y-3">
            {[...Array(count)].map((_, i) => (
                <Card key={i} className="p-5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                            <Skeleton className="w-12 h-12 rounded-xl" />
                            <div className="flex-1">
                                <Skeleton className="h-5 w-1/3 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                </Card>
            ))}
        </div>
    );
}
