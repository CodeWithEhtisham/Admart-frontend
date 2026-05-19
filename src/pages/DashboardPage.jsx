import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const FILTERS = ['All', 'Published', 'Ready', 'Scheduled', 'Generating']

const SPARKLINES = {
  credits: [40, 52, 48, 55, 50, 42],
  videos: [12, 14, 15, 16, 17, 18],
  views: [98, 102, 108, 110, 118, 124],
  scheduled: [3, 4, 5, 5, 6, 7],
}

const VIDEOS = [
  {
    id: 1,
    title: 'Summer Drop — Teaser',
    status: 'Published',
    duration: '0:24',
    date: 'Apr 12, 2026',
    platforms: ['T', 'Y', 'I'],
  },
  {
    id: 2,
    title: 'Brand Story — Vertical',
    status: 'Generating',
    duration: '—',
    date: 'Just now',
    platforms: ['T', 'I'],
  },
  {
    id: 3,
    title: 'Product Walkthrough',
    status: 'Ready',
    duration: '1:02',
    date: 'Apr 11, 2026',
    platforms: ['Y'],
  },
  {
    id: 4,
    title: 'Customer Spotlight',
    status: 'Scheduled',
    duration: '0:45',
    date: 'Apr 16, 2026',
    platforms: ['F', 'I'],
  },
  {
    id: 5,
    title: 'Tutorial — Onboarding',
    status: 'Generating',
    duration: '—',
    date: '2 min ago',
    platforms: ['Y', 'T'],
  },
  {
    id: 6,
    title: 'Flash Sale Promo',
    status: 'Failed',
    duration: '0:18',
    date: 'Apr 9, 2026',
    platforms: ['T'],
  },
]

function Sparkline({ values, tone }) {
  const max = Math.max(...values, 1)
  const toneBar = {
    blue: 'bg-accent-blue',
    green: 'bg-success',
    violet: 'bg-accent-violet',
    yellow: 'bg-warning',
  }[tone]

  return (
    <div className="flex h-10 items-end gap-1">
      {values.map((v, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-sm ${toneBar} opacity-80`}
          style={{ height: `${Math.max(12, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    Published: 'bg-accent-blue/20 text-accent-blue border-accent-blue/30',
    Generating:
      'border-accent-violet/30 bg-accent-violet/15 text-accent-violet animate-pulse-dot',
    Ready: 'border-success/30 bg-success/15 text-success',
    Scheduled: 'border-warning/30 bg-warning/15 text-warning',
    Failed: 'border-error/30 bg-error/15 text-error',
  }
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${map[status] || map.Published}`}
    >
      {status}
    </span>
  )
}

function PlatformDot({ letter }) {
  const colors = {
    T: 'bg-tiktok',
    Y: 'bg-youtube',
    I: 'bg-instagram',
    F: 'bg-facebook',
  }
  return (
    <span
      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${colors[letter]}`}
    >
      {letter}
    </span>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchOpen, setSearchOpen] = useState(false)
  const [darkUi, setDarkUi] = useState(true)

  const th = darkUi
    ? {
        shell: 'bg-base text-text-primary',
        panel: 'bg-panel border-border',
        surface: 'bg-surface border-border-default',
        elevated: 'bg-elevated',
        muted: 'text-text-secondary',
        faint: 'text-text-tertiary',
      }
    : {
        shell: 'bg-zinc-100 text-zinc-900',
        panel: 'bg-white border-zinc-200',
        surface: 'bg-white border-zinc-200',
        elevated: 'bg-zinc-50',
        muted: 'text-zinc-600',
        faint: 'text-zinc-500',
      }

  const onSearchKey = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      setSearchOpen((o) => !o)
    }
    if (e.key === 'Escape') setSearchOpen(false)
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', onSearchKey)
    return () => window.removeEventListener('keydown', onSearchKey)
  }, [onSearchKey])

  const navCls = (path, opts = {}) => {
    const active = location.pathname === path || opts.partialMatch
    const inactive = darkUi
      ? `${th.muted} hover:bg-white/5 hover:text-text-primary`
      : `${th.muted} hover:bg-zinc-100 hover:text-zinc-900`
    const layout = sidebarCollapsed ? 'justify-center gap-0 px-2' : 'gap-3'
    return `flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition ${layout} ${
      active ? 'bg-accent-blue/15 text-accent-blue' : inactive
    }`
  }

  const primaryText = darkUi ? 'text-text-primary' : 'text-zinc-900'

  const sidebarW = sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'

  return (
    <div className={`min-h-screen font-body ${th.shell}`}>
      {searchOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          aria-label="Close search"
          onClick={() => setSearchOpen(false)}
        />
      )}
      {searchOpen && (
        <div
          className="fixed left-1/2 top-[20%] z-[101] w-full max-w-lg -translate-x-1/2 animate-slide-up rounded-2xl border border-border-default bg-panel p-4 shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <input
            autoFocus
            type="search"
            placeholder="Search videos, templates..."
            className="w-full rounded-xl border border-border-default bg-input px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
          />
          <p className="mt-3 text-center text-xs text-text-muted">Press Esc to close · ⌘K</p>
        </div>
      )}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-40 flex flex-col border-r ${th.panel} ${sidebarW} transition-[width] duration-300 ease-out`}
      >
        <div className={`flex h-[60px] items-center border-b border-border px-4 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <Link to="/dashboard" className="font-heading text-lg font-bold">
            <span className={darkUi ? 'gradient-text' : 'text-accent-blue'}>V</span>
            {!sidebarCollapsed && (
              <span className={darkUi ? 'text-text-primary' : 'text-zinc-900'}>idify</span>
            )}
          </Link>
        </div>

        <nav className={`flex-1 space-y-6 overflow-y-auto py-4 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
          <div>
            {!sidebarCollapsed && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Main
              </p>
            )}
            <div className="space-y-1">
              <Link to="/dashboard" className={navCls('/dashboard')} title="Dashboard">
                <span className="text-lg" aria-hidden>
                  ◎
                </span>
                {!sidebarCollapsed && <span>Dashboard</span>}
              </Link>
              <Link to="/create" className={navCls('/create')} title="Create New">
                <span className="text-lg" aria-hidden>
                  ✦
                </span>
                {!sidebarCollapsed && <span>Create New</span>}
              </Link>
              <Link
                to="/library"
                className={`${navCls('/library')} ${!sidebarCollapsed ? 'w-full justify-between' : ''}`}
                title="My Videos"
              >
                <span className="text-lg" aria-hidden>
                  ▤
                </span>
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left">My Videos</span>
                    <span className="rounded-full bg-accent-blue/20 px-2 py-0.5 text-xs font-semibold text-accent-blue">
                      18
                    </span>
                  </>
                )}
              </Link>
              <Link to="/templates" className={navCls('/templates')} title="Templates">
                <span className="text-lg" aria-hidden>
                  ⧉
                </span>
                {!sidebarCollapsed && <span>Templates</span>}
              </Link>
            </div>
          </div>

          <div>
            {!sidebarCollapsed && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Publish
              </p>
            )}
            <div className="space-y-1">
              <Link to="/calendar" className={navCls('/calendar')} title="Content Calendar">
                <span className="text-lg" aria-hidden>
                  ⌁
                </span>
                {!sidebarCollapsed && <span>Content Calendar</span>}
              </Link>
              <Link to="/social" className={navCls('/social')} title="Social Accounts">
                <span className="text-lg" aria-hidden>
                  ⚡
                </span>
                {!sidebarCollapsed && <span>Social Accounts</span>}
              </Link>
            </div>
          </div>

          <div>
            {!sidebarCollapsed && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Analyze
              </p>
            )}
            <div className="space-y-1">
              <Link to="/analytics" className={navCls('/analytics')} title="Analytics">
                <span className="text-lg" aria-hidden>
                  📈
                </span>
                {!sidebarCollapsed && <span>Analytics</span>}
              </Link>
            </div>
          </div>

          <div>
            {!sidebarCollapsed && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Settings
              </p>
            )}
            <div className="space-y-1">
              <Link to="/settings" className={navCls('/settings')} title="Brand Kit">
                <span className="text-lg" aria-hidden>
                  ◇
                </span>
                {!sidebarCollapsed && <span>Brand Kit</span>}
              </Link>
              <Link to="/billing" className={navCls('/billing')} title="Billing">
                <span className="text-lg" aria-hidden>
                  $
                </span>
                {!sidebarCollapsed && <span>Billing</span>}
              </Link>
              <Link to="/settings" className={navCls('/settings')} title="Settings">
                <span className="text-lg" aria-hidden>
                  ⚙
                </span>
                {!sidebarCollapsed && <span>Settings</span>}
              </Link>
            </div>
          </div>
        </nav>

        <div className={`mt-auto space-y-3 border-t border-border p-3 ${th.panel}`}>
          <div
            className={`rounded-xl border border-border-default bg-surface ${
              sidebarCollapsed ? 'px-2 py-2 text-center' : 'p-3'
            }`}
          >
            {!sidebarCollapsed ? (
              <>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className={th.muted}>Credits</span>
                  <span className={`font-mono font-semibold ${primaryText}`}>42</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-violet"
                    style={{ width: '21%' }}
                  />
                </div>
                <p className={`mt-1 text-xs ${th.faint}`}>42 / 200</p>
              </>
            ) : (
              <>
                <p className={`font-mono text-sm font-bold ${primaryText}`}>42</p>
                <div className="mx-auto mt-1 h-8 w-1 overflow-hidden rounded-full bg-elevated">
                  <div
                    className="w-full bg-gradient-to-b from-accent-blue to-accent-violet"
                    style={{ height: '21%' }}
                  />
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSidebarCollapsed((c) => !c)}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border border-border-default ${th.elevated} py-2 text-sm ${th.muted} hover:text-text-primary`}
            aria-expanded={!sidebarCollapsed}
          >
            <span aria-hidden>{sidebarCollapsed ? '→' : '←'}</span>
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      <div
        className={`min-h-screen transition-[margin] duration-300 ease-out ${
          sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'
        }`}
      >
        <header
          className={`sticky top-0 z-30 flex h-[60px] items-center justify-between gap-4 border-b border-border px-7 backdrop-blur-md ${
            darkUi ? 'bg-panel/90' : 'bg-white/90'
          }`}
        >
          <nav aria-label="Breadcrumb" className={`shrink-0 text-sm ${th.muted}`}>
            <span className={primaryText}>Dashboard</span>
            <span className={`mx-1 ${darkUi ? 'text-text-muted' : 'text-zinc-400'}`}>/</span>
            <span>Home</span>
          </nav>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className={`mx-auto hidden max-w-md flex-1 items-center gap-3 rounded-xl border px-4 py-2 text-left text-sm md:flex ${th.surface} ${th.muted}`}
          >
            <span className="text-text-muted">⌕</span>
            <span>Search videos, templates...</span>
            <span className="ml-auto font-mono text-xs text-text-muted">⌘K</span>
          </button>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className={`rounded-xl border px-3 py-2 text-sm md:hidden ${th.surface}`}
            >
              Search
            </button>
            <button
              type="button"
              className={`relative rounded-xl border p-2 ${th.surface}`}
              aria-label="Notifications"
            >
              <span className="text-lg" aria-hidden>
                🔔
              </span>
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" />
            </button>
            <button
              type="button"
              onClick={() => setDarkUi((d) => !d)}
              className={`rounded-xl border p-2 text-lg ${th.surface}`}
              aria-label={darkUi ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {darkUi ? '🌙' : '☀️'}
            </button>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full font-heading text-sm font-bold text-white gradient-bg"
              aria-hidden
            >
              E
            </div>
          </div>
        </header>

        <main className="space-y-8 p-7">
          <section className="animate-slide-up relative overflow-hidden rounded-2xl border border-white/10 gradient-bg p-8 text-white shadow-lg shadow-accent-violet/20">
            <span
              className="animate-float pointer-events-none absolute -right-4 -top-4 text-6xl opacity-30"
              aria-hidden
            >
              ✦
            </span>
            <p className="font-heading text-2xl font-bold">Good morning, Ehtisham 👋</p>
            <p className="mt-1 text-sm text-white/80">42 credits remaining</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/create"
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-white/25"
              >
                <span>✦</span> New Video
              </Link>
              <button
                type="button"
                onClick={() => navigate('/create')}
                className="inline-flex items-center gap-2 rounded-xl bg-accent-violet/40 px-5 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-accent-violet/55"
              >
                <span>⊕</span> New Image
              </button>
              <button
                type="button"
                onClick={() => navigate('/create')}
                className="inline-flex items-center gap-2 rounded-xl bg-success/35 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-success/50"
              >
                <span>↑</span> Upload
              </button>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: 'Credits Remaining',
                value: '42',
                trend: '↓ 158 used',
                icon: '✦',
                spark: SPARKLINES.credits,
                tone: 'blue',
              },
              {
                label: 'Videos This Month',
                value: '18',
                trend: '↑ +3',
                icon: '▶',
                spark: SPARKLINES.videos,
                tone: 'green',
              },
              {
                label: 'Total Views',
                value: '124K',
                trend: '↑ +12%',
                icon: '◎',
                spark: SPARKLINES.views,
                tone: 'violet',
              },
              {
                label: 'Scheduled Posts',
                value: '7',
                trend: '↑ +2',
                icon: '⌚',
                spark: SPARKLINES.scheduled,
                tone: 'yellow',
              },
            ].map((card) => (
              <div
                key={card.label}
                className={`rounded-2xl border p-5 ${th.surface}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-xs font-medium uppercase tracking-wide ${th.faint}`}>
                      {card.label}
                    </p>
                    <p className={`mt-2 font-heading text-3xl font-bold ${primaryText}`}>{card.value}</p>
                    <p className={`mt-1 text-sm ${th.muted}`}>{card.trend}</p>
                  </div>
                  <span className="text-2xl opacity-80" aria-hidden>
                    {card.icon}
                  </span>
                </div>
                <div className="mt-4 flex justify-end">
                  <Sparkline values={card.spark} tone={card.tone} />
                </div>
              </div>
            ))}
          </section>

          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
              <h2 className={`font-heading text-xl font-bold ${primaryText}`}>Recent Videos</h2>
              <Link
                to="/library"
                className="text-sm font-medium text-accent-blue hover:underline"
              >
                View all →
              </Link>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeFilter === f
                      ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/20'
                      : `border border-border-default ${th.elevated} ${th.muted} hover:text-text-primary`
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {VIDEOS.filter(
                (v) => activeFilter === 'All' || v.status === activeFilter
              ).map((v) => (
                <article
                  key={v.id}
                  className={`group cursor-pointer overflow-hidden rounded-2xl border ${th.surface}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate('/result')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate('/result')
                    }
                  }}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <div className="absolute inset-0 gradient-bg opacity-90 transition group-hover:scale-105" />
                    <div className="absolute left-3 top-3">
                      <StatusBadge status={v.status} />
                    </div>
                    <div className="absolute bottom-3 right-3 rounded-md bg-black/50 px-2 py-0.5 font-mono text-xs text-white">
                      {v.duration}
                    </div>
                    <div
                      className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100"
                      aria-hidden
                    >
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-2xl text-base shadow-lg">
                        ▶
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-heading font-semibold ${primaryText}`}>{v.title}</h3>
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="text-text-muted hover:text-text-primary"
                        aria-label="Menu"
                      >
                        ···
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex gap-1">
                        {v.platforms.map((p) => (
                          <PlatformDot key={p} letter={p} />
                        ))}
                      </div>
                      <time className={`text-xs ${th.faint}`}>{v.date}</time>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h2 className={`mb-4 font-heading text-xl font-bold ${primaryText}`}>Quick Actions</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Link
                to="/templates"
                className={`flex items-center gap-3 rounded-2xl border p-5 transition hover:border-accent-blue/40 ${th.surface}`}
              >
                <span className="text-2xl" aria-hidden>
                  🔥
                </span>
                <div>
                  <p className={`font-semibold ${primaryText}`}>Trending Templates</p>
                  <p className={`text-sm ${th.faint}`}>Start from top performers</p>
                </div>
              </Link>
              <Link
                to="/social"
                className={`flex items-center gap-3 rounded-2xl border p-5 transition hover:border-accent-violet/40 ${th.surface}`}
              >
                <span className="text-2xl" aria-hidden>
                  ⚡
                </span>
                <div>
                  <p className={`font-semibold ${primaryText}`}>Connect Instagram</p>
                  <p className={`text-sm ${th.faint}`}>Finish setup in one click</p>
                </div>
              </Link>
              <Link
                to="/analytics"
                className={`flex items-center gap-3 rounded-2xl border p-5 transition hover:border-success/40 ${th.surface}`}
              >
                <span className="text-2xl" aria-hidden>
                  📈
                </span>
                <div>
                  <p className={`font-semibold ${primaryText}`}>View Analytics</p>
                  <p className={`text-sm ${th.faint}`}>Track performance</p>
                </div>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
