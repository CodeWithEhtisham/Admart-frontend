import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const PLATFORMS = [
  { id: 'tiktok', label: 'TikTok', dot: 'bg-tiktok' },
  { id: 'youtube', label: 'YouTube', dot: 'bg-youtube' },
  { id: 'instagram', label: 'Instagram', dot: 'bg-instagram' },
  { id: 'facebook', label: 'Facebook', dot: 'bg-facebook' },
]

const DEFAULT_DESCRIPTIONS = {
  tiktok: 'POV: your summer launch just hit different ✨ New drop — link in bio. #skincare #summer2024',
  youtube:
    'Summer Product Launch 2024 — full cinematic showcase, behind-the-scenes moments, and the story behind the glow.',
  instagram:
    'Summer glow, unlocked. ☀️ Our launch film is live — tap for the full reel and tell us your favorite shot.',
  facebook:
    'We are excited to share our Summer Product Launch 2024 video. Watch now and join the conversation in the comments.',
}

const INITIAL_TAGS = [
  '#skincare',
  '#beauty',
  '#summer2024',
  '#productlaunch',
  '#glowup',
  '#luxuryskincare',
]

function ChevronLeftIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PlayIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  )
}

function PauseIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
    </svg>
  )
}

export default function ResultPage() {
  const navigate = useNavigate()
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(35)
  const [activePlatform, setActivePlatform] = useState('tiktok')
  const [descriptions, setDescriptions] = useState(DEFAULT_DESCRIPTIONS)
  const [tags, setTags] = useState(INITIAL_TAGS)
  const [activePreview, setActivePreview] = useState('tiktok')
  const [title, setTitle] = useState('Summer Product Launch — Cinematic Showcase 2024')

  const activeDescription = descriptions[activePlatform] ?? ''
  const charLimit = 2200
  const charCount = activeDescription.length

  const previewCaption = useMemo(() => {
    const map = {
      tiktok: 'POV: your summer launch just hit different ✨ #skincare #summer2024',
      youtube: 'Summer Product Launch 2024 — Cinematic Showcase (Official)',
      instagram: 'Summer glow, unlocked. ☀️ Full reel — link in bio.',
      facebook: 'Summer Product Launch 2024 — watch the full story.',
    }
    return map[activePreview] ?? map.tiktok
  }, [activePreview])

  const removeTag = (t) => setTags((prev) => prev.filter((x) => x !== t))

  return (
    <div className="flex h-screen min-h-0 flex-col bg-base font-body text-text-primary">
      <header className="flex h-[60px] shrink-0 items-center gap-3 border-b border-border bg-panel px-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-text-secondary transition hover:bg-elevated hover:text-text-primary"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back
        </Link>
        <span className="h-5 w-px bg-border-default" aria-hidden />
        <h1 className="font-heading text-base font-semibold tracking-tight">Video Result</h1>
        <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
          ✓ Ready
        </span>
        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="version" className="sr-only">
            Version
          </label>
          <select
            id="version"
            className="rounded-lg border border-border-default bg-input px-3 py-1.5 text-sm text-text-primary outline-none focus:border-accent-blue/60"
            defaultValue="v3"
          >
            <option value="v1">Version 1</option>
            <option value="v2">Version 2</option>
            <option value="v3">Version 3 (latest)</option>
          </select>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <section className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-base">
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
            <div className="relative w-full max-w-[800px]">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border-default shadow-2xl shadow-black/40">
                <div className="absolute inset-0 gradient-bg opacity-90" />
                <div
                  className="absolute inset-0 opacity-40 mix-blend-overlay"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 80% 20%, rgba(0,242,234,0.25), transparent 40%)',
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-base via-base/60 to-transparent" />
                <div className="absolute inset-x-6 bottom-16 rounded-lg bg-black/45 px-3 py-2 text-center text-sm font-medium text-white backdrop-blur-md">
                  Summer Product Launch 2024
                </div>
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white shadow-lg backdrop-blur-md transition hover:bg-white/25"
                  aria-label={playing ? 'Pause' : 'Play'}
                >
                  {playing ? <PauseIcon className="h-7 w-7" /> : <PlayIcon className="ml-1 h-8 w-8" />}
                </button>
                <div className="absolute inset-x-0 bottom-0 space-y-2 bg-linear-to-t from-black/80 to-transparent px-4 pb-3 pt-10">
                  <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                    <div
                      className="pointer-events-none absolute left-0 top-0 h-full rounded-full gradient-bg"
                      style={{ width: `${progress}%` }}
                    />
                    <span
                      className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-white shadow"
                      style={{ left: `calc(${progress}% - 6px)` }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={progress}
                      onChange={(e) => setProgress(Number(e.target.value))}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      aria-label="Seek"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/90">
                    <button type="button" className="rounded p-1 hover:bg-white/10" aria-label="Play">
                      {playing ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="ml-0.5 h-4 w-4" />}
                    </button>
                    <button type="button" className="rounded p-1 hover:bg-white/10" aria-label="Rewind">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
                      </svg>
                    </button>
                    <span className="font-mono text-[11px] text-white/80">0:05 / 0:15</span>
                    <div className="ml-2 flex flex-1 items-center gap-2">
                      <span className="text-white/70" aria-hidden>
                        🔊
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue="72"
                        className="h-1 w-24 cursor-pointer accent-white"
                        aria-label="Volume"
                      />
                    </div>
                    <button
                      type="button"
                      className="rounded border border-white/20 px-2 py-0.5 text-[11px] hover:bg-white/10"
                    >
                      1x
                    </button>
                    <button type="button" className="ml-auto rounded p-1 hover:bg-white/10" aria-label="Fullscreen">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border px-6 py-4">
            <div className="mx-auto flex max-w-[800px] flex-wrap items-center gap-2">
              {['Format MP4', 'Quality 1080p', 'Size 8.4MB', 'Duration 0:15', 'Ratio 16:9'].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-border-default bg-surface px-3 py-1 text-xs text-text-secondary"
                >
                  {chip}
                </span>
              ))}
            </div>
            <div className="mx-auto mt-4 flex max-w-[800px] flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg border border-border-default bg-elevated px-4 py-2 text-sm font-medium text-text-primary transition hover:border-accent-blue/40"
              >
                Download MP4
              </button>
              <button
                type="button"
                className="rounded-lg border border-border-default bg-elevated px-4 py-2 text-sm font-medium text-text-primary transition hover:border-accent-blue/40"
              >
                Download Thumbnail
              </button>
            </div>
          </div>
        </section>

        <aside className="flex w-[380px] shrink-0 flex-col border-l border-border bg-panel">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Title</h2>
                <button
                  type="button"
                  className="text-xs font-medium text-accent-blue hover:text-accent-violet"
                >
                  Regenerate
                </button>
              </div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-blue/50"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Description</h2>
                <button
                  type="button"
                  className="text-xs font-medium text-accent-blue hover:text-accent-violet"
                >
                  Regenerate
                </button>
              </div>
              <div className="mb-2 flex gap-1 rounded-lg border border-border bg-input p-1">
                {PLATFORMS.map((p) => {
                  const active = activePlatform === p.id
                  const activeTone =
                    p.id === 'tiktok'
                      ? 'bg-tiktok/15 text-tiktok'
                      : p.id === 'youtube'
                        ? 'bg-youtube/15 text-youtube'
                        : p.id === 'instagram'
                          ? 'bg-instagram/15 text-instagram'
                          : 'bg-facebook/15 text-facebook'
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActivePlatform(p.id)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium transition ${
                        active ? activeTone : 'text-text-tertiary hover:text-text-secondary'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
                      <span className="hidden sm:inline">{p.label}</span>
                    </button>
                  )
                })}
              </div>
              <textarea
                value={activeDescription}
                onChange={(e) =>
                  setDescriptions((prev) => ({
                    ...prev,
                    [activePlatform]: e.target.value,
                  }))
                }
                rows={5}
                className="w-full resize-none rounded-lg border border-border-default bg-input px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-blue/50"
              />
              <div className="mt-1 flex justify-end text-xs text-text-muted">
                <span className="font-mono">
                  {charCount}/{charLimit}
                </span>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Tags</h2>
                <button
                  type="button"
                  className="text-xs font-medium text-accent-blue hover:text-accent-violet"
                >
                  Regenerate
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full border border-border-default bg-surface px-2.5 py-1 text-xs text-text-secondary"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="text-text-muted hover:text-text-primary"
                      aria-label={`Remove ${t}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  className="rounded-full border border-dashed border-border-default px-2.5 py-1 text-xs text-text-tertiary transition hover:border-accent-blue/40 hover:text-text-secondary"
                >
                  + Add
                </button>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                  Platform preview
                </h2>
              </div>
              <div className="mb-3 flex gap-1 rounded-lg border border-border bg-input p-1">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActivePreview(p.id)}
                    className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition ${
                      activePreview === p.id ? 'bg-elevated text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="rounded-2xl border border-border-default bg-surface p-3 shadow-xl">
                <div className="mx-auto max-w-[220px] overflow-hidden rounded-[1.75rem] border border-border-default bg-base shadow-lg">
                  <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                    <div className="h-8 w-8 rounded-full bg-linear-to-br from-accent-blue to-accent-violet" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-text-primary">@vidify_brand</p>
                      <p className="text-[10px] text-text-muted">Suggested for you</p>
                    </div>
                    <button
                      type="button"
                      className="rounded-full bg-accent-blue px-2.5 py-0.5 text-[10px] font-semibold text-white"
                    >
                      Follow
                    </button>
                  </div>
                  <div className="relative aspect-[9/14] w-full bg-black">
                    <div className="absolute inset-0 gradient-bg opacity-80" />
                    <div className="absolute inset-x-0 bottom-0 space-y-1 p-2">
                      <p className="text-[10px] leading-snug text-white drop-shadow">{previewCaption}</p>
                      <div className="flex gap-3 text-[10px] text-white/90">
                        <span>❤️ 2.4K</span>
                        <span>💬 142</span>
                        <span>↗ 890</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <footer className="flex h-[68px] shrink-0 items-center gap-2 border-t border-border bg-panel px-4">
        <button
          type="button"
          onClick={() => navigate('/publish')}
          className="rounded-lg gradient-bg px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25"
        >
          🚀 Publish Now
        </button>
        <button
          type="button"
          onClick={() => navigate('/publish')}
          className="rounded-lg border border-border-default bg-elevated px-4 py-2 text-sm font-medium text-text-primary transition hover:border-border-default"
        >
          📅 Schedule
        </button>
        <button
          type="button"
          className="rounded-lg border border-border-default bg-elevated px-4 py-2 text-sm font-medium text-text-primary transition hover:border-border-default"
        >
          ↓ Download
        </button>
        <button
          type="button"
          className="rounded-lg border border-border-default bg-elevated px-4 py-2 text-sm font-medium text-text-primary transition hover:border-border-default"
        >
          ↻ Regenerate
        </button>
        <button
          type="button"
          className="ml-auto rounded-lg border border-error/50 bg-transparent px-4 py-2 text-sm font-medium text-error transition hover:bg-error/10"
        >
          🗑 Delete
        </button>
      </footer>
    </div>
  )
}
