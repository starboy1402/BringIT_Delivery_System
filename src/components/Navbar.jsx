/**
 * @file Navbar - Main navigation bar
 *
 * Neo-brutalist bento header with Space Grotesk BringIT logo,
 * Backend Status Pill (Option B guide), notifications, and theme toggle.
 */

import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, Bell, Menu, X, Sun, Moon, LogOut, Database, Sparkles, ChevronDown } from 'lucide-react';
import { useAuth, useToast, useTheme } from '@/contexts';
import { notificationsDB } from '@/lib/db';
import { useRealtime } from '@/hooks/useRealtime';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/cn';
import { timeAgo } from '@/utils/timeAgo';
import { NotificationBell } from './navbar/NotificationBell';
import { MobileMenu } from './navbar/MobileMenu';
import { DatabaseSetupModal } from '@/components/DatabaseSetupModal';

const NAV_ITEMS = [
  { path: '/feed', label: 'Feed' },
  { path: '/create', label: 'Post Request' },
  { path: '/my-requests', label: 'My Activity' },
  { path: '/leaderboard', label: 'Leaderboard' },
  { path: '/profile', label: 'Profile' },
];

export function Navbar() {
  const { user, signOut, isSupabaseConfigured, demoUsers, switchDemoUser } = useAuth();
  const { showToast } = useToast();
  const { dark, toggle: toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
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
    <>
      <nav
        className="bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-md border-b-2 border-slate-900/80 dark:border-slate-700/80 sticky top-0 z-40 transition-colors duration-200 shadow-sm"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">

            {/* ── Logo ── */}
            <div className="flex items-center gap-4">
              <Link to={user ? '/feed' : '/'} className="flex items-center gap-2.5 group" aria-label="BringIT Home">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl border-2 border-slate-900 dark:border-emerald-400 flex items-center justify-center shadow-[2px_2px_0_0_#0f172a] group-hover:shadow-[3px_3px_0_0_#0f172a] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                  <Package className="text-slate-950 w-5 h-5 stroke-[2.5]" />
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

              {/* Status Pill Button (Option B Guide) */}
              <button
                onClick={() => setSetupModalOpen(true)}
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-heading border border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-slate-50 dark:bg-slate-900 transition-colors"
                title="Click to view Database & Option B setup guide"
              >
                {isSupabaseConfigured ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-700 dark:text-emerald-300">Live Supabase</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-amber-700 dark:text-amber-300">Demo Mode Active</span>
                  </>
                )}
              </button>
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
                          'px-3 py-1.5 rounded-lg text-xs font-heading font-bold uppercase tracking-wider transition-all duration-150',
                          isActive
                            ? 'bg-slate-900 text-emerald-400 dark:bg-emerald-500 dark:text-slate-950 shadow-[2px_2px_0_0_#0f172a]'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}

                  <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

                  {/* Demo persona quick switcher */}
                  {!isSupabaseConfigured && (
                    <div className="relative">
                      <button
                        onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
                        className="px-2 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-lg text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1"
                        title="Switch Persona"
                      >
                        <span>{user.name.split(' ')[0]}</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>

                      {personaMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-xl shadow-[4px_4px_0_0_#0f172a] p-1.5 z-50 animate-scale-in">
                          <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                            Switch Test Persona
                          </div>
                          {demoUsers.slice(0, 4).map((u) => (
                            <button
                              key={u.id}
                              onClick={() => {
                                switchDemoUser(u.id);
                                setPersonaMenuOpen(false);
                                showToast(`Switched persona to ${u.name}`);
                              }}
                              className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold truncate flex items-center justify-between ${
                                user.id === u.id
                                  ? 'bg-emerald-500 text-slate-950'
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                              }`}
                            >
                              <span className="truncate">{u.name}</span>
                              <span className="text-[10px] opacity-75">{u.hall.split(' ')[0]}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Theme toggle */}
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
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
                    <Avatar name={user.name} size="sm" />
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Log out"
                      aria-label="Log out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 mr-2 transition-colors"
                    aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                  </button>
                  <Link
                    to="/feed"
                    className="px-3 py-1.5 text-xs font-heading font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 uppercase"
                  >
                    Explore Feed
                  </Link>
                  <Link
                    to="/login"
                    className="px-3 py-1.5 text-xs font-heading font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 uppercase"
                  >
                    Sign In
                  </Link>
                  <Button variant="primary" onClick={() => navigate('/login')} className="text-xs px-4 py-1.5">
                    Launch Dispatch
                  </Button>
                </>
              )}
            </div>

            {/* ── Mobile buttons ── */}
            <div className="md:hidden flex items-center gap-1.5">
              <button
                onClick={() => setSetupModalOpen(true)}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
                aria-label="Setup"
              >
                <Database className="w-4 h-4" />
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 text-slate-600 dark:text-slate-300"
                aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              {user && (
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="p-2 text-slate-600 dark:text-slate-300 relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
                  )}
                </button>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-800 dark:text-slate-200"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
          <div className="md:hidden border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-[#0d131f] max-h-64 overflow-y-auto shadow-lg animate-slide-up">
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

      {/* Database Setup & Persona Modal */}
      <DatabaseSetupModal isOpen={setupModalOpen} onClose={() => setSetupModalOpen(false)} />
    </>
  );
}