import { Link, useNavigate } from 'react-router-dom'

const EMPTY_STATES = [
  {
    icon: '🎬',
    accent: 'blue',
    badge: 'Videos',
    title: 'No videos yet',
    desc: 'Create your first AI-powered video and start building your content library.',
    action: '✦ Create Your First Video',
    to: '/create',
    variant: 'gradient',
  },
  {
    icon: '📊',
    accent: 'violet',
    badge: 'Analytics',
    title: 'No data to show yet',
    desc: 'Publish content across platforms to start tracking views, engagement, and growth.',
    action: 'Create & Publish →',
    to: '/create',
    variant: 'outline',
  },
  {
    icon: '🔗',
    accent: 'green',
    badge: 'Social',
    title: 'No accounts connected',
    desc: 'Link your TikTok, YouTube, Instagram, or Facebook to publish directly from Vidify.',
    action: 'Connect Accounts →',
    to: '/social',
    variant: 'gradient',
  },
  {
    icon: '📅',
    accent: 'yellow',
    badge: 'Calendar',
    title: 'Nothing scheduled',
    desc: 'Plan your content calendar and schedule posts for the best engagement times.',
    action: 'Schedule Content →',
    to: '/create',
    variant: 'outline',
  },
  {
    icon: '◈',
    accent: 'grey',
    badge: 'Templates',
    title: 'No favourites yet',
    desc: 'Browse our template library and save your favourites for quick access later.',
    action: 'Browse Templates →',
    to: '/templates',
    variant: 'outline',
  },
  {
    icon: '🔔',
    accent: 'blue',
    badge: 'Notifications',
    title: 'All caught up!',
    desc: 'You have no new notifications. We\'ll let you know when something needs your attention.',
    action: 'Back to Dashboard',
    to: '/dashboard',
    variant: 'outline',
  },
]

const ACCENT_MAP = {
  blue: {
    badge: 'border-accent-blue/30 bg-accent-blue/15 text-accent-blue',
    iconBg: 'bg-accent-blue/10',
    gradient: 'from-accent-blue to-accent-violet',
    outline: 'border-accent-blue/40 text-accent-blue hover:bg-accent-blue/10',
  },
  violet: {
    badge: 'border-accent-violet/30 bg-accent-violet/15 text-accent-violet',
    iconBg: 'bg-accent-violet/10',
    gradient: 'from-accent-violet to-pink-500',
    outline: 'border-accent-violet/40 text-accent-violet hover:bg-accent-violet/10',
  },
  green: {
    badge: 'border-success/30 bg-success/15 text-success',
    iconBg: 'bg-success/10',
    gradient: 'from-success to-tiktok',
    outline: 'border-success/40 text-success hover:bg-success/10',
  },
  yellow: {
    badge: 'border-warning/30 bg-warning/15 text-warning',
    iconBg: 'bg-warning/10',
    gradient: 'from-warning to-orange-500',
    outline: 'border-warning/40 text-warning hover:bg-warning/10',
  },
  grey: {
    badge: 'border-white/10 bg-white/5 text-text-tertiary',
    iconBg: 'bg-white/5',
    gradient: 'from-text-muted to-text-tertiary',
    outline: 'border-white/10 text-text-secondary hover:bg-white/5',
  },
}

const QUICK_LINKS = [
  { icon: '✦', label: 'Create Video', to: '/create' },
  { icon: '▤', label: 'My Videos', to: '/library' },
  { icon: '⧉', label: 'Templates', to: '/templates' },
  { icon: '📈', label: 'Analytics', to: '/analytics' },
  { icon: '⚡', label: 'Social Accounts', to: '/social' },
]

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-base font-body text-text-primary">
      <style>{`
        @keyframes float404 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>

      {/* Simple nav bar */}
      <nav className="flex h-[60px] items-center border-b border-border bg-panel px-6">
        <Link to="/dashboard" className="font-heading text-lg font-bold">
          <span className="gradient-text">V</span>
          <span className="text-text-primary">idify</span>
        </Link>
      </nav>

      {/* 404 hero */}
      <section className="relative flex min-h-[calc(100vh-60px)] flex-col items-center justify-center overflow-hidden px-6 py-16">
        {/* Background blobs */}
        <div
          className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full opacity-20 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
        />

        {/* Floating 404 */}
        <h1
          className="bg-gradient-to-r from-accent-blue to-accent-violet bg-clip-text font-heading font-bold leading-none text-transparent"
          style={{
            fontSize: 'clamp(100px, 20vw, 200px)',
            animation: 'float404 4s ease-in-out infinite',
          }}
        >
          404
        </h1>

        <h2 className="mt-4 font-heading text-[28px] font-bold text-text-primary">
          This page went off-script
        </h2>
        <p className="mt-3 max-w-[420px] text-center text-base text-text-tertiary">
          The page you're looking for doesn't exist, was moved, or maybe got lost in the AI generation queue.
        </p>

        {/* Action buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent-violet/20 transition hover:opacity-90"
          >
            ⊞ Back to Dashboard
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-border-default px-5 py-2.5 text-sm font-medium text-text-secondary transition hover:border-white/20 hover:text-text-primary"
          >
            ← Go Back
          </button>
        </div>

        {/* Quick links */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="inline-flex items-center gap-2 rounded-full border border-border-default bg-surface px-4 py-2 text-xs font-medium text-text-secondary transition hover:border-white/15 hover:text-text-primary"
            >
              <span aria-hidden>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Divider */}
      <hr className="border-t border-border" />

      {/* Empty States Showcase */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="font-heading text-2xl font-bold text-text-primary">Empty State Components</h2>
          <p className="mt-2 text-sm text-text-tertiary">
            These components appear when sections have no content yet
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {EMPTY_STATES.map((card) => {
            const a = ACCENT_MAP[card.accent]
            return (
              <div
                key={card.title}
                className="relative overflow-hidden rounded-2xl border border-border-default bg-panel p-6"
              >
                {/* Badge */}
                <span className={`absolute right-4 top-4 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${a.badge}`}>
                  {card.badge}
                </span>

                {/* Icon */}
                <div className={`flex h-20 w-20 items-center justify-center rounded-[20px] text-4xl ${a.iconBg}`}>
                  {card.icon}
                </div>

                <h3 className="mt-5 font-heading text-base font-semibold text-text-primary">
                  {card.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-tertiary">{card.desc}</p>

                <Link
                  to={card.to}
                  className={`mt-5 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition ${
                    card.variant === 'gradient'
                      ? `border-transparent bg-gradient-to-r ${a.gradient} text-white shadow-md hover:opacity-90`
                      : a.outline
                  }`}
                >
                  {card.action}
                </Link>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
