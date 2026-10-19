import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AGENT_STEPS as STEPS, PLATFORM_NAMES, isScheduled, runStatusText, runTitle, waitingText, whenText } from '../utils/agents'
import { formatCredits } from '../utils/credits'
import {
  ConceptPicker,
  FinalReview,
  HookScore,
  Research,
  SceneVisual,
  ScriptEditor,
  ScriptView,
  Storyboard,
  TitleCheck,
} from './AgentRunViews.jsx'
import AgentEditReview from './AgentEditReview.jsx'
import AgentPostReview from './AgentPostReview.jsx'
import AgentTrendList from './AgentTrendList.jsx'
import { ClipPicker, ClipResults } from './AgentClipReview.jsx'
import AgentReport from './AgentReport.jsx'
import AgentStepTracker from './AgentStepTracker.jsx'
import { LiveDot, dangerButton, secondaryButton } from './AgentBits.jsx'
import { Glyphs } from './glyphs'
import { Icon } from './icons'

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
const WAITING_ON = { concept: 'concepts', script: 'script', storyboard: 'visuals', edit: 'plan_edit', post: 'write_post', clips: 'find_clips', final: 'review' }
const GATE_STEP = { concept: 'pick_concept', script: 'review_script', storyboard: 'review_storyboard', edit: 'review_edit', post: 'review_post', clips: 'review_clips' }
const AUDIO_NAMES = { basic: 'Basic', standard: 'Standard', studio: 'Studio' }
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
  const cutCount = (run.cuts || []).filter((c) => !c.keep).length
  const sent = Object.entries(run.posted || {})
  switch (step) {
    case 'trends':
      return `${run.trends?.length || 0} trends found`
    case 'collect':
      return run.numbers ? `${run.numbers.start} to ${run.numbers.end}` : ''
    case 'analyze':
      return run.report ? `${run.report.plan.length} posts planned` : ''
    case 'deliver':
      return run.emailError || (run.sentTo?.length ? `Sent to ${run.sentTo.join(', ')}` : '')
    case 'fetch':
      return run.sourceSeconds ? `${seconds(run.sourceSeconds)} video${run.short ? ' · Short' : ''}` : 'Video checked'
    case 'listen':
      return run.transcript?.length ? `${run.transcript.length} words` : 'No speech found'
    case 'write_post':
      return `${Object.keys(run.posts || {}).length} posts written`
    case 'wait':
      return run.postAt ? `Posted on time (${whenText(run.postAt)})` : 'Posted right away'
    case 'post':
      return sent
        .map(([p, r]) => `${PLATFORM_NAMES[p]} ${r.status === 'succeeded' ? '✓' : r.status === 'unknown' ? '?' : '✗'}`)
        .join(' · ')
    case 'prepare':
      return run.sourceSeconds ? `${seconds(run.sourceSeconds)} video` : 'Video checked'
    case 'transcribe':
      return run.transcript?.length ? `${run.transcript.length} words` : 'No speech found'
    case 'clean_audio':
      return run.audioFallback
        ? `${AUDIO_NAMES[run.audioLevelUsed]} (the ${AUDIO_NAMES[run.audioLevel]} service was unavailable)`
        : `${AUDIO_NAMES[run.audioLevelUsed] || ''} cleanup`
    case 'plan_edit':
      return `${cutCount} cuts${run.captionFixes?.length ? ` · ${run.captionFixes.length} caption fixes` : ''}`
    case 'render_edit':
      return run.removedSeconds != null ? `${seconds(run.duration || 0)} video · ${seconds(run.removedSeconds)} removed` : ''
    case 'package':
      return run.title || ''
    case 'get_video':
      return run.sourceSeconds ? `${seconds(run.sourceSeconds)} video${run.sourceTitle ? ` · ${run.sourceTitle}` : ''}` : 'Video checked'
    case 'transcribe_long':
      return 'Every word, with its timing'
    case 'find_clips': {
      const kept = (run.moments || []).filter((m) => m.keep !== false).length
      return run.clips?.length || run.status !== 'needs_review'
        ? `${kept} of ${run.moments?.length || 0} moments picked`
        : `${run.moments?.length || 0} moments found`
    }
    case 'render_clips': {
      const made = (run.clips || []).filter((c) => c.videoUrl).length
      return `${made} clip${made === 1 ? '' : 's'} made`
    }
    case 'finish_clips':
      return 'In your Library'
    default:
      break
  }
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

/** "downloading the video: 25% · 44 KB/s · about 55 min left" */
function downloadText({ part, percent, speed, eta }) {
  const rate = speed >= 1024 * 1024 ? `${(speed / 1024 / 1024).toFixed(1)} MB/s` : `${Math.round(speed / 1024)} KB/s`
  const left = eta == null ? '' : eta < 90 ? ` · about ${Math.max(1, Math.round(eta))}s left` : ` · about ${Math.round(eta / 60)} min left`
  return `downloading the ${part}: ${percent}%${speed ? ` · ${rate}` : ''}${left}`
}

function meta(entry) {
  if (!entry) return ''
  const took = (new Date(entry.finishedAt) - new Date(entry.startedAt)) / 1000
  const used = (entry.providers || []).map((p) => SERVICES[p] || p).join(', ')
  return [used, seconds(took)].filter(Boolean).join(' · ')
}

const DOT = {
  done: 'ai-gradient text-white',
  working: 'border-2 border-accent-violet bg-panel ai-node-working',
  waiting: 'ai-gradient ai-glow text-white',
  failed: 'bg-error text-white',
  queued: 'border border-dashed border-accent-violet/60 bg-panel text-text-tertiary',
  stopped: 'border border-border-default bg-elevated text-text-tertiary',
  todo: 'border border-border-default bg-panel text-text-tertiary',
}
const STATE_TEXT = {
  working: 'Working on it…',
  waiting: 'Waiting for you',
  failed: 'Failed here',
  queued: 'Up next',
  stopped: 'Stopped',
}

function EditDetails({ step, run, waiting, busy, act }) {
  if (step === 'prepare') {
    return <video src={run.sourceUrl} controls playsInline className="max-h-80 w-full max-w-sm rounded-xl bg-black" />
  }
  if (step === 'transcribe') {
    return <p className="max-h-48 overflow-y-auto whitespace-pre-line text-text-secondary">{run.transcript.map((w) => w.word).join(' ')}</p>
  }
  if (step === 'clean_audio') {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-xs text-text-tertiary">
          Original sound
          <audio src={run.audioUrl} controls className="mt-1 h-8 w-full" />
        </label>
        <label className="text-xs text-text-tertiary">
          Cleaned sound
          <audio src={run.audioCleanUrl} controls className="mt-1 h-8 w-full" />
        </label>
      </div>
    )
  }
  if (step === 'plan_edit') {
    if (waiting) {
      return <AgentEditReview run={run} busy={busy} onContinue={(p) => act('continue', p)} onDiscard={() => act('discard')} />
    }
    const counts = {}
    for (const c of run.cuts.filter((c) => !c.keep)) for (const r of c.reasons) counts[r] = (counts[r] || 0) + 1
    return (
      <ul className="space-y-0.5 text-sm text-text-secondary">
        {Object.entries(counts).map(([reason, n]) => (
          <li key={reason}>
            {n} × {reason}
          </li>
        ))}
        {run.captionFixes.map((f) => (
          <li key={f.index}>
            Caption: {f.from} → {f.to}
          </li>
        ))}
      </ul>
    )
  }
  if (step === 'render_edit') {
    return (
      <ul className="space-y-0.5 text-xs text-success-text" aria-label="Quality checks">
        {run.checks.map((c) => (
          <li key={c}>✓ {c}</li>
        ))}
      </ul>
    )
  }
  if (step === 'package') {
    return (
      <div className="space-y-1">
        <p className="font-medium">{run.title}</p>
        {run.thumbnailText ? <p className="text-xs text-text-tertiary">Thumbnail text: {run.thumbnailText}</p> : null}
        <TitleCheck run={run} />
        {run.thumbnailUrl ? <img src={run.thumbnailUrl} alt="Thumbnail" className="mt-2 max-h-48 rounded-lg" /> : null}
      </div>
    )
  }
  return null
}

function PostDetails({ step, run, waiting, busy, act }) {
  if (step === 'fetch') {
    return run.sourceUrl ? <video src={run.sourceUrl} controls playsInline className="max-h-80 w-full max-w-sm rounded-xl bg-black" /> : null
  }
  if (step === 'listen') {
    return <p className="max-h-48 overflow-y-auto text-text-secondary">{run.transcript.map((w) => w.word).join(' ')}</p>
  }
  if (step === 'write_post') {
    if (waiting) return <AgentPostReview run={run} busy={busy} onContinue={(p) => act('continue', p)} onDiscard={() => act('discard')} />
    return (
      <ul className="space-y-2 text-sm">
        {(run.chosen || []).map((p) => (
          <li key={p} className="rounded-xl border border-border-default bg-input p-3">
            <span className="text-xs font-semibold text-text-tertiary">{PLATFORM_NAMES[p]}</span>
            <p className="mt-1 whitespace-pre-line">{p === 'youtube' ? run.posts.youtube.title : run.posts[p]?.caption}</p>
          </li>
        ))}
      </ul>
    )
  }
  if (step === 'post') {
    return (
      <ul className="space-y-1 text-sm">
        {Object.entries(run.posted).map(([p, r]) => (
          <li key={p} className={r.status === 'succeeded' ? 'text-success-text' : 'text-danger'}>
            {r.status === 'succeeded' ? '✓' : '✗'} {PLATFORM_NAMES[p]}
            {r.error ? `: ${r.error}` : ''}
          </li>
        ))}
        <li>
          <Link to="/calendar" className="text-xs font-medium text-link hover:underline">
            See it in the Calendar →
          </Link>
        </li>
      </ul>
    )
  }
  return null
}

function ClipDetails({ step, run, waiting, busy, act }) {
  if (step === 'get_video') {
    return run.sourceUrl ? (
      <video src={run.sourceUrl} controls playsInline preload="metadata" className="max-h-80 w-full max-w-sm rounded-xl bg-black" />
    ) : null
  }
  if (step === 'find_clips') {
    if (waiting) return <ClipPicker run={run} busy={busy} onContinue={(p) => act('continue', p)} onDiscard={() => act('discard')} />
    return (
      <ol className="space-y-1 text-sm">
        {run.moments.map((m, i) => (
          <li key={i} className={m.keep === false ? 'text-text-tertiary line-through' : ''}>
            <span className="tabular-nums text-text-tertiary">{m.score}</span> {m.title}
          </li>
        ))}
      </ol>
    )
  }
  if (step === 'render_clips') return <ClipResults run={run} />
  if (step === 'finish_clips') {
    return (
      <Link to="/library" className="text-sm font-medium text-link hover:underline">
        Open Library →
      </Link>
    )
  }
  return null
}

const CLIP_STEPS = ['get_video', 'transcribe_long', 'find_clips', 'render_clips', 'finish_clips']
const POST_STEPS = ['fetch', 'listen', 'write_post', 'post']
const EDIT_STEPS = ['prepare', 'transcribe', 'clean_audio', 'plan_edit', 'render_edit', 'package']

function Details({ step, run, agent, waiting, busy, act, onApprove }) {
  if (step === 'trends') return <AgentTrendList run={run} />
  if (CLIP_STEPS.includes(step)) return <ClipDetails step={step} run={run} waiting={waiting} busy={busy} act={act} />
  if (step === 'analyze') return <AgentReport run={run} />
  if (POST_STEPS.includes(step)) return <PostDetails step={step} run={run} waiting={waiting} busy={busy} act={act} />
  if (EDIT_STEPS.includes(step)) return <EditDetails step={step} run={run} waiting={waiting} busy={busy} act={act} />
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
              <span className="mt-1 block">
                <HookScore concept={c} />
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
  if (step === 'trends') return run.trends?.length > 0
  if (step === 'get_video') return Boolean(run.sourceUrl)
  if (step === 'transcribe_long') return false
  if (step === 'find_clips') return run.moments?.length > 0
  if (step === 'render_clips') return run.clips?.length > 0
  if (step === 'finish_clips') return true
  if (step === 'analyze') return Boolean(run.report)
  if (step === 'fetch') return Boolean(run.sourceUrl)
  if (step === 'listen') return run.transcript?.length > 0
  if (step === 'write_post') return Boolean(run.posts && Object.keys(run.posts).length)
  if (step === 'post') return Boolean(run.posted && Object.keys(run.posted).length)
  if (step === 'prepare') return Boolean(run.sourceUrl)
  if (step === 'transcribe') return run.transcript?.length > 0
  if (step === 'clean_audio') return Boolean(run.audioCleanUrl)
  if (step === 'plan_edit') return Array.isArray(run.cuts) && run.cuts.length + (run.captionFixes?.length || 0) > 0
  if (step === 'render_edit') return run.checks.length > 0
  if (step === 'package') return Boolean(run.title)
  if (step === 'research') return Boolean(run.research?.notes)
  if (step === 'concepts') return run.concepts.length > 0
  if (['script', 'voice', 'visuals', 'captions'].includes(step)) return run.scenes.length > 0
  if (step === 'render') return run.checks.length > 0
  if (step === 'review') return Boolean(run.videoUrl)
  return step === 'finish'
}

// Steps whose output is a link or a hand-off, not something to preview.
const NOT_A_RESULT = ['finish', 'finish_clips', 'deliver', 'wait']

/** The step shown big on the canvas: what needs you now, else the finished result. Null while it works. */
function focusStep(run, steps, states) {
  const waiting = steps.find((s) => states[s] === 'waiting')
  if (waiting) return waiting
  if (!['succeeded', 'approved'].includes(run.status)) return null
  if (steps.includes('review') && run.videoUrl) return 'review'
  return [...steps].reverse().find((s) => states[s] === 'done' && !NOT_A_RESULT.includes(s) && hasDetails(s, run)) || null
}

function StepRow({ step, state, run, agent, entry, busy, act, onApprove, shownAbove }) {
  const auto = state === 'waiting' || (step === 'review' && run.status === 'needs_review')
  const [open, setOpen] = useState(auto || ['trends', 'analyze'].includes(step)) // the result itself
  const [label, help] = STEPS[step] || [step, '']
  const reached = state !== 'todo' && state !== 'queued'
  const expandable = reached && hasDetails(step, run) && !shownAbove
  const shown = expandable && (open || auto)
  const note =
    state === 'done'
      ? summary(step, run)
      : step === 'wait' && isScheduled(run) && run.postAt
        ? `Posts ${whenText(run.postAt)}`
        : STATE_TEXT[state] || help
  const extra =
    state === 'working' && ['voice', 'visuals'].includes(step)
      ? summary(step, run)
      : state === 'working' && step === 'get_video' && run.download
        ? downloadText(run.download)
        : ''

  return (
    <li className="group relative pb-4 pl-11 last:pb-0">
      <span aria-hidden className="absolute bottom-0 left-[13px] top-8 w-px bg-border-default group-last:hidden" />
      <span
        aria-hidden
        className={`absolute left-0 top-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${DOT[state]}`}
      >
        {state === 'done' ? (
          <Icon className="h-3.5 w-3.5">{Glyphs.check}</Icon>
        ) : state === 'failed' ? (
          '!'
        ) : state === 'waiting' ? (
          <Icon className="h-3.5 w-3.5">{Glyphs.user}</Icon>
        ) : state === 'working' ? (
          <span className="ai-live-dot" />
        ) : (
          ''
        )}
      </span>
      <button
        type="button"
        disabled={!expandable || auto}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={expandable ? shown : undefined}
        className="flex min-h-[44px] w-full cursor-pointer flex-wrap items-center gap-x-3 gap-y-0.5 rounded-xl px-3 py-1.5 text-left transition-colors duration-200 enabled:hover:bg-elevated/70 disabled:cursor-default"
      >
        <span className={`font-semibold ${reached ? 'text-text-primary' : 'text-text-tertiary'}`}>{label}</span>
        <span className={`min-w-0 flex-1 text-sm ${state === 'waiting' ? 'font-medium text-link' : state === 'failed' ? 'text-danger' : 'text-text-secondary'}`}>
          {note}
          {extra ? ` (${extra})` : ''}
        </span>
        {entry ? <span className="text-xs text-text-tertiary">{meta(entry)}</span> : null}
        {shownAbove ? <span className="text-xs font-medium text-violet-text">Shown above</span> : null}
        {expandable && !auto ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-link">
            {shown ? 'Hide' : 'Show'}
            <Icon className={`h-3.5 w-3.5 transition-transform duration-200 ${shown ? 'rotate-180' : ''}`}>{Glyphs.chevronDown}</Icon>
          </span>
        ) : null}
      </button>
      {shown ? (
        <div className="mt-2 px-3 pb-1">
          <Details step={step} run={run} agent={agent} waiting={state === 'waiting'} busy={busy} act={act} onApprove={onApprove} />
        </div>
      ) : null}
    </li>
  )
}

/** The big area under the tracker: what the agent made (or what it needs from you), else what it is doing now. */
function Stage({ run, agent, steps, states, focus, busy, act, onApprove }) {
  if (focus) {
    const waiting = states[focus] === 'waiting'
    const [label] = STEPS[focus] || [focus]
    return (
      <section
        aria-labelledby={`stage-${run.id}`}
        className={`rounded-2xl border p-4 sm:p-5 ${waiting ? 'border-accent-violet/50 bg-accent-violet/5 ai-glow' : 'border-border-default bg-base/40'}`}
      >
        <h3 id={`stage-${run.id}`} className="flex flex-wrap items-center gap-2 font-heading text-base font-semibold text-text-primary">
          {waiting ? (
            <span className="inline-flex items-center gap-1.5 rounded-full ai-gradient px-2.5 py-0.5 text-xs font-semibold text-white">
              <Icon className="h-3.5 w-3.5">{Glyphs.user}</Icon>
              Your turn
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success-text">
              <Icon className="h-3.5 w-3.5">{Glyphs.check}</Icon>
              Result
            </span>
          )}
          {label}
        </h3>
        <div className="mt-4">
          <Details step={focus} run={run} agent={agent} waiting={waiting} busy={busy} act={act} onApprove={onApprove} />
        </div>
      </section>
    )
  }
  const current = steps.find((s) => states[s] === 'working')
  if (!current) return null
  const [label, help] = STEPS[current] || [current, '']
  const extra =
    ['voice', 'visuals'].includes(current) ? summary(current, run) : current === 'get_video' && run.download ? downloadText(run.download) : ''
  return (
    <section className="relative overflow-hidden rounded-2xl border border-accent-violet/40 bg-accent-violet/5 p-5 sm:p-6">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full ai-gradient-soft opacity-20 blur-3xl" />
      <div className="relative flex items-start gap-4">
        <span aria-hidden className="ai-node-working flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-accent-violet bg-panel">
          <span className="ai-live-dot" />
        </span>
        <div className="min-w-0" role="status">
          <p className="font-heading text-base font-semibold">{label}: working on it…</p>
          <p className="mt-1 text-sm text-text-secondary">{help}</p>
          {extra ? <p className="mt-1 text-xs tabular-nums text-violet-text">{extra}</p> : null}
          <p className="mt-2 text-xs text-text-tertiary">You can leave this page. It keeps going, and the bell tells you when it needs you.</p>
        </div>
      </div>
    </section>
  )
}

/** One run as a workflow: every step, what it made, and which service made it. */
export default function AgentWorkflow({ run, agent, busy, now, runnerOnline, onAction, onApprove }) {
  const steps = [...(agent?.steps || []), ...(agent?.review ? ['review'] : [])]
  const states = stepStates(run, steps)
  const act = (action, payload) => onAction(run, action, payload)
  const stuck = run.status === 'queued' && !isScheduled(run) && now - new Date(run.updatedAt || run.createdAt).getTime() > STUCK_MS
  const waitNote = waitingText(run, runnerOnline, stuck)
  const [confirmCancel, setConfirmCancel] = useState(false)
  // A job that is waiting or working can be stopped, except while it is posting.
  const cancellable = ['queued', 'running'].includes(run.status) && !isScheduled(run) && !(run.status === 'running' && run.step === 'post')
  const focus = focusStep(run, steps, states)

  return (
    <article className="glass-card space-y-5 rounded-2xl p-4 sm:p-6">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg font-bold sm:text-xl">{runTitle(run)}</h2>
          <p className="mt-0.5 text-xs text-text-tertiary">
            {run.input.topic && run.title && run.input.topic !== run.title ? `Topic: ${run.input.topic} · ` : ''}
            {new Date(run.createdAt).toLocaleString()} · {formatCredits(run.credits)} credits
          </p>
        </div>
        <span
          className={`inline-flex min-h-[32px] items-center gap-2 rounded-full border px-3 text-xs font-semibold ${
            run.status === 'running' ? 'border-accent-violet/50 bg-accent-violet/10 text-violet-text' : 'border-border-default text-text-secondary'
          }`}
        >
          {run.status === 'running' ? <LiveDot /> : null}
          {runStatusText(run)}
        </span>
        {cancellable ? (
          confirmCancel ? (
            <span className="flex flex-wrap items-center gap-2">
              <button type="button" disabled={busy} onClick={() => act('discard')} className={`${dangerButton} font-semibold`}>
                Yes, stop it
              </button>
              <button type="button" onClick={() => setConfirmCancel(false)} className={secondaryButton}>
                Keep going
              </button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirmCancel(true)} className={`${secondaryButton} hover:text-danger`}>
              Cancel
            </button>
          )
        ) : null}
      </div>
      {confirmCancel && cancellable ? <p className="-mt-3 text-xs text-text-tertiary">Stops within a few seconds and refunds the credits.</p> : null}

      <div className="rounded-2xl border border-border-default bg-base/40 px-2 py-4 sm:px-4">
        <AgentStepTracker label="Progress" steps={steps.map((step) => ({ id: step, label: STEPS[step]?.[0] || step, state: states[step] }))} />
      </div>

      {waitNote ? <p className="text-xs text-warning-text">{waitNote}</p> : null}

      {isScheduled(run) ? (
        <div className="flex flex-col gap-3 rounded-xl border border-accent-blue/40 bg-accent-blue/5 px-4 py-3 sm:flex-row sm:items-center">
          <p className="min-w-0 flex-1 text-sm">
            Scheduled for <span className="font-semibold">{whenText(run.postAt)}</span>. The posts go out by themselves then.
          </p>
          <button type="button" disabled={busy} onClick={() => act('discard')} className={`${secondaryButton} self-start hover:text-danger`}>
            Cancel (credits refunded)
          </button>
        </div>
      ) : null}

      {run.status === 'failed' ? (
        <div className="flex flex-col gap-3 rounded-xl border border-error/40 bg-error/10 px-4 py-3 sm:flex-row sm:items-center">
          <p role="alert" className="min-w-0 flex-1 text-sm text-danger">
            {run.error}
          </p>
          <button type="button" disabled={busy} onClick={() => act('retry')} className={`${secondaryButton} self-start`}>
            Try again from here ({formatCredits(run.credits)} credits)
          </button>
        </div>
      ) : null}

      <Stage run={run} agent={agent} steps={steps} states={states} focus={focus} busy={busy} act={act} onApprove={() => onApprove(run)} />

      <section aria-labelledby={`steps-${run.id}`}>
        <h3 id={`steps-${run.id}`} className="px-1 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
          Step by step
        </h3>
        <ol className="mt-3" aria-label="Workflow">
          {steps.map((step) => (
            <StepRow
              key={`${step}-${states[step]}-${step === focus}`}
              step={step}
              state={states[step]}
              run={run}
              agent={agent}
              entry={run.log?.[step]}
              busy={busy}
              act={act}
              onApprove={() => onApprove(run)}
              shownAbove={step === focus}
            />
          ))}
        </ol>
      </section>
    </article>
  )
}

/** Before the first run: what the agent will do, as a flow of steps. */
export function HowItWorks({ agent }) {
  const steps = [...(agent?.steps || []), ...(agent?.review ? ['review'] : [])]
  return (
    <section aria-labelledby="how-it-works" className="glass-card relative overflow-hidden rounded-2xl p-5 sm:p-8">
      <div aria-hidden className="pointer-events-none absolute -top-28 left-1/2 h-56 w-2/3 -translate-x-1/2 rounded-full ai-gradient-soft opacity-15 blur-3xl" />
      <div className="relative">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-violet/40 bg-accent-violet/10 px-3 py-1 text-xs font-semibold text-violet-text">
          <Icon className="h-3.5 w-3.5">{Glyphs.sparkles}</Icon>
          {steps.length} step{steps.length === 1 ? '' : 's'}
        </span>
        <h2 id="how-it-works" className="mt-3 font-heading text-xl font-bold sm:text-2xl">
          How this agent works
        </h2>
        {agent?.description ? <p className="mt-2 max-w-2xl text-sm text-text-secondary">{agent.description}</p> : null}

        {steps.length > 1 ? (
          <div className="mt-6 rounded-2xl border border-border-default bg-base/40 px-2 py-4 sm:px-4">
            <AgentStepTracker label="The steps" steps={steps.map((step) => ({ id: step, label: STEPS[step]?.[0] || step, state: 'todo' }))} />
          </div>
        ) : null}

        <ol className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step} className="flex gap-3 rounded-xl border border-border-default bg-elevated/50 p-4 text-sm transition-colors duration-200 hover:border-accent-violet/40">
              <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full ai-gradient text-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{STEPS[step]?.[0] || step}</span>
                <span className="text-text-secondary">{STEPS[step]?.[1]}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-text-secondary">Start a run and watch each step light up here. Click any finished step to see what it made.</p>
      </div>
    </section>
  )
}
