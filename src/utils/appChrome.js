import { useEffect, useState } from 'react'

const COLLAPSE_KEY = 'admart_sidebarCollapsed'
const THEME_KEY = 'admart_theme'
const CHROME_EVENT = 'admart:chrome-change'
const DESKTOP_QUERY = '(min-width: 1024px)' // Tailwind lg: sidebar is pinned at and above this width

// The phone/tablet drawer is per-tab UI state, so it lives in memory, not localStorage.
let mobileNavOpen = false

function isDesktopNow() {
  return typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches
}

export function getCollapsed() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(COLLAPSE_KEY) === '1'
}

export function getTheme() {
  if (typeof window === 'undefined') return 'dark'
  return window.localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
}

/**
 * Shared app-chrome state (sidebar collapse, phone drawer, light/dark theme).
 * State is persisted to localStorage and broadcast via a custom event so that
 * every mounted consumer (sidebar, layout, header) stays in sync, including
 * across route changes where each page mounts its own components.
 */
export function useAppChrome() {
  const [collapsed, setCollapsed] = useState(getCollapsed)
  const [theme, setTheme] = useState(getTheme)
  const [mobileOpen, setMobileOpen] = useState(mobileNavOpen)
  const [isDesktop, setIsDesktop] = useState(isDesktopNow)

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY)
    const onMedia = () => setIsDesktop(media.matches)
    media.addEventListener('change', onMedia)
    return () => media.removeEventListener('change', onMedia)
  }, [])

  useEffect(() => {
    const sync = () => {
      setMobileOpen(mobileNavOpen)
      setCollapsed(getCollapsed())
      const nextTheme = getTheme()
      setTheme(nextTheme)
      applyTheme(nextTheme)
    }
    sync()
    window.addEventListener(CHROME_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(CHROME_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const toggleCollapsed = () => {
    window.localStorage.setItem(COLLAPSE_KEY, getCollapsed() ? '0' : '1')
    window.dispatchEvent(new Event(CHROME_EVENT))
  }

  const toggleTheme = () => {
    const next = getTheme() === 'light' ? 'dark' : 'light'
    window.localStorage.setItem(THEME_KEY, next)
    applyTheme(next)
    window.dispatchEvent(new Event(CHROME_EVENT))
  }

  const setMobileNav = (open) => {
    mobileNavOpen = open
    window.dispatchEvent(new Event(CHROME_EVENT))
  }

  return { collapsed, theme, toggleCollapsed, toggleTheme, mobileOpen, setMobileNav, isDesktop }
}
