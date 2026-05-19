import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import VidifySidebar from '../components/VidifySidebar.jsx'

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    icon: '🎬',
    accent: 'success',
    title: 'Video generation complete!',
    description: 'Summer Product Launch Campaign is ready to view and download.',
    time: '2 minutes ago',
    action: { label: 'View Video →', to: '/result' },
    thumbnail: true,
    read: false,
    group: 'today',
    type: 'generation',
  },
  {
    id: 2,
    icon: '🚀',
    accent: 'blue',
    title: 'Published to TikTok & YouTube',
    description: 'Brand Story 2024 went live on 2 platforms with scheduled captions.',
    time: '45 minutes ago',
    action: { label: 'View Analytics →', to: '/analytics' },
    thumbnail: true,
    read: false,
    group: 'today',
    type: 'publish',
  },
  {
    id: 3,
    icon: '⚠️',
    accent: 'warning',
    title: 'YouTube token expiring in 7 days',
    description: 'Your YouTube access token will expire soon. Refresh it to avoid publishing interruptions.',
    time: '1 hour ago',
    action: { label: 'Refresh Token →', to: '/social' },
    thumbnail: false,
    read: false,
    group: 'today',
    type: 'warning',
  },
  {
    id: 4,
    icon: '❌',
    accent: 'error',
    title: 'Failed to publish to Instagram',
    description: 'Q4 Campaign Ad could not be published due to an expired connection token.',
    time: '3 hours ago',
    action: { label: 'Fix Connection →', to: '/social' },
    thumbnail: false,
    read: false,
    group: 'today',
    type: 'warning',
  },
  {
    id: 5,
    icon: '💎',
    accent: 'warning',
    title: 'Low credit balance — 42 remaining',
    description: "You've used 79% of your monthly credits. Top up to keep creating.",
    time: 'Yesterday, 4:20 PM',
    action: { label: 'Buy Credits →', to: '/billing' },
    thumbnail: false,
    read: false,
    group: 'yesterday',
    type: 'warning',
  },
  {
    id: 6,
    icon: '✨',
    accent: 'blue',
    title: 'New feature: AI Image Generator',
    description: 'Create stunning thumbnails and social media images with our new AI tool.',
    time: 'Yesterday, 10:00 AM',
    action: { label: 'Try It Now →', to: '/image-gen' },
    thumbnail: false,
    read: true,
    group: 'yesterday',
    type: 'feature',
  },
  {
    id: 7,
    icon: '📊',
    accent: 'success',
    title: 'Weekly performance report ready',
    description: '12,400 views across all platforms this week — up 18% from last week.',
    time: 'Apr 13',
    action: { label: 'View Report →', to: '/analytics' },
    thumbnail: false,
    read: true,
    group: 'week',
    type: 'generation',
  },
  {
    id: 8,
    icon: '🚀',
    accent: 'blue',
    title: '5 videos published successfully',
    description: 'Scheduled content published to TikTok, YouTube, and Instagram this week.',
    time: 'Apr 12',
    action: { label: 'View Library →', to: '/library' },
    thumbnail: false,
    read: true,
    group: 'week',
    type: 'publish',
  },
  {
    id: 9,
    icon: '💳',
    accent: 'violet',
    title: 'Pro plan renewed successfully',
    description: '$49.00 charged to Visa ending 4242. Next renewal on May 10, 2026.',
    time: 'Apr 10',
    action: { label: 'View Invoice →', to: '/billing' },
    thumbnail: false,
    read: true,
    group: 'week',
    type: 'publish',
  },
]

const ACCENT_MAP = {
  success: { bar: 'bg-success', bg: 'bg-success/10', text: 'text-success' },
  blue: { bar: 'bg-accent-blue', bg: 'bg-accent-blue/10', text: 'text-accent-blue' },
  warning: { bar: 'bg-warning', bg: 'bg-warning/10', text: 'text-warning' },
  error: { bar: 'bg-error', bg: 'bg-error/10', text: 'text-error' },
  violet: { bar: 'bg-accent-violet', bg: 'bg-accent-violet/10', text: 'text-accent-violet' },
}

const FILTER_ITEMS = [
  { id: 'all', label: 'All Notifications', dot: null },
  { id: 'generation', label: 'Generation Complete', dot: 'bg-success' },
  { id: 'publish', label: 'Publish Updates', dot: 'bg-accent-blue' },
  { id: 'warning', label: 'Warnings', dot: 'bg-warning' },
  { id: 'feature', label: 'New Features', dot: 'bg-accent-violet' },
]

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [activeFilter, setActiveFilter] = useState('all')
  const [allCleared, setAllCleared] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const clearAll = useCallback(() => {
    setAllCleared(true)
  }, [])

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const filtered = activeFilter === 'all'
    ? notifications
    : notifications.filter((n) => n.type === activeFilter)

  const todayItems = filtered.filter((n) => n.group === 'today')
  const yesterdayItems = filtered.filter((n) => n.group === 'yesterday')
  const weekItems = filtered.filter((n) => n.group === 'week')

  const filterCounts = {
    all: notifications.length,
    generation: notifications.filter((n) => n.type === 'generation').length,
    publish: notifications.filter((n) => n.type === 'publish').length,
    warning: notifications.filter((n) => n.type === 'warning').length,
    feature: notifications.filter((n) => n.type === 'feature').length,
  }

  return (
    <div className="min-h-screen bg-base font-body text-text-primary">
      <VidifySidebar />
      <div className="ml-[260px] flex min-h-screen flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-[60px] shrink-0 items-center justify-between gap-4 border-b border-border bg-panel/90 px-7 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-lg font-bold text-text-primary">Notifications</h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                unreadCount > 0
                  ? 'bg-error/15 text-error'
                  : 'bg-elevated text-text-muted'
              }`}
            >
              {unreadCount} unread
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={markAllRead}
              className="rounded-xl border border-border-default bg-elevated px-4 py-2 text-sm font-medium text-text-primary hover:border-accent-blue/40"
            >
              ✓ Mark All Read
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="rounded-xl border border-error/30 px-4 py-2 text-sm font-medium text-error hover:bg-error/10"
            >
              Clear All
            </button>
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold text-white gradient-bg"
              aria-hidden
            >
              E
            </div>
          </div>
        </header>

        {/* Split Layout */}
        <div className="flex min-h-0 flex-1">
          {/* Feed */}
          <div className="flex-1 overflow-y-auto p-7">
            {allCleared ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <span className="text-5xl">🔔</span>
                <h2 className="mt-4 font-heading text-xl font-bold text-text-primary">All caught up!</h2>
                <p className="mt-2 text-sm text-text-tertiary">
                  You have no notifications right now. We'll let you know when something happens.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {todayItems.length > 0 && (
                  <NotificationGroup title="Today" items={todayItems} onDismiss={dismissNotification} />
                )}
                {yesterdayItems.length > 0 && (
                  <NotificationGroup title="Yesterday" items={yesterdayItems} onDismiss={dismissNotification} />
                )}
                {weekItems.length > 0 && (
                  <NotificationGroup title="Earlier This Week" items={weekItems} onDismiss={dismissNotification} />
                )}
                {filtered.length === 0 && !allCleared && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span className="text-4xl">🔍</span>
                    <p className="mt-3 text-sm text-text-tertiary">No notifications match this filter.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filter Panel */}
          <aside className="w-[240px] shrink-0 border-l border-border bg-panel overflow-y-auto">
            <div className="p-5 space-y-6">
              {/* Filter By Type */}
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Filter By Type</h3>
                <div className="space-y-1">
                  {FILTER_ITEMS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setActiveFilter(f.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        activeFilter === f.id
                          ? 'bg-accent-blue/15 text-accent-blue'
                          : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        {f.dot && <span className={`h-2 w-2 rounded-full ${f.dot}`} />}
                        {!f.dot && <span className="h-2 w-2" />}
                        {f.label}
                      </span>
                      <span className="text-xs text-text-muted">{filterCounts[f.id]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferences */}
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Preferences</h3>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-white/5 hover:text-text-primary"
                >
                  ⚙️ Notification Settings →
                </Link>
              </div>

              {/* Stats */}
              <div className="rounded-xl border border-border-default bg-surface p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">This Week</p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Videos generated</span>
                    <span className="font-mono text-sm font-semibold text-text-primary">6</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Published</span>
                    <span className="font-mono text-sm font-semibold text-success">5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Failed</span>
                    <span className="font-mono text-sm font-semibold text-error">1</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function NotificationGroup({ title, items, onDismiss }) {
  return (
    <div>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</h2>
      <div className="space-y-2">
        {items.map((n) => (
          <NotificationItem key={n.id} notification={n} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  )
}

function NotificationItem({ notification: n, onDismiss }) {
  const accent = ACCENT_MAP[n.accent] || ACCENT_MAP.blue

  return (
    <div
      className={`group relative flex items-start gap-3 rounded-xl border border-border-default p-4 transition hover:border-border-default/80 ${
        n.read ? 'bg-surface' : 'bg-panel'
      }`}
    >
      {!n.read && (
        <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl ${accent.bar}`} />
      )}

      {/* Icon */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent.bg}`}
      >
        <span className="text-base">{n.icon}</span>
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${n.read ? 'text-text-secondary' : 'text-text-primary'}`}>
          {n.title}
        </p>
        <p className="mt-0.5 text-xs text-text-tertiary leading-relaxed">{n.description}</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-[11px] text-text-muted">{n.time}</span>
          <Link
            to={n.action.to}
            className={`text-xs font-semibold ${accent.text} hover:underline`}
          >
            {n.action.label}
          </Link>
        </div>
      </div>

      {/* Thumbnail */}
      {n.thumbnail && (
        <div className="h-8 w-[52px] shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-accent-blue/30 via-accent-violet/20 to-base" />
      )}

      {/* Dismiss */}
      <button
        type="button"
        onClick={() => onDismiss(n.id)}
        className="absolute right-2 top-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-text-muted opacity-0 transition group-hover:opacity-100 hover:bg-elevated hover:text-text-primary"
      >
        ×
      </button>
    </div>
  )
}
