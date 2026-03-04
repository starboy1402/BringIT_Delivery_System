/**
 * @file MobileMenu - Hamburger menu dropdown for small screens
 *
 * Shows the user's profile info and navigation links.
 * Appears when the hamburger icon is tapped on mobile.
 */

import { Search, PlusCircle, Clock, Bookmark, Trophy, User, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { Avatar } from '@/components/ui/Avatar';

/** Navigation items shown in the mobile menu */
const MOBILE_NAV_ITEMS = [
    { path: '/feed', label: 'Browse Requests', icon: <Search className="w-4 h-4" /> },
    { path: '/create', label: 'Post a Request', icon: <PlusCircle className="w-4 h-4" /> },
    { path: '/my-requests', label: 'My Activity', icon: <Clock className="w-4 h-4" /> },
    { path: '/bookmarks', label: 'Saved Requests', icon: <Bookmark className="w-4 h-4" /> },
    { path: '/leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
    { path: '/profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
];

export function MobileMenu({ user, onNavigate, onLogout }) {
    const location = useLocation();

    return (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-1 shadow-lg animate-fade-in">
            {user ? (
                <>
                    {/* User info header */}
                    <div className="flex items-center gap-3 pb-3 mb-2 border-b border-gray-100 dark:border-gray-700">
                        <Avatar name={user.name} size="md" />
                        <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{user.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {user.department} {user.batch}
                            </div>
                        </div>
                    </div>

                    {/* Nav links */}
                    {MOBILE_NAV_ITEMS.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={onNavigate}
                            className={cn(
                                'flex items-center gap-3 w-full text-left py-2.5 px-3 rounded-lg transition-colors',
                                location.pathname === item.path
                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                            )}
                        >
                            {item.icon} {item.label}
                        </Link>
                    ))}

                    {/* Logout */}
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-3 w-full text-left py-2.5 px-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 mt-2 border-t border-gray-100 dark:border-gray-700 pt-4"
                    >
                        <LogOut className="w-4 h-4" /> Log Out
                    </button>
                </>
            ) : (
                <>
                    <Link
                        to="/login"
                        onClick={onNavigate}
                        className="block w-full text-left py-2.5 px-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        Log In
                    </Link>
                    <Link
                        to="/signup"
                        onClick={onNavigate}
                        className="block w-full text-left py-2.5 px-3 rounded-lg text-green-600 dark:text-green-400 font-bold hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                        Sign Up Free
                    </Link>
                </>
            )}
        </div>
    );
}
