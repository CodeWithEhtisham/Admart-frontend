import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Topbar from '../components/Topbar'
import {
  PROJECT_CHANGE_EVENT,
  getCachedActiveProject,
} from '../utils/projects'
import { saveGeneratedAsset } from '../utils/generatedAssets.js'
import {
  CREDITS_CHANGE_EVENT,
  creditsFromApiError,
  estimateJobCost,
  getCreditCosts,
  getCredits,
  notifyCreditsChanged,
  syncCreditsFromPayload,
} from '../utils/credits.js'
import {
  ACCEPTED_MIME,
  DEFAULT_VIDEO_CATALOG,
  MAX_FILE_MB,
  VIDEO_CAPABILITIES,
  canGenerateVideo,
  cancelVideoJob,
  createVideoJob,
  defaultModel,
  enhanceVideoPrompt,
  fieldEnabled,
  fieldOptions,
  flattenJobVideos,
  formatGenerationError,
  getModelEntry,
  listVideoJobs,
  loadVideoCatalog,
  modelsForCapability,
  pollVideoJob,
  promptStats,
  uploadVideoFrame,
  validationMessage,
} from '../utils/videoGeneration.js'
import { notifyLibraryChanged } from '../utils/library.js'

function Label({ children }) {
  return (
    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
      {children}
    </label>
  )
}

function Chip({ active, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-center text-xs font-medium transition ${
        active
          ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
          : 'border-border-default bg-surface text-text-secondary hover:border-white/10 hover:text-text-primary'
      } ${className}`}
    >
      {children}
    </button>
  )
}

async function downloadVideo(item) {
  if (!item?.url) return
  try {
    const res = await fetch(item.url)
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = item.fileName || 'admart-video.mp4'
    a.click()
    URL.revokeObjectURL(a.href)
  } catch {
    window.open(item.url, '_blank', 'noopener,noreferrer')
  }
}

function ChevronDown({ open }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-text-muted transition ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ModelPicker({ models, value, onChange }) {
  const rootRef = useRef(null)
  const [open, setOpen] = useState(false)
  const selected = models.find((m) => m.id === value) || models[0]

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-3 rounded-xl border bg-input px-3 py-2.5 text-left transition ${
          open
            ? 'border-accent-blue ring-1 ring-accent-blue'
            : 'border-border-default hover:border-white/15'
        }`}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text-primary">
            {selected?.label || 'Select model'}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-text-tertiary">
            {selected?.strength || selected?.family || selected?.inputs}
          </p>
        </div>
        <ChevronDown open={open} />
      </button>
      {open ? (
        <ul className="absolute left-0 right-0 z-40 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-border-default bg-panel p-1 shadow-xl shadow-black/40">
          {models.map((m) => {
            const active = m.id === value
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(m.id)
                    setOpen(false)
                  }}
                  className={`flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition ${
                    active
                      ? 'bg-accent-blue/15 text-accent-blue'
                      : 'text-text-secondary hover:bg-elevated hover:text-text-primary'
                  }`}
                >
                  <span className="text-sm font-medium">{m.label}</span>
                  <span className="mt-0.5 text-[11px] opacity-80">
                    {m.strength || m.inputs}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

function FrameUpload({ label, preview, onPick, onClear, disabled }) {
  const inputRef = useRef(null)
  return (
    <div>
      <Label>{label}</Label>
      {preview ? (
        <div className="relative overflow-hidden rounded-xl border border-border-default">
          <img src={preview} alt="" className="h-36 w-full object-cover" />
          <button
            type="button"
            disabled={disabled}
            onClick={onClear}
            className="absolute right-2 top-2 rounded-lg bg-black/60 px-2 py-1 text-[11px] text-white"
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="flex h-36 w-full flex-col items-center justify-center rounded-xl border border-dashed border-border-default bg-input text-sm text-text-tertiary transition hover:border-accent-blue/40 hover:text-text-secondary disabled:opacity-50"
        >
          <span>Drop or click to upload</span>
          <span className="mt-1 text-[11px]">JPEG / PNG / WebP · max {MAX_FILE_MB}MB</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MIME.join(',')}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onPick(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}

export default function VideoGenPage() {
  const navigate = useNavigate()
  const [project, setProject] = useState(getCachedActiveProject)
  const [capability, setCapability] = useState('textToVideo')
  const [model, setModel] = useState('')
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [duration, setDuration] = useState('')
  const [aspectRatio, setAspectRatio] = useState('')
  const [resolution, setResolution] = useState('')
  const [generateAudio, setGenerateAudio] = useState(true)
  const [seed, setSeed] = useState('')
  const [startPreview, setStartPreview] = useState('')
  const [endPreview, setEndPreview] = useState('')
  const [startUrl, setStartUrl] = useState('')
  const [endUrl, setEndUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [enhancingPrompt, setEnhancingPrompt] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [error, setError] = useState('')
  const [gallery, setGallery] = useState([])
  const [savedKeys, setSavedKeys] = useState(() => new Set())
  const [creditsRemaining, setCreditsRemaining] = useState(null)
  const [byCapability, setByCapability] = useState(null)
  const [catalog, setCatalog] = useState(DEFAULT_VIDEO_CATALOG)

  useEffect(() => {
    let cancelled = false
    loadVideoCatalog().then((data) => {
      if (!cancelled && data) setCatalog(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const sync = () => setProject(getCachedActiveProject())
    window.addEventListener(PROJECT_CHANGE_EVENT, sync)
    return () => window.removeEventListener(PROJECT_CHANGE_EVENT, sync)
  }, [])

  useEffect(() => {
    getCredits()
      .then((b) => {
        if (b) setCreditsRemaining(b.creditsRemaining)
      })
      .catch(() => {})
    getCreditCosts()
      .then((c) => setByCapability(c?.byCapability || null))
      .catch(() => {})
    const onCredits = (e) => {
      if (e.detail?.creditsRemaining != null) setCreditsRemaining(e.detail.creditsRemaining)
    }
    window.addEventListener(CREDITS_CHANGE_EVENT, onCredits)
    return () => window.removeEventListener(CREDITS_CHANGE_EVENT, onCredits)
  }, [])

  const models = useMemo(
    () => modelsForCapability(capability, catalog),
    [capability, catalog],
  )

  useEffect(() => {
    const next = defaultModel(capability, catalog)
    setModel(next || '')
  }, [capability, catalog])

  const entry = useMemo(
    () => getModelEntry(capability, model, catalog),
    [capability, model, catalog],
  )

  useEffect(() => {
    if (!entry) return
    const durs = fieldOptions(entry, 'duration')
    const aspects = fieldOptions(entry, 'aspectRatio')
    const resos = fieldOptions(entry, 'resolution')
    setDuration(durs?.[0] || '')
    setAspectRatio(aspects?.[0] || '')
    setResolution(resos?.[0] || '')
    setGenerateAudio(Boolean(entry.fields?.generateAudio))
  }, [entry?.id])

  const reloadGallery = useCallback(async () => {
    const pid = project?.id
    if (!pid) return
    try {
      const jobs = await listVideoJobs(pid, 24)
      setGallery(flattenJobVideos(jobs))
    } catch {
      // ignore
    }
  }, [project?.id])

  useEffect(() => {
    reloadGallery()
  }, [reloadGallery])

  const estimatedCost = estimateJobCost(byCapability, capability, 1)
  const canGo = canGenerateVideo({
    capability,
    prompt,
    startImageUrl: startUrl,
    endImageUrl: endUrl,
    modelId: model,
  })
  const blockReason = validationMessage({
    capability,
    prompt,
    startImageUrl: startUrl,
    endImageUrl: endUrl,
    modelId: model,
  })

  const pickFrame = async (which, file) => {
    if (!project?.id) {
      setError('Select a project first.')
      return
    }
    if (!ACCEPTED_MIME.includes(file.type)) {
      setError('Only JPEG, PNG, or WebP images are allowed.')
      return
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_FILE_MB}MB.`)
      return
    }
    const local = URL.createObjectURL(file)
    if (which === 'start') setStartPreview(local)
    else setEndPreview(local)
    setError('')
    try {
      const uploaded = await uploadVideoFrame(project.id, file)
      if (which === 'start') setStartUrl(uploaded.url)
      else setEndUrl(uploaded.url)
    } catch (err) {
      setError(formatGenerationError(err))
      if (which === 'start') {
        setStartPreview('')
        setStartUrl('')
      } else {
        setEndPreview('')
        setEndUrl('')
      }
    }
  }

  const onGenerate = async () => {
    if (!project?.id) {
      setError('Select a project first.')
      return
    }
    if (!canGo) {
      setError(blockReason || 'Complete required fields.')
      return
    }
    setBusy(true)
    setError('')
    setStatusText('Submitting…')
    try {
      const payload = {
        capability,
        model,
        prompt: prompt.trim(),
      }
      if (startUrl) payload.startImageUrl = startUrl
      if (endUrl) payload.endImageUrl = endUrl
      if (duration) payload.duration = duration
      if (aspectRatio) payload.aspectRatio = aspectRatio
      if (resolution) payload.resolution = resolution
      if (fieldEnabled(entry, 'generateAudio')) payload.generateAudio = generateAudio
      if (fieldEnabled(entry, 'negativePrompt') && negativePrompt.trim()) {
        payload.negativePrompt = negativePrompt.trim()
      }
      if (fieldEnabled(entry, 'seed') && seed !== '') {
        const n = Number(seed)
        if (!Number.isNaN(n)) payload.seed = n
      }

      const job = await createVideoJob(project.id, payload)
      syncCreditsFromPayload(job)
      if (job.creditsRemaining != null) setCreditsRemaining(job.creditsRemaining)
      notifyLibraryChanged({ projectId: project.id, action: 'create' })
      setStatusText('Queued — this can take a few minutes…')
      await reloadGallery()

      const done = await pollVideoJob(project.id, job.id, {
        intervalMs: 3000,
        onTick: undefined,
      })
      if (done.status === 'failed') {
        setError(done.error || 'Generation failed')
        setStatusText('')
      } else {
        setStatusText('Video ready')
        notifyCreditsChanged({ creditsRemaining: creditsRemaining })
      }
      notifyLibraryChanged({ projectId: project.id, action: 'done' })
      await reloadGallery()
    } catch (err) {
      creditsFromApiError(err)
      setError(formatGenerationError(err))
      setStatusText('')
    } finally {
      setBusy(false)
    }
  }

  const onCancel = async (jobId) => {
    if (!project?.id || !jobId) return
    try {
      await cancelVideoJob(project.id, jobId)
      notifyLibraryChanged({ projectId: project.id, action: 'cancel' })
      await reloadGallery()
    } catch (err) {
      setError(formatGenerationError(err))
    }
  }

  const showStart = entry?.inputs === 'image' || entry?.inputs === 'firstLast'
  const showEnd = entry?.inputs === 'firstLast'
  const durations = fieldOptions(entry, 'duration')
  const aspects = fieldOptions(entry, 'aspectRatio')
  const resolutions = fieldOptions(entry, 'resolution')

  const handleEnhancePrompt = () => {
    if (!prompt.trim() || enhancingPrompt) return
    setEnhancingPrompt(true)
    try {
      setPrompt(enhanceVideoPrompt(prompt))
    } finally {
      setEnhancingPrompt(false)
    }
  }

  const resultKey = (item) => item?.url || item?.jobId || ''

  const saveResult = (item) => {
    if (!item?.url) return
    const key = resultKey(item)
    saveGeneratedAsset({
      id: key,
      type: 'video',
      title: (item.prompt || 'Admart video').slice(0, 120),
      prompt: item.prompt || '',
      thumbnailUrl: item.url,
      sourceUrl: item.url,
      jobId: item.jobId,
      status: 'Ready',
    })
    setSavedKeys((prev) => new Set(prev).add(key))
    notifyLibraryChanged({ projectId: project?.id, action: 'save' })
  }

  const goPublish = (item) => {
    if (!item?.url) return
    navigate('/publish', {
      state: {
        type: 'video',
        videoUrl: item.url,
        title: (item.prompt || 'Admart video').slice(0, 120),
        prompt: item.prompt || '',
        model: item.model,
        capability: item.capability,
        jobId: item.jobId,
      },
    })
  }

  const useAsStartFrame = async (item) => {
    // Can't extract frame client-side easily; send user to I2V with hint.
    // Prefer opening library / prompt them — for now switch to imageToVideo tab.
    setCapability('imageToVideo')
    setStatusText('Switched to Image to video — upload a start frame (or use a still from your video).')
  }

  return (
    <AppLayout>
      <Topbar title="AI Video Gen" />
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:flex-row lg:gap-6 lg:p-6">
        {/* Form */}
        <section className="w-full shrink-0 space-y-5 lg:w-[380px] lg:overflow-y-auto lg:pr-1">
          <div>
            <h1 className="font-heading text-xl font-semibold text-text-primary">Generate video</h1>
            <p className="mt-1 text-sm text-text-tertiary">
              Curated fal.ai models — fields adapt to what each model needs.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {VIDEO_CAPABILITIES.map((c) => (
              <Chip
                key={c.id}
                active={capability === c.id}
                onClick={() => {
                  setCapability(c.id)
                  setError('')
                }}
              >
                {c.label}
              </Chip>
            ))}
          </div>
          <p className="text-xs text-text-muted">
            {VIDEO_CAPABILITIES.find((c) => c.id === capability)?.hint}
          </p>

          {showStart ? (
            <FrameUpload
              label={showEnd ? 'Start frame' : 'Start image'}
              preview={startPreview}
              disabled={busy}
              onPick={(f) => pickFrame('start', f)}
              onClear={() => {
                setStartPreview('')
                setStartUrl('')
              }}
            />
          ) : null}

          {showEnd ? (
            <FrameUpload
              label="End frame"
              preview={endPreview}
              disabled={busy}
              onPick={(f) => pickFrame('end', f)}
              onClear={() => {
                setEndPreview('')
                setEndUrl('')
              }}
            />
          ) : null}

          <div>
            <Label>Prompt</Label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                placeholder="Describe the shot, motion, style, and audio if the model supports it…"
                className="min-h-[120px] w-full resize-y rounded-xl border border-border-default bg-input p-3 pb-10 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
              />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleEnhancePrompt}
                  disabled={!prompt.trim() || enhancingPrompt || busy}
                  className="rounded-lg bg-accent-violet px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm shadow-accent-violet/25 transition hover:bg-accent-violet/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {enhancingPrompt ? 'Enhancing…' : '✦ Enhance prompt'}
                </button>
                <span className="font-mono text-xs text-text-muted">
                  {promptStats(prompt).words} words · {promptStats(prompt).chars} chars
                </span>
              </div>
            </div>
          </div>

          <div>
            <Label>Model</Label>
            <ModelPicker models={models} value={model} onChange={setModel} />
          </div>

          {durations?.length ? (
            <div>
              <Label>Duration</Label>
              <div className="flex flex-wrap gap-2">
                {durations.map((d) => (
                  <Chip key={d} active={duration === d} onClick={() => setDuration(d)}>
                    {d}
                  </Chip>
                ))}
              </div>
            </div>
          ) : null}

          {aspects?.length ? (
            <div>
              <Label>Aspect ratio</Label>
              <div className="flex flex-wrap gap-2">
                {aspects.map((a) => (
                  <Chip key={a} active={aspectRatio === a} onClick={() => setAspectRatio(a)}>
                    {a}
                  </Chip>
                ))}
              </div>
            </div>
          ) : null}

          {resolutions?.length ? (
            <div>
              <Label>Resolution</Label>
              <div className="flex flex-wrap gap-2">
                {resolutions.map((r) => (
                  <Chip key={r} active={resolution === r} onClick={() => setResolution(r)}>
                    {r}
                  </Chip>
                ))}
              </div>
            </div>
          ) : null}

          {fieldEnabled(entry, 'generateAudio') ? (
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={generateAudio}
                onChange={(e) => setGenerateAudio(e.target.checked)}
                className="rounded border-border-default"
              />
              Generate audio
            </label>
          ) : null}

          {fieldEnabled(entry, 'negativePrompt') ? (
            <div>
              <Label>Negative prompt</Label>
              <input
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-sm text-text-primary"
                placeholder="Things to avoid…"
              />
            </div>
          ) : null}

          {fieldEnabled(entry, 'seed') ? (
            <div>
              <Label>Seed (optional)</Label>
              <input
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                className="w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-sm text-text-primary"
                placeholder="Random"
              />
            </div>
          ) : null}

          {error ? (
            <p className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </p>
          ) : null}
          {statusText ? <p className="text-sm text-text-tertiary">{statusText}</p> : null}

          <button
            type="button"
            disabled={busy || !canGo || !project?.id}
            onClick={onGenerate}
            className="w-full rounded-xl bg-accent-blue px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? 'Generating…' : 'Generate video'}
          </button>
          <p className="text-center text-xs text-text-muted">
            {estimatedCost != null ? `~${estimatedCost} credits` : '—'}
            {creditsRemaining != null ? ` · ${creditsRemaining} left` : ''}
            {!canGo && blockReason ? ` · ${blockReason}` : ''}
          </p>
        </section>

        {/* Results */}
        <section className="min-h-[320px] flex-1 rounded-2xl border border-border-default bg-panel/40 p-4 lg:overflow-y-auto">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">Recent videos</h2>
            <button
              type="button"
              onClick={reloadGallery}
              className="text-xs text-text-tertiary hover:text-text-secondary"
            >
              Refresh
            </button>
          </div>
          {!gallery.length ? (
            <div className="flex h-64 flex-col items-center justify-center text-center text-sm text-text-muted">
              <p>No videos yet for this project.</p>
              <p className="mt-1 text-xs">Generate with a prompt — or add frames for image models.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {gallery.map((item) => {
                const ready = item.status === 'succeeded' && item.url
                const saved = savedKeys.has(resultKey(item))
                return (
                  <article
                    key={item.id}
                    className="group overflow-hidden rounded-xl border border-border-default bg-surface"
                  >
                    <div className="relative aspect-video bg-black/40">
                      {item.url ? (
                        <video
                          src={item.url}
                          controls
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-text-muted">
                          {item.status === 'failed' ? item.error || 'Failed' : item.status}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 p-3">
                      <p className="line-clamp-2 text-xs text-text-secondary">
                        {item.prompt || 'Untitled'}
                      </p>
                      <p className="truncate text-[11px] text-text-muted">{item.model}</p>
                      {ready ? (
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => saveResult(item)}
                            className="rounded-lg border border-border-default px-2 py-1 text-[11px] text-text-secondary hover:bg-elevated hover:text-text-primary"
                          >
                            {saved ? 'Saved' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadVideo(item)}
                            className="rounded-lg border border-border-default px-2 py-1 text-[11px] text-text-secondary hover:bg-elevated hover:text-text-primary"
                          >
                            Download
                          </button>
                          <button
                            type="button"
                            onClick={() => goPublish(item)}
                            className="rounded-lg border border-border-default px-2 py-1 text-[11px] text-text-secondary hover:bg-elevated hover:text-text-primary"
                          >
                            Publish
                          </button>
                          <button
                            type="button"
                            onClick={() => useAsStartFrame(item)}
                            className="rounded-lg border border-border-default px-2 py-1 text-[11px] text-text-secondary hover:bg-elevated hover:text-text-primary"
                          >
                            Use in I2V
                          </button>
                        </div>
                      ) : null}
                      {(item.status === 'queued' || item.status === 'running') && (
                        <button
                          type="button"
                          onClick={() => onCancel(item.jobId)}
                          className="text-[11px] text-error hover:underline"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
