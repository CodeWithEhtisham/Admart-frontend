import { useState } from 'react'

const chip = (on) =>
  `inline-flex min-h-[36px] items-center rounded-lg px-3 text-sm font-medium transition duration-200 ${
    on ? 'bg-accent-blue text-white' : 'border border-border-default bg-elevated text-text-secondary hover:text-text-primary'
  }`

/**
 * English or Urdu for an agent that speaks (the language of its script, voice and captions); a pick is saved
 * to the agent straight away, like the model pickers. Nothing for agents without a language choice.
 * onSave gets a config patch: { language }.
 */
export default function AgentLanguageSelect({ deployment, onSave }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const languages = deployment?.agent?.languages || []
  if (languages.length < 2) return null
  const current = languages.some((l) => l.id === deployment.config?.language) ? deployment.config.language : 'en'

  const pick = async (id) => {
    if (id === current) return
    setSaving(true)
    setError('')
    try {
      await onSave({ language: id })
    } catch (err) {
      setError(err.response?.data?.message || 'Could not change the language.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div role="group" aria-label="Language" className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs text-text-tertiary">Language</span>
      {languages.map((l) => (
        <button key={l.id} type="button" aria-pressed={current === l.id} disabled={saving} onClick={() => pick(l.id)} className={chip(current === l.id)}>
          {l.id === 'ur' ? 'اردو Urdu' : l.label}
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
