/**
 * @file Navbar - Main navigation bar
 *
 * Composes NavLinks (desktop), NotificationBell, and MobileMenu.
 * Uses React Router's Link and useLocation for navigation.
 * Polls for new notifications every 5 seconds when logged in.
 */

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, Bell, Menu, X, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth, useToast, useTheme } from '@/contexts';
import { notificationsDB } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/cn';
import { timeAgo } from '@/utils/timeAgo';
import { NotificationBell } from './navbar/NotificationBell';
import { MobileMenu } from './navbar/MobileMenu';

/** Desktop navigation links (shown when logged in) */
const NAV_ITEMS = [
  { path: '/feed', label: 'Requests' },
  { path: '/create', label: 'Post' },
  { path: '/my-requests', label: 'Activity' },
  { path: '/leaderboard', label: 'Leaderboard' },
  { path: '/profile', label: 'Profile' },
];

export function Navbar() {
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const { dark, toggle: toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll for notifications every 5 seconds when logged in
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      try {
        const [notifs, count] = await Promise.all([
          notificationsDB.getByUser(user.id),
          notificationsDB.unreadCount(user.id),
        ]);
        setNotifications(notifs);
        setUnreadCount(count);
      } catch {
        // Ignore lock/abort errors from auth token refresh
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  /** Log out and redirect to landing page. */
  const handleLogout = async () => {
    await signOut();
    showToast('Logged out successfully');
    setMobileMenuOpen(false);
    setNotifOpen(false);
    navigate('/');
  };

  /** Close menus after navigating (mobile). */
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setNotifOpen(false);
  };

  return (
    <nav
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* ── Logo ── */}
          <Link to={user ? '/feed' : '/'} className="flex items-center gap-2" aria-label="Go to homepage">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
              <Package className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-gray-800 dark:text-white tracking-tight">
              CUET<span className="text-green-600 dark:text-green-400">Connect</span>
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                {/* Nav links */}
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      location.pathname === item.path
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Notifications */}
                <NotificationBell
                  notifications={notifications}
                  unreadCount={unreadCount}
                  isOpen={notifOpen}
                  onToggle={() => setNotifOpen(!notifOpen)}
                  onMarkAllRead={async () => {
                    await notificationsDB.markAllRead(user.id);
                    setUnreadCount(0);
                  }}
                  onClickNotification={async (n) => {
                    await notificationsDB.markRead(n.id);
                    if (n.requestId) navigate(`/request/${n.requestId}`);
                    setNotifOpen(false);
                  }}
                />

                {/* User info + logout */}
                <div className="flex items-center gap-2 ml-1">
                  <Avatar name={user.name} size="sm" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[80px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    aria-label="Log out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Guest: theme toggle + login/signup */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 mr-2"
                  aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <Link to="/login" className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:text-green-600">
                  Log In
                </Link>
                <Button onClick={() => navigate('/signup')}>Sign Up</Button>
              </>
            )}
          </div>

          {/* ── Mobile buttons ── */}
          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400"
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user && (
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 text-gray-500 dark:text-gray-400 relative"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-300"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu Dropdown ── */}
      {mobileMenuOpen && (
        <MobileMenu user={user} onNavigate={closeMobileMenu} onLogout={handleLogout} />
      )}

      {/* ── Mobile Notification Panel ── */}
      {notifOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 max-h-64 overflow-y-auto shadow-lg animate-fade-in">
          <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <span className="font-semibold text-sm text-gray-800 dark:text-white">Notifications</span>
            {unreadCount > 0 && user && (
              <button
                onClick={async () => {
                  await notificationsDB.markAllRead(user.id);
                  setUnreadCount(0);
                }}
                className="text-xs text-green-600 dark:text-green-400"
              >
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">No notifications</div>
          ) : (
            notifications.slice(0, 10).map((n) => (
              <button
                key={n.id}
                className={cn(
                  'p-3 border-b border-gray-50 dark:border-gray-700 text-sm transition-colors w-full text-left',
                  !n.read && 'bg-green-50/50 dark:bg-green-900/10'
                )}
                onClick={async () => {
                  await notificationsDB.markRead(n.id);
                  if (n.requestId) navigate(`/request/${n.requestId}`);
                  setNotifOpen(false);
                }}
              >
                <p className="text-gray-700 dark:text-gray-200">{n.text}</p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
              </button>
            ))
          )}
        </div>
      )}
    </nav>
  );
}
