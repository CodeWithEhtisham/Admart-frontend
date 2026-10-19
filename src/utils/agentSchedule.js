// Agent schedule helpers (no imports, so they can be tested on their own).

export const SCHEDULE_MODES = [
  ['manual', 'Manual'],
  ['daily', 'Daily'],
  ['weekly', 'Weekly'],
  ['monthly', 'Monthly'],
]
export const TEXT_MAX = 3000
export const DEFAULT_DAYS = [0, 2, 4]

/** A schedule saved before modes existed (days only, or nothing) counts as weekly. */
export function scheduleMode(schedule) {
  const mode = schedule?.mode
  return SCHEDULE_MODES.some(([id]) => id === mode) ? mode : 'weekly'
}

/** How many runs a month a schedule makes (weeks are averaged to 52/12). */
export function runsPerMonth(mode, days = DEFAULT_DAYS) {
  if (mode === 'daily') return 30
  if (mode === 'weekly') return Math.round((days.length * 52) / 12)
  if (mode === 'monthly') return 1
  return 0
}

/** "per run", "per minute" or "per hour" for an agent's credit unit. */
export function creditUnitText(unit) {
  return unit === 'minute' ? 'per minute' : unit === 'hour' ? 'per hour' : 'per run'
}

/** What an estimate covers: "each" for a run, otherwise "per minute of video". */
function creditsEach(unit) {
  return unit === 'minute' ? 'per minute of video' : unit === 'hour' ? 'per hour of video' : 'each'
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

/** "3 runs a week · about 12.5 credits each · stops at the 100 credit monthly limit" */
export function scheduleSummary({ mode, days = DEFAULT_DAYS, credits, unit, limit }) {
  if (mode === 'manual') return 'Runs only when you press Run.'
  const per = mode === 'daily' ? 'a day' : mode === 'monthly' ? 'a month' : 'a week'
  const count = mode === 'weekly' ? days.length : 1
  const parts = [`${plural(count, 'run')} ${per}`]
  if (credits != null && credits !== '') parts.push(`about ${credits} credits ${creditsEach(unit)}`)
  if (limit) parts.push(`stops at the ${limit} credit monthly limit`)
  return parts.join(' · ')
}

/** One topic per line. */
export const parseTopics = (text) => text.split('\n').map((t) => t.trim()).filter(Boolean)

/** One text per blank-line-separated block, each cut to TEXT_MAX characters. */
export const parseTexts = (text) =>
  text.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean).map((t) => t.slice(0, TEXT_MAX))

/** Which input a scheduled agent works on: 'topics', 'trends' (set up on the run form), 'texts' or 'none'. */
export function scheduleInput(agent) {
  if (agent?.inputKind === 'text') return 'texts'
  if (agent?.inputKind === 'video') return 'none'
  return agent?.steps?.includes('trends') ? 'trends' : 'topics'
}

/** The PATCH body for the schedule box. Fields that do not apply to the chosen mode or agent are left out. */
export function buildSchedulePayload({ enabled, mode, time, days, dayOfMonth, tz, input, niche = '', queue = [], config = {} }) {
  const schedule = { mode, time, tz }
  if (mode === 'weekly') schedule.days = days
  if (mode === 'monthly') schedule.dayOfMonth = dayOfMonth
  const payload = { autopilot: enabled, schedule }
  if (input === 'topics' || input === 'texts') payload.topicQueue = queue
  payload.config = input === 'topics' ? { ...config, niche: niche.trim() } : { ...config }
  return payload
}

