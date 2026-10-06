import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Topbar from '../components/Topbar'

/**
 * There is no notifications backend yet. Rather than showing invented events,
 * point people to where real status already lives.
 */
export default function NotificationsPage() {
  return (
    <AppLayout>
      <div className="flex min-h-screen flex-col">
        <Topbar title="Notifications" />

        <main id="main-content" tabIndex={-1} className="flex flex-1 items-start justify-center p-4 sm:p-7">
          <section className="mt-6 w-full max-w-lg rounded-2xl border border-border-default bg-panel p-8 text-center sm:mt-16">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-blue/15 text-link">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <h2 className="mt-5 font-heading text-xl font-bold text-text-primary">No notifications yet</h2>
            <p className="mt-2 text-sm text-text-secondary">
              In-app notifications are coming soon. Until then, generation progress shows on your Dashboard and
              Library, and publishing results show in Analytics.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/dashboard"
                className="rounded-xl bg-accent-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Go to Dashboard
              </Link>
              <Link
                to="/library"
                className="rounded-xl border border-border-default bg-elevated px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:border-accent-blue/40"
              >
                Open Library
              </Link>
            </div>
          </section>
        </main>
      </div>
    </AppLayout>
  )
}
