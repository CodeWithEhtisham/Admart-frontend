import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AGENT_STEPS as STEPS, runStatusText, runTitle } from '../utils/agents'
import { formatCredits } from '../utils/credits'
import {
  ConceptPicker,
  FinalReview,
  Research,
  SceneVisual,
  ScriptEditor,
  ScriptView,
  Storyboard,
} from './AgentRunViews.jsx'

const SERVICES = {
  openrouter: 'OpenRouter',
  fal: 'fal.ai',
  pexels: 'Pexels',
  // Older runs
  gemini: 'Gemini',
  groq: 'Groq',
  kokoro: 'Kokoro',
  openai: 'OpenAI',
  cloudflare: 'Cloudflare AI',
  local: 'Whisper',
}
// A run paused at a check-in shows it on the step that made the thing to check.
const WAITING_ON = { concept: 'concepts', script: 'script', storyboard: 'visuals', final: 'review' }
const GATE_STEP = { concept: 'pick_concept', script: 'review_script', storyboard: 'review_storyboard' }
const STUCK_MS = 60 * 1000

const seconds = (n) => (n < 60 ? `${Math.max(1, Math.round(n))}s` : `${Math.floor(n / 60)}m ${Math.round(n % 60)}s`)

function stepStates(run, steps) {
  const all = run.steps.length ? run.steps : steps
  const done = ['approved', 'succeeded'].includes(run.status) || (run.status === 'needs_review' && run.step === 'final')
  const at = done ? Infinity : Math.max(0, all.indexOf(GATE_STEP[run.step] || run.step))
  const waiting = run.status === 'needs_review' ? WAITING_ON[run.step] : null
  const current = { running: 'working', queued: 'queued', failed: 'failed', discarded: 'stopped' }[run.status]
  return Object.fromEntries(
    steps.map((step) => {
      if (step === waiting) return [step, 'waiting']
      if (step === 'review') {
        if (run.status === 'approved') return [step, 'done']
        if (run.status === 'discarded') return [step, 'stopped']
        return [step, 'todo']
      }
      const i = all.indexOf(step)
      if (i < at) return [step, 'done']
      if (i === at && current) return [step, current]
      return [step, 'todo']
    }),
  )
}

function summary(step, run) {
  const scenes = run.scenes
  const words = scenes.reduce((n, s) => n + s.narration.split(/\s+/).filter(Boolean).length, 0)
  switch (step) {
    case 'research':
      return run.research?.sources?.length ? `${run.research.sources.length} sources` : 'Notes ready'
    case 'concepts':
      return run.concept ? `Picked: ${run.concept.title}` : `${run.concepts.length} ideas`
    case 'script':
      return `${scenes.length} scenes · about ${Math.round(words / 2.6)}s`
    case 'voice':
      return `${scenes.filter((s) => s.audioUrl).length} of ${scenes.length} scenes`
    case 'visuals':
      return `${scenes.filter((s) => s.imageUrl || s.clipUrl).length} of ${scenes.length} scenes`
    case 'render':
      return run.duration ? `${Math.round(run.duration)}s video` : ''
    case 'finish':
      return 'In your Library'
    case 'review':
      return run.status === 'approved' ? 'Approved' : ''
    default:
      return ''
  }
}

function meta(entry) {
  if (!entry) return ''
  const took = (new Date(entry.finishedAt) - new Date(entry.startedAt)) / 1000
  const used = (entry.providers || []).map((p) => SERVICES[p] || p).join(', ')
  return [used, seconds(took)].filter(Boolean).join(' · ')
}

const DOT = {
  done: 'border-success bg-success text-white',
  working: 'border-accent-blue text-link animate-pulse',
  waiting: 'border-accent-blue bg-accent-blue text-white',
  failed: 'border-error bg-error text-white',
  queued: 'border-border-default text-text-tertiary',
  stopped: 'border-border-default text-text-tertiary',
  todo: 'border-border-default text-text-tertiary',
}
const STATE_TEXT = {
  working: 'Working on it…',
  waiting: 'Waiting for you',
  failed: 'Failed here',
  queued: 'Up next',
  stopped: 'Stopped',
}

function Details({ step, run, agent, waiting, busy, act, onApprove }) {
  if (step === 'research') return <Research research={run.research} open />
  if (step === 'concepts') {
    if (waiting) {
      return (
        <ConceptPicker
          run={run}
          styles={agent?.styles || []}
          busy={busy}
          onContinue={(p) => act('continue', p)}
          onDiscard={() => act('discard')}
        />
      )
    }
    return (
      <ul className="grid gap-2 md:grid-cols-3">
        {run.concepts.map((c, i) => {
          const picked = run.concept?.title === c.title
          return (
            <li key={i} className={`rounded-xl border p-3 text-sm ${picked ? 'border-accent-blue bg-accent-blue/10' : 'border-border-default bg-input'}`}>
              <span className="block font-semibold">
                {c.title}
                {picked ? <span className="ml-1 text-xs font-medium text-link">(picked)</span> : null}
              </span>
              <span className="mt-1 block text-text-secondary">“{c.hook}”</span>
              <span className="mt-1 block text-xs text-text-tertiary">{c.angle}</span>
            </li>
          )
        })}
      </ul>
    )
  }
  if (step === 'script') {
    if (waiting) return <ScriptEditor run={run} busy={busy} onContinue={(p) => act('continue', p)} onDiscard={() => act('discard')} />
    return <ScriptView run={run} />
  }
  if (step === 'voice') {
    return (
      <ol className="space-y-2">
        {run.scenes.map((s, i) => (
          <li key={i} className="rounded-xl border border-border-default bg-input p-3 text-sm">
            <p>
              <span className="text-text-tertiary">{i + 1}.</span> {s.narration}
            </p>
            {s.audioUrl ? (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <audio src={s.audioUrl} controls className="h-8 w-full max-w-sm" aria-label={`Voice for scene ${i + 1}`} />
                {s.duration ? <span className="text-xs text-text-tertiary">{seconds(s.duration)}</span> : null}
                {run.scenes.length === 1 ? (
                  <a href={s.audioUrl} download className="text-xs font-medium text-link hover:underline">
                    Download MP3
                  </a>
                ) : null}
              </div>
            ) : (
              <p className="mt-1 text-xs text-text-tertiary">Not recorded yet</p>
            )}
          </li>
        ))}
      </ol>
    )
  }
  if (step === 'visuals') {
    if (waiting) {
      return (
        <Storyboard
          run={run}
          busy={busy}
          redoCredits={agent?.redoCredits}
          onContinue={(p) => act('continue', p)}
          onRegenerate={(p) => act('regenerate', p)}
          onDiscard={() => act('discard')}
        />
      )
    }
    return (
      <ol className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {run.scenes.map((s, i) => (
          <li key={i} title={s.clipUrl ? `Stock clip: ${s.stockQuery}` : s.imagePrompt}>
            <SceneVisual scene={s} />
            <p className="mt-1 text-[11px] text-text-tertiary">
              {i + 1}. {s.clipUrl ? `Stock clip${s.credit?.by ? ` by ${s.credit.by}` : ''}` : s.imageUrl ? 'AI picture' : 'Not made yet'}
            </p>
          </li>
        ))}
      </ol>
    )
  }
  if (step === 'render') {
    return (
      <div className="space-y-1 text-sm">
        {run.checks.length ? (
          <ul className="space-y-0.5 text-xs text-success-text" aria-label="Quality checks">
            {run.checks.map((c) => (
              <li key={c}>✓ {c}</li>
            ))}
          </ul>
        ) : null}
        <p className="text-xs text-text-tertiary">{run.music ? `Music: ${run.music}` : 'No background music'}</p>
      </div>
    )
  }
  if (step === 'finish') {
    return (
      <Link to="/library" className="text-sm font-medium text-link hover:underline">
        Open Library →
      </Link>
    )
  }
  if (step === 'review' && run.videoUrl) {
    return <FinalReview run={run} busy={busy} onApprove={onApprove} onDiscard={() => act('discard')} />
  }
  if (step === 'captions') return <p className="text-sm text-text-secondary">Captions are timed to every spoken word.</p>
  return null
}

function hasDetails(step, run) {
  if (step === 'research') return Boolean(run.research?.notes)
  if (step === 'concepts') return run.concepts.length > 0
  if (['script', 'voice', 'visuals', 'captions'].includes(step)) return run.scenes.length > 0
  if (step === 'render') return run.checks.length > 0
  if (step === 'review') return Boolean(run.videoUrl)
  return step === 'finish'
}

function StepRow({ step, state, run, agent, entry, busy, act, onApprove }) {
  const auto = state === 'waiting' || (step === 'review' && run.status === 'needs_review')
  const [open, setOpen] = useState(auto)
  const [label, help] = STEPS[step] || [step, '']
  const reached = state !== 'todo' && state !== 'queued'
  const expandable = reached && hasDetails(step, run)
  const shown = expandable && (open || auto)
  const note = state === 'done' ? summary(step, run) : STATE_TEXT[state] || help
  const extra = state === 'working' && ['voice', 'visuals'].includes(step) ? summary(step, run) : ''

  return (
    <li className="group relative pb-5 pl-10 last:pb-0">
      <span aria-hidden className="absolute bottom-0 left-[13px] top-7 w-px bg-border-default group-last:hidden" />
      <span
        aria-hidden
        className={`absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold ${DOT[state]}`}
      >
        {state === 'done' ? '✓' : state === 'failed' ? '!' : state === 'waiting' ? '•' : ''}
      </span>
      <button
        type="button"
        disabled={!expandable || auto}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={expandable ? shown : undefined}
        className="flex w-full flex-wrap items-baseline gap-x-3 gap-y-0.5 text-left disabled:cursor-default"
      >
        <span className={`font-semibold ${reached ? 'text-text-primary' : 'text-text-tertiary'}`}>{label}</span>
        <span className={`min-w-0 flex-1 text-sm ${state === 'waiting' ? 'font-medium text-link' : state === 'failed' ? 'text-danger' : 'text-text-secondary'}`}>
          {note}
          {extra ? ` (${extra})` : ''}
        </span>
        {entry ? <span className="text-xs text-text-tertiary">{meta(entry)}</span> : null}
        {expandable && !auto ? <span className="text-xs font-medium text-link">{shown ? 'Hide' : 'Show'}</span> : null}
      </button>
      {shown ? (
        <div className="mt-3">
          <Details step={step} run={run} agent={agent} waiting={state === 'waiting'} busy={busy} act={act} onApprove={onApprove} />
        </div>
      ) : null}
    </li>
  )
}

/** One run as a workflow: every step, what it made, and which service made it. */
export default function AgentWorkflow({ run, agent, busy, now, onAction, onApprove }) {
  const steps = [...(agent?.steps || []), ...(agent?.review ? ['review'] : [])]
  const states = stepStates(run, steps)
  const act = (action, payload) => onAction(run, action, payload)
  const stuck = run.status === 'queued' && now - new Date(run.updatedAt || run.createdAt).getTime() > STUCK_MS

  return (
    <article className="rounded-2xl border border-border-default bg-surface p-5">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg font-bold">{runTitle(run)}</h2>
          <p className="text-xs text-text-tertiary">
            {run.input.topic && run.title && run.input.topic !== run.title ? `Topic: ${run.input.topic} · ` : ''}
            {new Date(run.createdAt).toLocaleString()} · {formatCredits(run.credits)} credits
          </p>
        </div>
        <span className="rounded-full border border-border-default px-2.5 py-0.5 text-xs font-semibold text-text-secondary">{runStatusText(run)}</span>
      </div>

      {stuck ? (
        <p className="mt-3 text-xs text-warning">
          Still waiting to start. The agents worker may not be running. Your credits are refunded if it fails.
        </p>
      ) : null}

      {run.status === 'failed' ? (
        <div className="mt-3 flex flex-col gap-3 rounded-xl border border-error/40 bg-error/10 px-4 py-3 sm:flex-row sm:items-center">
          <p role="alert" className="min-w-0 flex-1 text-sm text-danger">
            {run.error}
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => act('retry')}
            className="self-start rounded-xl border border-border-default bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary disabled:opacity-50"
          >
            Try again from here ({formatCredits(run.credits)} credits)
          </button>
        </div>
      ) : null}

      <ol className="mt-5" aria-label="Workflow">
        {steps.map((step) => (
          <StepRow
            key={`${step}-${states[step]}`}
            step={step}
            state={states[step]}
            run={run}
            agent={agent}
            entry={run.log?.[step]}
            busy={busy}
            act={act}
            onApprove={() => onApprove(run)}
          />
        ))}
      </ol>
    </article>
  )
}

/** Before the first run: what the agent will do, step by step. */
export function HowItWorks({ agent }) {
  const steps = [...(agent?.steps || []), ...(agent?.review ? ['review'] : [])]
  return (
    <section className="rounded-2xl border border-border-default bg-surface p-5">
      <h2 className="font-heading text-lg font-bold">How this agent works</h2>
      <p className="mt-1 text-sm text-text-secondary">Start a run and watch each step fill in here. Click any finished step to see what it made.</p>
      <ol className="mt-5 space-y-3">
        {steps.map((step, i) => (
          <li key={step} className="flex gap-3 text-sm">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-default text-xs text-text-tertiary">
              {i + 1}
            </span>
            <span>
              <span className="block font-semibold">{STEPS[step]?.[0] || step}</span>
              <span className="text-text-secondary">{STEPS[step]?.[1]}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
