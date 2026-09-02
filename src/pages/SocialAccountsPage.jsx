import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Topbar from '../components/Topbar'
import {
  PROJECT_CHANGE_EVENT,
  connectAdsProvider,
  connectPlatform,
  disconnectAdsProvider,
  disconnectPlatform,
  getCachedActiveProject,
  listAdAccounts,
  listSocialAccounts,
} from '../utils/projects'

// YouTube, Facebook, Instagram, TikTok and Snapchat are live; the rest show as coming soon.
const ADS_PROVIDERS = [
  { key: 'google', name: 'YouTube Ads', description: 'Google Ads. Connect YouTube first to host the video, then this ads account to spend.' },
  { key: 'meta', name: 'Meta Ads', description: 'Facebook + Instagram ads from one ad account.' },
  { key: 'tiktok', name: 'TikTok Ads', description: 'TikTok Marketing API — separate from Login Kit.' },
  { key: 'snap', name: 'Snap Ads', description: 'Snap Marketing API — Login Kit cannot post organically.' },
]

const PLATFORMS = [
  { key: 'youtube', available: true },
  { key: 'facebook', available: true },
  { key: 'instagram', available: true },
  { key: 'tiktok', available: true },
  { key: 'snapchat', available: true },
  { key: 'shopify', available: false },
  { key: 'wordpress', available: false },
  { key: 'linkedin', available: false },
  { key: 'pinterest', available: false },
]

const PLATFORM_META = {
  tiktok: {
    name: 'TikTok',
    description: 'Short-form vertical video and live engagement.',
    gradient: 'linear-gradient(90deg, #00f2ea, #00c4bd)',
    iconBg: 'bg-tiktok',
  },
  youtube: {
    name: 'YouTube',
    description: 'Long-form, Shorts, and community posts.',
    gradient: 'linear-gradient(90deg, #ff4444, #cc0000)',
    iconBg: 'bg-youtube',
  },
  instagram: {
    name: 'Instagram',
    description: 'Reels, Stories, and feed distribution.',
    gradient: 'linear-gradient(90deg, #e6683c, #c13584)',
    iconBg: 'bg-instagram',
  },
  facebook: {
    name: 'Facebook',
    description: 'Pages, Reels, and targeted social campaigns.',
    gradient: 'linear-gradient(90deg, #1877f2, #0d5dbf)',
    iconBg: 'bg-facebook',
  },
  snapchat: {
    name: 'Snapchat',
    description: 'Snaps, Stories, and Spotlight ads.',
    gradient: 'linear-gradient(90deg, #fffc00, #f7e400)',
    iconBg: 'bg-snapchat',
    iconFg: 'text-black',
  },
  shopify: {
    name: 'Shopify',
    description: 'Store catalog, product pages, and checkout.',
    gradient: 'linear-gradient(90deg, #96bf48, #5e8e3e)',
    iconBg: 'bg-shopify',
  },
  wordpress: {
    name: 'WordPress',
    description: 'Blog posts, landing pages, and CMS publish.',
    gradient: 'linear-gradient(90deg, #21759b, #464646)',
    iconBg: 'bg-wordpress',
  },
  linkedin: {
    name: 'LinkedIn',
    description: 'Company pages, thought leadership, and B2B reach.',
    gradient: 'linear-gradient(90deg, #0a66c2, #004182)',
    iconBg: 'bg-linkedin',
  },
  pinterest: {
    name: 'Pinterest',
    description: 'Pins, Idea ads, and shopping catalogs.',
    gradient: 'linear-gradient(90deg, #e60023, #ad081b)',
    iconBg: 'bg-pinterest',
  },
}

function PlatformIcon({ platform, className = 'h-6 w-6' }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    className,
    'aria-hidden': true,
  }
  if (platform === 'youtube') {
    return (
      <svg {...common}>
        <path d="M9.55 8.43v7.14L15.82 12 9.55 8.43z" />
      </svg>
    )
  }
  if (platform === 'facebook') {
    return (
      <svg {...common}>
        <path d="M14.25 8.25h2.1V5.4h-2.43C11.4 5.4 10.5 7 10.5 9.15v1.6H8.25v2.85h2.25V22h3v-8.4h2.52l.48-2.85h-3V9.4c0-.66.18-1.15 1.25-1.15z" />
      </svg>
    )
  }
  if (platform === 'instagram') {
    return (
      <svg {...common}>
        <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.15-3.23 1.66-4.77 4.92-4.92C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.7 21.31.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
      </svg>
    )
  }
  if (platform === 'tiktok') {
    return (
      <svg {...common}>
        <path d="M12.53.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    )
  }
  if (platform === 'snapchat') {
    return (
      <svg {...common}>
        <path d="M12.21.79c.99 0 4.35.28 5.93 3.82.53 1.19.4 3.22.3 4.85-.08 1.23-.15 2.35.13 3 .54 1.27 1.7 1.06 2.24.7.4-.26.91-.84 1.17-1.72.05-.18.23-.32.42-.28.19.04.32.23.28.42-.34 1.13-.95 1.93-1.71 2.35-.45.25-.99.37-1.54.37-1.06 0-1.97-.54-2.34-1.41-.25-.58-.22-1.29-.14-2.57.11-1.67.25-3.72-.25-4.83-1.36-3.06-4.2-3.32-5.05-3.32s-3.68.26-5.04 3.32c-.5 1.11-.36 3.16-.25 4.83.08 1.28.11 1.99-.14 2.57-.37.87-1.28 1.41-2.34 1.41-.55 0-1.09-.12-1.54-.37-.76-.42-1.37-1.22-1.71-2.35-.04-.19.09-.38.28-.42.19-.04.37.1.42.28.27.89.77 1.46 1.17 1.72.55.36 1.7.57 2.25-.7.28-.65.2-1.78.12-3-.1-1.63-.23-3.66.3-4.85C7.86 1.07 11.22.79 12.21.79zm-4.4 13.55c.9 3.02 3.4 5.16 6.4 5.16s5.5-2.14 6.4-5.16c.15 1.48-.4 2.85-1.55 3.85-1.2 1.05-2.85 1.62-4.85 1.62s-3.65-.57-4.85-1.62c-1.15-1-1.7-2.37-1.55-3.85z" />
      </svg>
    )
  }
  if (platform === 'shopify') {
    return (
      <svg {...common}>
        <path d="M16.8 8.25h-1.05V6.3A3.75 3.75 0 0 0 12 2.55 3.75 3.75 0 0 0 8.25 6.3v1.95H7.2A1.95 1.95 0 0 0 5.27 10.4l.9 9.3A1.95 1.95 0 0 0 8.1 21.45h7.8a1.95 1.95 0 0 0 1.93-1.75l.9-9.3a1.95 1.95 0 0 0-1.93-2.15zM9.75 6.3A2.25 2.25 0 0 1 12 4.05 2.25 2.25 0 0 1 14.25 6.3v1.95h-4.5V6.3z" />
      </svg>
    )
  }
  if (platform === 'wordpress') {
    return (
      <svg {...common}>
        <path d="M21.47 6.83c.84 1.54 1.32 3.3 1.32 5.17 0 3.98-2.16 7.44-5.36 9.33l3.3-9.53c.61-1.54.82-2.77.82-3.86 0-.41-.03-.78-.07-1.11M13.49 6.93c.65-.03 1.23-.1 1.23-.1.58-.08.52-.93-.07-.9 0 0-1.75.14-2.88.14-1.06 0-2.85-.15-2.85-.15-.58-.03-.66.86-.07.89 0 0 .54.04 1.11.09l1.65 4.53-2.31 6.92-3.84-11.45c.65-.03 1.23-.08 1.23-.08.59-.07.52-.93-.06-.9 0 0-1.76.14-2.88.14-.2 0-.44-.01-.69-.02C4.63 2.32 8.1 0 12 0c2.65 0 5.07 1.02 6.9 2.69-.04 0-.09-.01-.13-.01-1.2 0-2.05 1.05-2.05 2.17 0 1.01.59 1.86 1.2 2.87.48.79.96 1.81.96 3.28 0 1.01-.38 2.18-.87 3.62l-1.14 3.81-4.14-12.32c.65-.03 1.23-.1 1.23-.1.59-.08.52-.93-.06-.9 0 0-1.76.14-2.88.14-.21 0-.45-.01-.7-.01zM12 24c-2.59 0-4.95-.87-6.85-2.33l3.65-9.99 3.73 10.23c.02.03.03.05.05.08.18.03.36.01.54.01.18 0 .36.01.54-.01.01-.03.03-.05.04-.08l2.66-7.27 1.63 4.47C17.05 23.13 14.65 24 12 24" />
      </svg>
    )
  }
  if (platform === 'linkedin') {
    return (
      <svg {...common}>
        <path d="M6.94 5a2 2 0 1 1-4-.002A2 2 0 0 1 6.94 5zM7 8.48H3V21h4V8.48zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68z" />
      </svg>
    )
  }
  if (platform === 'pinterest') {
    return (
      <svg {...common}>
        <path d="M12.02.29C5.87.29.9 5.25.9 11.4c0 4.66 2.84 8.64 6.9 10.27-.1-.87-.18-2.2.04-3.15.2-.86 1.29-5.47 1.29-5.47s-.33-.66-.33-1.63c0-1.53.89-2.67 2-2.67.94 0 1.39.7 1.39 1.55 0 .94-.6 2.35-.91 3.66-.26 1.1.55 1.99 1.63 1.99 1.96 0 3.46-2.06 3.46-5.04 0-2.63-1.89-4.47-4.59-4.47-3.13 0-4.97 2.35-4.97 4.77 0 .94.36 1.96.81 2.51.09.11.1.2.08.32l-.3 1.25c-.05.2-.16.24-.37.15-1.37-.64-2.23-2.65-2.23-4.26 0-3.47 2.52-6.66 7.27-6.66 3.82 0 6.78 2.72 6.78 6.35 0 3.79-2.39 6.84-5.71 6.84-1.11 0-2.16-.58-2.52-1.26l-.69 2.62c-.25.96-.92 2.16-1.37 2.89 1.03.32 2.13.49 3.27.49 6.15 0 11.12-4.97 11.12-11.11C23.14 5.25 18.17.29 12.02.29z" />
      </svg>
    )
  }
  return null
}

function LinkIcon({ className = 'h-8 w-8' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
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
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${meta.iconFg || 'text-white'} ${meta.iconBg} ${
              connected ? '' : 'opacity-70'
            }`}
            aria-hidden
          >
            <PlatformIcon platform={platform} className="h-6 w-6" />
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
            {platform === 'instagram' && !account.displayName && !account.handle && (
              <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
                Connect a Professional (Business or Creator) Instagram account. Personal accounts cannot connect.
              </p>
            )}
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
            <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${meta.iconBg} ${meta.iconFg || 'text-white'}`}>
              <PlatformIcon platform={platform} className="h-7 w-7" />
            </span>
            <p className="mt-4 font-heading text-lg font-semibold text-text-primary">
              {available ? `Connect your ${meta.name} account` : `${meta.name} — coming soon`}
            </p>
            <p className="mt-2 max-w-sm text-sm text-text-secondary">
              {available
                ? platform === 'instagram'
                  ? 'Sign in with Instagram. Requires a Professional (Business or Creator) account.'
                  : 'Publish directly from Admart and sync insights for performance tracking.'
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
  const [adAccountsByProvider, setAdAccountsByProvider] = useState({})
  const [loading, setLoading] = useState(true)
  const [busyPlatform, setBusyPlatform] = useState('')
  const [busyAds, setBusyAds] = useState('')
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
      const [accounts, ads] = await Promise.all([listSocialAccounts(projectId), listAdAccounts(projectId)])
      const map = {}
      for (const acc of accounts) map[acc.platform] = acc
      setAccountsByPlatform(map)
      const adsMap = {}
      for (const acc of ads || []) adsMap[acc.provider] = acc
      setAdAccountsByProvider(adsMap)
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
    const adsConnected = searchParams.get('adsConnected')
    const adsError = searchParams.get('adsError')
    if (!connected && !error && !adsConnected && !adsError) return
    if (connected) {
      setToast({ message: `${PLATFORM_META[connected]?.name || connected} connected.`, visible: true })
    } else if (adsConnected) {
      const name = ADS_PROVIDERS.find((p) => p.key === adsConnected)?.name || adsConnected
      setToast({ message: `${name} connected.`, visible: true })
    } else if (adsError) {
      const name = ADS_PROVIDERS.find((p) => p.key === adsError)?.name || adsError
      setToast({ message: `Couldn't connect ${name}. Please try again.`, visible: true })
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

  const handleConnectAds = async (provider) => {
    if (!projectId) return
    setBusyAds(provider)
    try {
      await connectAdsProvider(projectId, provider)
    } catch (err) {
      showToast(err.response?.data?.message || `Could not connect ${provider} ads.`)
      setBusyAds('')
    }
  }

  const handleDisconnectAds = async (provider) => {
    if (!projectId) return
    setBusyAds(provider)
    try {
      await disconnectAdsProvider(projectId, provider)
      await loadAccounts()
      const name = ADS_PROVIDERS.find((p) => p.key === provider)?.name || provider
      showToast(`${name} disconnected.`)
    } catch (err) {
      showToast(`Could not disconnect ${provider} ads.`)
    } finally {
      setBusyAds('')
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
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-blue/20 text-accent-blue">
            <LinkIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-medium text-text-primary">Secure OAuth 2.0 connections</p>
            <p className="mt-1 text-sm text-text-secondary">
              Admart uses industry-standard OAuth so we never store your passwords. Connections are
              per project — switching projects switches the connected accounts. For YouTube, Google
              shows your Gmail first; on the next screen pick the YouTube channel (Brand Account),
              not the Gmail name.
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

        {projectId && (
          <section className="space-y-4">
            <div>
              <h2 className="font-heading text-lg font-bold">Ads accounts</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Separate from organic Connect. Meta covers Facebook and Instagram ads together.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {ADS_PROVIDERS.map(({ key, name, description }) => {
                const account = adAccountsByProvider[key]
                const connected = Boolean(account?.connected)
                return (
                  <div key={key} className="rounded-2xl border border-border-default bg-surface p-5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-heading font-semibold">{name}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          connected
                            ? 'border border-success/40 bg-success/15 text-success'
                            : 'border border-border-default bg-elevated text-text-tertiary'
                        }`}
                      >
                        {connected ? 'Connected' : 'Not connected'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-text-secondary">{description}</p>
                    {connected && account?.displayName ? (
                      <p className="mt-3 truncate text-sm">{account.displayName}</p>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => (connected ? handleDisconnectAds(key) : handleConnectAds(key))}
                      disabled={busyAds === key}
                      className={`mt-4 rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
                        connected
                          ? 'border border-error/50 text-error hover:bg-error/10'
                          : 'gradient-bg text-white'
                      }`}
                    >
                      {busyAds === key ? 'Working…' : connected ? 'Disconnect' : `Connect ${name}`}
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </main>

      <Toast message={toast.message} visible={toast.visible} onDismiss={dismissToast} />
    </AppLayout>
  )
}
