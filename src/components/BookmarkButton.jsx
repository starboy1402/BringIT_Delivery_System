/**
 * @file BookmarkButton - Toggle save/unsave for requests
 */

import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useAuth, useToast } from '@/contexts';
import { usersDB } from '@/lib/db';

export function BookmarkButton({ requestId, isBookmarked: isBookmarkedProp }) {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [bookmarked, setBookmarked] = useState(isBookmarkedProp ?? false);

  // Only fetch from DB if the parent didn't pass the prop
  useEffect(() => {
    if (isBookmarkedProp !== undefined || !user) return;
    let cancelled = false;
    async function check() {
      const result = await usersDB.isBookmarked(user.id, requestId);
      if (!cancelled) setBookmarked(result);
    }
    check();
    return () => { cancelled = true; };
  }, [user, requestId, isBookmarkedProp]);

  // Sync with parent prop when it changes
  useEffect(() => {
    if (isBookmarkedProp !== undefined) setBookmarked(isBookmarkedProp);
  }, [isBookmarkedProp]);

  if (!user) return null;

  const toggle = async (e) => {
    e.stopPropagation();
    setBookmarked(!bookmarked); // Optimistic update
    try {
      const newState = await usersDB.toggleBookmark(user.id, requestId);
      setBookmarked(newState);
      refreshUser();
      showToast(newState ? 'Saved to bookmarks' : 'Removed from bookmarks', 'info');
    } catch {
      setBookmarked(bookmarked); // Revert on error
      showToast('Failed to update bookmark', 'error');
    }
  };

  return (
    <button
      onClick={toggle}
      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label={bookmarked ? 'Remove from bookmarks' : 'Save to bookmarks'}
    >
      {bookmarked ? (
        <BookmarkCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
      ) : (
        <Bookmark className="w-4 h-4 text-gray-400 dark:text-gray-500" />
      )}
    </button>
  );
}
