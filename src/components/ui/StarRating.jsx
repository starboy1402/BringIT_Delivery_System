/**
 * @file StarRating component
 *
 * Displays 1–5 stars. Can be read-only (display mode)
 * or interactive (click to rate).
 */

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * @param {Object} props
 * @param {number}   props.rating      - Current rating (1–5)
 * @param {Function} [props.onRate]    - Called with the selected star number
 * @param {boolean}  [props.interactive=false] - Enable click-to-rate
 */
export function StarRating({ rating, onRate, interactive = false }) {
    const [hoveredStar, setHoveredStar] = useState(0);

    return (
        <div
            className="flex items-center gap-0.5"
            role={interactive ? 'radiogroup' : undefined}
            aria-label={interactive ? 'Rating' : `Rating: ${rating} stars`}
        >
            {[1, 2, 3, 4, 5].map((starNumber) => {
                const isFilled = starNumber <= (hoveredStar || rating);

                return (
                    <Star
                        key={starNumber}
                        className={cn(
                            'w-5 h-5 transition-colors',
                            interactive && 'cursor-pointer',
                            isFilled
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                        )}
                        onMouseEnter={() => interactive && setHoveredStar(starNumber)}
                        onMouseLeave={() => interactive && setHoveredStar(0)}
                        onClick={() => interactive && onRate?.(starNumber)}
                        role={interactive ? 'radio' : undefined}
                        aria-checked={interactive ? starNumber === rating : undefined}
                        aria-label={interactive ? `${starNumber} star${starNumber > 1 ? 's' : ''}` : undefined}
                    />
                );
            })}
        </div>
    );
}
