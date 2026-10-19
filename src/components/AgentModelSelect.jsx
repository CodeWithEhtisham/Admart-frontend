import { useState } from 'react'
import ModelPicker from './ModelPicker.jsx'
import { formatCredits } from '../utils/credits'
import { creditUnitText } from '../utils/agentSchedule'

const TITLES = { text: 'AI model', image: 'Image model' }

/**
 * The agent's AI model dropdowns with credits per option; a pick is saved straight away. Nothing until the backend sends choices.
 * compact: small side-by-side pickers for the composer bar (their lists open upwards on large screens).
 */
export default function AgentModelSelect({ deployment, onSave, compact = false }) {
  const [saving, setSaving] = useState('')
  const [error, setError] = useState('')
  const choices = deployment?.modelChoices || {}
  const keys = Object.keys(TITLES).filter((key) => choices[key]?.length)
  if (!keys.length) return null
  const unit = creditUnitText(deployment.agent?.creditUnit)

  const pick = async (key, id) => {
    if (id === deployment.models?.[key]) return
    setSaving(key)
    setError('')
    try {
      await onSave({ ...(deployment.models || {}), [key]: id })
    } catch (err) {
      setError(err.response?.data?.message || 'Could not change the model.')
    } finally {
      setSaving('')
    }
  }

  const costs = (key) => Object.fromEntries(choices[key].map((m) => [m.id, { credits: m.creditsPerRun }]))
  const format = (credits) => `~${formatCredits(credits)} cr ${unit}`

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {keys.map((key) => (
          <div key={key} className="w-full min-w-0 sm:w-60">
            <ModelPicker
              compact
              dropUp
              label={TITLES[key]}
              models={choices[key]}
              value={deployment.models?.[key]}
              onChange={(id) => pick(key, id)}
              costsByModel={costs(key)}
              formatCost={format}
            />
          </div>
        ))}
        {saving ? (
          <span role="status" className="text-xs text-text-tertiary">
            Saving…
          </span>
        ) : null}
        {error ? (
          <p role="alert" className="w-full text-sm text-danger">
            {error}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div className={`grid gap-3 ${keys.length > 1 ? 'sm:grid-cols-2' : ''}`}>
      {keys.map((key) => (
        <div key={key} className="text-sm">
          <span className="flex items-center justify-between gap-2">
            <span className="font-medium text-text-primary">{TITLES[key]}</span>
            {saving === key ? <span role="status" className="text-xs text-text-tertiary">Saving…</span> : null}
          </span>
          <div className="mt-1">
            <ModelPicker
              label={TITLES[key]}
              models={choices[key]}
              value={deployment.models?.[key]}
              onChange={(id) => pick(key, id)}
              costsByModel={costs(key)}
              formatCost={format}
            />
          </div>
        </div>
      ))}
      {error ? (
        <p role="alert" className="text-sm text-danger sm:col-span-2">
          {error}
        </p>
      ) : null}
    </div>
  )
}
