import { useState } from 'react'
import { formatCredits } from '../utils/credits'
import { Glyphs } from './glyphs'
import { Icon } from './icons'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const PERIODS = [
  [7, 'Every week'],
  [15, 'Every 15 days'],
  [30, 'Every month'],
]
const GOALS = [
  ['', 'No goal'],
  ['views', 'YouTube views'],
  ['subscribers', 'New subscribers'],
  ['watch_hours', 'Watch hours'],
  ['posts', 'Posts published'],
]
const CHANNELS = [
  ['WhatsApp', Glyphs.message],
  ['Telegram', Glyphs.send],
  ['Slack', Glyphs.message],
]
const field =
  'w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue'

function browserZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

/** When the Growth Report runs, what it plans for, and where it's sent. */
export default function AgentReportSchedule({ deployment, agent, onSave }) {
  const config = deployment.config || {}
  const schedule = deployment.schedule || {}
  const [enabled, setEnabled] = useState(Boolean(deployment.autopilot))
  const [period, setPeriod] = useState(config.period || 7)
  const [day, setDay] = useState(schedule.days?.[0] ?? 0)
  const [at, setAt] = useState(schedule.time || '09:00')
  const [tz] = useState(schedule.tz || browserZone())
  const [perWeek, setPerWeek] = useState(config.posts_per_week || 3)
  const [goalMetric, setGoalMetric] = useState(config.goal?.metric || '')
  const [goalTarget, setGoalTarget] = useState(config.goal?.target || '')
  const [emails, setEmails] = useState((config.emails || []).join(', '))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const save = async (nextEnabled = enabled) => {
    setBusy(true)
    setError('')
    setSaved(false)
    const extra = emails.split(/[\s,;]+/).map((e) => e.trim()).filter(Boolean)
    if (extra.length > 5) {
      setError('Add up to 5 more email addresses.')
      setBusy(false)
      return
    }
    try {
      await onSave({
        autopilot: nextEnabled,
        schedule: { days: [Number(day)], time: at, tz },
        config: {
          ...config,
          period: Number(period),
          posts_per_week: Number(perWeek),
          goal: goalMetric && Number(goalTarget) > 0 ? { metric: goalMetric, target: Number(goalTarget) } : null,
          emails: extra,
        },
      })
      setEnabled(nextEnabled)
      setSaved(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the schedule.')
    } finally {
      setBusy(false)
    }
  }

  const nextRun = deployment.autopilot && deployment.nextRunAt ? new Date(deployment.nextRunAt) : null

  return (
    <section className="rounded-2xl border border-border-default bg-surface p-5">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-[1rem] font-semibold">Report schedule</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {enabled && nextRun
              ? `Next report: ${nextRun.toLocaleString(undefined, { weekday: 'long', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}`
              : 'Get a report on a schedule, with a plan for the next period.'}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={enabled} disabled={busy} onChange={(e) => save(e.target.checked)} />
          {enabled ? 'On' : 'Off'}
        </label>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <label className="block">
          <span className="text-text-tertiary">How often</span>
          <select value={period} onChange={(e) => setPeriod(Number(e.target.value))} className={`${field} mt-1`}>
            {PERIODS.map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-text-tertiary">{period === 7 ? 'On' : 'First on'}</span>
            <select value={day} onChange={(e) => setDay(Number(e.target.value))} className={`${field} mt-1`}>
              {DAYS.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-text-tertiary">At ({tz})</span>
            <input type="time" value={at} onChange={(e) => setAt(e.target.value)} className={`${field} mt-1`} />
          </label>
        </div>
        <label className="block">
          <span className="text-text-tertiary">Posts per week in the plan</span>
          <input type="number" min={1} max={14} value={perWeek} onChange={(e) => setPerWeek(e.target.value)} className={`${field} mt-1`} />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-text-tertiary">Goal per period</span>
            <select value={goalMetric} onChange={(e) => setGoalMetric(e.target.value)} className={`${field} mt-1`}>
              {GOALS.map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-text-tertiary">Target</span>
            <input
              type="number"
              min={1}
              value={goalTarget}
              disabled={!goalMetric}
              onChange={(e) => setGoalTarget(e.target.value)}
              placeholder="e.g. 5000"
              className={`${field} mt-1 disabled:opacity-50`}
            />
          </label>
        </div>
      </div>

      <div className="mt-4 text-sm">
        <p className="text-text-tertiary">Send it to</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/15 px-3 py-1 text-xs font-semibold text-success-text">
            ✓ Email
          </span>
          {CHANNELS.map(([name, glyph]) => (
            <span
              key={name}
              title={`${name} delivery is coming soon`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border-default px-3 py-1 text-xs text-text-tertiary"
            >
              <Icon className="h-3.5 w-3.5">{glyph}</Icon>
              {name} · Coming soon
            </span>
          ))}
        </div>
        <label className="mt-3 block">
          <span className="text-text-tertiary">Your email gets it. Also send to (up to 5, comma separated)</span>
          <input value={emails} onChange={(e) => setEmails(e.target.value)} placeholder="team@yourbrand.com" className={`${field} mt-1`} />
        </label>
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => save()}
          disabled={busy}
          className="rounded-xl gradient-bg px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? 'Saving…' : 'Save'}
        </button>
        <span className="text-xs text-text-tertiary">
          {saved ? 'Saved. ' : ''}About {formatCredits(agent.estimatedCredits)} credits per report.
        </span>
      </div>
    </section>
  )
}
