import { Link, useLocation } from 'react-router-dom'

function itemCls(isActive) {
  const base =
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition w-full'
  const inactive = 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
  const activeCls = 'bg-accent-blue/15 text-accent-blue'
  return `${base} ${isActive ? activeCls : inactive}`
}

export default function VidifySidebar() {
  const { pathname } = useLocation()

  const main = [
    { to: '/dashboard', label: 'Dashboard', icon: '◎' },
    { to: '/image-gen', label: 'AI Image Gen', icon: '🖼' },
    { to: '/create', label: 'Create Video', icon: '✦' },
    { to: '/library', label: 'My Videos', icon: '▤', badge: '18' },
    { to: '/templates', label: 'Templates', icon: '⧉' },
  ]

  const publish = [
    { to: '/calendar', label: 'Calendar', icon: '⌁' },
    { to: '/social', label: 'Social Accounts', icon: '⚡' },
  ]

  const analyze = [{ to: '/analytics', label: 'Analytics', icon: '📈' }]

  const settings = [
    { to: '/brand-kit', label: 'Brand Kit', icon: '◇' },
    { to: '/billing', label: 'Billing', icon: '💳' },
    { to: '/notifications', label: 'Notifications', icon: '🔔', badge: '6', badgeColor: 'red' },
    { to: '/settings', label: 'Settings', icon: '⚙', key: 'settings-end' },
  ]

  return (
    <aside className="fixed bottom-0 left-0 top-0 z-40 flex w-[260px] flex-col border-r border-border bg-panel">
      <div className="flex h-[60px] items-center border-b border-border px-4">
        <Link to="/" className="font-heading text-lg font-bold">
          <span className="gradient-text">V</span>
          <span className="text-text-primary">idify</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Main</p>
          <div className="space-y-1">
            {main.map((item) => (
              <Link
                key={item.to + item.label}
                to={item.to}
                className={`${itemCls(pathname === item.to)} ${item.badge ? 'justify-between' : ''}`}
                title={item.label}
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg" aria-hidden>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </span>
                {item.badge && (
                  <span className="rounded-full bg-accent-blue/20 px-2 py-0.5 text-xs font-semibold text-accent-blue">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Publish</p>
          <div className="space-y-1">
            {publish.map((item) => (
              <Link key={item.to} to={item.to} className={itemCls(pathname === item.to)} title={item.label}>
                <span className="text-lg" aria-hidden>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Analyze</p>
          <div className="space-y-1">
            {analyze.map((item) => (
              <Link key={item.to} to={item.to} className={itemCls(pathname === item.to)} title={item.label}>
                <span className="text-lg" aria-hidden>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Settings</p>
          <div className="space-y-1">
            {settings.map((item) => (
              <Link
                key={item.key || item.label}
                to={item.to}
                className={`${itemCls(pathname === item.to)} ${item.badge ? 'justify-between' : ''}`}
                title={item.label}
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg" aria-hidden>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </span>
                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      item.badgeColor === 'red'
                        ? 'bg-error/20 text-error'
                        : 'bg-accent-blue/20 text-accent-blue'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="mt-auto space-y-3 border-t border-border p-3">
        <div className="rounded-xl border border-border-default bg-surface p-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-text-secondary">Credits</span>
            <span className="font-mono font-semibold text-text-primary">42</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-violet"
              style={{ width: '21%' }}
            />
          </div>
          <p className="mt-1 text-xs text-text-tertiary">42 / 200</p>
        </div>
      </div>
    </aside>
  )
}
