import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Topbar from '../components/Topbar'
import {
  PROJECT_CHANGE_EVENT,
  connectPlatform,
  disconnectPlatform,
  getCachedActiveProject,
  listSocialAccounts,
} from '../utils/projects'

// YouTube ships first; the rest light up as the backend implements them.
const PLATFORMS = [
  { key: 'youtube', available: true },
  { key: 'tiktok', available: false },
  { key: 'instagram', available: false },
  { key: 'facebook', available: false },
]

const PLATFORM_META = {
  tiktok: {
    name: 'TikTok',
    description: 'Short-form vertical video and live engagement.',
    gradient: 'linear-gradient(90deg, #00f2ea, #00c4bd)',
    iconBg: 'bg-tiktok',
    letter: 'T',
  },
  youtube: {
    name: 'YouTube',
    description: 'Long-form, Shorts, and community posts.',
    gradient: 'linear-gradient(90deg, #ff4444, #cc0000)',
    iconBg: 'bg-youtube',
    letter: 'Y',
  },
  instagram: {
    name: 'Instagram',
    description: 'Reels, Stories, and feed distribution.',
    gradient: 'linear-gradient(90deg, #e6683c, #c13584)',
    iconBg: 'bg-instagram',
    letter: 'I',
  },
  facebook: {
    name: 'Facebook',
    description: 'Pages, Reels, and targeted social campaigns.',
    gradient: 'linear-gradient(90deg, #1877f2, #0d5dbf)',
    iconBg: 'bg-facebook',
    letter: 'F',
  },
}

function Toast({ message, visible, onDismiss }) {
  useEffect(() => {
    if (!visible || !message) return undefined
    const t = setTimeout(onDismiss, 3200)
    return () => clearTimeout(t)
  }, [visible, message, onDismiss])

  if (!visible || !message) return null
  return (
    <div className="fixed bottom-6 left-1/2 z-[300] max-w-md -translate-x-1/2 animate-slide-up rounded-xl border border-border-default bg-elevated px-4 py-3 text-sm text-text-primary shadow-2xl">
      {message}
    </div>
  )
}

function ChannelAvatar({ src, fallback }) {
  const [errored, setErrored] = useState(false)
  const showImage = src && !errored
  return (
    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-elevated font-heading text-sm font-bold text-text-primary">
      {showImage ? (
        <img
          src={src}
          alt=""
          // Google/YouTube avatar hosts return 403 when hotlinked with a referrer.
          referrerPolicy="no-referrer"
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        fallback
      )}
    </div>
  )
}

function PlatformCard({ platform, account, available, busy, onConnect, onDisconnect }) {
  const meta = PLATFORM_META[platform]
  const connected = Boolean(account?.connected)

  return (
    <section className="overflow-hidden rounded-2xl border border-border-default bg-surface">
      <div className="h-0.5" style={{ background: meta.gradient }} />
      <div className="space-y-5 p-6">
        <div className="flex items-start gap-4">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white ${meta.iconBg} ${
              connected ? '' : 'opacity-60'
            }`}
            aria-hidden
          >
            {meta.letter}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-lg font-bold">{meta.name}</h2>
              {connected ? (
                <span className="rounded-full border border-success/40 bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                  Connected
                </span>
              ) : (
                <span className="rounded-full border border-border-default bg-elevated px-2 py-0.5 text-xs font-semibold text-text-tertiary">
                  Not Connected
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-text-secondary">{meta.description}</p>
          </div>
        </div>

        {connected ? (
          <>
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border-default bg-input p-4">
              <ChannelAvatar
                src={account.avatarUrl}
                fallback={(account.displayName || account.handle || meta.name).charAt(0).toUpperCase()}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{account.displayName || account.handle || '—'}</p>
                {account.handle && <p className="truncate text-xs text-text-tertiary">{account.handle}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onDisconnect(platform)}
                disabled={busy}
                className="rounded-xl border border-error/50 px-4 py-2 text-sm font-medium text-error transition hover:bg-error/10 disabled:opacity-50"
              >
                {busy ? 'Working…' : 'Disconnect'}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border-default bg-input px-6 py-10 text-center">
            <span className="text-4xl" aria-hidden>
              🔗
            </span>
            <p className="mt-4 font-heading text-lg font-semibold text-text-primary">
              {available ? `Connect your ${meta.name} account` : `${meta.name} — coming soon`}
            </p>
            <p className="mt-2 max-w-sm text-sm text-text-secondary">
              {available
                ? 'Publish directly from Vidify and sync insights for performance tracking.'
                : "We're putting the finishing touches on this integration."}
            </p>
            {available ? (
              <button
                type="button"
                onClick={() => onConnect(platform)}
                disabled={busy}
                className="mt-8 inline-flex items-center gap-2 rounded-xl gradient-bg px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 disabled:opacity-50"
              >
                {busy ? 'Connecting…' : `Connect ${meta.name} →`}
              </button>
            ) : (
              <button
                type="button"
                disabled
                title="Coming soon"
                className="mt-8 inline-flex items-center gap-2 rounded-xl border border-border-default bg-elevated px-6 py-3 text-sm font-semibold text-text-tertiary"
              >
                Coming soon
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default function SocialAccountsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeProject, setActiveProject] = useState(getCachedActiveProject)
  const [accountsByPlatform, setAccountsByPlatform] = useState({})
  const [loading, setLoading] = useState(true)
  const [busyPlatform, setBusyPlatform] = useState('')
  const [toast, setToast] = useState({ message: '', visible: false })

  const showToast = (message) => setToast({ message, visible: true })
  const dismissToast = useCallback(() => setToast((t) => ({ ...t, visible: false })), [])

  // Keep the active project in sync if the user switches it.
  useEffect(() => {
    const sync = () => setActiveProject(getCachedActiveProject())
    window.addEventListener(PROJECT_CHANGE_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(PROJECT_CHANGE_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const projectId = activeProject?.id

  const loadAccounts = useCallback(async () => {
    if (!projectId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const accounts = await listSocialAccounts(projectId)
      const map = {}
      for (const acc of accounts) map[acc.platform] = acc
      setAccountsByPlatform(map)
    } catch (err) {
      console.error('Failed to load social accounts:', err)
      showToast('Could not load social accounts.')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  // When the backend redirects back from the provider (/social?connected=… or ?error=…),
  // show a toast, refresh the list, and strip the query flag from the URL.
  useEffect(() => {
    const connected = searchParams.get('connected')
    const error = searchParams.get('error')
    if (!connected && !error) return
    if (connected) {
      setToast({ message: `${PLATFORM_META[connected]?.name || connected} connected.`, visible: true })
    } else {
      setToast({
        message: `Couldn't connect ${PLATFORM_META[error]?.name || error}. Please try again.`,
        visible: true,
      })
    }
    loadAccounts()
    setSearchParams({}, { replace: true })
  }, [searchParams, loadAccounts, setSearchParams])

  const handleConnect = async (platform) => {
    if (!projectId) return
    setBusyPlatform(platform)
    try {
      // On success this performs a full-page redirect to the provider; the code
      // below only runs if requesting the authorize URL fails (e.g. 501 not ready).
      await connectPlatform(projectId, platform)
    } catch (err) {
      console.error('Failed to start connection:', err)
      showToast(
        err.response?.data?.message || `Could not connect ${PLATFORM_META[platform].name}.`,
      )
      setBusyPlatform('')
    }
  }

  const handleDisconnect = async (platform) => {
    if (!projectId) return
    setBusyPlatform(platform)
    try {
      await disconnectPlatform(projectId, platform)
      await loadAccounts()
      showToast(`${PLATFORM_META[platform].name} disconnected.`)
    } catch (err) {
      console.error('Failed to disconnect platform:', err)
      showToast(`Could not disconnect ${PLATFORM_META[platform].name}.`)
    } finally {
      setBusyPlatform('')
    }
  }

  const connectedCount = PLATFORMS.filter((p) => accountsByPlatform[p.key]?.connected).length

  return (
    <AppLayout>
      <Topbar title="Social Accounts" />

      <main className="space-y-6 p-7">
        {!projectId ? (
          <p className="text-sm text-text-secondary">
            You need a project before connecting social accounts.{' '}
            <Link to="/onboarding" className="font-medium text-accent-blue hover:underline">
              Create a project
            </Link>
            .
          </p>
        ) : (
          <p className="text-sm text-text-secondary">
            {loading ? 'Loading…' : `${connectedCount} of ${PLATFORMS.length} platforms connected`}
          </p>
        )}

        <div className="flex gap-4 rounded-2xl border border-accent-blue/25 bg-accent-blue/10 px-5 py-4">
          <span className="text-2xl" aria-hidden>
            🔗
          </span>
          <div>
            <p className="font-medium text-text-primary">Secure OAuth 2.0 connections</p>
            <p className="mt-1 text-sm text-text-secondary">
              Vidify uses industry-standard OAuth so we never store your passwords. Connections are
              per project — switching projects switches the connected accounts.
            </p>
          </div>
        </div>

        {projectId && (
          <div className="grid gap-6 lg:grid-cols-2">
            {PLATFORMS.map(({ key, available }) => (
              <PlatformCard
                key={key}
                platform={key}
                account={accountsByPlatform[key]}
                available={available}
                busy={busyPlatform === key}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
              />
            ))}
          </div>
        )}
      </main>

      <Toast message={toast.message} visible={toast.visible} onDismiss={dismissToast} />
    </AppLayout>
  )
}
