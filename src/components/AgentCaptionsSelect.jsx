import { useState } from 'react'

const chip = (on) =>
  `inline-flex min-h-[36px] items-center rounded-lg px-3 text-sm font-medium transition duration-200 ${
    on ? 'bg-accent-blue text-white' : 'border border-border-default bg-elevated text-text-secondary hover:text-text-primary'
  }`

/**
 * Subtitles on or off for an agent that burns captions into its video (the Shorts Creator); a pick is saved
 * to the agent straight away, like the language. Nothing for other agents. onSave gets a config patch: { captions }.
 */
export default function AgentCaptionsSelect({ deployment, onSave }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  if (!deployment?.agent?.steps?.includes('captions')) return null
  const on = deployment.config?.captions !== false

  const pick = async (value) => {
    if (value === on) return
    setSaving(true)
    setError('')
    try {
      await onSave({ captions: value })
    } catch (err) {
      setError(err.response?.data?.message || 'Could not change the subtitles.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div role="group" aria-label="Subtitles" className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs text-text-tertiary">Subtitles</span>
      {[
        [true, 'On'],
        [false, 'Off'],
      ].map(([value, label]) => (
        <button key={label} type="button" aria-pressed={on === value} disabled={saving} onClick={() => pick(value)} className={chip(on === value)}>
          {label}
        </button>
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
