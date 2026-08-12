import { useEffect } from 'react'
import { useAuth, useUser } from '@clerk/react'
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
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
import { setAuthTokenProvider } from './utils/api'

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base font-body text-text-primary">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent-violet border-t-transparent" />
    </div>
  )
}

function useIsAuthenticated() {
  const { isLoaded, isSignedIn } = useAuth()
  // Also allow direct JWT users who have a localStorage accessToken
  const hasDirectToken = Boolean(localStorage.getItem('accessToken'))
  return { isLoaded, isAuthenticated: isSignedIn || hasDirectToken }
}

function ProtectedRoute() {
  const location = useLocation()
  const { isLoaded, isAuthenticated } = useIsAuthenticated()

  if (!isLoaded) return <LoadingScreen />

  if (!isAuthenticated) {
    const next = `${location.pathname}${location.search}`
    return <Navigate to={`/auth?redirect_url=${encodeURIComponent(next)}`} replace />
  }

  return <Outlet />
}

function ClerkApiBridge() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()

  useEffect(() => {
    if (!isLoaded) {
      // Don't clear the provider yet — a direct-auth user may already have a token
      return undefined
    }

    if (isSignedIn) {
      // Clerk session — use Clerk token
      setAuthTokenProvider(() => getToken())
    } else {
      // No Clerk session — fall back to direct JWT in localStorage (if any)
      const directToken = localStorage.getItem('accessToken')
      if (directToken) {
        setAuthTokenProvider(() => Promise.resolve(directToken))
      } else {
        setAuthTokenProvider(null)
      }
    }

    return () => setAuthTokenProvider(null)
  }, [getToken, isLoaded, isSignedIn])

  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return

    // Only sync Clerk user data when actually signed in via Clerk.
    // Do NOT wipe localStorage when a direct-JWT user is active.
    if (!isSignedIn || !user) return

    const clerkUser = {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      avatarUrl: user.imageUrl || '',
    }

    try {
      const existing = JSON.parse(window.localStorage.getItem('user') || '{}') || {}
      window.localStorage.setItem('user', JSON.stringify({ ...existing, ...clerkUser }))
    } catch {
      window.localStorage.setItem('user', JSON.stringify(clerkUser))
    }
  }, [isLoaded, isSignedIn, user])

  return null
}

export default function App() {
  return (
    <>
      <ClerkApiBridge />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/*" element={<AuthPage />} />
        {/* Public routes — browsable without signing in */}
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
    </>
  )
}

