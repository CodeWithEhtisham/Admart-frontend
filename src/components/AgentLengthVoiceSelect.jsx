import { useState } from 'react'

const chip = (on) =>
  `inline-flex min-h-[36px] items-center rounded-lg px-3 text-sm font-medium transition duration-200 ${
    on ? 'bg-accent-blue text-white' : 'border border-border-default bg-elevated text-text-secondary hover:text-text-primary'
  }`

const isFemale = (voice) => /female/i.test(voice?.label || '')

/**
 * A Short's length and a female or male narrator, saved to the agent straight away like the language buttons.
 * The exact voice (and its samples) stays in Settings; picking the other gender takes that language's first one.
 * onSave gets a config patch: { length } or { voice }.
 */
export default function AgentLengthVoiceSelect({ deployment, onSave }) {
  const [saving, setSaving] = useState('')
  const [error, setError] = useState('')
  const agent = deployment?.agent || {}
  const config = deployment?.config || {}
  const lengths = agent.lengths || []
  const language = agent.languages?.some((l) => l.id === config.language) ? config.language : 'en'
  const voices = (agent.voices || []).filter((v) => (v.language || 'en') === language)
  if (!lengths.length && !voices.length) return null
  const length = lengths.includes(config.length) ? config.length : 45
  const voice = voices.find((v) => v.id === config.voice) || voices[0]
  const female = isFemale(voice)

  const save = async (key, patch) => {
    setSaving(key)
    setError('')
    try {
      await onSave(patch)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save that.')
    } finally {
      setSaving('')
    }
  }

  const pickGender = (wantFemale) => {
    if (wantFemale === female) return
    const next = voices.find((v) => isFemale(v) === wantFemale)
    if (next) save('voice', { voice: next.id })
  }

  return (
    <>
      {lengths.length ? (
        <div role="group" aria-label="Length" className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-text-tertiary">Length</span>
          {lengths.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={length === s}
              disabled={Boolean(saving)}
              onClick={() => length !== s && save('length', { length: s })}
              className={chip(length === s)}
            >
              {s} sec
            </button>
          ))}
        </div>
      ) : null}
      {voices.length ? (
        <div role="group" aria-label="Voice" className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-text-tertiary">Voice</span>
          {[
            [true, 'Female'],
            [false, 'Male'],
          ].map(([on, label]) => (
            <button
              key={label}
              type="button"
              aria-pressed={female === on}
              disabled={Boolean(saving)}
              onClick={() => pickGender(on)}
              className={chip(female === on)}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
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
    </>
  )
}
