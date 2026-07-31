import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppChrome } from '../utils/appChrome'
import {
  CREDITS_CHANGE_EVENT,
  formatCredits,
  getCredits,
} from '../utils/credits.js'

function Icon({ children, className = 'h-5 w-5' }) {
  return (
    <svg
      className={`shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  )
}

const Icons = {
  dashboard: (
    <Icon>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </Icon>
  ),
  imageGen: (
    <Icon>
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <circle cx="9" cy="9" r="1.75" />
      <path d="M3 16.5l5-4.5 4 3.5 3-2.5 6 5" />
    </Icon>
  ),
  createVideo: (
    <Icon>
      <rect x="2.5" y="5" width="14" height="14" rx="2.5" />
      <path d="M16.5 10.5L21.5 7.5v9l-5-3" />
      <path d="M7 12h5M9.5 9.5v5" />
    </Icon>
  ),
  library: (
    <Icon>
      <path d="M4 5.5A1.5 1.5 0 015.5 4H14a1.5 1.5 0 011.5 1.5v13A1.5 1.5 0 0114 20H5.5A1.5 1.5 0 014 18.5v-13z" />
      <path d="M17 6.5h1.5A1.5 1.5 0 0120 8v10.5A1.5 1.5 0 0118.5 20H17" />
      <path d="M7.5 9h5M7.5 12.5h5M7.5 16h3" />
    </Icon>
  ),
  templates: (
    <Icon>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </Icon>
  ),
  calendar: (
    <Icon>
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9.5h18M8 3v3.5M16 3v3.5" />
      <path d="M8 13.5h.01M12 13.5h.01M16 13.5h.01M8 17h.01M12 17h.01" />
    </Icon>
  ),
  social: (
    <Icon>
      <circle cx="12" cy="12" r="3" />
      <circle cx="5" cy="7" r="2" />
      <circle cx="19" cy="7" r="2" />
      <circle cx="5" cy="17" r="2" />
      <circle cx="19" cy="17" r="2" />
      <path d="M7 8.2l2.5 2.2M14.5 10.4L17 8.2M7 15.8l2.5-2.2M14.5 13.6L17 15.8" />
    </Icon>
  ),
  analytics: (
    <Icon>
      <path d="M4 19V5M4 19h16" />
      <path d="M8 15v-3M12 15V8M16 15v-6" />
      <path d="M8 9l4-3 4 2" />
    </Icon>
  ),
  brandKit: (
    <Icon>
      <path d="M12 3l7.5 4.2v9.6L12 21l-7.5-4.2V7.2L12 3z" />
      <path d="M12 12l7.5-4.2M12 12v9M12 12L4.5 7.8" />
    </Icon>
  ),
  billing: (
    <Icon>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
      <path d="M2.5 10h19" />
      <path d="M7 15h3M14 15h3" />
    </Icon>
  ),
  sun: (
    <Icon className="h-4 w-4">
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" />
    </Icon>
  ),
  moon: (
    <Icon className="h-4 w-4">
      <path d="M20 14.5A8.5 8.5 0 019.5 4 7 7 0 1019 16.5c.35-.64.65-1.3.9-2z" />
    </Icon>
  ),
  panelLeft: (
    <Icon className="h-4 w-4">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
      <path d="M13.5 10l-2 2 2 2" />
    </Icon>
  ),
  panelRight: (
    <Icon className="h-4 w-4">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
      <path d="M12.5 10l2 2-2 2" />
    </Icon>
  ),
}

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: Icons.dashboard },
      { to: '/image-gen', label: 'AI Image Gen', icon: Icons.imageGen },
      { to: '/video-gen', label: 'AI Video Gen', icon: Icons.createVideo },
      { to: '/library', label: 'Library', icon: Icons.library },
      { to: '/templates', label: 'Templates', icon: Icons.templates },
    ],
  },
  {
    label: 'Publish',
    items: [
      { to: '/calendar', label: 'Calendar', icon: Icons.calendar },
      { to: '/social', label: 'Social Accounts', icon: Icons.social },
    ],
  },
  {
    label: 'Analyze',
    items: [{ to: '/analytics', label: 'Analytics', icon: Icons.analytics }],
  },
  {
    label: 'Workspace',
    items: [
      { to: '/brand-kit', label: 'Brand Kit', icon: Icons.brandKit },
      { to: '/billing', label: 'Billing', icon: Icons.billing },
    ],
  },
]

function NavItem({ item, active, collapsed }) {
  const base =
    'flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition w-full'
  const state = active
    ? 'bg-accent-blue/15 text-accent-blue'
    : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
  const layout = collapsed ? 'justify-center gap-0' : item.badge ? 'justify-between gap-3' : 'gap-3'

  const badgeCls =
    item.badgeColor === 'red'
      ? 'bg-error/20 text-error'
      : 'bg-accent-blue/20 text-accent-blue'

  return (
    <Link to={item.to} className={`${base} ${state} ${layout}`} title={item.label}>
      <span className="flex items-center gap-3">
        {item.icon}
        {!collapsed && <span>{item.label}</span>}
      </span>
      {!collapsed && item.badge && (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeCls}`}>
          {item.badge}
        </span>
      )}
    </Link>
  )
}

export default function AdmartSidebar() {
  const { pathname } = useLocation()
  const { collapsed, theme, toggleCollapsed, toggleTheme } = useAppChrome()
  const sidebarW = collapsed ? 'w-[72px]' : 'w-[260px]'
  const [remaining, setRemaining] = useState(null)
  const [total, setTotal] = useState(null)

  useEffect(() => {
    let cancelled = false
    getCredits()
      .then((bal) => {
        if (cancelled || !bal) return
        setRemaining(bal.creditsRemaining)
        setTotal(bal.creditsTotal)
      })
      .catch(() => {})
    const onChange = (e) => {
      const d = e.detail
      if (d?.creditsRemaining != null) setRemaining(d.creditsRemaining)
      if (d?.creditsTotal != null) setTotal(d.creditsTotal)
    }
    window.addEventListener(CREDITS_CHANGE_EVENT, onChange)
    return () => {
      cancelled = true
      window.removeEventListener(CREDITS_CHANGE_EVENT, onChange)
    }
  }, [])

  const rem = formatCredits(remaining)
  const tot = formatCredits(total)
  const remainingNumber = Number(remaining)
  const totalNumber = Number(total)
  const pct =
    Number.isFinite(remainingNumber) && Number.isFinite(totalNumber) && totalNumber > 0
      ? Math.min(100, Math.round((remainingNumber / totalNumber) * 100))
      : 0

  return (
    <aside
      className={`fixed bottom-0 left-0 top-0 z-40 flex flex-col border-r border-border bg-panel transition-[width] duration-300 ease-out ${sidebarW}`}
    >
      <div className={`flex h-[60px] items-center border-b border-border px-4 ${collapsed ? 'justify-center' : ''}`}>
        <Link to="/dashboard" className="font-heading text-lg font-bold">
          <span className="gradient-text">A</span>
          {!collapsed && <span className="text-text-primary">dmart</span>}
        </Link>
      </div>

      <nav className={`flex-1 space-y-6 overflow-y-auto py-4 ${collapsed ? 'px-2' : 'px-3'}`}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavItem
                  key={item.to}
                  item={item}
                  active={pathname === item.to || pathname.startsWith(`${item.to}/`)}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto space-y-3 border-t border-border p-3">
        <Link
          to="/billing"
          title="Billing & credits"
          className={`block rounded-xl border border-border-default bg-surface transition hover:border-accent-blue/40 ${
            collapsed ? 'px-2 py-2 text-center' : 'p-3'
          }`}
        >
          {!collapsed ? (
            <>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-text-secondary">Credits</span>
                <span className="font-mono font-semibold text-text-primary">{rem}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-violet transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-text-tertiary">
                {rem} / {tot}
              </p>
            </>
          ) : (
            <>
              <p className="font-mono text-sm font-bold text-text-primary">{rem}</p>
              <div className="mx-auto mt-1 h-8 w-1 overflow-hidden rounded-full bg-elevated">
                <div
                  className="w-full bg-gradient-to-b from-accent-blue to-accent-violet transition-all"
                  style={{ height: `${pct}%` }}
                />
              </div>
            </>
          )}
        </Link>

        <div className={`flex gap-2 ${collapsed ? 'flex-col' : ''}`}>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border-default bg-elevated py-2 text-sm text-text-secondary transition hover:text-text-primary"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? Icons.sun : Icons.moon}
            {!collapsed && <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>}
          </button>
          <button
            type="button"
            onClick={toggleCollapsed}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border-default bg-elevated py-2 text-sm text-text-secondary transition hover:text-text-primary"
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? Icons.panelRight : Icons.panelLeft}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}
