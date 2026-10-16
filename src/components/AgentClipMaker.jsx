import { useState } from 'react'
import { runStatusText, runTitle } from '../utils/agents'
import { formatCredits } from '../utils/credits'
import { CLIP_STAGES, clipScreen, clock, etaText, isSlow, optionName, rateText, stageStates } from '../utils/clips'
import AgentClipSource from './AgentClipSource.jsx'
import { ClipPicker, ClipResults } from './AgentClipReview.jsx'

const STUCK_MS = 60 * 1000
const STAGE_TEXT = {
  get_video: 'Get the video',
  transcribe_long: 'Transcribe it word by word',
  find_clips: 'Find and score the best moments',
  review_clips: 'You pick and trim the clips',
  render_clips: 'Make the vertical clips',
  finish_clips: 'Save them to your Library',
}
const STAGE_ESTIMATE = { transcribe_long: '~1 min', find_clips: '~20 s', review_clips: 'needs you', render_clips: '~20 s per clip' }
const WORKING_TEXT = {
  get_video: 'Getting the video',
  transcribe_long: 'Transcribing the video',
  find_clips: 'Finding the best moments',
  review_clips: 'Getting the moments ready',
  render_clips: 'Making the clips',
  finish_clips: 'Saving to your Library',
}

const took = (entry) => {
  if (!entry?.startedAt || !entry?.finishedAt) return ''
  const s = (new Date(entry.finishedAt) - new Date(entry.startedAt)) / 1000
  return s < 60 ? `${Math.max(1, Math.round(s))}s` : `${Math.round(s / 60)} min`
}

function Stepper({ run }) {
  const states = stageStates(run)
  return (
    <ol aria-label="Steps" className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
      {CLIP_STAGES.map(([id, label], i) => {
        const state = states[i]
        return (
          <li key={id} aria-current={state === 'current' ? 'step' : undefined} className="flex items-center gap-1.5">
            {i ? <span aria-hidden className="mr-1.5 text-text-tertiary">·</span> : null}
            <span
              aria-hidden
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                state === 'done'
                  ? 'bg-success text-white'
                  : state === 'current'
                    ? 'bg-accent-blue text-white'
                    : state === 'failed'
                      ? 'bg-error text-white'
                      : 'border border-border-default text-text-tertiary'
              }`}
            >
              {state === 'done' ? '✓' : state === 'failed' ? '!' : i + 1}
            </span>
            <span
              className={
                state === 'done'
                  ? 'font-medium text-success-text'
                  : state === 'current'
                    ? 'font-bold text-link'
                    : state === 'failed'
                      ? 'font-medium text-danger'
                      : 'text-text-tertiary'
              }
            >
              {label}
              <span className="sr-only">{{ done: ' (done)', current: ' (now)', failed: ' (failed)', stopped: ' (stopped)' }[state] || ''}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function Progress({ run, agent, config, now, busy, act, onNew }) {
  const states = stageStates(run)
  const at = Math.max(0, states.findIndex((s) => s !== 'done'))
  const [step] = CLIP_STAGES[at]
  const download = run.status === 'running' && step === 'get_video' ? run.download : null
  const stuck = run.status === 'queued' && now - new Date(run.updatedAt || run.createdAt).getTime() > STUCK_MS
  const seconds = run.sourceSeconds || run.input?.seconds
  const chosen = (run.moments || []).filter((m) => m.keep !== false).length
  const review = (config?.checkpoints || 'all') === 'all'
  const settings = [
    ['Clip length', optionName(agent?.clipLengths, config?.clipLength || 'medium')],
    ['Clips', `up to ${config?.clipCount || 5}`],
    ['Captions', optionName(agent?.captionStyles, config?.captionStyle || 'classic')],
    ['Framing', optionName(agent?.layouts, config?.layout || 'auto')],
    ['Pace', config?.tighten ? 'Tightened' : 'As spoken'],
  ]

  return (
    <div className="grid divide-y divide-border-default lg:grid-cols-[minmax(0,1fr)_280px] lg:divide-x lg:divide-y-0">
      <div className="min-w-0 space-y-5 p-4 sm:p-5">
        <div>
          <h2 className="font-heading text-lg font-bold">{runTitle(run)}</h2>
          <p className="mt-0.5 text-xs text-text-tertiary">
            Started {new Date(run.createdAt).toLocaleString()}
            {seconds ? ` · ${clock(seconds)} long` : ''} · {formatCredits(run.credits)} credits
            {['queued', 'running', 'needs_review'].includes(run.status) ? ' reserved' : ''}
          </p>
        </div>

        {run.status === 'failed' ? (
          <div className="flex flex-col gap-3 rounded-xl border border-error/40 bg-error/10 px-4 py-3 sm:flex-row sm:items-center">
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
        ) : run.status === 'discarded' ? (
          <div className="flex flex-col gap-3 rounded-xl border border-border-default bg-input px-4 py-3 sm:flex-row sm:items-center">
            <p className="min-w-0 flex-1 text-sm text-text-secondary">This run was stopped and its credits were refunded.</p>
            <button type="button" onClick={onNew} className="self-start rounded-xl gradient-bg px-4 py-2 text-sm font-semibold text-white">
              Make new clips
            </button>
          </div>
        ) : (
          <section aria-live="polite" className="rounded-xl border border-accent-blue/40 bg-accent-blue/5 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-medium">
                {run.status === 'queued'
                  ? 'Waiting to start'
                  : download
                    ? `Downloading the ${download.part || 'video'}`
                    : WORKING_TEXT[step]}
                …
              </p>
              {download ? <p className="font-heading text-2xl font-bold tabular-nums">{download.percent}%</p> : null}
              {!download && step === 'render_clips' && chosen ? (
                <p className="text-sm tabular-nums text-text-secondary">
                  {(run.clips || []).length} of {chosen} made
                </p>
              ) : null}
            </div>
            {download ? (
              <div role="progressbar" aria-label="Download" aria-valuenow={download.percent} aria-valuemin={0} aria-valuemax={100} className="mt-3 h-2 overflow-hidden rounded-full bg-elevated">
                <div className="h-full rounded-full gradient-bg transition-all" style={{ width: `${download.percent}%` }} />
              </div>
            ) : (
              <div aria-hidden className="mt-3 h-2 overflow-hidden rounded-full bg-elevated">
                <div className="h-full w-1/3 animate-pulse rounded-full bg-accent-blue/60 motion-reduce:animate-none" />
              </div>
            )}
            {download ? (
              <p className="mt-2 flex flex-wrap gap-x-4 text-xs text-text-tertiary">
                {download.speed ? <span>{rateText(download.speed)}</span> : null}
                {download.eta != null ? <span>{etaText(download.eta)}</span> : null}
              </p>
            ) : null}
          </section>
        )}

        {stuck ? <p className="text-xs text-warning">Still waiting to start. The agents worker may not be running. Your credits are refunded if it fails.</p> : null}
        {isSlow(download) ? (
          <p className="text-xs text-text-tertiary">
            This is slow because the connection is slow. Next time, uploading the file from your computer may be faster.
          </p>
        ) : null}
        {['queued', 'running'].includes(run.status) ? (
          <p className="text-xs text-text-tertiary">You can leave this page. It keeps going, and the bell tells you when it needs you.</p>
        ) : null}

        <ol className="space-y-1" aria-label="What it does">
          {CLIP_STAGES.map(([id], i) => {
            const state = states[i]
            const note =
              state === 'done'
                ? took(run.log?.[id]) || 'done'
                : id === 'review_clips' && !review
                  ? 'skipped'
                  : state === 'current' && run.status === 'running'
                    ? 'now'
                    : STAGE_ESTIMATE[id] || ''
            return (
              <li key={id} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${state === 'current' ? 'bg-elevated' : ''}`}>
                <span
                  aria-hidden
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    state === 'done' ? 'bg-success text-white' : state === 'failed' ? 'bg-error text-white' : state === 'current' ? 'border-2 border-accent-blue text-link' : 'border border-border-default text-text-tertiary'
                  }`}
                >
                  {state === 'done' ? '✓' : state === 'failed' ? '!' : i + 1}
                </span>
                <span className={`min-w-0 flex-1 ${state === 'todo' ? 'text-text-tertiary' : ''}`}>{STAGE_TEXT[id]}</span>
                <span className="text-xs text-text-tertiary">{note}</span>
              </li>
            )
          })}
        </ol>
      </div>

      <aside className="p-4 sm:p-5">
        <h3 className="font-heading text-[1rem] font-semibold">Clip settings</h3>
        <dl className="mt-3 space-y-2 text-sm">
          {settings.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="text-text-tertiary">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </div>
  )
}

/** The Clip Maker page body: start screen, or the chosen run (working, pick the clips, finished). */
export default function AgentClipMaker({ deployment, runs, run, busy, now, projectId, onSelect, onNew, onStart, onAction, onSaveConfig }) {
  const agent = deployment.agent
  const [confirmCancel, setConfirmCancel] = useState(false)
  const screen = clipScreen(run)
  const act = (action, payload) => onAction(run, action, payload)
  const cancellable = run && ['queued', 'running'].includes(run.status)

  return (
    <div className="space-y-4">
      {runs.length ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <label htmlFor="clip-run" className="text-sm text-text-tertiary">
            Run
          </label>
          <select
            id="clip-run"
            value={run?.id || 'new'}
            onChange={(e) => (e.target.value === 'new' ? onNew() : onSelect(e.target.value))}
            className="max-w-xs rounded-xl border border-border-default bg-surface px-3 py-2 text-sm font-medium focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
          >
            {!run ? <option value="new">New clips</option> : null}
            {runs.map((r) => (
              <option key={r.id} value={r.id}>
                {runTitle(r)} · {runStatusText(r)}
              </option>
            ))}
          </select>
          {run ? (
            <button type="button" onClick={onNew} className="rounded-xl border border-border-default bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary">
              + New clips
            </button>
          ) : null}
        </div>
      ) : null}

      {screen === 'start' ? (
        <AgentClipSource
          agent={agent}
          config={deployment.config}
          projectId={projectId}
          runs={runs}
          busy={busy}
          paused={deployment.status !== 'active'}
          onStart={onStart}
          onSaveConfig={onSaveConfig}
          onSelectRun={onSelect}
        />
      ) : (
        <article className="rounded-2xl border border-border-default bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default p-4">
            <Stepper run={run} />
            {cancellable ? (
              confirmCancel ? (
                <span className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-text-tertiary">Stops within a few seconds and refunds the credits.</span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => act('discard')}
                    className="rounded-lg border border-error/50 px-3 py-1 font-semibold text-danger hover:bg-error/10 disabled:opacity-50"
                  >
                    Yes, stop it
                  </button>
                  <button type="button" onClick={() => setConfirmCancel(false)} className="text-text-secondary hover:text-text-primary">
                    Keep going
                  </button>
                </span>
              ) : (
                <button type="button" onClick={() => setConfirmCancel(true)} className="text-sm font-medium text-text-secondary hover:text-danger">
                  Cancel run
                </button>
              )
            ) : (
              <span className="rounded-full border border-border-default px-2.5 py-0.5 text-xs font-semibold text-text-secondary">{runStatusText(run)}</span>
            )}
          </div>
          {screen === 'pick' ? (
            <ClipPicker run={run} agent={agent} config={deployment.config} busy={busy} onContinue={(p) => act('continue', p)} onDiscard={() => act('discard')} />
          ) : screen === 'done' ? (
            <ClipResults run={run} onNew={onNew} />
          ) : (
            <Progress run={run} agent={agent} config={deployment.config} now={now} busy={busy} act={act} onNew={onNew} />
          )}
        </article>
      )}
    </div>
  )
}
