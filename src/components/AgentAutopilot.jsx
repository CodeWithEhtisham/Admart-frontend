import { useState } from 'react'
import { formatCredits } from '../utils/credits'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const PRESETS = {
  1: [2],
  3: [0, 2, 4],
  5: [0, 1, 2, 3, 4],
  7: [0, 1, 2, 3, 4, 5, 6],
}
const field =
  'w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue'

function browserZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

/** Schedule an agent: days, time, topic queue (or the agent picks from the niche). */
export default function AgentAutopilot({ deployment, agent, onSave }) {
  const schedule = deployment.schedule || {}
  const [enabled, setEnabled] = useState(Boolean(deployment.autopilot))
  const [days, setDays] = useState(schedule.days || [0, 2, 4])
  const [at, setAt] = useState(schedule.time || '09:00')
  const [tz] = useState(schedule.tz || browserZone())
  const [niche, setNiche] = useState(deployment.config?.niche || '')
  const [topics, setTopics] = useState((deployment.topicQueue || []).join('\n'))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const toggleDay = (d) => setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()))

  const save = async (nextEnabled = enabled) => {
    setBusy(true)
    setError('')
    setSaved(false)
    try {
      await onSave({
        autopilot: nextEnabled,
        schedule: { days, time: at, tz },
        topicQueue: topics.split('\n').map((t) => t.trim()).filter(Boolean),
        config: { ...(deployment.config || {}), niche: niche.trim() },
      })
      setEnabled(nextEnabled)
      setSaved(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save Autopilot.')
    } finally {
      setBusy(false)
    }
  }

  const perWeek = days.length
  const preset = PRESETS[perWeek]?.join() === days.join() ? String(perWeek) : 'custom'
  const nextRun = deployment.autopilot && deployment.nextRunAt ? new Date(deployment.nextRunAt) : null

  return (
    <section className="rounded-2xl border border-border-default bg-surface p-5" aria-labelledby="autopilot-title">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 id="autopilot-title" className="font-heading text-[1rem] font-semibold">
            Autopilot
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Makes new videos on a schedule. Each one waits here for your approval.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Autopilot"
          disabled={busy}
          onClick={() => save(!enabled)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${enabled ? 'bg-accent-blue' : 'bg-elevated'}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${enabled ? 'left-5' : 'left-0.5'}`} />
        </button>
      </div>

      <div className="mt-4 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-text-tertiary">How often</span>
            <select
              value={preset}
              onChange={(e) => PRESETS[e.target.value] && setDays(PRESETS[e.target.value])}
              className={`mt-1 ${field}`}
            >
              <option value="1">Once a week</option>
              <option value="3">3 times a week</option>
              <option value="5">Every weekday</option>
              <option value="7">Every day</option>
              {preset === 'custom' ? <option value="custom">Custom days</option> : null}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-text-tertiary">At ({tz})</span>
            <input type="time" value={at} onChange={(e) => setAt(e.target.value)} className={`mt-1 ${field}`} />
          </label>
        </div>

        <details className="rounded-xl border border-border-default bg-input px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium">More options</summary>
          <div className="mt-3 space-y-4">
            <fieldset>
              <legend className="text-sm text-text-tertiary">Pick exact days</legend>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {DAYS.map((label, d) => (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={days.includes(d)}
                    onClick={() => toggleDay(d)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                      days.includes(d)
                        ? 'bg-accent-blue text-white'
                        : 'border border-border-default bg-elevated text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="block text-sm">
              <span className="text-text-tertiary">Channel niche (the agent picks topics from it)</span>
              <input value={niche} maxLength={300} onChange={(e) => setNiche(e.target.value)} className={`mt-1 ${field}`} />
            </label>
            <label className="block text-sm">
              <span className="text-text-tertiary">Your own topics (one per line, used first, in order)</span>
              <textarea
                rows={4}
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                placeholder={'e.g. Why espresso has crema\nThe history of instant coffee'}
                className={`mt-1 ${field} resize-y`}
              />
            </label>
          </div>
        </details>

        <p className="text-xs text-text-tertiary">
          {perWeek} run{perWeek === 1 ? '' : 's'} a week · about {formatCredits(agent?.estimatedCredits)} credits each
          {deployment.monthlyCreditLimit ? ` · stops at the ${formatCredits(deployment.monthlyCreditLimit)} credit monthly limit` : ''}
        </p>
        {nextRun ? (
          <p className="text-sm text-success-text">Next run: {nextRun.toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
        ) : null}
        {deployment.autopilotNote ? <p className="text-sm text-warning">{deployment.autopilotNote}</p> : null}
        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy || !days.length}
            onClick={() => save()}
            className="rounded-xl gradient-bg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save schedule'}
          </button>
          {saved ? <span className="text-sm text-success-text" role="status">Saved</span> : null}
        </div>
      </div>
    </section>
  )
}
