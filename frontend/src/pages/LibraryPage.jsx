import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const MOCK_VIDEOS = [
  {
    id: '1',
    title: 'Summer Product Launch Campaign',
    status: 'published',
    platforms: ['T', 'Y'],
    duration: '0:30',
    views: '12.4K',
    date: '2h ago',
  },
  {
    id: '2',
    title: 'Brand Story 2024 — Origin',
    status: 'generating',
    platforms: ['I'],
    duration: '1:00',
    views: null,
    date: '5m ago',
  },
  {
    id: '3',
    title: 'Tutorial: Getting Started in 60s',
    status: 'ready',
    platforms: ['Y'],
    duration: '0:15',
    views: null,
    date: 'Yesterday',
  },
  {
    id: '4',
    title: 'Product Testimonial — Happy Customer',
    status: 'scheduled',
    platforms: ['T', 'F'],
    duration: '0:45',
    views: null,
    date: '2d ago',
  },
  {
    id: '5',
    title: 'Q4 Campaign Ad — Retry',
    status: 'failed',
    platforms: ['I'],
    duration: '0:30',
    views: null,
    date: '3d ago',
  },
  {
    id: '6',
    title: 'Holiday Promo Video',
    status: 'ready',
    platforms: ['T', 'Y', 'I'],
    duration: '0:30',
    views: null,
    date: '4d ago',
  },
  {
    id: '7',
    title: 'New Product Reveal — Teasure',
    status: 'published',
    platforms: ['T', 'Y', 'I', 'F'],
    duration: '0:20',
    views: '8.1K',
    date: '5d ago',
  },
  {
    id: '8',
    title: 'Behind the Scenes Look',
    status: 'published',
    platforms: ['I'],
    duration: '0:45',
    views: '3.2K',
    date: '1w ago',
  },
  {
    id: '9',
    title: 'Customer Success Story #1',
    status: 'published',
    platforms: ['Y', 'F'],
    duration: '2:00',
    views: '5.7K',
    date: '1w ago',
  },
]

const PLATFORM_DOT = {
  T: 'bg-tiktok',
  Y: 'bg-youtube',
  I: 'bg-instagram',
  F: 'bg-facebook',
}

function parseDurationMmSs(s) {
  const parts = s.split(':').map(Number)
  if (parts.length !== 2 || parts.some(Number.isNaN)) return 0
  return parts[0] * 60 + parts[1]
}

function parseViews(v) {
  if (!v) return 0
  const n = parseFloat(v.replace('K', ''))
  if (Number.isNaN(n)) return 0
  return v.includes('K') ? n * 1000 : n
}

const STATUS_STYLES = {
  published: 'border-success/30 bg-success/10 text-success',
  generating: 'border-warning/30 bg-warning/10 text-warning',
  ready: 'border-accent-blue/30 bg-accent-blue/10 text-accent-blue',
  scheduled: 'border-warning/30 bg-warning/10 text-warning',
  failed: 'border-error/30 bg-error/10 text-error',
}

function LogoMark() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg gradient-bg font-heading text-lg font-bold text-white shadow-lg shadow-accent-blue/20">
        V
      </span>
      <span className="font-heading text-xl font-semibold tracking-tight text-text-primary">Vidify</span>
    </Link>
  )
}

function SearchIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" strokeLinecap="round" />
    </svg>
  )
}

function navLinkClass(active) {
  const base =
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:bg-elevated hover:text-text-primary'
  return active ? `${base} bg-elevated font-medium text-text-primary` : `${base} text-text-secondary`
}

export default function LibraryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [viewMode, setViewMode] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [activeMenu, setActiveMenu] = useState(null)

  useEffect(() => {
    const onDoc = (e) => {
      if (activeMenu === null) return
      if (!e.target.closest('[data-video-menu-root]')) setActiveMenu(null)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [activeMenu])

  const filteredVideos = useMemo(() => {
    let list = [...MOCK_VIDEOS]
    if (statusFilter !== 'all') {
      list = list.filter((v) => v.status === statusFilter)
    }
    if (platformFilter !== 'all') {
      const code = platformFilter
      list = list.filter((v) => v.platforms.includes(code))
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((v) => v.title.toLowerCase().includes(q))
    }
    if (typeFilter !== 'all') {
      if (typeFilter === 'short') list = list.filter((v) => parseDurationMmSs(v.duration) <= 45)
      if (typeFilter === 'long') list = list.filter((v) => parseDurationMmSs(v.duration) > 45)
    }
    if (sortBy === 'az') list.sort((a, b) => a.title.localeCompare(b.title))
    if (sortBy === 'newest') list.sort((a, b) => Number(a.id) - Number(b.id))
    if (sortBy === 'oldest') list.sort((a, b) => Number(b.id) - Number(a.id))
    if (sortBy === 'views') list.sort((a, b) => parseViews(b.views) - parseViews(a.views))
    return list
  }, [searchQuery, statusFilter, typeFilter, platformFilter, sortBy])

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllVisible = () => {
    setSelectedIds(new Set(filteredVideos.map((v) => v.id)))
  }

  const clearSelection = () => setSelectedIds(new Set())

  const nSelected = selectedIds.size
  const totalCount = 18

  return (
    <div className="flex h-screen min-h-0 bg-base font-body text-text-primary">
      <aside className="flex w-[260px] shrink-0 flex-col border-r border-border bg-panel">
        <div className="flex h-[60px] items-center border-b border-border px-4">
          <LogoMark />
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto p-3">
          <div className="space-y-1">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Main</p>
            <Link to="/dashboard" className={navLinkClass(location.pathname === '/dashboard')}>
              <span className="text-lg" aria-hidden>
                ◎
              </span>
              Dashboard
            </Link>
            <Link to="/create" className={navLinkClass(location.pathname === '/create')}>
              <span className="text-lg" aria-hidden>
                ✦
              </span>
              Create New
            </Link>
            <Link
              to="/library"
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition hover:bg-elevated hover:text-text-primary ${
                location.pathname === '/library'
                  ? 'bg-elevated font-medium text-text-primary'
                  : 'text-text-secondary'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-lg" aria-hidden>
                  ▤
                </span>
                My Videos
              </span>
              <span className="rounded-full bg-accent-blue/20 px-2 py-0.5 text-xs font-semibold text-accent-blue">18</span>
            </Link>
            <Link to="/templates" className={navLinkClass(location.pathname === '/templates')}>
              <span className="text-lg" aria-hidden>
                ⧉
              </span>
              Templates
            </Link>
          </div>
          <div className="space-y-1">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Publish</p>
            <Link to="/calendar" className={navLinkClass(location.pathname === '/calendar')}>
              <span className="text-lg" aria-hidden>
                ⌁
              </span>
              Content Calendar
            </Link>
            <Link to="/social" className={navLinkClass(location.pathname === '/social')}>
              <span className="text-lg" aria-hidden>
                ⚡
              </span>
              Social Accounts
            </Link>
          </div>
          <div className="space-y-1">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Analyze</p>
            <Link to="/analytics" className={navLinkClass(location.pathname === '/analytics')}>
              <span className="text-lg" aria-hidden>
                📈
              </span>
              Analytics
            </Link>
          </div>
          <div className="space-y-1">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Settings</p>
            <Link to="/settings" className={navLinkClass(location.pathname === '/settings')}>
              <span className="text-lg" aria-hidden>
                ◇
              </span>
              Brand Kit
            </Link>
            <Link to="/billing" className={navLinkClass(location.pathname === '/billing')}>
              <span className="text-lg" aria-hidden>
                $
              </span>
              Billing
            </Link>
            <Link to="/settings" className={navLinkClass(location.pathname === '/settings')}>
              <span className="text-lg" aria-hidden>
                ⚙
              </span>
              Settings
            </Link>
          </div>
        </nav>
        <div className="border-t border-border p-4">
          <div className="rounded-xl border border-border-default bg-surface px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">Credits</p>
            <p className="font-mono text-sm font-semibold text-text-primary">240 left</p>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-border bg-panel px-6">
          <div>
            <h1 className="font-heading text-lg font-semibold">My Videos</h1>
            <p className="text-xs text-text-muted">{totalCount} videos</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/create"
              className="inline-flex items-center gap-2 rounded-lg gradient-bg px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-blue/20"
            >
              ✦ New Video
            </Link>
            <div
              className="h-9 w-9 rounded-full border border-border-default bg-linear-to-br from-accent-blue to-accent-violet"
              title="Account"
            />
          </div>
        </header>

        <div className="relative min-h-0 flex-1 overflow-y-auto">
          {nSelected > 0 && (
            <div className="sticky top-0 z-20 flex items-center gap-3 border-b-2 border-accent-blue bg-elevated px-6 py-3 shadow-lg shadow-accent-blue/10">
              <span className="text-sm font-medium text-text-primary">
                {nSelected} selected
              </span>
              <button
                type="button"
                className="rounded-lg bg-success/15 px-3 py-1.5 text-sm font-semibold text-success transition hover:bg-success/25"
              >
                Publish All
              </button>
              <button
                type="button"
                className="rounded-lg bg-accent-blue/15 px-3 py-1.5 text-sm font-semibold text-accent-blue transition hover:bg-accent-blue/25"
              >
                Download All
              </button>
              <button
                type="button"
                className="rounded-lg bg-error/10 px-3 py-1.5 text-sm font-semibold text-error transition hover:bg-error/20"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="ml-auto text-text-muted transition hover:text-text-primary"
                aria-label="Clear selection"
              >
                ×
              </button>
            </div>
          )}

          <div className="space-y-4 p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
              <div className="relative min-w-[200px] flex-1">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos..."
                  className="w-full rounded-lg border border-border-default bg-input py-2 pl-10 pr-3 text-sm outline-none focus:border-accent-blue/50"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-border-default bg-input px-3 py-2 text-sm outline-none focus:border-accent-blue/50"
              >
                <option value="all">All statuses</option>
                <option value="published">Published</option>
                <option value="ready">Ready</option>
                <option value="scheduled">Scheduled</option>
                <option value="generating">Generating</option>
                <option value="failed">Failed</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-lg border border-border-default bg-input px-3 py-2 text-sm outline-none focus:border-accent-blue/50"
              >
                <option value="all">All types</option>
                <option value="short">Short (≤0:45)</option>
                <option value="long">Long (&gt;0:45)</option>
              </select>
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="rounded-lg border border-border-default bg-input px-3 py-2 text-sm outline-none focus:border-accent-blue/50"
              >
                <option value="all">All platforms</option>
                <option value="T">TikTok</option>
                <option value="Y">YouTube</option>
                <option value="I">Instagram</option>
                <option value="F">Facebook</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-border-default bg-input px-3 py-2 text-sm outline-none focus:border-accent-blue/50"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="views">Most Views</option>
                <option value="az">A–Z</option>
              </select>
              <div className="ml-auto flex rounded-lg border border-border-default bg-input p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium ${viewMode === 'grid' ? 'bg-elevated text-text-primary' : 'text-text-muted'}`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium ${viewMode === 'list' ? 'bg-elevated text-text-primary' : 'text-text-muted'}`}
                >
                  List
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                All Videos — <span className="font-mono text-text-primary">{filteredVideos.length}</span> results
              </p>
              <button type="button" onClick={selectAllVisible} className="text-sm font-medium text-accent-blue hover:underline">
                Select all
              </button>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredVideos.map((video) => {
                  const selected = selectedIds.has(video.id)
                  return (
                    <div
                      key={video.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate('/result')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          navigate('/result')
                        }
                      }}
                      className={`group relative cursor-pointer overflow-hidden rounded-xl border bg-surface transition ${
                        selected
                          ? 'border-accent-blue shadow-[0_0_0_1px_rgba(37,99,235,0.45)] shadow-accent-blue/20'
                          : 'border-border hover:-translate-y-0.5 hover:border-border-default hover:shadow-lg'
                      }`}
                    >
                      <div className="relative aspect-video overflow-hidden">
                        <div className="absolute inset-0 gradient-bg opacity-80 transition group-hover:opacity-95" />
                        <div className="absolute inset-0 bg-linear-to-t from-base via-base/30 to-transparent" />
                        <label
                          onClick={(e) => e.stopPropagation()}
                          className={`absolute left-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-white/20 bg-black/40 text-white backdrop-blur-sm transition ${
                            selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleSelect(video.id)}
                            className="h-4 w-4 accent-accent-blue"
                          />
                        </label>
                        <span
                          className={`absolute right-3 top-3 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${STATUS_STYLES[video.status]}`}
                        >
                          {video.status}
                        </span>
                        <div
                          className="pointer-events-none absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100"
                          aria-hidden
                        >
                          <svg className="ml-1 h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <path d="M8 5v14l11-7L8 5z" />
                          </svg>
                        </div>
                        <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-0.5 font-mono text-[11px] text-white backdrop-blur-sm">
                          {video.duration}
                        </span>
                      </div>
                      <div className="space-y-2 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-2 font-heading text-sm font-semibold leading-snug">{video.title}</p>
                          <div className="relative shrink-0" data-video-menu-root>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveMenu((m) => (m === video.id ? null : video.id))
                              }}
                              className="rounded-md p-1 text-text-muted transition hover:bg-elevated hover:text-text-primary"
                              aria-label="Open menu"
                            >
                              ···
                            </button>
                            {activeMenu === video.id && (
                              <div className="absolute right-0 z-30 mt-1 w-44 overflow-hidden rounded-lg border border-border-default bg-panel py-1 text-sm shadow-xl">
                                <Link
                                  to="/result"
                                  className="block px-3 py-2 text-text-secondary hover:bg-elevated hover:text-text-primary"
                                  onClick={() => setActiveMenu(null)}
                                >
                                  View
                                </Link>
                                <button type="button" className="block w-full px-3 py-2 text-left hover:bg-elevated">
                                  Edit
                                </button>
                                <Link
                                  to="/publish"
                                  className="block px-3 py-2 text-text-secondary hover:bg-elevated hover:text-text-primary"
                                  onClick={() => setActiveMenu(null)}
                                >
                                  Publish
                                </Link>
                                <button type="button" className="block w-full px-3 py-2 text-left hover:bg-elevated">
                                  Download
                                </button>
                                <div className="my-1 h-px bg-border" />
                                <button type="button" className="block w-full px-3 py-2 text-left text-error hover:bg-error/10">
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                          <span className="flex items-center gap-1">
                            {video.platforms.map((p) => (
                              <span key={p} className={`h-2 w-2 rounded-full ${PLATFORM_DOT[p]}`} title={p} />
                            ))}
                          </span>
                          {video.views && <span>{video.views} views</span>}
                          <span>·</span>
                          <span>{video.date}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border-default bg-panel">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="border-b border-border bg-elevated/60 text-xs uppercase tracking-wide text-text-tertiary">
                    <tr>
                      <th className="px-4 py-3">Video</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Platforms</th>
                      <th className="px-4 py-3">Views</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVideos.map((video) => {
                      const selected = selectedIds.has(video.id)
                      return (
                        <tr
                          key={video.id}
                          onClick={() => navigate('/result')}
                          className={`cursor-pointer border-b border-border transition hover:bg-elevated/40 ${selected ? 'bg-accent-blue/5' : ''}`}
                        >
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleSelect(video.id)}
                                className="accent-accent-blue"
                              />
                              <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg border border-border-default">
                                <div className="absolute inset-0 gradient-bg opacity-80" />
                              </div>
                              <span className="font-medium text-text-primary">{video.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[video.status]}`}
                            >
                              {video.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {video.platforms.map((p) => (
                                <span key={p} className={`h-2 w-2 rounded-full ${PLATFORM_DOT[p]}`} />
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-text-secondary">{video.views ?? '—'}</td>
                          <td className="px-4 py-3 font-mono text-text-secondary">{video.duration}</td>
                          <td className="px-4 py-3 text-text-muted">{video.date}</td>
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="relative inline-block text-left" data-video-menu-root>
                              <button
                                type="button"
                                onClick={() => setActiveMenu((m) => (m === `list-${video.id}` ? null : `list-${video.id}`))}
                                className="rounded-md p-1 text-text-muted hover:bg-elevated hover:text-text-primary"
                              >
                                ···
                              </button>
                              {activeMenu === `list-${video.id}` && (
                                <div className="absolute right-0 z-30 mt-1 w-44 overflow-hidden rounded-lg border border-border-default bg-panel py-1 text-sm shadow-xl">
                                  <Link
                                    to="/result"
                                    className="block px-3 py-2 text-text-secondary hover:bg-elevated hover:text-text-primary"
                                    onClick={() => setActiveMenu(null)}
                                  >
                                    View
                                  </Link>
                                  <button type="button" className="block w-full px-3 py-2 text-left hover:bg-elevated">
                                    Edit
                                  </button>
                                  <Link
                                    to="/publish"
                                    className="block px-3 py-2 text-text-secondary hover:bg-elevated hover:text-text-primary"
                                    onClick={() => setActiveMenu(null)}
                                  >
                                    Publish
                                  </Link>
                                  <button type="button" className="block w-full px-3 py-2 text-left hover:bg-elevated">
                                    Download
                                  </button>
                                  <div className="my-1 h-px bg-border" />
                                  <button type="button" className="block w-full px-3 py-2 text-left text-error hover:bg-error/10">
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <nav className="flex items-center justify-center gap-2 pt-4 text-sm text-text-secondary">
              <button type="button" className="rounded-md px-2 py-1 hover:bg-elevated hover:text-text-primary">
                ←
              </button>
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`h-8 w-8 rounded-md ${p === 1 ? 'bg-accent-blue text-white' : 'hover:bg-elevated hover:text-text-primary'}`}
                >
                  {p}
                </button>
              ))}
              <span className="px-1">...</span>
              <button type="button" className="h-8 w-8 rounded-md hover:bg-elevated hover:text-text-primary">
                9
              </button>
              <button type="button" className="rounded-md px-2 py-1 hover:bg-elevated hover:text-text-primary">
                →
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}
