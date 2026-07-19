import { useEffect, useState } from 'react'

const COLLAPSE_KEY = 'admart_sidebarCollapsed'
const THEME_KEY = 'admart_theme'
const CHROME_EVENT = 'admart:chrome-change'

const LEGACY_COLLAPSE_KEY = 'vidify_sidebarCollapsed'
const LEGACY_THEME_KEY = 'vidify_theme'

function migrateKey(nextKey, legacyKey) {
  if (typeof window === 'undefined') return
  if (window.localStorage.getItem(nextKey) != null) return
  const legacy = window.localStorage.getItem(legacyKey)
  if (legacy != null) {
    window.localStorage.setItem(nextKey, legacy)
    window.localStorage.removeItem(legacyKey)
  }
}

export function getCollapsed() {
  if (typeof window === 'undefined') return false
  migrateKey(COLLAPSE_KEY, LEGACY_COLLAPSE_KEY)
  return window.localStorage.getItem(COLLAPSE_KEY) === '1'
}

export function getTheme() {
  if (typeof window === 'undefined') return 'dark'
  migrateKey(THEME_KEY, LEGACY_THEME_KEY)
  return window.localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
}

/**
 * Shared app-chrome state (sidebar collapse + light/dark theme).
 * State is persisted to localStorage and broadcast via a custom event so that
 * every mounted consumer (sidebar, layout, header) stays in sync, including
 * across route changes where each page mounts its own components.
 */
export function useAppChrome() {
  const [collapsed, setCollapsed] = useState(getCollapsed)
  const [theme, setTheme] = useState(getTheme)

  useEffect(() => {
    const sync = () => {
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

  return { collapsed, theme, toggleCollapsed, toggleTheme }
}
