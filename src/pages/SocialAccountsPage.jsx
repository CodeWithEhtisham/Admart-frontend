import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import ProjectDropdown from '../components/ProjectDropdown'

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

export default function SocialAccountsPage() {
  const navigate = useNavigate()
  const [toast, setToast] = useState({ message: '', visible: false })

  const showToast = (message) => {
    setToast({ message, visible: true })
  }

  const dismissToast = useCallback(() => setToast((t) => ({ ...t, visible: false })), [])

  const action = (label) => {
    showToast(`${label} — saved (demo).`)
  }

  return (
    <AppLayout>
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-4 border-b border-border bg-panel/90 px-7 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-heading text-lg font-bold text-text-primary">Social Accounts</h1>
              <p className="text-sm text-text-secondary">3 of 4 platforms connected</p>
            </div>
            <span className="text-text-muted">|</span>
            <ProjectDropdown />
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold text-white gradient-bg" aria-hidden>
            E
          </div>
        </header>

        <main className="space-y-6 p-7">
          <div className="flex gap-4 rounded-2xl border border-accent-blue/25 bg-accent-blue/10 px-5 py-4">
            <span className="text-2xl" aria-hidden>
              🔗
            </span>
            <div>
              <p className="font-medium text-text-primary">Secure OAuth 2.0 connections</p>
              <p className="mt-1 text-sm text-text-secondary">
                Vidify uses industry-standard OAuth so we never store your passwords. Tokens refresh automatically when
                possible; you can revoke access anytime.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* TikTok */}
            <section className="overflow-hidden rounded-2xl border border-border-default bg-surface">
              <div className="h-0.5" style={{ background: PLATFORM_META.tiktok.gradient }} />
              <div className="space-y-5 p-6">
                <div className="flex items-start gap-4">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white ${PLATFORM_META.tiktok.iconBg}`}
                    aria-hidden
                  >
                    {PLATFORM_META.tiktok.letter}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-heading text-lg font-bold">{PLATFORM_META.tiktok.name}</h2>
                      <span className="rounded-full border border-success/40 bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                        Connected
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">{PLATFORM_META.tiktok.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border-default bg-input p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-elevated font-heading text-sm font-bold text-text-primary">
                    V
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">@vidify.studio</p>
                    <p className="text-xs text-text-tertiary">128K followers · Last published Apr 12, 2026</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { k: 'Videos published', v: '42' },
                    { k: 'Total views', v: '2.1M' },
                    { k: 'Avg engagement', v: '6.8%' },
                    { k: 'Token expiry', v: 'Aug 2026' },
                  ].map((row) => (
                    <div key={row.k} className="rounded-lg border border-border bg-panel px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{row.k}</p>
                      <p className="mt-1 font-mono text-sm font-semibold text-text-primary">{row.v}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-text-tertiary">
                    <span>Token health</span>
                    <span className="text-success">Healthy</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-elevated">
                    <div className="h-full w-[92%] rounded-full bg-success" />
                  </div>
                  <p className="mt-1 text-xs text-text-muted">Next rotation · Jul 28, 2026</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => action('Disconnect TikTok')}
                    className="rounded-xl border border-error/50 px-4 py-2 text-sm font-medium text-error transition hover:bg-error/10"
                  >
                    Disconnect
                  </button>
                  <button
                    type="button"
                    onClick={() => action('Refresh TikTok token')}
                    className="rounded-xl border border-border-default bg-elevated px-4 py-2 text-sm font-medium text-text-primary transition hover:border-accent-blue/40"
                  >
                    Refresh Token
                  </button>
                  <button
                    type="button"
                    onClick={() => action('Add TikTok account')}
                    className="rounded-xl border border-dashed border-border-default px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-accent-blue/40 hover:text-text-primary"
                  >
                    + Add Another Account
                  </button>
                </div>
              </div>
            </section>

            {/* YouTube */}
            <section className="overflow-hidden rounded-2xl border border-border-default bg-surface">
              <div className="h-0.5" style={{ background: PLATFORM_META.youtube.gradient }} />
              <div className="space-y-4 border-b border-border-default bg-warning/10 px-6 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-warning">Token expiring soon — refresh within 7 days to avoid publish errors.</p>
                  <button
                    type="button"
                    onClick={() => action('YouTube token refreshed')}
                    className="shrink-0 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 px-4 py-2 text-sm font-semibold text-black shadow"
                  >
                    Refresh Token Now
                  </button>
                </div>
              </div>
              <div className="space-y-5 p-6">
                <div className="flex items-start gap-4">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white ${PLATFORM_META.youtube.iconBg}`}
                    aria-hidden
                  >
                    {PLATFORM_META.youtube.letter}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-heading text-lg font-bold">{PLATFORM_META.youtube.name}</h2>
                      <span className="rounded-full border border-success/40 bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                        Connected
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">{PLATFORM_META.youtube.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border-default bg-input p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-elevated font-heading text-sm font-bold text-text-primary">
                    V
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">Vidify Official</p>
                    <p className="text-xs text-text-tertiary">84K subscribers · Last published Apr 14, 2026</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { k: 'Videos published', v: '19' },
                    { k: 'Total views', v: '512K' },
                    { k: 'Avg engagement', v: '4.2%' },
                    { k: 'Token expiry', v: 'Apr 22, 2026' },
                  ].map((row) => (
                    <div key={row.k} className="rounded-lg border border-border bg-panel px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{row.k}</p>
                      <p className="mt-1 font-mono text-sm font-semibold text-text-primary">{row.v}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-text-tertiary">
                    <span>Token health</span>
                    <span className="text-warning">Expires in 7d</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-elevated">
                    <div className="h-full w-[35%] rounded-full bg-warning" />
                  </div>
                  <p className="mt-1 text-xs text-text-muted">Expiry · Apr 22, 2026</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => action('Disconnect YouTube')}
                    className="rounded-xl border border-error/50 px-4 py-2 text-sm font-medium text-error transition hover:bg-error/10"
                  >
                    Disconnect
                  </button>
                  <button
                    type="button"
                    onClick={() => action('Refresh YouTube token')}
                    className="rounded-xl border border-border-default bg-elevated px-4 py-2 text-sm font-medium text-text-primary transition hover:border-accent-blue/40"
                  >
                    Refresh Token
                  </button>
                  <button
                    type="button"
                    onClick={() => action('Add YouTube channel')}
                    className="rounded-xl border border-dashed border-border-default px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-accent-blue/40 hover:text-text-primary"
                  >
                    + Add Another Account
                  </button>
                </div>
              </div>
            </section>

            {/* Instagram */}
            <section className="overflow-hidden rounded-2xl border border-border-default bg-surface">
              <div className="h-0.5" style={{ background: PLATFORM_META.instagram.gradient }} />
              <div className="space-y-5 p-6">
                <div className="flex items-start gap-4">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white ${PLATFORM_META.instagram.iconBg}`}
                    aria-hidden
                  >
                    {PLATFORM_META.instagram.letter}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-heading text-lg font-bold">{PLATFORM_META.instagram.name}</h2>
                      <span className="rounded-full border border-success/40 bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                        Connected
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">{PLATFORM_META.instagram.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border-default bg-input p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-elevated font-heading text-sm font-bold text-text-primary">
                    V
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">@vidify.ai</p>
                    <p className="text-xs text-text-tertiary">41K followers · Last published Apr 11, 2026</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { k: 'Videos published', v: '31' },
                    { k: 'Total views', v: '980K' },
                    { k: 'Avg engagement', v: '8.1%' },
                    { k: 'Token expiry', v: 'Sep 2026' },
                  ].map((row) => (
                    <div key={row.k} className="rounded-lg border border-border bg-panel px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{row.k}</p>
                      <p className="mt-1 font-mono text-sm font-semibold text-text-primary">{row.v}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-text-tertiary">
                    <span>Token health</span>
                    <span className="text-success">Healthy</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-elevated">
                    <div className="h-full w-[88%] rounded-full bg-success" />
                  </div>
                  <p className="mt-1 text-xs text-text-muted">Next rotation · Sep 4, 2026</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => action('Disconnect Instagram')}
                    className="rounded-xl border border-error/50 px-4 py-2 text-sm font-medium text-error transition hover:bg-error/10"
                  >
                    Disconnect
                  </button>
                  <button
                    type="button"
                    onClick={() => action('Refresh Instagram token')}
                    className="rounded-xl border border-border-default bg-elevated px-4 py-2 text-sm font-medium text-text-primary transition hover:border-accent-blue/40"
                  >
                    Refresh Token
                  </button>
                  <button
                    type="button"
                    onClick={() => action('Add Instagram account')}
                    className="rounded-xl border border-dashed border-border-default px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-accent-blue/40 hover:text-text-primary"
                  >
                    + Add Another Account
                  </button>
                </div>
              </div>
            </section>

            {/* Facebook */}
            <section className="overflow-hidden rounded-2xl border border-border-default bg-surface">
              <div className="h-0.5 bg-gradient-to-r from-text-muted to-text-muted" />
              <div className="space-y-6 p-6">
                <div className="flex items-start gap-4">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white opacity-60 ${PLATFORM_META.facebook.iconBg}`}
                    aria-hidden
                  >
                    {PLATFORM_META.facebook.letter}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-heading text-lg font-bold">{PLATFORM_META.facebook.name}</h2>
                      <span className="rounded-full border border-border-default bg-elevated px-2 py-0.5 text-xs font-semibold text-text-tertiary">
                        Not Connected
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">{PLATFORM_META.facebook.description}</p>
                  </div>
                </div>
                <div className="flex flex-col items-center rounded-2xl border border-dashed border-border-default bg-input px-6 py-10 text-center">
                  <span className="text-4xl" aria-hidden>
                    📣
                  </span>
                  <p className="mt-4 font-heading text-lg font-semibold text-text-primary">Connect your Facebook Page</p>
                  <p className="mt-2 max-w-sm text-sm text-text-secondary">
                    Publish Reels and feed posts directly from Vidify. Insights sync for performance tracking.
                  </p>
                  <div className="mt-8 grid w-full max-w-lg gap-3 sm:grid-cols-3">
                    {[
                      { t: 'Reels', d: 'Native vertical delivery' },
                      { t: 'Insights', d: 'Reach & engagement' },
                      { t: 'Targeting', d: 'Audience alignment' },
                    ].map((f) => (
                      <div key={f.t} className="rounded-xl border border-border-default bg-panel p-4 text-left">
                        <p className="font-medium text-text-primary">{f.t}</p>
                        <p className="mt-1 text-xs text-text-tertiary">{f.d}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      showToast('Facebook OAuth started (demo).')
                      navigate('/create')
                    }}
                    className="mt-8 inline-flex items-center gap-2 rounded-xl gradient-bg px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25"
                  >
                    Connect Facebook Page →
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>

      <Toast message={toast.message} visible={toast.visible} onDismiss={dismissToast} />
    </AppLayout>
  )
}
