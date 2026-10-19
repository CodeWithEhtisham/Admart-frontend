import { useEffect, useRef, useState } from 'react'
import { formatCredits } from '../utils/credits'
import { formatDuration, listLibraryAssets, uploadLibraryMedia, videoFileSeconds } from '../utils/library'
import AgentComposer from './AgentComposer.jsx'
import { primaryButton, secondaryButton } from './AgentBits.jsx'
import { Glyphs } from './glyphs'
import { Icon } from './icons'

/** "Make a video": pick a library video (panel above the bar) or upload one, then start the agent on it. Rendered as the composer bar. */
export default function AgentVideoPicker({ agent, config, projectId, busy, paused, onStart, title, action, modelLine }) {
  const [videos, setVideos] = useState(null)
  const [selected, setSelected] = useState('')
  const [seconds, setSeconds] = useState({})
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')
  const [showLibrary, setShowLibrary] = useState(false)
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

  const pick = (id) => {
    setSelected(id)
    setShowLibrary(false)
  }

  return (
    <AgentComposer
      label={title || (max ? 'Edit a video' : 'Post a video')}
      panel={
        <div>
          <div className="flex items-center justify-between gap-3 pr-1">
            <h3 className="font-heading text-[1rem] font-semibold">Your videos</h3>
            <button type="button" onClick={() => setShowLibrary(false)} className={secondaryButton}>
              Close
            </button>
          </div>
          {videos === null ? <p className="mt-3 text-xs text-text-tertiary">Loading your videos…</p> : null}
          {videos?.length ? (
            <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-6" aria-label="Your videos">
              {videos.map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => pick(v.id)}
                    aria-pressed={selected === v.id}
                    title={v.title}
                    className={`block w-full cursor-pointer overflow-hidden rounded-lg border text-left transition-colors duration-200 ${
                      selected === v.id ? 'border-accent-violet ring-2 ring-accent-violet' : 'border-border-default hover:border-accent-violet/50'
                    }`}
                  >
                    <video src={v.sourceUrl} preload="metadata" muted playsInline className="aspect-square w-full bg-black object-cover" />
                    <span className="block truncate px-1.5 py-1 text-[11px] text-text-secondary">{v.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {videos && !videos.length ? <p className="mt-3 text-xs text-text-tertiary">No videos yet. Upload one to start.</p> : null}
        </div>
      }
      panelOpen={showLibrary}
      panelId="agent-video-library"
      onClosePanel={() => setShowLibrary(false)}
      tools={modelLine}
      actions={
        <>
          <span className="text-xs text-text-tertiary">{paused ? 'This agent is paused. Resume it to run.' : `${estimate} Refunded if it fails.`}</span>
          <button
            type="button"
            disabled={busy || uploading || !selected || paused}
            onClick={() => onStart({ assetId: selected })}
            className={primaryButton}
          >
            {busy ? 'Starting…' : action || (max ? 'Edit this video' : 'Write the posts')}
            {busy ? null : <Icon className="h-4 w-4">{Glyphs.arrowRight}</Icon>}
          </button>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-[1rem] font-semibold">{title || (max ? 'Edit a video' : 'Post a video')}</h2>
          {chosen ? (
            <p className="mt-0.5 flex min-w-0 items-center gap-2 text-sm">
              <Icon className="h-4 w-4 text-success-text">{Glyphs.check}</Icon>
              <span className="truncate font-medium">{chosen.title}</span>
              {length ? <span className="shrink-0 text-text-tertiary">· {formatDuration(length)}</span> : null}
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-text-tertiary">
              Pick a video from your Library or upload one{max ? ` (up to ${max / 60} minutes)` : ''}.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowLibrary((v) => !v)}
            aria-expanded={showLibrary}
            aria-controls="agent-video-library"
            className={secondaryButton}
          >
            <Icon className="h-4 w-4">{Glyphs.film}</Icon>
            {chosen ? 'Change video' : 'From Library'}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            className="peer sr-only"
            id="agent-video-upload"
            onChange={(e) => upload(e.target.files?.[0])}
          />
          <label
            htmlFor="agent-video-upload"
            className={`${secondaryButton} peer-focus-visible:ring-2 peer-focus-visible:ring-accent-violet ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <Icon className="h-4 w-4">{Glyphs.upload}</Icon>
            {uploading ? (progress != null ? `Uploading… ${Math.floor(progress * 100)}%` : 'Uploading…') : 'Upload a video'}
          </label>
        </div>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </AgentComposer>
  )
}
