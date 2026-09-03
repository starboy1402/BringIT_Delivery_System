/**
 * @file AnimatedNumber component
 *
 * Counts up from 0 to the target value with a smooth animation.
 * Used for stat counters on the landing page.
 *
 * @param {number} value    - The target number to count to
 * @param {number} duration - Animation duration in milliseconds (default: 1000)
 */

import { useState, useEffect } from 'react';

export function AnimatedNumber({ value, duration = 1000 }) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (value === 0) {
            setDisplayValue(0);
            return;
        }

        let current = 0;
        const increment = value / (duration / 16); // ~60fps

        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setDisplayValue(value);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(current));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value, duration]);

    return <span>{displayValue}</span>;
}
