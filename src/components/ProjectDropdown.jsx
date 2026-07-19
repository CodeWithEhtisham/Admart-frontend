import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PROJECT_CHANGE_EVENT,
  activateProject,
  getCachedActiveProject,
  listProjects,
  resolveActiveProject,
  setActiveProject as cacheActiveProject,
} from '../utils/projects'

// Re-export so existing importers (if any) keep working from this module too.
export { PROJECT_CHANGE_EVENT }

// ─── Helpers ──────────────────────────────────────────────────────────
const PINNED_KEY = 'admart_pinnedProjects'
const LEGACY_PINNED_KEY = 'vidify_pinnedProjects'

function getPinnedIds() {
  try {
    let raw = localStorage.getItem(PINNED_KEY)
    if (!raw) {
      raw = localStorage.getItem(LEGACY_PINNED_KEY)
      if (raw) {
        localStorage.setItem(PINNED_KEY, raw)
        localStorage.removeItem(LEGACY_PINNED_KEY)
      }
    }
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// ─── Component ────────────────────────────────────────────────────────
export default function ProjectDropdown() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeProject, setActiveProjectState] = useState(getCachedActiveProject)
  const [pinnedIds, setPinnedIds] = useState(getPinnedIds)
  const [tab, setTab] = useState('recent') // 'recent' | 'all' | 'starred'
  const menuRef = useRef(null)
  const searchRef = useRef(null)

  // Load the user's projects from the backend on mount.
  useEffect(() => {
    let cancelled = false
    listProjects()
      .then((data) => {
        if (cancelled) return
        setProjects(data.projects)
        const active = resolveActiveProject(data)
        if (active) {
          setActiveProjectState(active)
          cacheActiveProject(active)
        }
      })
      .catch((err) => console.error('Failed to load projects:', err))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Stay in sync if the active project changes elsewhere (other tabs/components).
  useEffect(() => {
    const sync = () => setActiveProjectState(getCachedActiveProject())
    window.addEventListener(PROJECT_CHANGE_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(PROJECT_CHANGE_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  // Close on click outside
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
        setSearch('')
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
      // Auto-focus search
      setTimeout(() => searchRef.current?.focus(), 80)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') {
        setOpen(false)
        setSearch('')
      }
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  const selectProject = useCallback((proj) => {
    setActiveProjectState(proj)
    cacheActiveProject(proj) // caches to localStorage + broadcasts PROJECT_CHANGE_EVENT
    setOpen(false)
    setSearch('')
    activateProject(proj.id).catch((err) =>
      console.error('Failed to mark project active:', err),
    )
  }, [])

  const togglePin = useCallback(
    (id, e) => {
      e.stopPropagation()
      setPinnedIds((prev) => {
        const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
        localStorage.setItem(PINNED_KEY, JSON.stringify(next))
        localStorage.removeItem(LEGACY_PINNED_KEY)
        return next
      })
    },
    []
  )

  // Filtering
  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.org || '').toLowerCase().includes(search.toLowerCase()),
  )

  const pinnedProjects = filtered.filter((p) => pinnedIds.includes(p.id))
  const recentProjects = filtered.filter((p) => !pinnedIds.includes(p.id))

  const displayList =
    tab === 'starred'
      ? pinnedProjects
      : tab === 'all'
        ? filtered
        : [...pinnedProjects, ...recentProjects]

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger button */}
      <button
        type="button"
        id="project-dropdown-trigger"
        onClick={() => setOpen((o) => !o)}
        className="group flex items-center gap-2.5 rounded-xl border border-border-default bg-surface/60 px-3 py-1.5 text-sm transition hover:border-accent-blue/40 hover:bg-surface"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {/* Project color dot */}
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
          style={{ background: activeProject?.color || '#3f3f46' }}
        >
          {activeProject?.icon || '—'}
        </span>

        <span className="max-w-[140px] truncate font-medium text-text-primary">
          {activeProject?.name || (loading ? 'Loading…' : 'Select project')}
        </span>

        {/* Chevron */}
        <svg
          className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {open && (
        <>
          {/* Backdrop overlay */}
          <div className="fixed inset-0 z-[98]" aria-hidden />

          <div
            className="absolute left-0 top-full z-[99] mt-2 w-[380px] animate-fade-slide-down rounded-2xl border border-border-default bg-panel shadow-2xl shadow-black/40"
            role="dialog"
            aria-label="Select a project"
          >
            {/* Search bar */}
            <div className="border-b border-border p-3">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                  ⌕
                </span>
                <input
                  ref={searchRef}
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full rounded-xl border border-border-default bg-input pl-8 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border px-3">
              {[
                { id: 'recent', label: 'Recent' },
                { id: 'starred', label: 'Starred' },
                { id: 'all', label: 'All' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`relative px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
                    tab === t.id
                      ? 'text-accent-blue'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {t.label}
                  {tab === t.id && (
                    <span className="absolute bottom-0 left-1/2 h-[2px] w-4/5 -translate-x-1/2 rounded-full bg-accent-blue" />
                  )}
                </button>
              ))}
            </div>

            {/* Project list */}
            <div className="max-h-[320px] overflow-y-auto p-2">
              {displayList.length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-text-tertiary">
                  {loading
                    ? 'Loading projects…'
                    : search
                      ? 'No projects match your search'
                      : projects.length === 0
                        ? 'No projects yet — create your first one'
                        : 'No projects in this category'}
                </div>
              )}

              {/* Pinned section header */}
              {tab === 'recent' && pinnedProjects.length > 0 && (
                <p className="mb-1 mt-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                  Pinned
                </p>
              )}

              {tab === 'recent' &&
                pinnedProjects.map((proj) => (
                  <ProjectRow
                    key={proj.id}
                    project={proj}
                    isActive={activeProject?.id === proj.id}
                    isPinned
                    onSelect={() => selectProject(proj)}
                    onTogglePin={(e) => togglePin(proj.id, e)}
                  />
                ))}

              {tab === 'recent' && pinnedProjects.length > 0 && recentProjects.length > 0 && (
                <p className="mb-1 mt-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                  Recent
                </p>
              )}

              {tab === 'recent' &&
                recentProjects.map((proj) => (
                  <ProjectRow
                    key={proj.id}
                    project={proj}
                    isActive={activeProject?.id === proj.id}
                    isPinned={false}
                    onSelect={() => selectProject(proj)}
                    onTogglePin={(e) => togglePin(proj.id, e)}
                  />
                ))}

              {tab !== 'recent' &&
                displayList.map((proj) => (
                  <ProjectRow
                    key={proj.id}
                    project={proj}
                    isActive={activeProject?.id === proj.id}
                    isPinned={pinnedIds.includes(proj.id)}
                    onSelect={() => selectProject(proj)}
                    onTogglePin={(e) => togglePin(proj.id, e)}
                  />
                ))}
            </div>

            {/* Footer — New Project */}
            <div className="border-t border-border p-2">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-accent-blue transition hover:bg-accent-blue/10"
                onClick={() => {
                  setOpen(false)
                  setSearch('')
                  navigate('/onboarding')
                }}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-accent-blue/50 text-xs">
                  +
                </span>
                New Project
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Row sub-component ────────────────────────────────────────────────
function ProjectRow({ project, isActive, isPinned, onSelect, onTogglePin }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
        isActive
          ? 'bg-accent-blue/10 text-text-primary'
          : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
      }`}
    >
      {/* Icon badge */}
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm"
        style={{ background: project.color }}
      >
        {project.icon}
      </span>

      {/* Name & org */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium leading-tight">{project.name}</p>
        <p className="truncate text-xs text-text-muted">{project.org}</p>
      </div>

      {/* Active check */}
      {isActive && (
        <span className="text-accent-blue text-sm shrink-0" aria-label="Active project">
          ✓
        </span>
      )}

      {/* Star / pin toggle */}
      <button
        type="button"
        onClick={onTogglePin}
        className={`shrink-0 text-sm transition ${
          isPinned
            ? 'text-warning'
            : 'text-text-muted opacity-0 group-hover:opacity-100 hover:text-warning'
        }`}
        aria-label={isPinned ? 'Unpin project' : 'Pin project'}
        title={isPinned ? 'Unpin' : 'Pin'}
      >
        {isPinned ? '★' : '☆'}
      </button>
    </button>
  )
}
