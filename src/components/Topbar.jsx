import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProjectDropdown from './ProjectDropdown'
import { CREDITS_CHANGE_EVENT, formatCredits, getCredits } from '../utils/credits.js'
import { clearActiveProject } from '../utils/projects'
import api from '../utils/api'
import { clearSession, getStoredUser, isAuthenticated } from '../utils/auth'
import { useAppChrome } from '../utils/appChrome'
import { initialsFor } from '../utils/user.js'

/**
 * Shared top navigation bar used by every in-app page.
 * The breadcrumb title changes per page; search, project, credits, and account
 * controls stay consistent across the authenticated workspace.
 */
export default function Topbar({ title }) {
  const { mobileOpen, setMobileNav } = useAppChrome()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [creditsRemaining, setCreditsRemaining] = useState(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const authenticated = isAuthenticated()
  const user = getStoredUser()

  const handleSignOut = async () => {
    try {
      const refreshToken = window.localStorage.getItem('refreshToken')
      if (refreshToken) {
        await api.post('/api/auth/logout', { refreshToken, refresh: refreshToken })
      }
    } catch {
      /* still clear local session */
    }
    clearSession()
    clearActiveProject()
    navigate('/auth', { replace: true })
  }

  useEffect(() => {
    let cancelled = false
    getCredits()
      .then((bal) => {
        if (!cancelled && bal?.creditsRemaining != null) {
          setCreditsRemaining(bal.creditsRemaining)
        }
      })
      .catch(() => {})

    const onChange = (event) => {
      if (event.detail?.creditsRemaining != null) {
        setCreditsRemaining(event.detail.creditsRemaining)
      }
    }

    window.addEventListener(CREDITS_CHANGE_EVENT, onChange)
    return () => {
      cancelled = true
      window.removeEventListener(CREDITS_CHANGE_EVENT, onChange)
    }
  }, [])

  const onSearchKey = useCallback((event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      setSearchOpen((open) => !open)
    }
    if (event.key === 'Escape') setSearchOpen(false)
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
          <p className="mt-3 text-center text-xs text-text-muted">Press Esc to close / Ctrl+K</p>
        </div>
      )}

      <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between gap-2 border-b border-border bg-base/75 px-3 backdrop-blur-xl sm:gap-4 sm:px-7">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setMobileNav(true)}
            aria-label="Open menu"
            aria-controls="app-sidebar"
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-default bg-surface text-text-primary lg:hidden"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm text-text-secondary">
            <Link to="/dashboard" className="hidden py-1 hover:text-text-primary sm:inline-block">
              Dashboard
            </Link>
            <span className="hidden text-text-muted sm:inline">/</span>
            <h1 className="truncate font-heading text-lg font-bold text-text-primary">{title}</h1>
          </nav>
          {authenticated && (
            <>
              <span className="hidden text-text-muted lg:inline">|</span>
              <div className="hidden lg:block">
                <ProjectDropdown />
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="mx-auto hidden max-w-md flex-1 items-center gap-3 rounded-xl border border-border-default bg-surface px-4 py-2 text-left text-sm text-text-secondary transition hover:border-accent-blue/40 hover:bg-elevated hover:shadow-[0_0_0_1px_rgba(59,130,246,0.12)] md:flex"
        >
          <span aria-hidden className="text-text-tertiary">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <span>Search videos, templates...</span>
          <span className="ml-auto rounded-md border border-border-default bg-input px-1.5 py-0.5 font-mono text-xs text-text-muted">
            Ctrl K
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/billing"
            className="hidden items-center gap-1.5 rounded-xl border border-border-default bg-surface px-3 py-2 font-mono text-sm font-semibold text-text-primary transition hover:border-accent-blue/40 hover:shadow-[0_0_0_1px_rgba(59,130,246,0.12)] sm:inline-flex"
            title="Credits remaining"
          >
            <span
              className="flex h-5 w-5 items-center justify-center rounded-md gradient-bg font-sans text-[10px] font-bold text-white"
              aria-hidden
            >
              cr
            </span>
            {formatCredits(creditsRemaining, '...')}
          </Link>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-default bg-surface text-text-secondary md:hidden"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>

          <Link
            to="/notifications"
            className="relative rounded-xl border border-border-default bg-surface p-2"
            aria-label="Notifications"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </Link>

          {!authenticated ? (
            <>
              <Link
                to="/auth"
                className="rounded-xl border border-border-default bg-surface px-3 py-2 text-sm font-medium text-text-primary transition hover:border-accent-blue/40"
              >
                Sign in
              </Link>
              <Link
                to="/auth?mode=sign-up"
                className="rounded-xl gradient-bg px-3 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                className="flex h-9 w-9 items-center justify-center rounded-full gradient-bg font-heading text-xs font-bold text-white shadow-md shadow-accent-blue/20 transition hover:opacity-90"
                title={user?.email || 'User profile'}
              >
                {initialsFor(user)}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-border-default bg-panel p-3 shadow-2xl animate-fade-slide-down">
                  <div className="border-b border-border-default pb-2.5 mb-2 px-1">
                    <p className="font-heading text-sm font-bold text-text-primary truncate">
                      {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'User'}
                    </p>
                    <p className="text-xs text-text-muted truncate">{user?.email || ''}</p>
                  </div>
                  <Link
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-text-secondary transition hover:bg-surface hover:text-text-primary"
                  >
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-danger transition hover:bg-error/10"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  )
}

