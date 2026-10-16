import { useEffect, useRef, useState } from 'react'
import { formatCredits } from '../utils/credits'
import { formatDuration, listLibraryAssets, uploadLibraryMedia, videoFileSeconds } from '../utils/library'

/** "Make a video": pick a library video or upload one, then start the Video Editor on it. */
export default function AgentVideoPicker({ agent, config, projectId, busy, paused, onStart, title, action }) {
  const [videos, setVideos] = useState(null)
  const [selected, setSelected] = useState('')
  const [seconds, setSeconds] = useState({})
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')
  const fileInput = useRef(null)
  const max = typeof agent.maxSeconds === 'number' ? agent.maxSeconds : null // the Video Editor's limit
  const perMinuteAgent = agent.creditUnit === 'minute'
  const perHourAgent = agent.creditUnit === 'hour'

  useEffect(() => {
    listLibraryAssets('video', { projectId, limit: 24 })
      .then((res) => setVideos(res.items.filter((v) => v.status === 'ready')))
      .catch(() => setVideos([]))
  }, [projectId])

  const upload = async (file) => {
    if (!file) return
    setError('')
    const length = await videoFileSeconds(file)
    if (max && length && length > max + 1) {
      setError(`This video is ${formatDuration(length)} long. The Video Editor takes videos up to ${max / 60} minutes.`)
      return
    }
    setUploading(true)
    try {
      const asset = await uploadLibraryMedia(file, projectId, setProgress)
      setVideos((prev) => [asset, ...(prev || [])])
      setSelected(asset.id)
      if (length) setSeconds((prev) => ({ ...prev, [asset.id]: length }))
    } catch (err) {
      setError(err.response?.data?.message || 'Could not upload the video.')
    } finally {
      setUploading(false)
      setProgress(null)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const level = agent.audioLevels?.find((l) => l.id === (config?.audio || 'standard'))
  const perMinute = Number(level?.creditsPerMinute ?? agent.estimatedCredits ?? 0)
  const chosen = videos?.find((v) => v.id === selected)
  const length = seconds[selected] ?? chosen?.durationSeconds
  const estimate = perHourAgent
    ? length
      ? `About ${formatCredits((Number(agent.estimatedCredits) * Math.max(length, 60)) / 3600)} credits for this video.`
      : `About ${formatCredits(agent.estimatedCredits)} credits per hour of video.`
    : !perMinuteAgent
    ? `About ${formatCredits(agent.estimatedCredits)} credits.`
    : length
      ? `About ${formatCredits(perMinute * Math.max(length, 1) / 60)} credits for this video.`
      : `About ${formatCredits(perMinute)} credits per minute of video.`

  return (
    <section className="rounded-2xl border border-border-default bg-surface p-4">
      <h2 className="font-heading text-[1rem] font-semibold">{title || (max ? 'Edit a video' : 'Post a video')}</h2>
      <p className="mt-1 text-sm text-text-tertiary">
        Pick a video from your Library or upload one{max ? ` (up to ${max / 60} minutes)` : ''}.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          ref={fileInput}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="sr-only"
          id="agent-video-upload"
          onChange={(e) => upload(e.target.files?.[0])}
        />
        <label
          htmlFor="agent-video-upload"
          className={`cursor-pointer rounded-xl border border-border-default px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        >
          {uploading ? (progress != null ? `Uploading… ${Math.floor(progress * 100)}%` : 'Uploading…') : '↑ Upload a video'}
        </label>
      </div>

      {videos === null ? <p className="mt-3 text-xs text-text-tertiary">Loading your videos…</p> : null}
      {videos?.length ? (
        <ul className="mt-3 grid max-h-72 grid-cols-3 gap-2 overflow-y-auto" aria-label="Your videos">
          {videos.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => setSelected(v.id)}
                aria-pressed={selected === v.id}
                title={v.title}
                className={`block w-full overflow-hidden rounded-lg border text-left ${selected === v.id ? 'border-accent-blue ring-2 ring-accent-blue' : 'border-border-default'}`}
              >
                <video src={v.sourceUrl} preload="metadata" muted playsInline className="aspect-square w-full bg-black object-cover" />
                <span className="block truncate px-1.5 py-1 text-[11px] text-text-secondary">{v.title}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {videos && !videos.length ? <p className="mt-3 text-xs text-text-tertiary">No videos yet. Upload one to start.</p> : null}

      {error ? (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy || uploading || !selected || paused}
          onClick={() => onStart({ assetId: selected })}
          className="rounded-xl gradient-bg px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Starting…' : action || (max ? 'Edit this video' : 'Write the posts')}
        </button>
        <span className="text-xs text-text-tertiary">{paused ? 'This agent is paused. Resume it to run.' : `${estimate} Refunded if it fails.`}</span>
      </div>
    </section>
  )
}
