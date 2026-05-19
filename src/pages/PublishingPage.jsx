import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const PLATFORMS = [
  {
    id: 'tiktok',
    name: 'TikTok',
    handle: '@vidify_brand',
    icon: '🎵',
    color: 'text-tiktok',
    dot: 'bg-tiktok',
    connected: true,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    handle: 'Vidify Brand',
    icon: '▶️',
    color: 'text-youtube',
    dot: 'bg-youtube',
    connected: true,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@vidify.brand',
    icon: '📸',
    color: 'text-instagram',
    dot: 'bg-instagram',
    connected: true,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    handle: 'Vidify Brand Page',
    icon: 'f',
    color: 'text-facebook',
    dot: 'bg-facebook',
    connected: false,
  },
]

function ChevronLeftIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        disabled ? 'cursor-not-allowed bg-elevated opacity-40' : checked ? 'bg-accent-blue' : 'bg-elevated'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? 'left-5' : 'left-0.5'
        }`}
      />
    </button>
  )
}

export default function PublishingPage() {
  const navigate = useNavigate()
  const [scheduleMode, setScheduleMode] = useState('now')
  const [openAccordion, setOpenAccordion] = useState('tiktok')
  const [toggles, setToggles] = useState({
    tiktok: true,
    youtube: true,
    instagram: true,
    facebook: false,
  })
  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const activeCount = PLATFORMS.filter((p) => toggles[p.id] && p.connected).length

  useEffect(() => {
    if (!showToast) return
    const t = setTimeout(() => {
      setShowToast(false)
      navigate('/dashboard')
    }, 1800)
    return () => clearTimeout(t)
  }, [showToast, navigate])

  const toggleAccordion = (id) => {
    setOpenAccordion((prev) => (prev === id ? '' : id))
  }

  const confirmPublish = () => {
    setShowModal(false)
    setShowToast(true)
  }

  return (
    <div className="relative flex h-screen min-h-0 flex-col bg-base font-body text-text-primary">
      <header className="flex h-[60px] shrink-0 items-center gap-3 border-b border-border bg-panel px-4">
        <Link
          to="/result"
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-text-secondary transition hover:bg-elevated hover:text-text-primary"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back
        </Link>
        <span className="h-5 w-px bg-border-default" aria-hidden />
        <h1 className="font-heading text-base font-semibold tracking-tight">Publish Video</h1>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[360px] shrink-0 flex-col border-r border-border bg-panel">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
            <div className="overflow-hidden rounded-xl border border-border-default bg-surface shadow-lg">
              <div className="relative aspect-video w-full">
                <div className="absolute inset-0 gradient-bg" />
                <div className="absolute inset-0 bg-linear-to-t from-base/90 via-transparent to-transparent" />
                <button
                  type="button"
                  className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur-md"
                  aria-label="Play preview"
                >
                  <svg className="ml-0.5 h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M8 5v14l11-7L8 5z" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2 p-4">
                <p className="font-heading text-sm font-semibold leading-snug">
                  Summer Product Launch — Cinematic Showcase 2024
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {['0:15', '16:9', '1080p', '8.4MB'].map((c) => (
                    <span
                      key={c}
                      className="rounded-md border border-border-default bg-input px-2 py-0.5 font-mono text-[10px] text-text-secondary"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Publishing to</h2>
              <div className="space-y-3">
                {PLATFORMS.map((p) => {
                  const on = toggles[p.id]
                  const disabled = !p.connected
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                        disabled ? 'border-border bg-input/40 opacity-60' : 'border-border-default bg-input'
                      }`}
                    >
                      <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-elevated text-lg ${p.color}`}>
                        {p.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-text-primary">{p.name}</p>
                        <p className="truncate text-xs text-text-muted">{disabled ? 'Not connected' : p.handle}</p>
                      </div>
                      <Toggle
                        checked={on && !disabled}
                        disabled={disabled}
                        onChange={(v) => setToggles((prev) => ({ ...prev, [p.id]: v }))}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                Platform previews
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {PLATFORMS.filter((p) => p.connected).map((p) => (
                  <div
                    key={p.id}
                    className="w-[70px] shrink-0 overflow-hidden rounded-xl border border-border-default bg-base shadow-md"
                  >
                    <div className={`relative aspect-[9/16] ${p.id === 'tiktok' ? 'bg-tiktok/20' : ''} ${p.id === 'youtube' ? 'bg-youtube/20' : ''} ${p.id === 'instagram' ? 'bg-instagram/20' : ''}`}>
                      <div className="absolute inset-0 gradient-bg opacity-60" />
                    </div>
                    <p className="truncate px-1 py-1 text-center text-[9px] text-text-muted">{p.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="min-h-0 flex-1 overflow-y-auto bg-base p-6 lg:p-8">
          <section className="mx-auto max-w-3xl space-y-8">
            <div>
              <h2 className="mb-3 font-heading text-lg font-semibold">Schedule</h2>
              <div className="space-y-3 rounded-xl border border-border-default bg-panel p-4">
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent p-2 transition hover:border-border-default hover:bg-elevated/40">
                  <input
                    type="radio"
                    name="schedule"
                    className="mt-1 accent-accent-blue"
                    checked={scheduleMode === 'now'}
                    onChange={() => setScheduleMode('now')}
                  />
                  <span>
                    <span className="block text-sm font-medium text-text-primary">🚀 Publish Now</span>
                    <span className="text-xs text-text-muted">Your video goes live as soon as publishing completes.</span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent p-2 transition hover:border-border-default hover:bg-elevated/40">
                  <input
                    type="radio"
                    name="schedule"
                    className="mt-1 accent-accent-blue"
                    checked={scheduleMode === 'schedule'}
                    onChange={() => setScheduleMode('schedule')}
                  />
                  <span>
                    <span className="block text-sm font-medium text-text-primary">📅 Schedule for Later</span>
                    <span className="text-xs text-text-muted">Pick a date, time, and timezone for each platform batch.</span>
                  </span>
                </label>
                {scheduleMode === 'schedule' && (
                  <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs text-text-tertiary">Date</label>
                      <input
                        type="date"
                        className="w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm outline-none focus:border-accent-blue/50"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-text-tertiary">Time</label>
                      <input
                        type="time"
                        className="w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm outline-none focus:border-accent-blue/50"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-text-tertiary">Timezone</label>
                      <select className="w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm outline-none focus:border-accent-blue/50">
                        <option>UTC</option>
                        <option>America/New_York</option>
                        <option>Europe/London</option>
                        <option>Asia/Tokyo</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="mb-3 font-heading text-lg font-semibold">Per-platform settings</h2>
              <div className="space-y-2">
                {/* TikTok */}
                <div className="overflow-hidden rounded-xl border border-border-default bg-panel">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('tiktok')}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <span className="h-2 w-2 rounded-full bg-tiktok" />
                      TikTok
                    </span>
                    <span className="text-text-muted">{openAccordion === 'tiktok' ? '−' : '+'}</span>
                  </button>
                  {openAccordion === 'tiktok' && (
                    <div className="space-y-3 border-t border-border px-4 py-4">
                      <div>
                        <label className="mb-1 block text-xs text-text-tertiary">Caption</label>
                        <textarea
                          rows={3}
                          defaultValue="POV: your summer launch just hit different ✨ #skincare #summer2024"
                          maxLength={2200}
                          className="w-full resize-none rounded-lg border border-border-default bg-input px-3 py-2 text-sm outline-none focus:border-accent-blue/50"
                        />
                        <p className="mt-1 text-right text-xs text-text-muted font-mono">120/2200</p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs text-text-tertiary">Privacy</label>
                          <select className="w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm">
                            <option>Public</option>
                            <option>Friends</option>
                            <option>Private</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-text-tertiary">Comments</label>
                          <select className="w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm">
                            <option>Everyone</option>
                            <option>Friends</option>
                            <option>Off</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* YouTube */}
                <div className="overflow-hidden rounded-xl border border-border-default bg-panel">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('youtube')}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <span className="h-2 w-2 rounded-full bg-youtube" />
                      YouTube
                    </span>
                    <span className="text-text-muted">{openAccordion === 'youtube' ? '−' : '+'}</span>
                  </button>
                  {openAccordion === 'youtube' && (
                    <div className="space-y-3 border-t border-border px-4 py-4">
                      <div>
                        <label className="mb-1 block text-xs text-text-tertiary">Title</label>
                        <input
                          type="text"
                          defaultValue="Summer Product Launch 2024 — Cinematic Showcase"
                          className="w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm outline-none focus:border-accent-blue/50"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-text-tertiary">Description</label>
                        <textarea
                          rows={4}
                          defaultValue="Full cinematic showcase for our summer launch. Chapters coming soon."
                          className="w-full resize-none rounded-lg border border-border-default bg-input px-3 py-2 text-sm outline-none focus:border-accent-blue/50"
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs text-text-tertiary">Visibility</label>
                          <select className="w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm">
                            <option>Public</option>
                            <option>Unlisted</option>
                            <option>Private</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-text-tertiary">Category</label>
                          <select className="w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm">
                            <option>Howto & Style</option>
                            <option>Science &amp; Technology</option>
                            <option>Entertainment</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Instagram */}
                <div className="overflow-hidden rounded-xl border border-border-default bg-panel">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('instagram')}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <span className="h-2 w-2 rounded-full bg-instagram" />
                      Instagram
                    </span>
                    <span className="text-text-muted">{openAccordion === 'instagram' ? '−' : '+'}</span>
                  </button>
                  {openAccordion === 'instagram' && (
                    <div className="space-y-3 border-t border-border px-4 py-4">
                      <div>
                        <label className="mb-1 block text-xs text-text-tertiary">Caption</label>
                        <textarea
                          rows={3}
                          defaultValue="Summer glow, unlocked. ☀️ #skincare #beauty"
                          className="w-full resize-none rounded-lg border border-border-default bg-input px-3 py-2 text-sm outline-none focus:border-accent-blue/50"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-text-tertiary">Post type</label>
                        <select className="w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm">
                          <option>Reel</option>
                          <option>Feed</option>
                          <option>Story</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Facebook */}
                <div className="overflow-hidden rounded-xl border border-border bg-input opacity-60">
                  <div className="flex w-full items-center justify-between px-4 py-3">
                    <span className="flex items-center gap-2 text-sm font-semibold text-text-muted">
                      <span className="h-2 w-2 rounded-full bg-facebook" />
                      Facebook
                      <span className="rounded-md bg-elevated px-2 py-0.5 text-[10px] font-medium uppercase text-text-tertiary">
                        Not connected
                      </span>
                    </span>
                  </div>
                  <div className="border-t border-border px-4 py-4 text-sm text-text-muted">
                    Connect Facebook in Settings to enable publishing and previews.
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      <footer className="flex h-[72px] shrink-0 items-center gap-3 border-t border-border bg-panel px-4">
        <div className="flex items-center gap-1.5">
          {PLATFORMS.filter((p) => toggles[p.id] && p.connected).map((p) => (
            <span key={p.id} className={`h-2 w-2 rounded-full ${p.dot}`} title={p.name} />
          ))}
        </div>
        <p className="text-sm text-text-secondary">
          Publishing to <span className="font-semibold text-text-primary">{activeCount}</span> platforms
        </p>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-border-default bg-elevated px-4 py-2 text-sm font-medium text-text-primary transition hover:border-border-default"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="rounded-lg gradient-bg px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25"
          >
            🚀 Publish Now
          </button>
        </div>
      </footer>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="w-full max-w-md rounded-2xl border border-border-default bg-panel p-6 shadow-2xl"
          >
            <h2 id="confirm-title" className="font-heading text-lg font-semibold">
              Confirm Publishing
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              You are about to publish this video to the selected platforms. Captions and visibility settings will be
              applied immediately.
            </p>
            <ul className="mt-4 space-y-2 rounded-xl border border-border-default bg-input p-3 text-sm">
              {PLATFORMS.filter((p) => toggles[p.id] && p.connected).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-medium">
                    <span className={`h-2 w-2 rounded-full ${p.dot}`} />
                    {p.name}
                  </span>
                  <span className="truncate text-xs text-text-muted">{p.handle}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-elevated hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPublish}
                className="rounded-lg gradient-bg px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-blue/20"
              >
                🚀 Publish Now
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="animate-slide-up fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl border border-success/30 bg-panel px-5 py-3 text-sm font-medium text-success shadow-xl">
          ✅ Published to 3 platforms successfully!
        </div>
      )}
    </div>
  )
}
