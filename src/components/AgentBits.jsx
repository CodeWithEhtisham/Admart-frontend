import { Glyphs } from './glyphs'
import { Icon } from './icons'

const AGENT_GLYPHS = {
  'youtube-shorts': Glyphs.film,
  'script-writer': Glyphs.pencil,
  voiceover: Glyphs.volume,
  'video-editor': Glyphs.camera,
  'cross-poster': Glyphs.send,
  'trend-finder': Glyphs.trending,
  'growth-report': Glyphs.chart,
}

// Shared studio button looks (agent detail page and its panels). 44px tall for touch.
export const primaryButton =
  'inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl ai-gradient px-5 text-sm font-semibold text-white shadow-lg shadow-accent-violet/25 transition duration-200 hover:shadow-accent-violet/45 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:brightness-100'
export const secondaryButton =
  'inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-border-default bg-elevated/60 px-4 text-sm font-medium text-text-secondary transition-colors duration-200 hover:border-accent-violet/50 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50'
export const dangerButton =
  'inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-error/50 px-4 text-sm font-medium text-danger transition-colors duration-200 hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-50'

export function AgentIcon({ slug, kind, size = 'md' }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-xl text-white ${size === 'sm' ? 'h-10 w-10' : 'h-11 w-11'} ${
        kind === 'large' ? 'ai-gradient ai-glow' : 'bg-accent-violet'
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

/** The "agent is working" pulse. Decorative: pair it with words. */
export function LiveDot() {
  return <span aria-hidden className="ai-live-dot" />
}
