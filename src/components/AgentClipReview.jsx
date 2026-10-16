import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatCredits } from '../utils/credits'
import { clock, optionName, parseClock } from '../utils/clips'

const scoreTone = (value) =>
  value >= 80
    ? 'border-success/40 bg-success/15 text-success-text'
    : value >= 60
      ? 'border-accent-blue/40 bg-accent-blue/10 text-link'
      : 'border-border-default bg-elevated text-text-secondary'
const segmentTone = (it, score) => (!it.keep ? 'bg-text-tertiary/40' : score >= 80 ? 'bg-success' : score >= 60 ? 'bg-accent-blue' : 'bg-accent-violet')

function Score({ value, className = '' }) {
  return (
    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums ${scoreTone(value)} ${className}`} title="How likely it is to do well as a Short (0–100)">
      {value}
    </span>
  )
}

const input =
  'h-10 w-full rounded-lg border border-border-default bg-input px-3 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue'
const nudge = 'h-10 shrink-0 rounded-lg border border-border-default px-2.5 text-xs text-text-secondary hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent-blue'

/** A start or end time typed as 12:45.0, with ±0.5 s nudges and "Now" (the player's time). */
function TimeField({ label, value, onChange, onNow }) {
  const reset = (el) => (el.value = clock(value, true))
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-text-tertiary">{label}</span>
      <span className="flex items-center gap-1.5">
        <button type="button" className={nudge} aria-label={`${label} half a second earlier`} onClick={() => onChange(Math.max(0, value - 0.5))}>
          −0.5
        </button>
        <input
          key={value}
          defaultValue={clock(value, true)}
          inputMode="decimal"
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), e.currentTarget.blur())}
          onBlur={(e) => {
            const t = parseClock(e.target.value)
            if (t == null) reset(e.target)
            else if (t !== value) onChange(Math.round(t * 10) / 10)
          }}
          className={`${input} text-center font-mono tabular-nums`}
        />
        <button type="button" className={nudge} aria-label={`${label} half a second later`} onClick={() => onChange(value + 0.5)}>
          +0.5
        </button>
        <button type="button" className={`${nudge} px-3 font-medium`} title="Use the player's current time" onClick={onNow}>
          Now
        </button>
      </span>
    </label>
  )
}

/** Check-in: pick the moments to turn into clips, trim their edges and edit the hook text and captions. */
export function ClipPicker({ run, agent, config, busy, onContinue, onDiscard }) {
  const player = useRef(null)
  const stopAt = useRef(null)
  const [items, setItems] = useState(() =>
    run.moments.map((m, index) => ({ index, keep: m.keep !== false, start: m.start, end: m.end, hook: m.hook || '', captions: m.text })),
  )
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(null)
  const [position, setPosition] = useState(0)
  const [order, setOrder] = useState('score')
  const set = (index, patch) => setItems((prev) => prev.map((it) => (it.index === index ? { ...it, ...patch } : it)))
  const kept = items.filter((it) => it.keep)
  const total = run.sourceSeconds || Math.max(...items.map((it) => it.end), 1)
  const bad = (it) => !(it.end - it.start >= 3 && it.end - it.start <= 180 && it.start >= 0 && it.end <= total + 0.5)
  const invalid = kept.some(bad)
  const it = items[current]
  const m = run.moments[current]
  const shown = order === 'time' ? [...items].sort((a, b) => a.start - b.start) : items

  const preview = (target) => {
    const video = player.current
    if (!video) return
    stopAt.current = target.end
    setPlaying(target.index)
    video.currentTime = target.start
    video.play().catch(() => {})
  }
  const onTime = () => {
    const video = player.current
    if (!video) return
    setPosition(video.currentTime)
    if (stopAt.current != null && video.currentTime >= stopAt.current) {
      video.pause()
      stopAt.current = null
      setPlaying(null)
    }
  }
  const now = () => Math.round((player.current?.currentTime || 0) * 10) / 10
  const choose = (index) => {
    setCurrent(index)
    const video = player.current
    if (video && playing == null) video.currentTime = items[index].start
  }

  return (
    <div>
      <div className="grid divide-y divide-border-default lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:divide-x lg:divide-y-0">
        <div className="flex min-w-0 flex-col gap-4 p-4">
          {run.sourceUrl ? (
            <video
              ref={player}
              src={run.sourceUrl}
              controls
              playsInline
              preload="metadata"
              onTimeUpdate={onTime}
              onPause={() => setPlaying(null)}
              className="aspect-video w-full rounded-xl border border-border-default bg-black"
            />
          ) : (
            <p className="rounded-xl border border-border-default bg-input p-4 text-sm text-text-tertiary">The source video is no longer stored, so it can't be played here.</p>
          )}

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
              <button type="button" onClick={() => (playing === it.index ? player.current?.pause() : preview(it))} disabled={!run.sourceUrl} className="font-medium text-link hover:underline disabled:opacity-50">
                {playing === it.index ? '❚❚ Stop' : '▶ Play this moment'}
              </button>
              <span className="flex items-center gap-3" aria-hidden>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-success" />80+</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-accent-blue" />60+</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-text-tertiary/40" />not picked</span>
              </span>
            </div>
            <div className="relative h-14 rounded-lg border border-border-default bg-elevated" aria-label="Where the moments are in the video">
              <div className="pointer-events-none absolute inset-x-2 top-1 flex justify-between text-[10px] tabular-nums text-text-tertiary">
                {[0, 1 / 3, 2 / 3, 1].map((f) => (
                  <span key={f}>{clock(total * f)}</span>
                ))}
              </div>
              <div className="absolute inset-x-2 bottom-2 h-6">
                {items.map((x) => (
                  <button
                    key={x.index}
                    type="button"
                    onClick={() => choose(x.index)}
                    aria-label={`${run.moments[x.index].title}, ${clock(x.start)} to ${clock(x.end)}${x.index === current ? ' (editing)' : ''}`}
                    className={`absolute h-full min-w-1.5 rounded-sm transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white ${segmentTone(x, run.moments[x.index].score)} ${
                      x.index === current ? 'z-10 ring-2 ring-text-primary' : ''
                    }`}
                    style={{ left: `${(x.start / total) * 100}%`, width: `${((x.end - x.start) / total) * 100}%` }}
                  />
                ))}
                {run.sourceUrl ? (
                  <span aria-hidden className="pointer-events-none absolute -bottom-1 -top-1 z-20 w-0.5 bg-text-primary/80" style={{ left: `${Math.min(100, (position / total) * 100)}%` }} />
                ) : null}
              </div>
            </div>
          </div>

          <section aria-label="Edit the selected moment" className={`rounded-xl border p-4 ${it.keep ? 'border-accent-blue/60 bg-accent-blue/5' : 'border-border-default bg-input'}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-heading text-[1rem] font-semibold">{m.title}</p>
                <p className="text-xs text-text-tertiary">
                  {clock(it.start)}–{clock(it.end)} · {Math.round(it.end - it.start)}s{m.reason ? ` · ${m.reason}` : ''}
                </p>
              </div>
              <label className="flex shrink-0 items-center gap-2 text-sm text-text-secondary">
                <input type="checkbox" className="h-4 w-4" checked={it.keep} onChange={(e) => set(it.index, { keep: e.target.checked })} />
                Make this clip
              </label>
            </div>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs text-text-tertiary">Hook text on screen</span>
                <input value={it.hook} maxLength={80} onChange={(e) => set(it.index, { hook: e.target.value })} className={input} />
              </label>
              <div className="grid gap-3 xl:grid-cols-2">
                <TimeField label="Starts at" value={it.start} onChange={(v) => set(it.index, { start: v })} onNow={() => set(it.index, { start: now() })} />
                <TimeField label="Ends at" value={it.end} onChange={(v) => set(it.index, { end: v })} onNow={() => set(it.index, { end: now() })} />
              </div>
              {bad(it) ? <p className="text-xs text-danger">A clip must be 3 seconds to 3 minutes long, inside the video.</p> : null}
              <label className="block">
                <span className="mb-1.5 flex flex-wrap items-center justify-between gap-x-3 text-xs text-text-tertiary">
                  <span>Captions</span>
                  <span>Fix misheard words. Timing stays matched to the speech.</span>
                </span>
                <textarea
                  rows={3}
                  maxLength={5000}
                  value={it.captions}
                  onChange={(e) => set(it.index, { captions: e.target.value })}
                  className="w-full resize-y rounded-lg border border-border-default bg-input px-3 py-2 text-sm leading-relaxed text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                />
              </label>
            </div>
          </section>
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default bg-elevated px-4 py-3">
            <p className="text-sm text-text-secondary">
              <span className="font-semibold text-text-primary">{items.length} moments found</span> · pick a card to edit it
            </p>
            <div className="flex items-center gap-3 text-sm">
              <button type="button" onClick={() => setItems((prev) => prev.map((x) => ({ ...x, keep: true })))} className="font-medium text-link hover:underline">
                Select all
              </button>
              <button type="button" onClick={() => setItems((prev) => prev.map((x) => ({ ...x, keep: false })))} className="font-medium text-text-secondary hover:text-text-primary">
                None
              </button>
              <select aria-label="Sort moments" value={order} onChange={(e) => setOrder(e.target.value)} className="rounded-lg border border-border-default bg-surface px-2 py-1 text-sm focus:border-accent-blue focus:outline-none">
                <option value="score">Best score</option>
                <option value="time">Timeline order</option>
              </select>
            </div>
          </div>
          <ul className="grid max-h-[820px] grid-cols-2 gap-4 overflow-y-auto p-4">
            {shown.map((x) => {
              const mo = run.moments[x.index]
              const editing = x.index === current
              return (
                <li key={x.index} className="relative">
                  <button type="button" onClick={() => choose(x.index)} aria-current={editing ? 'true' : undefined} className="group block w-full text-left focus-visible:outline-none">
                    <span
                      className={`relative block aspect-[9/16] w-full overflow-hidden rounded-2xl bg-slate-900 transition group-focus-visible:ring-2 group-focus-visible:ring-accent-blue ${
                        editing ? 'border-2 border-accent-blue shadow-[0_0_0_4px_rgba(37,99,235,0.25)]' : x.keep ? 'border-2 border-accent-blue/50' : 'border border-dashed border-text-tertiary/50 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {run.sourceUrl ? (
                        <video src={`${run.sourceUrl}#t=${x.start}`} preload="metadata" muted playsInline tabIndex={-1} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-70" />
                      ) : null}
                      <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
                      {x.hook ? (
                        <span className="absolute inset-x-0 top-11 px-3 text-center">
                          <span className="inline-block rounded-lg bg-black/65 px-2.5 py-1 text-xs font-bold uppercase leading-tight text-white">{x.hook}</span>
                        </span>
                      ) : null}
                      <span className="absolute inset-x-0 bottom-8 line-clamp-2 px-3 text-center font-heading text-sm font-bold uppercase leading-tight text-white [text-shadow:0_2px_6px_rgba(0,0,0,.9)]">
                        {x.captions.split(/\s+/).slice(0, 7).join(' ')}
                      </span>
                      <Score value={mo.score} className="absolute right-2.5 top-2.5" />
                      {editing ? <span className="absolute inset-x-0 bottom-0 bg-accent-blue/90 py-1 text-center text-[11px] font-semibold text-white">Editing</span> : null}
                    </span>
                    <span className="mt-2 block truncate text-sm font-semibold text-text-primary">{mo.title}</span>
                    <span className="block text-xs text-text-tertiary">
                      {clock(x.start)}–{clock(x.end)} · {Math.round(x.end - x.start)}s
                    </span>
                    {mo.reason ? <span className="block truncate text-xs text-text-secondary">{mo.reason}</span> : null}
                  </button>
                  <label className="absolute left-2.5 top-2.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-black/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-white">
                    <input
                      type="checkbox"
                      checked={x.keep}
                      onChange={(e) => set(x.index, { keep: e.target.checked })}
                      aria-label={`Make a clip of “${mo.title}”`}
                      className="h-4 w-4 cursor-pointer accent-accent-blue"
                    />
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-border-default bg-panel/95 p-4 backdrop-blur-md">
        <p className="text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">
            {kept.length} of {items.length} selected
          </span>
          {' · '}
          {clock(kept.reduce((n, x) => n + x.end - x.start, 0))} of clips · Captions: {optionName(agent?.captionStyles, config?.captionStyle || 'classic')} ·{' '}
          {optionName(agent?.layouts, config?.layout || 'auto')}
        </p>
        <div className="flex items-center gap-3">
          {invalid ? <span className="text-xs text-danger">Fix the clip times first.</span> : null}
          <button type="button" disabled={busy} onClick={onDiscard} className="rounded-xl border border-border-default px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary disabled:opacity-50">
            Discard
          </button>
          <button
            type="button"
            disabled={busy || !kept.length || invalid}
            onClick={() =>
              onContinue({
                clips: items.map(({ captions, ...x }) => (captions.trim() && captions !== run.moments[x.index].text ? { ...x, captions } : x)),
              })
            }
            className="rounded-xl gradient-bg px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {kept.length === 1 ? 'Make 1 clip' : `Make ${kept.length} clips`}
          </button>
        </div>
      </div>
    </div>
  )
}

/** The finished vertical clips: play, download, or open the Publish page for one. */
export function ClipResults({ run, onNew }) {
  const navigate = useNavigate()
  const publish = (c) =>
    navigate('/publish', {
      state: { type: 'video', videoUrl: c.videoUrl, thumbnailUrl: c.thumbnailUrl, title: c.title, prompt: c.text, assetId: c.assetId },
    })
  const made = run.clips.filter((c) => c.videoUrl).length
  const source = run.sourceTitle || run.input?.title

  return (
    <div className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-heading text-xl font-bold">{made === 1 ? '1 clip ready' : `${made} clips ready`}</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {source ? `From “${source}” · ` : ''}saved to your Library · {formatCredits(run.credits)} credits used
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/library" className="rounded-xl border border-border-default px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary">
            Open in Library
          </Link>
          {onNew ? (
            <button type="button" onClick={onNew} className="rounded-xl gradient-bg px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25">
              Make more clips
            </button>
          ) : null}
        </div>
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {run.clips.map((c, i) => (
          <li key={i} className="flex flex-col">
            {c.videoUrl ? (
              <div className="relative">
                <video
                  src={c.videoUrl}
                  poster={c.thumbnailUrl || undefined}
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={c.title}
                  className="aspect-[9/16] w-full rounded-2xl border border-border-default bg-black object-cover"
                />
                {c.score != null ? <Score value={c.score} className="pointer-events-none absolute right-2.5 top-2.5" /> : null}
              </div>
            ) : (
              <div className="flex aspect-[9/16] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-error/50 bg-error/5 p-4 text-center">
                <span aria-hidden className="text-2xl text-danger">!</span>
                <p className="text-xs text-danger">{c.error || "This clip couldn't be made."}</p>
              </div>
            )}
            <p className="mt-2 line-clamp-2 text-sm font-semibold">{c.title}</p>
            <p className="text-xs text-text-tertiary">{c.videoUrl ? (c.duration ? clock(c.duration) : '') : 'Not made'}</p>
            {c.videoUrl ? (
              <div className="mt-2 flex items-center gap-2">
                <button type="button" onClick={() => publish(c)} className="flex-1 rounded-lg gradient-bg px-3 py-1.5 text-xs font-semibold text-white">
                  Publish…
                </button>
                <a href={c.videoUrl} download className="rounded-lg border border-border-default px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary">
                  Download
                </a>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
