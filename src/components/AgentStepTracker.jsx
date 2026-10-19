import { useEffect, useRef } from 'react'
import { Glyphs } from './glyphs'
import { Icon } from './icons'

// state: done | working | waiting | queued | failed | stopped | todo
const ACTIVE = ['working', 'waiting', 'queued']
const NODE = {
  done: 'ai-gradient text-white',
  working: 'border-2 border-accent-violet bg-panel ai-node-working',
  waiting: 'ai-gradient ai-glow text-white',
  queued: 'border-2 border-dashed border-accent-violet/60 bg-panel text-text-secondary',
  failed: 'bg-error text-white',
  stopped: 'border border-border-default bg-elevated text-text-tertiary',
  todo: 'border border-border-default bg-panel text-text-tertiary',
}
const LABEL = {
  done: 'text-text-primary',
  working: 'font-semibold text-text-primary',
  waiting: 'font-semibold text-text-primary',
  failed: 'font-semibold text-danger',
}
const NOTE = {
  working: ['Working…', 'text-violet-text'],
  waiting: ['Needs you', 'font-semibold text-link'],
  queued: ['Up next', 'text-text-tertiary'],
  failed: ['Failed here', 'text-danger'],
  stopped: ['Stopped', 'text-text-tertiary'],
}
const SR = {
  done: ' (done)',
  working: ' (working now)',
  waiting: ' (waiting for you)',
  queued: ' (up next)',
  failed: ' (failed)',
  stopped: ' (stopped)',
}

function NodeMark({ state, index }) {
  if (state === 'done') return <Icon className="h-4 w-4">{Glyphs.check}</Icon>
  if (state === 'failed') return '!'
  if (state === 'working') return <span className="ai-live-dot" />
  if (state === 'waiting') return <Icon className="h-4 w-4">{Glyphs.user}</Icon>
  if (state === 'queued') return <Icon className="h-4 w-4">{Glyphs.clock}</Icon>
  if (state === 'stopped') return <Icon className="h-4 w-4">{Glyphs.x}</Icon>
  return index + 1
}

/**
 * Horizontal step tracker: Script → Pictures → Voice → Video.
 * @param {{ steps: { id: string, label: string, state: string, note?: string }[], label?: string }} props
 * The list scrolls sideways on its own when it doesn't fit, so the page never does.
 */
export default function AgentStepTracker({ steps, label = 'Steps' }) {
  const listRef = useRef(null)
  const at = steps.findIndex((s) => ACTIVE.includes(s.state) || s.state === 'failed')

  // Keep the current step in view on narrow screens.
  useEffect(() => {
    const list = listRef.current
    const node = at >= 0 ? list?.children[at] : null
    if (!node || list.scrollWidth <= list.clientWidth) return
    list.scrollLeft = node.offsetLeft - (list.clientWidth - node.clientWidth) / 2
  }, [at])

  return (
    <ol ref={listRef} aria-label={label} className="relative flex overflow-x-auto pb-1 [scrollbar-width:thin]">
      {steps.map((s, i) => {
        const [note, noteTone] = NOTE[s.state] || []
        return (
          <li
            key={s.id}
            aria-current={ACTIVE.includes(s.state) ? 'step' : undefined}
            className="relative flex min-w-[78px] flex-1 flex-col items-center px-1 text-center"
          >
            {i ? (
              <span
                aria-hidden
                className={`absolute left-[calc(-50%+24px)] right-[calc(50%+24px)] top-[17px] h-0.5 rounded-full ${
                  steps[i - 1].state === 'done' ? 'ai-gradient-soft' : 'bg-border-default'
                }`}
              />
            ) : null}
            <span
              aria-hidden
              className={`relative flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-colors duration-200 ${NODE[s.state] || NODE.todo}`}
            >
              <NodeMark state={s.state} index={i} />
            </span>
            <span className={`mt-2 text-xs leading-tight ${LABEL[s.state] || 'text-text-tertiary'}`}>
              {s.label}
              <span className="sr-only">{SR[s.state] || ''}</span>
            </span>
            {s.note || note ? (
              <span aria-hidden className={`mt-0.5 text-xs leading-tight tabular-nums ${noteTone || 'text-text-tertiary'}`}>
                {s.note || note}
              </span>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
