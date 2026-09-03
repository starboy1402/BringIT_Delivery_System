/**
 * @file FAQItem component
 *
 * An expandable question-and-answer accordion item.
 * Used on the landing page's FAQ section.
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * @param {Object} props
 * @param {string} props.q - The question text
 * @param {string} props.a - The answer text
 */
export function FAQItem({ q, a }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                aria-expanded={isOpen}
            >
                <span className="font-medium text-gray-900 dark:text-white pr-4">{q}</span>
                <ChevronDown
                    className={cn('w-5 h-5 text-gray-400 transition-transform flex-shrink-0', isOpen && 'rotate-180')}
                />
            </button>
            {isOpen && (
                <div className="px-5 pb-5 text-gray-600 dark:text-gray-300 text-sm leading-relaxed animate-fade-in">
                    {a}
                </div>
            )}
        </div>
    );
}
