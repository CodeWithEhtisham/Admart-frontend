import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import WizardPage from './pages/WizardPage'
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
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/create" element={<WizardPage />} />
      <Route path="/progress" element={<ProgressPage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="/publish" element={<PublishingPage />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/templates" element={<TemplatesPage />} />
      <Route path="/social" element={<SocialAccountsPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/billing" element={<BillingPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/brand-kit" element={<BrandKitPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/image-gen" element={<ImageGenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
