import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Topbar from '../components/Topbar'
import {
  CREDITS_CHANGE_EVENT,
  formatCredits,
  getCredits,
} from '../utils/credits.js'
import {
  GENERATED_ASSETS_EVENT,
  downloadAsset,
  downloadFilename,
  getSavedAssets,
} from '../utils/generatedAssets'
import {
  LIBRARY_CHANGE_EVENT,
  formatDuration,
  formatLibraryDate,
  listLibraryAssets,
} from '../utils/library.js'
import {
  PROJECT_CHANGE_EVENT,
  getCachedActiveProject,
  listProjects,
  listSocialAccounts,
  resolveActiveProject,
  setActiveProject,
} from '../utils/projects'
import { getStoredUser } from '../utils/user.js'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'ready', label: 'Ready' },
  { id: 'generating', label: 'Generating' },
  { id: 'published', label: 'Published' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'failed', label: 'Failed' },
]

const STATUS_STYLES = {
  ready: 'border-success/30 bg-success/10 text-success',
  generating: 'border-accent-violet/30 bg-accent-violet/10 text-accent-violet',
  published: 'border-accent-blue/30 bg-accent-blue/10 text-accent-blue',
  scheduled: 'border-warning/30 bg-warning/10 text-warning',
  failed: 'border-error/30 bg-error/10 text-error',
}

const PLATFORM_LABELS = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
}

function getFirstName(user) {
  const raw =
    user?.firstName ||
    user?.first_name ||
    user?.name ||
    user?.email?.split('@')?.[0] ||
    ''
  return raw.trim() || 'there'
}

function statusLabel(status) {
  const s = String(status || 'ready').toLowerCase()
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatNumber(value) {
  const n = Number(value || 0)
  if (!Number.isFinite(n)) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return String(n)
}

function normalizeLocalAsset(asset) {
  if (!asset) return null
  const sourceUrl = asset.sourceUrl || asset.thumbnailUrl || ''
  if (!sourceUrl) return null
  return {
    id: `local-${asset.id || sourceUrl}`,
    mediaType: asset.type === 'video' ? 'video' : 'image',
    title: asset.title || (asset.type === 'video' ? 'Generated video' : 'Generated image'),
    status: String(asset.status || 'ready').toLowerCase(),
    thumbnailUrl: asset.thumbnailUrl || sourceUrl,
    sourceUrl,
    prompt: asset.prompt || '',
    width: asset.width || null,
    height: asset.height || null,
    durationSeconds: asset.durationSeconds ?? null,
    createdAt: asset.createdAt || new Date().toISOString(),
    jobId: asset.jobId || null,
    localOnly: true,
  }
}

function mergeAssets(serverItems, localItems) {
  const seen = new Set()
  const merged = []
  for (const item of serverItems || []) {
    if (!item) continue
    const key = item.sourceUrl || item.id
    if (key) seen.add(key)
    merged.push(item)
  }
  for (const local of localItems || []) {
    const item = normalizeLocalAsset(local)
    if (!item) continue
    const key = item.sourceUrl || item.id
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(item)
  }
  return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function StatusBadge({ status }) {
  const key = String(status || 'ready').toLowerCase()
  const styles = STATUS_STYLES[key] || STATUS_STYLES.ready
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${styles}`}>
      {statusLabel(key)}
    </span>
  )
}

function MetricCard({ label, value, detail, tone, index }) {
  const toneClass = {
    blue: 'border-accent-blue/30 bg-accent-blue/10 text-accent-blue',
    green: 'border-success/30 bg-success/10 text-success',
    violet: 'border-accent-violet/30 bg-accent-violet/10 text-accent-violet',
    yellow: 'border-warning/30 bg-warning/10 text-warning',
  }[tone]

  return (
    <section className="animate-stagger-in rounded-2xl border border-border-default bg-surface/50 backdrop-blur-sm p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase text-text-tertiary">{label}</p>
          <p className="mt-2 font-heading text-3xl font-bold text-text-primary animate-count-up">{value}</p>
          <p className="mt-1 text-sm text-text-secondary">{detail}</p>
        </div>
        <span className={`rounded-xl border px-2.5 py-1 text-xs font-bold ${toneClass}`}>
          Live
        </span>
      </div>
    </section>
  )
}

function AssetThumb({ asset }) {
  const status = String(asset.status || 'ready').toLowerCase()
  if (status === 'generating') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-elevated">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-accent-violet/20 border-t-accent-violet" />
        <p className="mt-2 text-xs text-text-tertiary">Generating</p>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-error/10 px-4 text-center">
        <p className="text-sm font-semibold text-error">Failed</p>
        <p className="mt-1 line-clamp-2 text-xs text-text-muted">{asset.title}</p>
      </div>
    )
  }

  const src = asset.sourceUrl || asset.thumbnailUrl
  if (src && asset.mediaType === 'video') {
    const videoSrc = src.includes('#') ? src : `${src}#t=0.1`
    return (
      <>
        <video
          src={videoSrc}
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/25">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white">
            <span className="ml-0.5 h-0 w-0 border-y-[8px] border-l-[13px] border-y-transparent border-l-white" />
          </span>
        </div>
      </>
    )
  }

  if (src) {
    return <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
  }

  return <div className="absolute inset-0 gradient-bg opacity-80" />
}

function AssetCard({ asset, onOpen, onDownload }) {
  const isVideo = asset.mediaType === 'video'
  const meta = isVideo
    ? formatDuration(asset.durationSeconds) || 'Video'
    : asset.width && asset.height
      ? `${asset.width} x ${asset.height}`
      : 'Image'

  return (
    <article className="overflow-hidden rounded-2xl border border-border-default bg-surface/50 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => onOpen(asset)}
        className="block w-full text-left"
      >
        <div className="relative aspect-video overflow-hidden bg-input">
          <AssetThumb asset={asset} />
          <div className="absolute left-3 top-3">
            <StatusBadge status={asset.status} />
          </div>
        </div>
      </button>
      <div className="space-y-3 p-4">
        <div>
          <h3 className="truncate font-heading font-semibold text-text-primary">{asset.title}</h3>
          <div className="mt-1 flex items-center justify-between gap-3 text-xs text-text-tertiary">
            <span>{meta}</span>
            <time>{formatLibraryDate(asset.createdAt)}</time>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onOpen(asset)}
            className="rounded-lg bg-accent-blue px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-accent-blue/90"
          >
            {asset.status === 'generating' ? 'View Job' : 'Open'}
          </button>
          {asset.sourceUrl && asset.status !== 'generating' && asset.status !== 'failed' && (
            <button
              type="button"
              onClick={() => onDownload(asset)}
              className="rounded-lg border border-border-default bg-elevated px-3 py-1.5 text-xs font-semibold text-text-secondary transition hover:text-text-primary"
            >
              Download
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const firstName = getFirstName(user)

  const [activeFilter, setActiveFilter] = useState('all')
  const [balance, setBalance] = useState(null)
  const [activeProject, setActiveProjectState] = useState(() => getCachedActiveProject())
  const [projects, setProjects] = useState([])
  const [assets, setAssets] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [assetMessage, setAssetMessage] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

  const loadDashboard = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true)
    else setLoading(true)
    setError('')

    try {
      const [projectResult, creditResult] = await Promise.allSettled([
        listProjects(),
        getCredits(),
      ])

      let nextProjects = []
      let nextActiveProject = getCachedActiveProject()

      if (projectResult.status === 'fulfilled') {
        nextProjects = projectResult.value.projects || []
        nextActiveProject = resolveActiveProject(projectResult.value)
        setProjects(nextProjects)
        setActiveProjectState(nextActiveProject)
        if (nextActiveProject && getCachedActiveProject()?.id !== nextActiveProject.id) {
          setActiveProject(nextActiveProject)
        }
      } else {
        setProjects([])
        setActiveProjectState(nextActiveProject)
      }

      if (creditResult.status === 'fulfilled') {
        setBalance(creditResult.value)
      }

      const projectId = nextActiveProject?.id
      const [libraryResult, accountsResult] = projectId
        ? await Promise.allSettled([
            listLibraryAssets('all', { projectId, limit: 50 }),
            listSocialAccounts(projectId),
          ])
        : [{ status: 'fulfilled', value: { items: [] } }, { status: 'fulfilled', value: [] }]

      const serverAssets =
        libraryResult.status === 'fulfilled' ? libraryResult.value.items || [] : []
      const localAssets = getSavedAssets()
      setAssets(mergeAssets(serverAssets, localAssets))
      setAccounts(accountsResult.status === 'fulfilled' ? accountsResult.value || [] : [])

      if (projectResult.status === 'rejected' && creditResult.status === 'rejected') {
        setError('Could not reach the backend. Start the backend and refresh.')
      } else if (libraryResult.status === 'rejected') {
        setError('Dashboard loaded, but library data could not be refreshed.')
      }

      setLastUpdated(new Date().toISOString())
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Could not load dashboard data.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  useEffect(() => {
    const refresh = () => loadDashboard({ silent: true })
    const onCredits = (event) => {
      if (event.detail) setBalance((prev) => ({ ...(prev || {}), ...event.detail }))
    }

    window.addEventListener(PROJECT_CHANGE_EVENT, refresh)
    window.addEventListener(LIBRARY_CHANGE_EVENT, refresh)
    window.addEventListener(GENERATED_ASSETS_EVENT, refresh)
    window.addEventListener(CREDITS_CHANGE_EVENT, onCredits)
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      window.removeEventListener(PROJECT_CHANGE_EVENT, refresh)
      window.removeEventListener(LIBRARY_CHANGE_EVENT, refresh)
      window.removeEventListener(GENERATED_ASSETS_EVENT, refresh)
      window.removeEventListener(CREDITS_CHANGE_EVENT, onCredits)
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [loadDashboard])

  useEffect(() => {
    const hasGenerating = assets.some((asset) => asset.status === 'generating')
    if (!hasGenerating) return undefined
    const id = window.setInterval(() => loadDashboard({ silent: true }), 4000)
    return () => window.clearInterval(id)
  }, [assets, loadDashboard])

  const counts = useMemo(() => {
    const videos = assets.filter((asset) => asset.mediaType === 'video').length
    const images = assets.filter((asset) => asset.mediaType === 'image').length
    const generating = assets.filter((asset) => asset.status === 'generating').length
    const ready = assets.filter((asset) => ['ready', 'published'].includes(asset.status)).length
    const failed = assets.filter((asset) => asset.status === 'failed').length
    const connected = accounts.filter((account) => account.connected).length
    return { videos, images, generating, ready, failed, connected }
  }, [accounts, assets])

  const filteredAssets = useMemo(() => {
    if (activeFilter === 'all') return assets
    return assets.filter((asset) => asset.status === activeFilter)
  }, [activeFilter, assets])

  const balanceRemaining = Number(balance?.creditsRemaining ?? 0)
  const balanceTotal = Number(balance?.creditsTotal ?? 0)
  const balanceUsed = Number(balance?.creditsUsed ?? Math.max(0, balanceTotal - balanceRemaining))
  const activeProjectName = activeProject?.name || activeProject?.title || 'No active project'
  const connectedNames = accounts
    .filter((account) => account.connected)
    .map((account) => PLATFORM_LABELS[account.platform] || account.platform)
    .join(', ')

  const handleAssetDownload = async (asset) => {
    setAssetMessage('')
    try {
      const ext = asset.mediaType === 'video' ? 'mp4' : 'png'
      await downloadAsset(asset.sourceUrl || asset.thumbnailUrl, downloadFilename(asset.title || 'admart-asset', ext))
      setAssetMessage('Download started.')
    } catch (err) {
      setAssetMessage(err instanceof Error ? err.message : 'Could not download asset.')
    }
  }

  const openAsset = (asset) => {
    if (asset.status === 'generating' || asset.status === 'failed') {
      navigate('/library')
      return
    }
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

  return (
    <AppLayout>
      <Topbar title="Home" />

      <main className="space-y-8 p-7">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 gradient-bg p-7 text-white shadow-lg gradient-glow">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/15 blur-[90px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-accent-violet/40 blur-[100px]"
            aria-hidden
          />
          <div className="relative max-w-3xl animate-fade-slide-down">
            <p className="font-heading text-2xl font-bold">Welcome back, {firstName}</p>
            <p className="mt-2 text-sm text-white/85">
              {activeProject ? `Live dashboard for ${activeProjectName}.` : 'Create a project to start generating content.'}
            </p>
            <p className="mt-1 text-xs text-white/70">
              {formatCredits(balanceRemaining, '0')} credits remaining
              {lastUpdated ? ` - updated ${formatLibraryDate(lastUpdated)}` : ''}
              {refreshing ? ' - refreshing' : ''}
            </p>
          </div>
          <div className="relative mt-6 flex flex-wrap gap-3">
            <Link
              to="/templates"
              className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-white/20"
            >
              Use Template
            </Link>
            <Link
              to="/image-gen"
              className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              New Image
            </Link>
            <Link
              to="/video-gen"
              className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              New Video
            </Link>
            <button
              type="button"
              onClick={() => loadDashboard({ silent: true })}
              className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/10"
            >
              Refresh
            </button>
          </div>
        </section>

        {error && (
          <section className="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
            {error}
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Credits Remaining"
            value={formatCredits(balanceRemaining, loading ? '...' : '0')}
            detail={`${formatCredits(balanceUsed, '0')} used of ${formatCredits(balanceTotal, '0')}`}
            tone="blue"
            index={0}
          />
          <MetricCard
            label="Library Assets"
            value={loading ? '...' : formatNumber(assets.length)}
            detail={`${counts.images} images, ${counts.videos} videos`}
            tone="green"
            index={1}
          />
          <MetricCard
            label="Active Jobs"
            value={loading ? '...' : formatNumber(counts.generating)}
            detail={`${counts.ready} ready, ${counts.failed} failed`}
            tone="violet"
            index={2}
          />
          <MetricCard
            label="Connected Accounts"
            value={loading ? '...' : formatNumber(counts.connected)}
            detail={connectedNames || 'No social accounts connected'}
            tone="yellow"
            index={3}
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <div>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-heading text-xl font-bold text-text-primary">Recent Content</h2>
                {assetMessage && <p className="mt-1 text-xs text-text-tertiary">{assetMessage}</p>}
              </div>
              <Link to="/library" className="text-sm font-medium text-accent-blue hover:underline">
                View library
              </Link>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeFilter === filter.id
                      ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/20'
                      : 'border border-border-default bg-elevated text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-64 animate-pulse rounded-2xl border border-border-default bg-surface" />
                ))}
              </div>
            ) : filteredAssets.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAssets.slice(0, 9).map((asset, index) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    onOpen={openAsset}
                    onDownload={handleAssetDownload}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border-default bg-surface p-10 text-center">
                <p className="font-heading text-lg font-semibold text-text-primary">No content here yet</p>
                <p className="mt-2 text-sm text-text-secondary">
                  Generate an image, create a video, or upload media to see it appear here.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link to="/templates" className="rounded-xl bg-accent-blue px-4 py-2 text-sm font-semibold text-white">
                    Browse Templates
                  </Link>
                  <button
                    type="button"
                    onClick={() => navigate('/library', { state: { openUpload: true } })}
                    className="rounded-xl border border-border-default bg-elevated px-4 py-2 text-sm font-semibold text-text-primary"
                  >
                    Upload Media
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-border-default bg-surface/50 backdrop-blur-sm p-5">
              <h2 className="font-heading text-lg font-bold text-text-primary">Project Snapshot</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3 border-b border-border pb-3">
                  <span className="text-text-tertiary">Active project</span>
                  <span className="text-right font-medium text-text-primary">{activeProjectName}</span>
                </div>
                <div className="flex justify-between gap-3 border-b border-border pb-3">
                  <span className="text-text-tertiary">Projects</span>
                  <span className="font-medium text-text-primary">{projects.length}</span>
                </div>
                <div className="flex justify-between gap-3 border-b border-border pb-3">
                  <span className="text-text-tertiary">Generating</span>
                  <span className="font-medium text-text-primary">{counts.generating}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-text-tertiary">Connected channels</span>
                  <span className="text-right font-medium text-text-primary">{connectedNames || 'None'}</span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border-default bg-surface/50 backdrop-blur-sm p-5">
              <h2 className="font-heading text-lg font-bold text-text-primary">Quick Actions</h2>
              <div className="mt-4 grid gap-3">
                <Link
                  to="/templates"
                  className="rounded-xl border border-border-default bg-elevated px-4 py-3 text-sm font-semibold text-text-primary transition hover:border-accent-blue/40"
                >
                  Start from a template
                </Link>
                <Link
                  to="/social"
                  className="rounded-xl border border-border-default bg-elevated px-4 py-3 text-sm font-semibold text-text-primary transition hover:border-accent-violet/40"
                >
                  Connect social accounts
                </Link>
                <Link
                  to="/billing"
                  className="rounded-xl border border-border-default bg-elevated px-4 py-3 text-sm font-semibold text-text-primary transition hover:border-success/40"
                >
                  Manage credits
                </Link>
                <Link
                  to="/library"
                  className="rounded-xl border border-border-default bg-elevated px-4 py-3 text-sm font-semibold text-text-primary transition hover:border-warning/40"
                >
                  Open library
                </Link>
              </div>
            </section>
          </aside>
        </section>
      </main>
    </AppLayout>
  )
}
