import { useEffect, useRef, useState } from 'react'
import { formatCredits } from '../utils/credits'

const STYLE_LOOKS = {
  cinematic: ['Film-like, dramatic light', 'from-amber-500 via-orange-700 to-slate-900'],
  photoreal: ['Real photos, natural light', 'from-sky-300 via-emerald-500 to-stone-700'],
  illustration: ['Flat, bold and bright', 'from-yellow-300 via-pink-400 to-indigo-500'],
  anime: ['Anime line art', 'from-pink-300 via-fuchsia-500 to-cyan-400'],
  minimal: ['Simple, soft pastels', 'from-rose-100 via-violet-200 to-sky-200'],
}

const chip = (on) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    on ? 'bg-accent-blue text-white' : 'border border-border-default bg-elevated text-text-secondary hover:text-text-primary'
  }`

function Group({ label, children }) {
  return (
    <fieldset>
      <legend className="text-sm text-text-tertiary">{label}</legend>
      <div className="mt-1.5">{children}</div>
    </fieldset>
  )
}

/** Voice, pace, tone, length and visual style for an agent. `value` is the agent config; `onChange` gets a patch. */
export default function AgentStylePicker({ agent, value, onChange }) {
  const audio = useRef(null)
  const [playing, setPlaying] = useState('')
  useEffect(() => () => audio.current?.pause(), [])

  const play = (id) => {
    audio.current?.pause()
    if (playing === id) return setPlaying('')
    audio.current = new Audio(`/agent-voices/${id}.mp3`)
    audio.current.onended = () => setPlaying('')
    audio.current.play().catch(() => setPlaying(''))
    setPlaying(id)
  }

  const voice = value.voice || agent.voices?.[0]?.id
  return (
    <div className="space-y-4">
      {agent.voices?.length ? (
        <Group label="Voice">
          <div className="grid gap-2 sm:grid-cols-2">
            {agent.voices.map((v) => {
              const [name, kind] = v.label.split(': ')
              return (
                <div
                  key={v.id}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent-blue ${
                    voice === v.id ? 'border-accent-blue bg-accent-blue/10' : 'border-border-default bg-input'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => play(v.id)}
                    aria-label={`${playing === v.id ? 'Stop' : 'Play'} ${name} sample`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-elevated text-text-primary hover:bg-accent-blue hover:text-white"
                  >
                    {playing === v.id ? '■' : '▶'}
                  </button>
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-sm">
                    <input type="radio" name="agent-voice" className="sr-only" checked={voice === v.id} onChange={() => onChange({ voice: v.id })} />
                    <span className="min-w-0">
                      <span className="block font-medium">{name}</span>
                      <span className="block truncate text-xs text-text-tertiary">{kind}</span>
                    </span>
                  </label>
                </div>
              )
            })}
          </div>
        </Group>
      ) : null}

      {agent.paces?.length ? (
        <Group label="Speaking pace">
          <div className="flex flex-wrap gap-1.5">
            {agent.paces.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={(value.pace || 'normal') === p.id}
                onClick={() => onChange({ pace: p.id })}
                className={chip((value.pace || 'normal') === p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </Group>
      ) : null}

      {agent.tones?.length ? (
        <Group label="Tone">
          <div className="flex flex-wrap gap-1.5">
            <button type="button" aria-pressed={!value.tone} onClick={() => onChange({ tone: '' })} className={chip(!value.tone)}>
              From my Brand Kit
            </button>
            {agent.tones.map((t) => (
              <button key={t.id} type="button" aria-pressed={value.tone === t.id} onClick={() => onChange({ tone: t.id })} className={chip(value.tone === t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </Group>
      ) : null}

      {agent.lengths?.length ? (
        <Group label="Video length">
          <div className="flex flex-wrap gap-1.5">
            {agent.lengths.map((s) => (
              <button key={s} type="button" aria-pressed={(value.length || 45) === s} onClick={() => onChange({ length: s })} className={chip((value.length || 45) === s)}>
                {s} seconds
              </button>
            ))}
          </div>
        </Group>
      ) : null}

      {agent.formats?.length ? (
        <Group label="Format">
          <div className="grid gap-2 sm:grid-cols-2">
            {agent.formats.map((f) => {
              const on = (value.format || '9:16') === f.id
              const [name, use] = f.label.split(' · ')
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange({ format: f.id })}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-left ${on ? 'border-accent-blue bg-accent-blue/10' : 'border-border-default bg-input'}`}
                >
                  <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center">
                    <span
                      className="block rounded-sm border-2 border-current text-text-secondary"
                      style={{ width: { '9:16': 18, '1:1': 26, '4:5': 22, original: 32 }[f.id], height: { '9:16': 32, '1:1': 26, '4:5': 28, original: 20 }[f.id] }}
                    />
                  </span>
                  <span className="min-w-0 text-sm">
                    <span className="block font-medium">{name}</span>
                    {use ? <span className="block text-xs text-text-tertiary">{use}</span> : null}
                  </span>
                </button>
              )
            })}
          </div>
        </Group>
      ) : null}

      {agent.cutStyles?.length ? (
        <Group label="Cut style">
          <div className="flex flex-wrap gap-1.5">
            {agent.cutStyles.map((c) => {
              const [name, hint] = c.label.split(' · ')
              const on = (value.cut || 'normal') === c.id
              return (
                <button key={c.id} type="button" aria-pressed={on} title={hint} onClick={() => onChange({ cut: c.id })} className={chip(on)}>
                  {name}
                </button>
              )
            })}
          </div>
          <p className="mt-1 text-xs text-text-tertiary">
            {(agent.cutStyles.find((c) => c.id === (value.cut || 'normal'))?.label || '').split(' · ')[1]}
          </p>
        </Group>
      ) : null}

      {agent.audioLevels?.length ? (
        <Group label="Audio cleanup">
          <div className="grid gap-2 sm:grid-cols-3">
            {agent.audioLevels.map((a) => {
              const [name, hint] = a.label.split(' · ')
              const on = (value.audio || 'standard') === a.id
              return (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange({ audio: a.id })}
                  className={`rounded-xl border px-3 py-2 text-left text-sm ${on ? 'border-accent-blue bg-accent-blue/10' : 'border-border-default bg-input'}`}
                >
                  <span className="block font-medium">{name}</span>
                  <span className="block text-xs text-text-tertiary">{hint}</span>
                  <span className="mt-1 block text-xs font-semibold text-text-secondary">~{formatCredits(a.creditsPerMinute)} credits/min</span>
                </button>
              )
            })}
          </div>
        </Group>
      ) : null}

      {agent.styles?.length ? (
        <Group label="Picture style">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {[{ id: '', label: 'Agent picks' }, ...agent.styles].map((s) => {
              const [hint, gradient] = STYLE_LOOKS[s.id] || ['Best fit for each video', 'from-slate-500 via-slate-600 to-slate-800']
              const on = (value.style || '') === s.id
              return (
                <label
                  key={s.id || 'auto'}
                  className={`cursor-pointer rounded-xl border p-1.5 text-xs has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent-blue ${on ? 'border-accent-blue bg-accent-blue/10' : 'border-border-default bg-input'}`}
                >
                  <input type="radio" name="agent-style" className="sr-only" checked={on} onChange={() => onChange({ style: s.id })} />
                  <span aria-hidden className={`block aspect-[3/4] rounded-lg bg-gradient-to-br ${gradient}`} />
                  <span className="mt-1 block font-medium">{s.label}</span>
                  <span className="block text-[11px] text-text-tertiary">{hint}</span>
                </label>
              )
            })}
          </div>
        </Group>
      ) : null}
    </div>
  )
}
