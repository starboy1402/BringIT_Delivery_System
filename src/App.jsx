/**
 * @file App.jsx - Application shell with React Router
 *
 * Sets up all context providers and defines route layout.
 * Protected routes redirect to /login if no user is logged in.
 * New users (no student_id) are redirected to /complete-profile.
 */

import { useLocation, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import {
  AuthProvider, ToastProvider, ThemeProvider, ModalProvider, useAuth,
} from '@/contexts';

// Pages
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { CompleteProfilePage } from '@/pages/CompleteProfilePage';
import { FeedPage } from '@/pages/FeedPage';
import { CreateRequestPage } from '@/pages/CreateRequestPage';
import { RequestDetailPage } from '@/pages/RequestDetailPage';
import { MyRequestsPage } from '@/pages/MyRequestsPage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import { ProfilePage } from '@/pages/ProfilePage';

// Layout
import { Navbar } from '@/components/Navbar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Skeleton } from '@/components/ui';

// ───── Auth Guard ─────

/**
 * Wraps a route element so unauthenticated users are sent to /login.
 * New users without a student_id are sent to /complete-profile.
 * @param {{ children: React.ReactNode }} props
 */
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.studentId) return <Navigate to="/complete-profile" replace />;
  return children;
}

/** Full-page loading spinner shown while checking auth state. */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-4">
        <Skeleton className="w-12 h-12 rounded-xl mx-auto" />
        <Skeleton className="w-32 h-4 mx-auto" />
      </div>
    </div>
  );
}

// ───── App Content (routing layout) ─────

/** Pages that should NOT show the floating "Post" button. */
const HIDE_FAB_PATHS = ['/', '/create', '/login', '/signup', '/complete-profile'];

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const showFab =
    user &&
    !loading &&
    !HIDE_FAB_PATHS.includes(location.pathname) &&
    !location.pathname.startsWith('/request/');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <Navbar />

      <div className="page-enter">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/request/:id" element={<RequestDetailPage />} />

          {/* Profile completion (must be logged in but student_id not required) */}
          <Route path="/complete-profile" element={<CompleteProfilePage />} />

          {/* Protected routes */}
          <Route path="/create" element={<RequireAuth><CreateRequestPage /></RequireAuth>} />
          <Route path="/my-requests" element={<RequireAuth><MyRequestsPage initialTab="posted" /></RequireAuth>} />
          <Route path="/bookmarks" element={<RequireAuth><MyRequestsPage initialTab="bookmarks" /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Mobile floating action button for quick post creation */}
      {showFab && (
        <button
          onClick={() => navigate('/create')}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 active:scale-95 transition-all z-40"
          aria-label="Post a new delivery request"
        >
          <PlusCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

// ───── Root App (providers + error boundary) ─────

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <ModalProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </ModalProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
