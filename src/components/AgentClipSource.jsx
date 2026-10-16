import { useEffect, useRef, useState } from 'react'
import { runStatusText, runTitle } from '../utils/agents'
import { formatCredits } from '../utils/credits'
import { clipCredits, clock, optionHint, optionName } from '../utils/clips'
import { listLibraryAssets, uploadLibraryMedia, videoFileSeconds } from '../utils/library'

const field =
  'mt-1.5 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-sm focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue'
const chip = (on) =>
  `min-w-12 rounded-lg px-3 py-1.5 text-sm font-medium tabular-nums transition focus-visible:ring-2 focus-visible:ring-accent-blue ${
    on ? 'bg-accent-blue text-white' : 'border border-border-default bg-elevated text-text-secondary hover:text-text-primary'
  }`
const card = (on) =>
  `rounded-xl border text-left transition focus-visible:ring-2 focus-visible:ring-accent-blue ${
    on ? 'border-accent-blue bg-accent-blue/10' : 'border-border-default bg-input hover:border-accent-blue/40'
  }`
const SETTING_KEYS = ['clipLength', 'clipCount', 'captionStyle', 'layout', 'tighten']
const TABS = [
  ['link', 'YouTube link'],
  ['upload', 'Upload from computer'],
  ['library', 'From Library'],
]

// A person talking to camera, so the caption previews look like a real clip.
const SAMPLE_FRAME = '/leonardo-media/posters/StoryKling2.jpg'

/** What each caption style looks like, on a small vertical frame. */
function CaptionSample({ id }) {
  const hit = <span className="text-accent-blue">hit</span>
  const text = {
    classic: <span className="text-[11px] font-semibold text-white">and what a {hit}</span>,
    bold: <span className="font-heading text-sm font-extrabold uppercase leading-tight text-white">what a {hit}</span>,
    boxed: (
      <span className="text-[11px] font-semibold text-white">
        what a <span className="rounded bg-accent-blue px-1 text-white">hit</span>
      </span>
    ),
    minimal: <span className="text-[10px] text-white/90">what a hit</span>,
  }[id]
  return (
    <span
      aria-hidden
      className={`relative flex aspect-[9/16] w-full justify-center overflow-hidden rounded-lg bg-slate-800 px-1 text-center ${
        id === 'minimal' ? 'items-end pb-3' : 'items-end pb-6'
      }`}
    >
      <img src={SAMPLE_FRAME} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <span className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
      <span className="relative">{text || <span className="text-[11px] text-white">what a hit</span>}</span>
    </span>
  )
}

/** A small diagram of how the wide video fits the vertical clip. */
function FramingSample({ id }) {
  return (
    <span aria-hidden className="relative flex h-10 w-6 shrink-0 items-center justify-center overflow-hidden rounded border border-border-default bg-elevated">
      {id === 'fit' ? (
        <span className="h-3 w-full bg-accent-blue/70" />
      ) : id === 'crop' ? (
        <span className="absolute inset-0 bg-accent-blue/50" />
      ) : (
        <>
          <span className="absolute inset-0 bg-accent-blue/25" />
          <span className="relative h-3 w-3 rounded-full border-2 border-accent-blue" />
        </>
      )}
    </span>
  )
}

function Setting({ label, hint, children }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-text-secondary">{label}</legend>
      <div className="mt-2">{children}</div>
      {hint ? <p className="mt-1.5 text-xs text-text-tertiary">{hint}</p> : null}
    </fieldset>
  )
}

/** Clip Maker start screen: the video (YouTube link, upload or Library), the clip settings and the cost. */
export default function AgentClipSource({ agent, config, projectId, runs, busy, paused, onStart, onSaveConfig, onSelectRun }) {
  const [tab, setTab] = useState('link')
  const [url, setUrl] = useState('')
  const [rights, setRights] = useState(false)
  const [videos, setVideos] = useState(null)
  const [picked, setPicked] = useState(null) // { id, title, seconds }
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState(() => ({
    clipLength: config?.clipLength || 'medium',
    clipCount: Number(config?.clipCount || 5),
    captionStyle: config?.captionStyle || 'classic',
    layout: config?.layout || 'auto',
    tighten: Boolean(config?.tighten),
  }))
  const fileInput = useRef(null)
  const set = (patch) => setSettings((prev) => ({ ...prev, ...patch }))

  useEffect(() => {
    if (tab !== 'library' || videos) return
    listLibraryAssets('video', { projectId, limit: 24 })
      .then((res) => setVideos(res.items.filter((v) => v.status === 'ready')))
      .catch(() => setVideos([]))
  }, [tab, videos, projectId])

  const upload = async (file) => {
    if (!file) return
    setError('')
    setPicked(null)
    const seconds = await videoFileSeconds(file)
    setUploading(true)
    try {
      const asset = await uploadLibraryMedia(file, projectId, setProgress)
      setPicked({ id: asset.id, title: asset.title || file.name, seconds })
      setVideos((prev) => (prev ? [asset, ...prev] : prev))
    } catch (err) {
      setError(err.response?.data?.message || 'Could not upload the video.')
    } finally {
      setUploading(false)
      setProgress(null)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const fromLink = tab === 'link'
  const ready = fromLink ? Boolean(url.trim()) && rights : Boolean(picked) && !uploading
  const credits = fromLink ? null : clipCredits(agent, picked?.seconds)
  const cost =
    credits != null
      ? `About ${formatCredits(credits)} credits for this ${clock(picked.seconds)} video.`
      : `About ${formatCredits(agent.estimatedCredits)} credits per hour of video.`

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const changed = SETTING_KEYS.some((k) => (k === 'clipCount' ? Number(config?.[k] || 5) : config?.[k]) !== settings[k])
    if (changed) {
      try {
        await onSaveConfig({ ...(config || {}), ...settings })
      } catch (err) {
        setError(err.response?.data?.message || 'Could not save the clip settings.')
        return
      }
    }
    onStart(fromLink ? { url: url.trim(), rights } : { assetId: picked.id })
  }

  const recent = runs.slice(0, 5)
  const review = (config?.checkpoints || 'all') === 'all'

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <form onSubmit={submit} aria-label="Make clips" className="min-w-0 space-y-6 rounded-2xl border border-border-default bg-surface p-5 sm:p-6">
        <div>
          <h2 className="font-heading text-lg font-bold">Make clips</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Give it a long video. It finds the best moments and turns them into vertical clips with captions.
          </p>
        </div>

        <div role="tablist" aria-label="Video source" className="grid gap-1 rounded-xl border border-border-default bg-input p-1 sm:grid-cols-3">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => {
                setTab(id)
                setError('')
                if (id === 'link') setPicked(null)
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-accent-blue ${
                tab === id ? 'bg-accent-blue text-white shadow' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'link' ? (
          <div className="space-y-3">
            <label className="block text-sm">
              <span className="font-medium text-text-secondary">Link to a public YouTube video</span>
              <input
                type="url"
                inputMode="url"
                value={url}
                maxLength={300}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=…"
                className={field}
              />
            </label>
            <p className="text-xs text-text-tertiary">
              Slow connection? Uploading the video file from your computer is usually faster than downloading it from YouTube.
            </p>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-0.5 h-4 w-4" checked={rights} onChange={(e) => setRights(e.target.checked)} />
              <span className="text-text-secondary">I own this video or have the rights to use it.</span>
            </label>
          </div>
        ) : tab === 'upload' ? (
          <div>
            <input
              ref={fileInput}
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              className="sr-only"
              id="clip-upload"
              onChange={(e) => upload(e.target.files?.[0])}
            />
            <label
              htmlFor="clip-upload"
              className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border-default bg-input px-4 py-8 text-center text-sm hover:border-accent-blue/60 has-[:focus-visible]:ring-2 ${
                uploading ? 'pointer-events-none opacity-60' : ''
              }`}
            >
              <span className="font-medium text-text-primary">
                {uploading ? (progress != null ? `Uploading… ${Math.floor(progress * 100)}%` : 'Uploading…') : 'Choose a video file'}
              </span>
              <span className="text-xs text-text-tertiary">MP4, MOV or WebM. It is saved to your Library too.</span>
            </label>
            {uploading && progress != null ? (
              <div role="progressbar" aria-label="Upload" aria-valuenow={Math.floor(progress * 100)} aria-valuemin={0} aria-valuemax={100} className="mt-3 h-1.5 overflow-hidden rounded-full bg-elevated">
                <div className="h-full rounded-full bg-accent-blue transition-all" style={{ width: `${progress * 100}%` }} />
              </div>
            ) : null}
          </div>
        ) : (
          <div>
            {videos === null ? <p className="text-sm text-text-tertiary">Loading your videos…</p> : null}
            {videos && !videos.length ? <p className="text-sm text-text-tertiary">No videos in your Library yet. Upload one instead.</p> : null}
            {videos?.length ? (
              <ul className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-4" aria-label="Your videos">
                {videos.map((v) => (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => setPicked({ id: v.id, title: v.title, seconds: v.durationSeconds })}
                      aria-pressed={picked?.id === v.id}
                      title={v.title}
                      className={`block w-full overflow-hidden rounded-lg border text-left focus-visible:ring-2 focus-visible:ring-accent-blue ${
                        picked?.id === v.id ? 'border-accent-blue ring-2 ring-accent-blue' : 'border-border-default'
                      }`}
                    >
                      <video src={v.sourceUrl} preload="metadata" muted playsInline className="aspect-video w-full bg-black object-cover" />
                      <span className="block truncate px-2 py-1 text-xs text-text-secondary">{v.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )}

        {picked && !fromLink ? (
          <p className="rounded-xl border border-success/40 bg-success/10 px-3 py-2 text-sm">
            <span className="font-medium">{picked.title}</span>
            {picked.seconds ? <span className="text-text-secondary"> · {clock(picked.seconds)}</span> : null}
          </p>
        ) : null}

        <section aria-labelledby="clip-settings" className="space-y-5 border-t border-border-default pt-5">
          <h3 id="clip-settings" className="font-heading text-[1rem] font-semibold">
            Clip settings
          </h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <Setting label="Clip length" hint={optionHint(agent.clipLengths, settings.clipLength)}>
              <div className="flex flex-wrap gap-1.5">
                {agent.clipLengths.map((c) => (
                  <button key={c.id} type="button" aria-pressed={settings.clipLength === c.id} onClick={() => set({ clipLength: c.id })} className={chip(settings.clipLength === c.id)}>
                    {optionName(agent.clipLengths, c.id)}
                  </button>
                ))}
              </div>
            </Setting>
            <Setting label="How many clips (at most)">
              <div className="flex flex-wrap gap-1.5">
                {agent.clipCounts.map((n) => (
                  <button key={n} type="button" aria-pressed={settings.clipCount === n} onClick={() => set({ clipCount: n })} className={`${chip(settings.clipCount === n)} min-w-10`}>
                    {n}
                  </button>
                ))}
              </div>
            </Setting>
          </div>

          <Setting label="Caption style" hint={optionHint(agent.captionStyles, settings.captionStyle)}>
            <div className="grid grid-cols-4 gap-2 sm:max-w-md">
              {agent.captionStyles.map((c) => {
                const on = settings.captionStyle === c.id
                return (
                  <button key={c.id} type="button" aria-pressed={on} onClick={() => set({ captionStyle: c.id })} className={`${card(on)} p-1.5`}>
                    <CaptionSample id={c.id} />
                    <span className="mt-1 block text-center text-xs font-medium">{optionName(agent.captionStyles, c.id)}</span>
                  </button>
                )
              })}
            </div>
          </Setting>

          <Setting label="Framing">
            <div className="grid gap-2 sm:grid-cols-3">
              {agent.layouts.map((l) => {
                const on = settings.layout === l.id
                return (
                  <button key={l.id} type="button" aria-pressed={on} onClick={() => set({ layout: l.id })} className={`${card(on)} flex items-center gap-3 px-3 py-2.5`}>
                    <FramingSample id={l.id} />
                    <span className="min-w-0 text-sm">
                      <span className="block font-medium">{optionName(agent.layouts, l.id)}</span>
                      <span className="block text-xs text-text-tertiary">{optionHint(agent.layouts, l.id)}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </Setting>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-border-default bg-input px-4 py-3">
            <span className="text-sm">
              <span id="tighten-label" className="block font-medium">
                Tighten pace
              </span>
              <span className="block text-xs text-text-tertiary">Cuts long pauses and um/uh inside each clip. Captions follow.</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={settings.tighten}
              aria-labelledby="tighten-label"
              onClick={() => set({ tighten: !settings.tighten })}
              className={`relative h-6 w-11 shrink-0 rounded-full transition focus-visible:ring-2 focus-visible:ring-accent-blue ${settings.tighten ? 'bg-accent-blue' : 'bg-elevated border border-border-default'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${settings.tighten ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
        </section>

        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 border-t border-border-default pt-5">
          <button
            type="submit"
            disabled={busy || paused || !ready}
            className="rounded-xl gradient-bg px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Checking the video…' : 'Find the best clips'}
          </button>
          <span className="text-xs text-text-tertiary">{paused ? 'This agent is paused. Resume it to run.' : `${cost} Refunded if it fails.`}</span>
        </div>
      </form>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-border-default bg-surface p-5">
          <h3 className="font-heading text-[1rem] font-semibold">What happens next</h3>
          <ol className="mt-3 space-y-3 text-sm">
            {[
              ['Gets and transcribes the video'],
              ['Finds and scores the best moments'],
              review ? ['You pick and trim the clips', 'Nothing is made until you approve'] : ['Picks the best moments itself', 'Turn on check-ins in Settings to pick them yourself'],
              ['Makes the vertical clips and saves them to your Library'],
            ].map(([text, note], i) => (
              <li key={text} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border-default text-xs text-text-tertiary">{i + 1}</span>
                <span>
                  <span className="block">{text}</span>
                  {note ? <span className="block text-xs text-link">{note}</span> : null}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {recent.length ? (
          <nav aria-label="Recent runs" className="overflow-hidden rounded-2xl border border-border-default bg-surface">
            <h3 className="px-5 pb-2 pt-4 font-heading text-[1rem] font-semibold">Recent runs</h3>
            <ul className="divide-y divide-border-default">
              {recent.map((r) => (
                <li key={r.id}>
                  <button type="button" onClick={() => onSelectRun(r.id)} className="block w-full px-5 py-3 text-left transition hover:bg-elevated focus-visible:bg-elevated">
                    <span className="block truncate text-sm font-medium">{runTitle(r)}</span>
                    <span className={`mt-0.5 block text-xs ${r.status === 'needs_review' ? 'font-semibold text-link' : r.status === 'failed' ? 'text-danger' : 'text-text-tertiary'}`}>
                      {runStatusText(r)} · {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </aside>
    </div>
  )
}
