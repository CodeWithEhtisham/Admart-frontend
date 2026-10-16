// Clip Maker page helpers (no imports, so they can be tested on their own).

/** The six stages shown across the top of a Clip Maker run: [step id, label]. */
export const CLIP_STAGES = [
  ['get_video', 'Get video'],
  ['transcribe_long', 'Transcribe'],
  ['find_clips', 'Find moments'],
  ['review_clips', 'Pick clips'],
  ['render_clips', 'Make clips'],
  ['finish_clips', 'Save'],
]

/** Which screen a run needs: start (no run), working, pick (check-in) or done. */
export function clipScreen(run) {
  if (!run) return 'start'
  if (run.status === 'needs_review' && run.moments?.length) return 'pick'
  if (['succeeded', 'approved'].includes(run.status) && run.clips?.length) return 'done'
  return 'working'
}

/** One state per stage: done, current, failed, stopped or todo. */
export function stageStates(run) {
  if (['succeeded', 'approved'].includes(run.status)) return CLIP_STAGES.map(() => 'done')
  const step = run.step === 'clips' ? 'review_clips' : run.step
  const at = Math.max(0, CLIP_STAGES.findIndex(([id]) => id === step))
  const here = { failed: 'failed', discarded: 'stopped' }[run.status] || 'current'
  return CLIP_STAGES.map((_, i) => (i < at ? 'done' : i === at ? here : 'todo'))
}

/** 765 → "12:45"; with `tenths`, 765.4 → "12:45.4". */
export function clock(t, tenths = false) {
  const whole = Math.max(0, tenths ? Math.floor(t) : Math.round(t))
  const h = Math.floor(whole / 3600)
  const mm = String(Math.floor(whole / 60) % 60).padStart(h ? 2 : 1, '0')
  const ss = String(whole % 60).padStart(2, '0')
  const tail = tenths ? `.${Math.floor(Math.round((t - whole) * 10) % 10)}` : ''
  return `${h ? `${h}:` : ''}${mm}:${ss}${tail}`
}

/** "12:45.5" / "1:02:03" / "45" → seconds, or null when it is not a time. */
export function parseClock(text) {
  const parts = String(text).trim().split(':')
  if (!parts[0] || parts.length > 3 || parts.some((p) => !/^\d+(\.\d+)?$/.test(p))) return null
  const nums = parts.map(Number)
  if (nums.slice(1).some((n) => n >= 60)) return null
  return nums.reduce((total, n) => total * 60 + n, 0)
}

export function rateText(speed) {
  return speed >= 1024 * 1024 ? `${(speed / 1024 / 1024).toFixed(1)} MB/s` : `${Math.round(speed / 1024)} KB/s`
}

export function etaText(eta) {
  if (eta == null) return ''
  return eta < 90 ? `about ${Math.max(1, Math.round(eta))}s left` : `about ${Math.round(eta / 60)} min left`
}

/** Under 256 KB/s a long video takes a while: worth suggesting an upload instead. */
export const isSlow = (download) => Boolean(download?.speed) && download.speed < 256 * 1024

/** Credits for a video of `seconds` (priced per hour, one minute at least), or null when the length is unknown. */
export function clipCredits(agent, seconds) {
  if (!seconds) return null
  return (Number(agent.estimatedCredits) * Math.max(seconds, 60)) / 3600
}

// Catalog labels look like "30–60 s · most popular" or "Follow the speaker (face tracking, …)".
const splitLabel = (label = '') => {
  const [name, hint = ''] = label.includes(' · ') ? label.split(' · ') : label.split(' (')
  return [name, hint.replace(/\)$/, '')]
}
export const optionName = (list, id) => splitLabel(list?.find((o) => o.id === id)?.label)[0]
export const optionHint = (list, id) => splitLabel(list?.find((o) => o.id === id)?.label)[1]
