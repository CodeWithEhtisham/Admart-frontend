import { useEffect, useState } from 'react'
import { isScheduled, runStatusText, runTitle, whenText } from '../utils/agents'
import { formatCredits } from '../utils/credits'
import { LiveDot } from './AgentBits.jsx'
import { Glyphs } from './glyphs'
import { Icon } from './icons'

const TICK_MS = 30 * 1000 // keeps "5 min ago" fresh while the page isn't polling

const elapsed = (ms) => {
  const s = Math.max(1, Math.round(ms / 1000))
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
}

const ago = (iso, now) => {
  const s = (now - new Date(iso).getTime()) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`
  return new Date(iso).toLocaleDateString()
}

// When the run's first step started (time spent waiting in the queue doesn't count).
const startedAt = (run) =>
  Object.values(run.log || {})
    .map((e) => e?.startedAt)
    .filter(Boolean)
    .sort()[0] || run.createdAt

const endedAt = (run) => run.finishedAt || run.updatedAt || run.createdAt

function detail(run, runnerOnline, now) {
  if (run.status === 'running') return [`${runStatusText(run)} · ${elapsed(now - new Date(startedAt(run)).getTime())}`, 'text-text-tertiary']
  if (run.status === 'queued') {
    if (isScheduled(run) && run.postAt) return [`Scheduled for ${whenText(run.postAt)}`, 'text-text-tertiary']
    return runnerOnline === false
      ? ['Waiting for the runner to come back', 'font-medium text-text-primary']
      : ['Starts when the runner is free', 'text-text-tertiary']
  }
  if (run.status === 'needs_review') return ['Needs your review →', 'font-semibold text-link']
  if (run.status === 'failed') return [`Failed ${ago(endedAt(run), now)} · credits refunded`, 'text-danger']
  if (run.status === 'discarded') return [`Stopped ${ago(endedAt(run), now)}`, 'text-text-tertiary']
  return [`Done ${ago(endedAt(run), now)} · ${formatCredits(run.credits)} credits`, 'text-text-tertiary']
}

// Status marker beside each run (the words next to it carry the meaning).
const MARK = {
  queued: 'border border-dashed border-text-tertiary',
  needs_review: 'ai-gradient-soft',
  failed: 'bg-error',
  discarded: 'border border-border-default',
}

function RunnerStatus({ online }) {
  // One atomic status region, so a screen reader hears the change once, in words.
  return (
    <div role="status" aria-atomic="true">
      {online === true ? (
        <p className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-2.5 py-0.5 text-xs text-text-secondary">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-success" />
          Agent runner: <span className="font-semibold text-success-text">online</span>
        </p>
      ) : online === false ? (
        <p className="flex gap-2 rounded-xl border border-warning/50 bg-warning/15 px-3 py-2 text-xs text-text-primary">
          <Icon className="mt-0.5 h-4 w-4 text-warning-text">{Glyphs.alert}</Icon>
          <span>
            <span className="font-semibold">Agent runner is offline.</span> Your runs will wait until it starts. Credits are
            refunded if a run fails.
          </span>
        </p>
      ) : null}
    </div>
  )
}

function Group({ label, runs, selectedId, runnerOnline, now, onSelect }) {
  if (!runs.length) return null
  return (
    <section>
      <h3 className="px-1 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
        {label} ({runs.length})
      </h3>
      <ul className="mt-2 space-y-1">
        {runs.map((r) => {
          const active = r.id === selectedId
          const [text, tone] = detail(r, runnerOnline, now)
          return (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onSelect(r.id)}
                aria-current={active ? 'true' : undefined}
                className={`flex min-h-[44px] w-full cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-violet ${
                  active ? 'border-accent-violet/60 bg-accent-violet/10 ai-glow' : 'border-transparent hover:border-border-default hover:bg-elevated/70'
                }`}
              >
                <span aria-hidden className="mt-1.5 flex h-2 w-2 shrink-0 items-center justify-center">
                  {r.status === 'running' ? (
                    <LiveDot />
                  ) : (
                    <span
                      className={`h-2 w-2 rounded-full ${
                        r.status === 'queued' && runnerOnline === false ? 'bg-warning' : MARK[r.status] || 'bg-success'
                      }`}
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{runTitle(r)}</span>
                  <span className={`mt-0.5 block text-xs tabular-nums ${tone}`}>{text}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** The Activity panel on every agent page: is the runner up, what is running, waiting, and recently finished. */
export default function AgentActivity({ runs, selectedId, runnerOnline, now, onSelect, className = '' }) {
  const [tick, setTick] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setTick(Date.now()), TICK_MS)
    return () => clearInterval(t)
  }, [])
  const clock = Math.max(now || 0, tick)
  const running = runs.filter((r) => r.status === 'running')
  const waiting = runs.filter((r) => r.status === 'queued')
  const finished = runs
    .filter((r) => !['running', 'queued'].includes(r.status))
    .sort((a, b) => new Date(endedAt(b)) - new Date(endedAt(a)))
  const groups = { selectedId, runnerOnline, now: clock, onSelect }

  return (
    <aside aria-label="Activity" className={`glass-card rounded-2xl p-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-[1rem] font-semibold">Activity</h2>
        {running.length ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-text">
            <LiveDot />
            {running.length} working
          </span>
        ) : null}
      </div>
      <div className="mt-2">
        <RunnerStatus online={runnerOnline} />
      </div>
      {runs.length ? (
        <div className="-mx-1 mt-4 max-h-[70vh] space-y-5 overflow-y-auto px-1">
          <Group label="Running" runs={running} {...groups} />
          <Group label="Waiting" runs={waiting} {...groups} />
          <Group label="Finished" runs={finished} {...groups} />
        </div>
      ) : (
        <p className="mt-4 text-sm text-text-tertiary">Nothing yet. Runs you start show up here.</p>
      )}
    </aside>
  )
}
