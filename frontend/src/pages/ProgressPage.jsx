import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const STAGES = [
  'Analyzing Prompt',
  'Generating Frames',
  'Rendering Video',
  'Adding Music',
  'Burning Captions',
  'Encoding Output',
]

const FRAME_THRESHOLDS = [30, 45, 60, 75, 88]

/** Stage segments: advance at 10%, 40%, 65%, 78%, 90%, 98% */
function activeStageIndex(p) {
  if (p >= 100) return 5
  if (p < 10) return 0
  if (p < 40) return 1
  if (p < 65) return 2
  if (p < 78) return 3
  if (p < 90) return 4
  return 5
}

function framesLoadedCount(p) {
  return FRAME_THRESHOLDS.filter((t) => p >= t).length
}

export default function ProgressPage() {
  const navigate = useNavigate()
  const [percentage, setPercentage] = useState(0)
  const [stageIndex, setStageIndex] = useState(0)
  const [loadedFrames, setLoadedFrames] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [notifyActive, setNotifyActive] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(45)

  const radius = 70
  const circumference = useMemo(() => 2 * Math.PI * radius, [])

  useEffect(() => {
    const id = setInterval(() => {
      setPercentage((prev) => {
        if (prev >= 100) return 100
        const delta = 1 + Math.round(Math.random())
        return Math.min(100, prev + delta)
      })
    }, 400)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    setStageIndex(activeStageIndex(percentage))
    setLoadedFrames(framesLoadedCount(percentage))
  }, [percentage])

  useEffect(() => {
    if (percentage >= 100) {
      const t = setTimeout(() => setShowSuccess(true), 800)
      return () => clearTimeout(t)
    }
    return undefined
  }, [percentage])

  useEffect(() => {
    if (percentage >= 100) return undefined
    const id = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [percentage])

  const strokeDashoffset = circumference - (percentage / 100) * circumference
  const stageLabel = STAGES[stageIndex]

  return (
    <div className="relative min-h-screen overflow-hidden bg-base font-body text-text-primary">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-accent-blue/30 blur-[100px] animate-pulse" />
        <div className="absolute -right-20 bottom-24 h-96 w-96 rounded-full bg-accent-violet/25 blur-[110px] animate-pulse [animation-delay:400ms]" />
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute bottom-0 h-1 w-1 rounded-full bg-text-muted/40"
            style={{
              left: `${(i * 17) % 100}%`,
              animation: `floatUp ${10 + (i % 5)}s linear infinite`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.6; }
          100% { transform: translateY(-100vh); opacity: 0; }
        }
      `}</style>

      <header className="fixed left-0 right-0 top-0 z-20 flex h-[60px] items-center border-b border-border bg-panel/90 px-6 backdrop-blur-md">
        <Link
          to="/dashboard"
          className="font-heading text-lg font-bold tracking-tight gradient-text transition-opacity hover:opacity-90"
        >
          Vidify
        </Link>
      </header>

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pb-16 pt-24">
        <div className="w-full max-w-[600px] rounded-[20px] border border-border-default bg-panel p-12 shadow-2xl animate-slide-up">
          <div className="flex flex-col items-center">
            <div className="relative h-[160px] w-[160px]">
              <svg className="-rotate-90" width="160" height="160" viewBox="0 0 160 160" aria-hidden>
                <defs>
                  <linearGradient id="vidifyRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke="url(#vidifyRing)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-[stroke-dashoffset] duration-300 ease-out"
                />
              </svg>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-heading text-3xl font-bold text-text-primary">{percentage}%</span>
                <span className="text-xs font-medium uppercase tracking-wider text-text-tertiary">Generating</span>
              </div>
            </div>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-border-default bg-elevated px-4 py-2 text-sm text-text-secondary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-blue opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-blue" />
              </span>
              {stageLabel}
            </div>

            <div className="mt-10 w-full overflow-x-auto">
              <div className="flex min-w-[560px] items-start justify-between px-1">
                {STAGES.map((label, i) => {
                  const done = percentage >= 100 || i < stageIndex
                  const active = percentage < 100 && i === stageIndex
                  return (
                    <div key={label} className="flex flex-1 items-start">
                      <div className="flex w-full min-w-0 flex-col items-center gap-2">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-mono ${
                            done
                              ? 'border-success/50 bg-success/15 text-success'
                              : active
                                ? 'border-accent-blue bg-accent-blue/15 text-text-primary'
                                : 'border-border-default bg-surface text-text-muted'
                          }`}
                        >
                          {done ? '✓' : i + 1}
                        </div>
                        <span
                          className={`max-w-[88px] text-center text-[10px] font-medium leading-tight ${
                            active ? 'text-text-primary' : done ? 'text-text-secondary' : 'text-text-muted'
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                      {i < STAGES.length - 1 && (
                        <div
                          className={`mx-0.5 mt-4 h-px min-w-[12px] flex-1 max-w-[48px] ${
                            percentage >= 100 || i < stageIndex ? 'bg-success/35' : 'bg-border-default'
                          }`}
                          aria-hidden
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-10 grid w-full grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-border-default bg-surface px-2 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Time left</p>
                <p className="mt-1 font-mono text-lg text-text-primary">{secondsLeft}s</p>
              </div>
              <div className="rounded-xl border border-border-default bg-surface px-2 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Queue</p>
                <p className="mt-1 font-mono text-lg text-text-primary">#1</p>
              </div>
              <div className="rounded-xl border border-border-default bg-surface px-2 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Duration</p>
                <p className="mt-1 font-mono text-lg text-text-primary">15s</p>
              </div>
            </div>

            <div className="mt-10 flex w-full gap-3">
              {[0, 1, 2, 3, 4].map((i) => {
                const loaded = i < loadedFrames
                return (
                  <div
                    key={i}
                    className={`relative aspect-video flex-1 overflow-hidden rounded-lg border border-border-default ${
                      loaded ? 'bg-gradient-to-br from-accent-blue/50 to-accent-violet/50' : 'animate-shimmer'
                    }`}
                  >
                    {loaded && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-lg text-white backdrop-blur-sm">
                          ▶
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/create')}
                className="flex-1 rounded-xl border border-error/50 bg-transparent py-3 text-sm font-semibold text-error transition hover:bg-error/10"
              >
                Cancel Generation
              </button>
              <button
                type="button"
                onClick={() => setNotifyActive((v) => !v)}
                className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition ${
                  notifyActive
                    ? 'border-accent-blue bg-accent-blue/15 text-text-primary'
                    : 'border-border-default bg-elevated text-text-secondary hover:text-text-primary'
                }`}
              >
                🔔 Notify when ready
              </button>
            </div>
          </div>
        </div>
      </main>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-slide-up">
          <div className="w-full max-w-md rounded-2xl border border-border-default bg-panel p-8 text-center shadow-2xl">
            <p className="text-4xl">🎉</p>
            <h2 className="mt-4 font-heading text-2xl font-bold text-text-primary">Your video is ready!</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Review the cut, pick a thumbnail, and publish to your connected platforms.
            </p>
            <div className="mx-auto mt-6 aspect-video max-w-xs overflow-hidden rounded-xl border border-border-default bg-gradient-to-br from-accent-blue/40 to-accent-violet/40" />
            <button
              type="button"
              onClick={() => navigate('/result')}
              className="mt-8 w-full rounded-xl bg-accent-blue py-3 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 transition hover:bg-accent-blue/90"
            >
              View &amp; Publish Video →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
