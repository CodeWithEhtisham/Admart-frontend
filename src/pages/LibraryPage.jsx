import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Topbar from '../components/Topbar'
import {
  LIBRARY_CHANGE_EVENT,
  LIBRARY_TABS,
  canCancelLibraryAsset,
  cancelLibraryAsset,
  deleteLibraryAsset,
  formatDuration,
  formatLibraryDate,
  libraryUploadAccept,
  listLibraryAssets,
  uploadLibraryMedia,
} from '../utils/library.js'
import {
  PROJECT_CHANGE_EVENT,
  getCachedActiveProject,
} from '../utils/projects'

const STATUS_STYLES = {
  published: 'border-success/30 bg-success/10 text-success',
  generating: 'border-warning/30 bg-warning/10 text-warning',
  ready: 'border-accent-blue/30 bg-accent-blue/10 text-accent-blue',
  scheduled: 'border-warning/30 bg-warning/10 text-warning',
  failed: 'border-error/30 bg-error/10 text-error',
}

function SearchIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" strokeLinecap="round" />
    </svg>
  )
}

function AssetThumb({ asset }) {
  if (asset.status === 'generating') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-elevated">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-accent-violet/20 border-t-accent-violet" />
        <p className="mt-2 text-[11px] text-text-tertiary">Generating…</p>
      </div>
    )
  }
  if (asset.status === 'failed') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-error/10 px-3 text-center">
        <p className="text-xs font-semibold text-error">Failed</p>
        <p className="mt-1 line-clamp-2 text-[11px] text-text-muted">{asset.title}</p>
      </div>
    )
  }
  const src = asset.sourceUrl || asset.thumbnailUrl
  if (src && asset.mediaType === 'video') {
    // Seek hint helps browsers paint a first frame for MP4 thumbs.
    const thumbSrc = src.includes('#') ? src : `${src}#t=0.1`
    return (
      <>
        <video
          src={thumbSrc}
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white">
            <svg className="ml-0.5 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          </span>
        </div>
      </>
    )
  }
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
    )
  }
  return <div className="absolute inset-0 gradient-bg opacity-80" />
}

export default function LibraryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const uploadInputRef = useRef(null)
  const [tab, setTab] = useState('all')
  const [items, setItems] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [projectId, setProjectId] = useState(() => getCachedActiveProject()?.id || null)
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [viewMode, setViewMode] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [activeMenu, setActiveMenu] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = useCallback(
    async ({ append = false, cursor } = {}) => {
      if (append) setLoadingMore(true)
      else setLoading(true)
      setError('')
      try {
        const result = await listLibraryAssets(tab, {
          projectId: getCachedActiveProject()?.id,
          limit: 50,
          cursor: append ? cursor : undefined,
        })
        setProjectId(result.projectId)
        setNextCursor(result.nextCursor)
        setItems((prev) => (append ? [...prev, ...result.items] : result.items))
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            'Failed to load library.',
        )
        if (!append) setItems([])
        setNextCursor(null)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [tab],
  )

  useEffect(() => {
    clearSelection()
    load()
  }, [tab, load])

  useEffect(() => {
    const onProject = () => {
      setProjectId(getCachedActiveProject()?.id || null)
      load()
    }
    const onLibrary = () => load()
    window.addEventListener(PROJECT_CHANGE_EVENT, onProject)
    window.addEventListener(LIBRARY_CHANGE_EVENT, onLibrary)
    return () => {
      window.removeEventListener(PROJECT_CHANGE_EVENT, onProject)
      window.removeEventListener(LIBRARY_CHANGE_EVENT, onLibrary)
    }
  }, [load])

  // Poll while any generating items so cards flip to ready/failed
  useEffect(() => {
    const hasGenerating = items.some((i) => i.status === 'generating')
    if (!hasGenerating) return undefined
    const id = window.setInterval(() => load(), 4000)
    return () => window.clearInterval(id)
  }, [items, load])

  useEffect(() => {
    const onDoc = (e) => {
      if (activeMenu === null) return
      if (!e.target.closest('[data-video-menu-root]')) setActiveMenu(null)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [activeMenu])

  useEffect(() => {
    if (!location.state?.openUpload) return
    const t = window.setTimeout(() => uploadInputRef.current?.click(), 80)
    navigate(location.pathname, { replace: true, state: {} })
    return () => window.clearTimeout(t)
  }, [location.state, location.pathname, navigate])

  const openUploadPicker = () => {
    if (!projectId) {
      setError('Create a project before uploading.')
      return
    }
    uploadInputRef.current?.click()
  }

  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setError('')
    try {
      await uploadLibraryMedia(file, projectId)
      await load()
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Upload failed. Use jpeg/png/webp or mp4/mov/webm.',
      )
    } finally {
      setUploading(false)
    }
  }

  const filtered = useMemo(() => {
    let list = [...items]
    if (statusFilter !== 'all') {
      list = list.filter((v) => v.status === statusFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          (v.prompt && v.prompt.toLowerCase().includes(q)),
      )
    }
    if (sortBy === 'az') list.sort((a, b) => a.title.localeCompare(b.title))
    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    if (sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    }
    return list
  }, [items, searchQuery, statusFilter, sortBy])

  const counts = useMemo(() => {
    const videos = items.filter((i) => i.mediaType === 'video').length
    const images = items.filter((i) => i.mediaType === 'image').length
    return { all: items.length, video: videos, image: images }
  }, [items])

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllVisible = () => {
    setSelectedIds(new Set(filtered.map((v) => v.id)))
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  const openAsset = (asset) => {
    if (asset.status === 'generating' || asset.status === 'failed') return
    if (!asset.sourceUrl) return
    if (asset.mediaType === 'video') {
      navigate('/publish', {
        state: {
          type: 'video',
          videoUrl: asset.sourceUrl,
          title: asset.title,
          prompt: asset.prompt,
          jobId: asset.jobId,
          assetId: asset.id,
        },
      })
      return
    }
    navigate('/publish', {
      state: {
        type: 'image',
        imageUrl: asset.sourceUrl,
        title: asset.title,
        prompt: asset.prompt,
        jobId: asset.jobId,
        assetId: asset.id,
      },
    })
  }

  const handleCancel = async (asset) => {
    if (!canCancelLibraryAsset(asset)) return
    setCancellingId(asset.id)
    setActiveMenu(null)
    try {
      await cancelLibraryAsset(asset, projectId)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Cancel failed.')
    } finally {
      setCancellingId(null)
    }
  }

  const handleDeleteOne = async (asset) => {
    setActiveMenu(null)
    setDeleting(true)
    setError('')
    try {
      await deleteLibraryAsset(asset.id, projectId)
      setItems((prev) => prev.filter((i) => i.id !== asset.id))
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(asset.id)
        return next
      })
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Delete failed.')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteSelected = async () => {
    if (!selectedIds.size) return
    setDeleting(true)
    setError('')
    const ids = [...selectedIds]
    try {
      await Promise.all(ids.map((id) => deleteLibraryAsset(id, projectId)))
      setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)))
      clearSelection()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Delete failed.')
      await load()
    } finally {
      setDeleting(false)
    }
  }

  const nSelected = selectedIds.size
  const tabLabel = LIBRARY_TABS.find((t) => t.id === tab)?.label || 'All'

  const menuActions = (asset) => (
    <div className="absolute right-0 z-30 mt-1 w-44 overflow-hidden rounded-lg border border-border-default bg-panel py-1 text-sm shadow-xl">
      {asset.status === 'ready' || asset.status === 'published' ? (
        <button
          type="button"
          className="block w-full px-3 py-2 text-left hover:bg-elevated"
          onClick={(e) => {
            e.stopPropagation()
            setActiveMenu(null)
            openAsset(asset)
          }}
        >
          Publish
        </button>
      ) : null}
      {canCancelLibraryAsset(asset) ? (
        <button
          type="button"
          disabled={cancellingId === asset.id}
          className="block w-full px-3 py-2 text-left text-warning hover:bg-warning/10 disabled:opacity-50"
          onClick={(e) => {
            e.stopPropagation()
            handleCancel(asset)
          }}
        >
          {cancellingId === asset.id ? 'Cancelling…' : 'Cancel'}
        </button>
      ) : null}
      {asset.sourceUrl && asset.status === 'ready' ? (
        <a
          href={asset.sourceUrl}
          download
          target="_blank"
          rel="noreferrer"
          className="block px-3 py-2 text-text-secondary hover:bg-elevated hover:text-text-primary"
          onClick={(e) => e.stopPropagation()}
        >
          Download
        </a>
      ) : null}
      <div className="my-1 h-px bg-border" />
      <button
        type="button"
        disabled={deleting}
        className="block w-full px-3 py-2 text-left text-error hover:bg-error/10 disabled:opacity-50"
        onClick={(e) => {
          e.stopPropagation()
          handleDeleteOne(asset)
        }}
      >
        Delete
      </button>
    </div>
  )

  return (
    <AppLayout>
      <div className="flex min-h-screen flex-col">
        <Topbar title="Library" />

        <div className="relative flex-1">
          {nSelected > 0 && (
            <div className="sticky top-0 z-20 flex items-center gap-3 border-b-2 border-accent-blue bg-elevated px-6 py-3 shadow-lg shadow-accent-blue/10">
              <span className="text-sm font-medium text-text-primary">{nSelected} selected</span>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteSelected}
                className="rounded-lg bg-error/10 px-3 py-1.5 text-sm font-semibold text-error transition hover:bg-error/20 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                className="inline-flex rounded-lg border border-border-default bg-input p-1"
                role="tablist"
                aria-label="Media type"
              >
                {LIBRARY_TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.id}
                    onClick={() => setTab(t.id)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                      tab === t.id
                        ? 'bg-elevated text-text-primary shadow-sm'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {t.label}
                    {!loading && tab === t.id ? (
                      <span className="ml-1.5 font-mono text-text-tertiary">{filtered.length}</span>
                    ) : null}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept={libraryUploadAccept()}
                  className="hidden"
                  onChange={handleUploadFile}
                />
                <button
                  type="button"
                  onClick={() => load()}
                  className="rounded-lg border border-border-default px-3 py-2 text-sm text-text-secondary hover:text-text-primary"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  disabled={uploading || !projectId}
                  onClick={openUploadPicker}
                  className="inline-flex items-center gap-2 rounded-lg border border-border-default bg-elevated px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-accent-blue/40 disabled:opacity-50"
                >
                  {uploading ? 'Uploading…' : 'Upload'}
                </button>
                <Link
                  to="/image-gen"
                  className="inline-flex items-center gap-2 rounded-lg border border-border-default bg-elevated px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-accent-blue/40"
                >
                  New Image
                </Link>
                <Link
                  to="/video-gen"
                  className="inline-flex items-center gap-2 rounded-lg gradient-bg px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-blue/20"
                >
                  New Video
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
              <div className="relative min-w-[200px] flex-1">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search library…"
                  className="w-full rounded-lg border border-border-default bg-input py-2 pl-10 pr-3 text-sm outline-none focus:border-accent-blue/50"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-border-default bg-input px-3 py-2 text-sm outline-none focus:border-accent-blue/50"
              >
                <option value="all">All statuses</option>
                <option value="ready">Ready</option>
                <option value="generating">Generating</option>
                <option value="failed">Failed</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-border-default bg-input px-3 py-2 text-sm outline-none focus:border-accent-blue/50"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
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
                {tabLabel} —{' '}
                <span className="font-mono text-text-primary">{loading ? '…' : filtered.length}</span> results
                {tab === 'all' && !loading ? (
                  <span className="ml-2 text-text-muted">
                    ({counts.video} videos · {counts.image} images)
                  </span>
                ) : null}
              </p>
              <button
                type="button"
                onClick={selectAllVisible}
                className="text-sm font-medium text-accent-blue hover:underline"
                disabled={!filtered.length}
              >
                Select all
              </button>
            </div>

            {error ? (
              <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                {error}
                <button type="button" onClick={() => load()} className="ml-3 underline">
                  Retry
                </button>
              </div>
            ) : null}

            {!projectId && !loading ? (
              <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
                No active project.{' '}
                <Link to="/onboarding" className="underline">
                  Create one
                </Link>{' '}
                to use the library.
              </div>
            ) : null}

            {loading ? (
              <p className="py-16 text-center text-sm text-text-muted">Loading library…</p>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border-default px-6 py-16 text-center">
                <p className="font-heading text-lg text-text-primary">Nothing here yet</p>
                <p className="mt-2 text-sm text-text-muted">
                  {tab === 'image'
                    ? 'Generate or upload an image — it will show up here.'
                    : tab === 'video'
                      ? 'Create or upload a video and it will appear in this tab.'
                      : 'Upload your own media, or create a video or image.'}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    type="button"
                    disabled={uploading || !projectId}
                    onClick={openUploadPicker}
                    className="rounded-lg border border-border-default px-4 py-2 text-sm font-semibold disabled:opacity-50"
                  >
                    {uploading ? 'Uploading…' : 'Upload image or video'}
                  </button>
                  {(tab === 'all' || tab === 'image') && (
                    <Link
                      to="/image-gen"
                      className="rounded-lg border border-border-default px-4 py-2 text-sm font-semibold"
                    >
                      New Image
                    </Link>
                  )}
                  {(tab === 'all' || tab === 'video') && (
                    <Link
                      to="/video-gen"
                      className="rounded-lg gradient-bg px-4 py-2 text-sm font-semibold text-white"
                    >
                      New Video
                    </Link>
                  )}
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((asset) => {
                  const selected = selectedIds.has(asset.id)
                  const duration = formatDuration(asset.durationSeconds)
                  const clickable = asset.status === 'ready' || asset.status === 'published'
                  return (
                    <div
                      key={asset.id}
                      role={clickable ? 'button' : 'article'}
                      tabIndex={clickable ? 0 : undefined}
                      onClick={() => clickable && openAsset(asset)}
                      onKeyDown={(e) => {
                        if (!clickable) return
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          openAsset(asset)
                        }
                      }}
                      className={`group relative overflow-hidden rounded-xl border bg-surface transition ${
                        clickable ? 'cursor-pointer' : 'cursor-default'
                      } ${
                        selected
                          ? 'border-accent-blue shadow-[0_0_0_1px_rgba(37,99,235,0.45)] shadow-accent-blue/20'
                          : 'border-border hover:border-border-default hover:shadow-lg'
                      } ${asset.status === 'failed' ? 'border-error/30' : ''}`}
                    >
                      <div className="relative aspect-video overflow-hidden bg-elevated">
                        <AssetThumb asset={asset} />
                        {asset.status === 'ready' || asset.status === 'published' ? (
                          <div className="absolute inset-0 bg-linear-to-t from-base via-base/30 to-transparent" />
                        ) : null}
                        <label
                          onClick={(e) => e.stopPropagation()}
                          className={`absolute left-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-white/20 bg-black/40 text-white backdrop-blur-sm transition ${
                            selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleSelect(asset.id)}
                            className="h-4 w-4 accent-accent-blue"
                          />
                        </label>
                        <span className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                          {asset.mediaType}
                        </span>
                        <span
                          className={`absolute right-3 top-3 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${STATUS_STYLES[asset.status] || STATUS_STYLES.ready}`}
                        >
                          {asset.status}
                        </span>
                        {canCancelLibraryAsset(asset) ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCancel(asset)
                            }}
                            disabled={cancellingId === asset.id}
                            className="absolute bottom-3 right-3 z-10 rounded-md bg-warning/90 px-2.5 py-1 text-[11px] font-semibold text-black disabled:opacity-50"
                          >
                            {cancellingId === asset.id ? '…' : 'Cancel'}
                          </button>
                        ) : null}
                        {duration ? (
                          <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-0.5 font-mono text-[11px] text-white backdrop-blur-sm">
                            {duration}
                          </span>
                        ) : null}
                      </div>
                      <div className="space-y-2 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-2 font-heading text-sm font-semibold leading-snug">
                            {asset.title}
                          </p>
                          <div className="relative shrink-0" data-video-menu-root>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveMenu((m) => (m === asset.id ? null : asset.id))
                              }}
                              className="rounded-md p-1 text-text-muted transition hover:bg-elevated hover:text-text-primary"
                              aria-label="Open menu"
                            >
                              ···
                            </button>
                            {activeMenu === asset.id ? menuActions(asset) : null}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                          <span>{formatLibraryDate(asset.createdAt)}</span>
                          {asset.width && asset.height ? (
                            <span>
                              · {asset.width}×{asset.height}
                            </span>
                          ) : null}
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
                      <th className="px-4 py-3">Asset</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((asset) => {
                      const selected = selectedIds.has(asset.id)
                      const clickable = asset.status === 'ready' || asset.status === 'published'
                      return (
                        <tr
                          key={asset.id}
                          onClick={() => clickable && openAsset(asset)}
                          className={`border-b border-border transition hover:bg-elevated/40 ${
                            clickable ? 'cursor-pointer' : ''
                          } ${selected ? 'bg-accent-blue/5' : ''}`}
                        >
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleSelect(asset.id)}
                                className="accent-accent-blue"
                              />
                              <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg border border-border-default bg-elevated">
                                <AssetThumb asset={asset} />
                              </div>
                              <span className="line-clamp-2 font-medium text-text-primary">
                                {asset.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 capitalize text-text-secondary">{asset.mediaType}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[asset.status] || STATUS_STYLES.ready}`}
                            >
                              {asset.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-text-muted">
                            {formatLibraryDate(asset.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="relative inline-block text-left" data-video-menu-root>
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveMenu((m) =>
                                    m === `list-${asset.id}` ? null : `list-${asset.id}`,
                                  )
                                }
                                className="rounded-md p-1 text-text-muted hover:bg-elevated hover:text-text-primary"
                              >
                                ···
                              </button>
                              {activeMenu === `list-${asset.id}` ? menuActions(asset) : null}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {nextCursor ? (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => load({ append: true, cursor: nextCursor })}
                  className="rounded-lg border border-border-default bg-elevated px-4 py-2 text-sm font-medium text-text-primary hover:border-accent-blue/40 disabled:opacity-50"
                >
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
