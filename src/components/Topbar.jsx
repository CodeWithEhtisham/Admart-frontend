import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProjectDropdown from './ProjectDropdown'
import { getUserInitial } from '../utils/user.js'
import api from '../utils/api'
import { CREDITS_CHANGE_EVENT, formatCredits, getCredits } from '../utils/credits.js'

/**
 * Shared top navigation bar used by every in-app page.
 * The structure and the right-side account cluster (search, notifications,
 * user menu with Settings/Logout) are identical everywhere — only the
 * breadcrumb `title` changes per page.
 */
export default function Topbar({ title }) {
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [creditsRemaining, setCreditsRemaining] = useState(null)

  useEffect(() => {
    let cancelled = false
    getCredits()
      .then((bal) => {
        if (!cancelled && bal?.creditsRemaining != null) {
          setCreditsRemaining(bal.creditsRemaining)
        }
      })
      .catch(() => {})
    const onChange = (e) => {
      if (e.detail?.creditsRemaining != null) {
        setCreditsRemaining(e.detail.creditsRemaining)
      }
    }
    window.addEventListener(CREDITS_CHANGE_EVENT, onChange)
    return () => {
      cancelled = true
      window.removeEventListener(CREDITS_CHANGE_EVENT, onChange)
    }
  }, [])

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        await api.post('/api/auth/logout', { refreshToken })
      }
    } catch (err) {
      console.error('Backend logout error:', err)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      navigate('/auth')
    }
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

  return (
    <>
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

      <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between gap-4 border-b border-border bg-panel/90 px-7 backdrop-blur-md">
        <div className="flex items-center gap-4 shrink-0">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-text-secondary">
            <Link to="/dashboard" className="hover:text-text-primary">
              Dashboard
            </Link>
            <span className="text-text-muted">/</span>
            <span className="font-heading text-lg font-bold text-text-primary">{title}</span>
          </nav>
          <span className="text-text-muted">|</span>
          <ProjectDropdown />
        </div>

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="mx-auto hidden max-w-md flex-1 items-center gap-3 rounded-xl border border-border-default bg-surface px-4 py-2 text-left text-sm text-text-secondary md:flex"
        >
          <span className="text-text-muted">⌕</span>
          <span>Search videos, templates...</span>
          <span className="ml-auto font-mono text-xs text-text-muted">⌘K</span>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/billing"
            className="hidden items-center gap-1.5 rounded-xl border border-border-default bg-surface px-3 py-2 font-mono text-sm font-semibold text-text-primary transition hover:border-accent-blue/40 sm:inline-flex"
            title="Credits remaining"
          >
            <span className="text-accent-blue" aria-hidden>
              ◆
            </span>
            {formatCredits(creditsRemaining, '…')}
          </Link>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="rounded-xl border border-border-default bg-surface px-3 py-2 text-sm md:hidden"
          >
            Search
          </button>
          <Link
            to="/notifications"
            className="relative rounded-xl border border-border-default bg-surface p-2"
            aria-label="Notifications"
          >
            <span className="text-lg" aria-hidden>
              🔔
            </span>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" />
          </Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-full font-heading text-sm font-bold text-white gradient-bg hover:ring-2 hover:ring-accent-blue/50 transition cursor-pointer"
              aria-haspopup="true"
              aria-expanded={userMenuOpen}
            >
              {getUserInitial()}
            </button>

            {userMenuOpen && (
              <>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(false)}
                  className="fixed inset-0 z-40 h-full w-full cursor-default"
                  aria-label="Close user menu"
                />
                <div className="absolute right-0 mt-2 z-50 w-48 rounded-xl border border-border-default bg-panel p-2 shadow-xl animate-fade-slide-down">
                  <Link
                    to="/settings"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary transition hover:bg-white/5 hover:text-text-primary"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <span className="text-lg">⚙</span> Settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false)
                      handleLogout()
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-error hover:bg-error/10 transition text-left"
                  >
                    <span className="text-lg">↪</span> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
