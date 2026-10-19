import { useState } from 'react'
import { formatCredits } from '../utils/credits'
import { primaryButton } from './AgentBits.jsx'
import {
  DEFAULT_DAYS,
  SCHEDULE_MODES,
  TEXT_MAX,
  buildSchedulePayload,
  parseTexts,
  parseTopics,
  scheduleInput,
  scheduleMode,
  scheduleSummary,
} from '../utils/agentSchedule'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAYS_OF_MONTH = Array.from({ length: 28 }, (_, i) => i + 1)
const field =
  'min-h-[44px] w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue'

function browserZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

function Segmented({ label, options, value, onChange, disabled }) {
  return (
    <div role="group" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-xl border border-border-default bg-input p-1">
      {options.map(([id, text]) => (
        <button
          key={id}
          type="button"
          aria-pressed={value === id}
          disabled={disabled}
          onClick={() => onChange(id)}
          className={`min-h-[44px] cursor-pointer rounded-lg px-4 text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
            value === id ? 'ai-gradient text-white' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  )
}

/** Run an agent once or on a schedule (manual, daily, weekly, monthly), with the input a scheduled run works on. Shown in the Schedule dialog. */
export default function AgentSchedule({ deployment, agent, onSave }) {
  const schedule = deployment.schedule || {}
  const input = scheduleInput(agent)
  const [enabled, setEnabled] = useState(Boolean(deployment.autopilot))
  const [mode, setMode] = useState(() => scheduleMode(schedule))
  const [days, setDays] = useState(schedule.days || DEFAULT_DAYS)
  const [dayOfMonth, setDayOfMonth] = useState(schedule.dayOfMonth || 1)
  const [at, setAt] = useState(schedule.time || '09:00')
  const [tz] = useState(schedule.tz || browserZone())
  const [niche, setNiche] = useState(deployment.config?.niche || '')
  const [queue, setQueue] = useState((deployment.topicQueue || []).join(input === 'texts' ? '\n\n' : '\n'))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const toggleDay = (d) => setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()))

  const save = async (nextEnabled = enabled) => {
    setBusy(true)
    setError('')
    setSaved(false)
    try {
      await onSave(
        buildSchedulePayload({
          enabled: nextEnabled,
          mode,
          time: at,
          days,
          dayOfMonth: Number(dayOfMonth),
          tz,
          input,
          niche,
          queue: input === 'texts' ? parseTexts(queue) : parseTopics(queue),
          config: deployment.config || {},
        }),
      )
      setEnabled(nextEnabled)
      setSaved(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the schedule.')
    } finally {
      setBusy(false)
    }
  }

  const summary = scheduleSummary({
    mode,
    days,
    credits: deployment.estimatedCredits != null ? formatCredits(deployment.estimatedCredits) : undefined,
    unit: agent?.creditUnit,
    limit: deployment.monthlyCreditLimit ? formatCredits(deployment.monthlyCreditLimit) : undefined,
  })
  const nextRun = deployment.autopilot && deployment.nextRunAt ? new Date(deployment.nextRunAt) : null
  const texts = input === 'texts' ? parseTexts(queue) : []
  const tooLong = input === 'texts' && queue.split(/\n\s*\n/).some((t) => t.trim().length > TEXT_MAX)

  return (
    <section aria-labelledby="schedule-title">
      <h2 id="schedule-title" className="pr-12 font-heading text-lg font-semibold">
        Schedule
      </h2>
      <p className="mt-1 pr-12 text-sm text-text-secondary">
        Run this agent once, or let it run on its own. Each result waits here for your approval.
      </p>

      <div className="mt-4 space-y-4">
        <Segmented
          label="How to run"
          options={[
            ['once', 'Run once'],
            ['schedule', 'On a schedule'],
          ]}
          value={enabled ? 'schedule' : 'once'}
          disabled={busy}
          onChange={(id) => id !== (enabled ? 'schedule' : 'once') && save(id === 'schedule')}
        />

        {enabled ? (
          <>
            <Segmented label="How often" options={SCHEDULE_MODES} value={mode} onChange={setMode} />

            {mode === 'manual' ? (
              <p className="text-sm text-text-secondary">Runs only when you press Run.</p>
            ) : (
              <div className="space-y-4">
                <label className="block text-sm sm:max-w-xs">
                  <span className="text-text-tertiary">At ({tz})</span>
                  <input type="time" value={at} onChange={(e) => setAt(e.target.value)} className={`mt-1 ${field}`} />
                </label>
                {mode === 'weekly' ? (
                  <fieldset>
                    <legend className="text-sm text-text-tertiary">On these days</legend>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {DAYS.map((label, d) => (
                        <button
                          key={label}
                          type="button"
                          aria-pressed={days.includes(d)}
                          onClick={() => toggleDay(d)}
                          className={`min-h-[44px] min-w-[44px] cursor-pointer rounded-lg px-3 text-sm font-medium transition-colors duration-200 ${
                            days.includes(d)
                              ? 'ai-gradient text-white'
                              : 'border border-border-default bg-elevated text-text-secondary hover:border-accent-violet/50 hover:text-text-primary'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                ) : null}
                {mode === 'monthly' ? (
                  <label className="block text-sm sm:max-w-xs">
                    <span className="text-text-tertiary">Day of the month</span>
                    <select value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} className={`mt-1 ${field}`}>
                      {DAYS_OF_MONTH.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </div>
            )}

            {input === 'none' ? (
              <p className="text-sm text-text-secondary">
                Each run takes the newest video in your Library that this agent hasn&apos;t worked on yet.
              </p>
            ) : null}
            {input === 'trends' ? (
              <p className="text-sm text-text-secondary">
                Uses the topics and region you picked for this agent. Daily finds today&apos;s trends, Weekly this week&apos;s, Monthly this month&apos;s.
              </p>
            ) : null}
            {input === 'topics' ? (
              <label className="block text-sm">
                <span className="text-text-tertiary">Channel niche (the agent picks topics from it)</span>
                <input value={niche} maxLength={300} onChange={(e) => setNiche(e.target.value)} className={`mt-1 ${field}`} />
              </label>
            ) : null}
            {input === 'topics' ? (
              <label className="block text-sm">
                <span className="text-text-tertiary">Your own topics (one per line, used first, in order)</span>
                <textarea
                  rows={4}
                  value={queue}
                  onChange={(e) => setQueue(e.target.value)}
                  placeholder={'e.g. Why espresso has crema\nThe history of instant coffee'}
                  className={`mt-1 ${field} resize-y`}
                />
              </label>
            ) : null}
            {input === 'texts' ? (
              <label className="block text-sm">
                <span className="text-text-tertiary">
                  Texts to read, one after another. Leave a blank line between texts (up to {TEXT_MAX.toLocaleString()} characters each).
                </span>
                <textarea
                  rows={6}
                  value={queue}
                  onChange={(e) => setQueue(e.target.value)}
                  aria-describedby="schedule-texts-count"
                  className={`mt-1 ${field} resize-y`}
                />
                <span id="schedule-texts-count" className={`mt-1 block text-xs ${tooLong ? 'text-danger' : 'text-text-tertiary'}`}>
                  {texts.length} text{texts.length === 1 ? '' : 's'}
                  {tooLong ? ` · a text is over ${TEXT_MAX.toLocaleString()} characters and will be cut` : ''}
                </span>
              </label>
            ) : null}

            {mode !== 'manual' ? <p className="text-xs text-text-tertiary">{summary}</p> : null}
          </>
        ) : null}

        {nextRun ? (
          <p className="text-sm text-success-text">
            Next run: {nextRun.toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
        ) : null}
        {deployment.autopilotNote ? <p className="text-sm text-warning-text">{deployment.autopilotNote}</p> : null}
        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}

        {enabled ? (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={busy || (mode === 'weekly' && !days.length)}
              onClick={() => save()}
              className={primaryButton}
            >
              {busy ? 'Saving…' : 'Save schedule'}
            </button>
            {saved ? (
              <span className="text-sm text-success-text" role="status">
                Saved
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
