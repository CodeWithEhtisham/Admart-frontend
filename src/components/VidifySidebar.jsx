import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppChrome } from '../utils/appChrome'
import {
  CREDITS_CHANGE_EVENT,
  getCredits,
} from '../utils/credits.js'

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: '◎' },
      { to: '/image-gen', label: 'AI Image Gen', icon: '🖼' },
      { to: '/create', label: 'Create Video', icon: '✦' },
      { to: '/library', label: 'Library', icon: '▤' },
      { to: '/templates', label: 'Templates', icon: '⧉' },
    ],
  },
  {
    label: 'Publish',
    items: [
      { to: '/calendar', label: 'Calendar', icon: '⌁' },
      { to: '/social', label: 'Social Accounts', icon: '⚡' },
    ],
  },
  {
    label: 'Analyze',
    items: [{ to: '/analytics', label: 'Analytics', icon: '📈' }],
  },
  {
    label: 'Workspace',
    items: [
      { to: '/brand-kit', label: 'Brand Kit', icon: '◇' },
      { to: '/billing', label: 'Billing', icon: '💳' },
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
        <span className="text-lg" aria-hidden>
          {item.icon}
        </span>
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

export default function VidifySidebar() {
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

  const rem = remaining ?? '—'
  const tot = total ?? '—'
  const pct =
    typeof remaining === 'number' && typeof total === 'number' && total > 0
      ? Math.min(100, Math.round((remaining / total) * 100))
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
                  active={pathname === item.to}
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
            <span aria-hidden>{theme === 'dark' ? '☀️' : '🌙'}</span>
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
            <span aria-hidden>{collapsed ? '→' : '←'}</span>
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}
