import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const clock = (t) => {
  const s = Math.max(0, Math.round(t))
  const h = Math.floor(s / 3600)
  const mm = String(Math.floor(s / 60) % 60).padStart(h ? 2 : 1, '0')
  return `${h ? `${h}:` : ''}${mm}:${String(s % 60).padStart(2, '0')}`
}

function Score({ value }) {
  const tone =
    value >= 80
      ? 'border-success/40 bg-success/15 text-success-text'
      : value >= 60
        ? 'border-accent-blue/40 bg-accent-blue/10 text-link'
        : 'border-border-default bg-elevated text-text-secondary'
  return (
    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums ${tone}`} title="How likely it is to do well as a Short (0–100)">
      {value}
    </span>
  )
}

const input =
  'w-full rounded-lg border border-border-default bg-input px-2.5 py-1.5 text-sm focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue'

/** Check-in: pick the moments to turn into clips, trim their edges and edit the hook text. */
export function ClipPicker({ run, busy, onContinue, onDiscard }) {
  const player = useRef(null)
  const stopAt = useRef(null)
  const [items, setItems] = useState(() =>
    run.moments.map((m, index) => ({ index, keep: m.keep !== false, start: m.start, end: m.end, hook: m.hook || '', captions: m.text })),
  )
  const [playing, setPlaying] = useState(null)
  const [editing, setEditing] = useState(null)
  const set = (index, patch) => setItems((prev) => prev.map((it) => (it.index === index ? { ...it, ...patch } : it)))
  const chosen = items.filter((it) => it.keep).length
  const invalid = items.some((it) => it.keep && !(it.end - it.start >= 3 && it.end - it.start <= 180 && it.start >= 0))

  const preview = (it) => {
    const video = player.current
    if (!video) return
    stopAt.current = it.end
    setPlaying(it.index)
    video.currentTime = it.start
    video.play().catch(() => {})
    video.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }
  const onTime = () => {
    const video = player.current
    if (video && stopAt.current != null && video.currentTime >= stopAt.current) {
      video.pause()
      stopAt.current = null
      setPlaying(null)
    }
  }
  const now = () => Math.round((player.current?.currentTime || 0) * 10) / 10

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        The agent found {run.moments.length} moments, best first. Tick the ones you want, play them, and fix where they start
        or end. Only the ticked ones are made into clips.
      </p>
      {run.sourceUrl ? (
        <video
          ref={player}
          src={run.sourceUrl}
          controls
          playsInline
          preload="metadata"
          onTimeUpdate={onTime}
          onPause={() => setPlaying(null)}
          className="max-h-72 w-full rounded-xl bg-black"
        />
      ) : null}

      <ol className="space-y-3">
        {items.map((it) => {
          const m = run.moments[it.index]
          return (
            <li
              key={it.index}
              className={`rounded-xl border p-3 text-sm transition ${it.keep ? 'border-accent-blue/60 bg-accent-blue/5' : 'border-border-default bg-input opacity-70'}`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0"
                  checked={it.keep}
                  onChange={(e) => set(it.index, { keep: e.target.checked })}
                  aria-label={`Make a clip of “${m.title}”`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold">{m.title}</p>
                    <Score value={m.score} />
                  </div>
                  <p className="mt-0.5 text-xs text-text-tertiary">
                    {clock(it.start)}–{clock(it.end)} · {Math.round(it.end - it.start)}s{m.reason ? ` · ${m.reason}` : ''}
                  </p>
                  {editing === it.index ? (
                    <label className="mt-2 block text-xs text-text-tertiary">
                      Captions: fix any misheard word. Timing stays matched to the speech.
                      <textarea
                        rows={4}
                        maxLength={5000}
                        value={it.captions}
                        onChange={(e) => set(it.index, { captions: e.target.value })}
                        className={`mt-1 ${input}`}
                      />
                    </label>
                  ) : (
                    <p className="mt-2 line-clamp-3 text-text-secondary">“{it.captions}”</p>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditing(editing === it.index ? null : it.index)}
                    className="mt-1 text-xs font-medium text-text-secondary hover:text-text-primary"
                  >
                    {editing === it.index ? 'Done editing captions' : 'Edit captions'}
                  </button>

                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                    <label className="block text-xs text-text-tertiary">
                      Hook text on screen
                      <input value={it.hook} maxLength={80} onChange={(e) => set(it.index, { hook: e.target.value })} className={`mt-1 ${input}`} />
                    </label>
                    {['start', 'end'].map((edge) => (
                      <label key={edge} className="block text-xs text-text-tertiary">
                        {edge === 'start' ? 'Starts at (s)' : 'Ends at (s)'}
                        <span className="mt-1 flex gap-1">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max={run.sourceSeconds || undefined}
                            value={it[edge]}
                            onChange={(e) => set(it.index, { [edge]: Number(e.target.value) })}
                            className={`${input} w-24 tabular-nums`}
                          />
                          <button
                            type="button"
                            onClick={() => set(it.index, { [edge]: now() })}
                            title="Use the player's current time"
                            className="shrink-0 rounded-lg border border-border-default px-2 text-xs text-text-secondary hover:text-text-primary"
                          >
                            Now
                          </button>
                        </span>
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => (playing === it.index ? player.current?.pause() : preview(it))}
                    className="mt-2 text-xs font-medium text-link hover:underline"
                  >
                    {playing === it.index ? '❚❚ Stop' : '▶ Play this moment'}
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      {invalid ? <p className="text-sm text-danger">A clip must be 3 seconds to 3 minutes long.</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || !chosen || invalid}
          onClick={() =>
            onContinue({
              clips: items.map(({ captions, ...it }) => (captions.trim() && captions !== run.moments[it.index].text ? { ...it, captions } : it)),
            })
          }
          className="rounded-xl gradient-bg px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {chosen === 1 ? 'Make 1 clip' : `Make ${chosen} clips`}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onDiscard}
          className="rounded-xl border border-border-default px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          Discard
        </button>
      </div>
    </div>
  )
}

/** The finished vertical clips: play, download, or open the Publish page for one. */
export function ClipResults({ run }) {
  const navigate = useNavigate()
  const publish = (c) =>
    navigate('/publish', {
      state: { type: 'video', videoUrl: c.videoUrl, thumbnailUrl: c.thumbnailUrl, title: c.title, prompt: c.text, assetId: c.assetId },
    })

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {run.clips.map((c, i) => (
        <li key={i} className="flex flex-col overflow-hidden rounded-xl border border-border-default bg-input text-sm">
          {c.videoUrl ? (
            <video
              src={c.videoUrl}
              poster={c.thumbnailUrl || undefined}
              controls
              playsInline
              preload="metadata"
              className="aspect-[9/16] w-full bg-black object-cover"
            />
          ) : (
            <p className="flex aspect-[9/16] items-center justify-center p-3 text-center text-xs text-danger">{c.error || 'Not made'}</p>
          )}
          <div className="flex flex-1 flex-col gap-1 p-2.5">
            <div className="flex items-start justify-between gap-2">
              <p className="line-clamp-2 font-medium">{c.title}</p>
              {c.score != null ? <Score value={c.score} /> : null}
            </div>
            {c.duration ? <p className="text-xs text-text-tertiary">{Math.round(c.duration)}s</p> : null}
            {c.videoUrl ? (
              <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-1">
                <button type="button" onClick={() => publish(c)} className="text-xs font-semibold text-link hover:underline">
                  Publish…
                </button>
                <a href={c.videoUrl} download className="text-xs font-medium text-text-secondary hover:text-text-primary">
                  Download
                </a>
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}
