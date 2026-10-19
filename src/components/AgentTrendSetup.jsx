import { useEffect, useRef, useState } from 'react'
import AgentModelSelect from './AgentModelSelect.jsx'
import AgentComposer from './AgentComposer.jsx'
import { primaryButton, secondaryButton } from './AgentBits.jsx'
import { Glyphs } from './glyphs'
import { Icon } from './icons'
import { formatCredits } from '../utils/credits'
import {
  CUSTOM_MAX,
  DEFAULT_WINDOW,
  MAX_TOPICS,
  toggleTopic,
  topicCount,
  topicLocked,
  trendChoices,
} from '../utils/trends'

const DEBOUNCE_MS = 600
const field =
  'w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue'
const chip =
  'min-h-[44px] cursor-pointer rounded-full px-4 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue disabled:cursor-not-allowed disabled:opacity-50'

/** Trend Finder's composer: pick topics and a region (saved as you go) in the panel, choose how far back to look, then run. */
export default function AgentTrendSetup({ deployment, agent, busy, onSaveConfig, onSaveModels, onStart }) {
  const topics = agent.trendTopics || []
  const regions = agent.regions || []
  const windows = agent.trendWindows || []
  const max = agent.maxTrendTopics || MAX_TOPICS
  const initial = trendChoices(deployment.config)
  const [picked, setPicked] = useState(initial.topics)
  const [custom, setCustom] = useState(initial.custom)
  const [showCustom, setShowCustom] = useState(Boolean(initial.custom))
  const [region, setRegion] = useState(initial.region)
  const [range, setRange] = useState(DEFAULT_WINDOW)
  const [pending, setPending] = useState(false) // custom text typed but not saved yet
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [showSetup, setShowSetup] = useState(() => topicCount(initial.topics, initial.custom) === 0)
  const timer = useRef(null)
  const latest = useRef(onSaveConfig)
  useEffect(() => {
    latest.current = onSaveConfig
  })
  useEffect(() => () => clearTimeout(timer.current), [])

  const save = async (next) => {
    clearTimeout(timer.current)
    setPending(false)
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      await latest.current({ trendTopics: next.picked, customTopic: next.custom.trim(), region: next.region })
      setSaved(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your choices.')
    } finally {
      setSaving(false)
    }
  }

  const change = (next) => {
    const merged = { picked, custom, region, ...next }
    setPicked(merged.picked)
    setCustom(merged.custom)
    setRegion(merged.region)
    save(merged)
  }

  const typeCustom = (text) => {
    setCustom(text)
    setPending(true)
    setSaved(false)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => save({ picked, custom: text, region }), DEBOUNCE_MS)
  }

  const toggleCustom = () => {
    if (showCustom && custom) change({ custom: '' })
    setShowCustom(!showCustom)
  }

  const count = topicCount(picked, custom)
  const full = count >= max
  const hasTopic = count > 0
  const active = deployment.status === 'active'
  const canRun = hasTopic && !busy && !saving && !pending && active

  const topicNames = [...picked.map((id) => topics.find((t) => t.id === id)?.label || id), ...(custom.trim() ? [custom.trim()] : [])]
  const regionName = regions.find((r) => r.id === region)?.label
  const windowName = windows.find((w) => w.id === range)?.label

  return (
    <AgentComposer
      label="Find trends"
      onSubmit={(e) => {
        e.preventDefault()
        if (canRun) onStart({ window: range })
      }}
      panelOpen={showSetup}
      panelId="trend-setup-panel"
      onClosePanel={() => setShowSetup(false)}
      panel={
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-text-tertiary">
              Pick what you care about. It reads news, Reddit and YouTube and finds what&apos;s rising.
            </p>
            <button type="button" onClick={() => setShowSetup(false)} className={secondaryButton}>
              Done
            </button>
          </div>

          <div role="group" aria-labelledby="trend-topics-label">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span id="trend-topics-label" className="font-medium text-text-primary">
                Topics
              </span>
              <span className={`text-xs ${full ? 'text-warning-text' : 'text-text-tertiary'}`}>
                {count} of {max}
                {full ? ' · Up to 3 topics' : ''}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {topics.map((t) => {
                const on = picked.includes(t.id)
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={on}
                    disabled={topicLocked(picked, custom, t.id, max)}
                    onClick={() => change({ picked: toggleTopic(picked, custom, t.id, max) })}
                    className={`${chip} ${on ? 'ai-gradient text-white shadow-md shadow-accent-violet/25' : 'border border-border-default bg-elevated text-text-secondary hover:border-accent-violet/50 hover:text-text-primary'}`}
                  >
                    {t.label}
                  </button>
                )
              })}
              <button
                type="button"
                aria-pressed={showCustom}
                disabled={full && !showCustom}
                onClick={toggleCustom}
                className={`${chip} border border-dashed border-border-default ${showCustom ? 'bg-accent-violet/10 text-text-primary' : 'text-text-secondary hover:border-accent-violet/50 hover:text-text-primary'}`}
              >
                + Your own topic
              </button>
            </div>
            {showCustom ? (
              <label className="mt-2 block text-sm">
                <span className="text-text-tertiary">Your own topic</span>
                <input
                  value={custom}
                  maxLength={CUSTOM_MAX}
                  onChange={(e) => typeCustom(e.target.value)}
                  placeholder="e.g. home espresso"
                  className={`mt-1 ${field}`}
                />
              </label>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-text-primary">Region</span>
              <select value={region} onChange={(e) => change({ region: e.target.value })} className={`mt-1 min-h-[44px] ${field}`}>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>

            <div role="group" aria-label="Trends from" className="text-sm">
              <span className="font-medium text-text-primary">Trends from</span>
              <div className="mt-1 flex">
                <div className="inline-flex flex-wrap gap-1 rounded-xl border border-border-default bg-input p-1">
                  {windows.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      aria-pressed={range === w.id}
                      onClick={() => setRange(w.id)}
                      className={`min-h-[44px] cursor-pointer rounded-lg px-4 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-accent-blue ${
                        range === w.id ? 'ai-gradient text-white' : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      tools={<AgentModelSelect compact deployment={deployment} onSave={onSaveModels} />}
      actions={
        <>
          <span className="text-xs text-text-tertiary">
            {active
              ? `About ${formatCredits(agent.estimatedCredits)} credits. Refunded if it fails.`
              : 'This agent is paused. Resume it to run.'}
          </span>
          <button type="submit" disabled={!canRun} className={primaryButton}>
            {busy ? 'Starting…' : 'Find trends'}
            {busy ? null : <Icon className="h-4 w-4">{Glyphs.arrowRight}</Icon>}
          </button>
        </>
      }
    >
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-[1rem] font-semibold">Find trends</h2>
          {hasTopic ? (
            <ul className="mt-1.5 flex flex-wrap gap-1.5" aria-label="Your choices">
              {topicNames.map((name) => (
                <li key={name} className="rounded-full border border-accent-violet/40 bg-accent-violet/10 px-2.5 py-0.5 text-xs font-medium text-violet-text">
                  {name}
                </li>
              ))}
              {regionName ? <li className="rounded-full border border-border-default px-2.5 py-0.5 text-xs text-text-secondary">{regionName}</li> : null}
              {windowName ? <li className="rounded-full border border-border-default px-2.5 py-0.5 text-xs text-text-secondary">{windowName}</li> : null}
            </ul>
          ) : (
            <p className="mt-0.5 text-sm text-text-tertiary">Pick at least one topic to find trends.</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowSetup((v) => !v)}
          aria-expanded={showSetup}
          aria-controls="trend-setup-panel"
          className={secondaryButton}
        >
          <Icon className="h-4 w-4">{Glyphs.sliders}</Icon>
          {hasTopic ? 'Topics & region' : 'Pick topics'}
        </button>
      </div>
      <div className="mt-1 min-h-[1.25rem] text-xs">
        {saving || pending ? (
          <span role="status" className="text-text-tertiary">
            Saving…
          </span>
        ) : saved ? (
          <span role="status" className="text-success-text">
            Saved
          </span>
        ) : null}
        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </AgentComposer>
  )
}
