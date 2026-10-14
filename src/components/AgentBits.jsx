import { Glyphs } from './glyphs'
import { Icon } from './icons'

const AGENT_GLYPHS = {
  'youtube-shorts': Glyphs.film,
  'script-writer': Glyphs.pencil,
  voiceover: Glyphs.volume,
  'video-editor': Glyphs.camera,
  'cross-poster': Glyphs.send,
}

export function AgentIcon({ slug, kind }) {
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ${
        kind === 'large' ? 'gradient-bg' : 'bg-accent-violet'
      }`}
      aria-hidden
    >
      <Icon className="h-5 w-5">{AGENT_GLYPHS[slug] || Glyphs.sparkles}</Icon>
    </span>
  )
}

export function KindBadge({ kind }) {
  return (
    <span className="rounded-full border border-border-default bg-elevated px-2 py-0.5 text-xs font-semibold text-text-secondary">
      {kind === 'large' ? 'Full automation' : 'Single task'}
    </span>
  )
}

const RUN_STATUS = {
  queued: ['Queued', 'border-border-default bg-elevated text-text-secondary'],
  running: ['Working', 'border-accent-blue/40 bg-accent-blue/15 text-link'],
  needs_review: ['Ready for review', 'border-warning/50 bg-warning/15 text-text-primary'],
  approved: ['Approved', 'border-success/40 bg-success/15 text-success-text'],
  succeeded: ['Done', 'border-success/40 bg-success/15 text-success-text'],
  failed: ['Failed', 'border-error/40 bg-error/10 text-danger'],
  discarded: ['Discarded', 'border-border-default bg-elevated text-text-tertiary'],
  active: ['Active', 'border-success/40 bg-success/15 text-success-text'],
  paused: ['Paused', 'border-border-default bg-elevated text-text-tertiary'],
}

export function StatusBadge({ status }) {
  const [label, cls] = RUN_STATUS[status] || [status, RUN_STATUS.queued[1]]
  return <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>
}
