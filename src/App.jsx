import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import ProgressPage from './pages/ProgressPage'
import ResultPage from './pages/ResultPage'
import PublishingPage from './pages/PublishingPage'
import LibraryPage from './pages/LibraryPage'
import TemplatesPage from './pages/TemplatesPage'
import SocialAccountsPage from './pages/SocialAccountsPage'
import CalendarPage from './pages/CalendarPage'
import AnalyticsPage from './pages/AnalyticsPage'
import BillingPage from './pages/BillingPage'
import SettingsPage from './pages/SettingsPage'
import BrandKitPage from './pages/BrandKitPage'
import NotificationsPage from './pages/NotificationsPage'
import ImageGenPage from './pages/ImageGenPage'
import VideoGenPage from './pages/VideoGenPage'
import NotFoundPage from './pages/NotFoundPage'
import { isAuthenticated } from './utils/auth'

function ProtectedRoute() {
  const location = useLocation()

  if (!isAuthenticated()) {
    const next = `${location.pathname}${location.search}`
    return <Navigate to={`/auth?redirect_url=${encodeURIComponent(next)}`} replace />
  }

  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/*" element={<AuthPage />} />
      <Route path="/auth-callback" element={<AuthCallbackPage />} />
      <Route path="/templates" element={<TemplatesPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/create" element={<VideoGenPage />} />
        <Route path="/video-gen" element={<VideoGenPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/publish" element={<PublishingPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/social" element={<SocialAccountsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/brand-kit" element={<BrandKitPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/image-gen" element={<ImageGenPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
