/**
 * @file Navbar - Clean, accessible production navigation bar
 */

import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, Bell, Menu, X, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth, useToast, useTheme } from '@/contexts';
import { notificationsDB } from '@/lib/db';
import { useRealtime } from '@/hooks/useRealtime';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/cn';
import { timeAgo } from '@/utils/timeAgo';
import { NotificationBell } from './navbar/NotificationBell';
import { MobileMenu } from './navbar/MobileMenu';

const NAV_ITEMS = [
  { path: '/feed', label: 'Feed' },
  { path: '/create', label: 'Post Request' },
  { path: '/my-requests', label: 'My Activity' },
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

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const [notifs, count] = await Promise.all([
        notificationsDB.getByUser(user.id),
        notificationsDB.unreadCount(user.id),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch {
      // safe fallback
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useRealtime(
    `notifications:${user?.id}`,
    { table: 'notifications', filter: `user_id=eq.${user?.id}` },
    loadNotifications
  );

  const handleLogout = async () => {
    await signOut();
    showToast('Logged out successfully');
    setMobileMenuOpen(false);
    setNotifOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setNotifOpen(false);
  };

  return (
    <header className="sticky top-0 z-40">
      <nav
        className="bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-md border-b-2 border-slate-900/80 dark:border-slate-700/80 transition-colors duration-200 shadow-sm"
        role="navigation"
        aria-label="Main campus navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">

            {/* ── Logo ── */}
            <div className="flex items-center gap-4">
              <Link
                to={user ? '/feed' : '/'}
                className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl p-1"
                aria-label="BringIT Campus Dispatch Home"
              >
                <div className="w-10 h-10 bg-emerald-500 rounded-xl border-2 border-slate-900 dark:border-emerald-400 flex items-center justify-center shadow-[2px_2px_0_0_#0f172a] group-hover:shadow-[3px_3px_0_0_#0f172a] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                  <Package className="text-slate-950 w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                </div>
                <div className="flex flex-col">
                  <span className="font-heading font-extrabold text-xl text-slate-950 dark:text-white tracking-tight flex items-center gap-1">
                    Bring<span className="text-emerald-500">IT</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase -mt-1">
                    CUET Campus Dispatch
                  </span>
                </div>
              </Link>
            </div>

            {/* ── Desktop Nav ── */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  {NAV_ITEMS.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                          isActive
                            ? 'bg-slate-900 text-emerald-400 dark:bg-emerald-500 dark:text-slate-950 shadow-[2px_2px_0_0_#0f172a]'
                            : 'text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        )}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {item.label}
                      </Link>
                    );
                  })}

                  <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" aria-hidden="true" />

                  {/* Theme toggle */}
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {dark ? (
                      <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
                    ) : (
                      <Moon className="w-4 h-4" aria-hidden="true" />
                    )}
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
                  <div className="flex items-center gap-2 ml-1 pl-2 border-l border-slate-200 dark:border-slate-800">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-0.5"
                      aria-label="View your profile"
                    >
                      <Avatar name={user.name} size="sm" />
                      <span className="text-xs font-heading font-bold text-slate-900 dark:text-white hidden lg:inline max-w-[120px] truncate">
                        {user.name.split(' ')[0]}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                      title="Log out"
                      aria-label="Log out of account"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 mr-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {dark ? (
                      <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
                    ) : (
                      <Moon className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                  <Link
                    to="/feed"
                    className="px-3 py-1.5 text-xs font-heading font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 uppercase focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
                  >
                    Explore Feed
                  </Link>
                  <Link
                    to="/login"
                    className="px-3 py-1.5 text-xs font-heading font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 uppercase focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/login')}
                    className="text-xs px-4 py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    Launch Dispatch
                  </Button>
                </>
              )}
            </div>

            {/* ── Mobile buttons ── */}
            <div className="md:hidden flex items-center gap-1.5">
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-600 dark:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
                aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {dark ? (
                  <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
                ) : (
                  <Moon className="w-4 h-4" aria-hidden="true" />
                )}
              </button>

              {user && (
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="p-2 text-slate-600 dark:text-slate-300 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
                  aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                >
                  <Bell className="w-4 h-4" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" aria-hidden="true" />
                  )}
                </button>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Menu className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <MobileMenu user={user} onNavigate={closeMobileMenu} onLogout={handleLogout} />
        )}

        {/* Mobile Notification Panel */}
        {notifOpen && (
          <div
            className="md:hidden border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-[#0d131f] max-h-64 overflow-y-auto shadow-lg animate-slide-up"
            role="region"
            aria-label="Recent notifications"
          >
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                Notifications
              </span>
              {unreadCount > 0 && user && (
                <button
                  onClick={async () => {
                    await notificationsDB.markAllRead(user.id);
                    setUnreadCount(0);
                  }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-bold"
                >
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs">No notifications yet</div>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <button
                  key={n.id}
                  className={cn(
                    'p-3 border-b border-slate-100 dark:border-slate-800 text-left w-full transition-colors',
                    !n.read && 'bg-emerald-50/60 dark:bg-emerald-950/20'
                  )}
                  onClick={async () => {
                    await notificationsDB.markRead(n.id);
                    if (n.requestId) navigate(`/request/${n.requestId}`);
                    setNotifOpen(false);
                  }}
                >
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{n.text}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                </button>
              ))
            )}
          </div>
        )}
      </nav>
    </header>
  );
}