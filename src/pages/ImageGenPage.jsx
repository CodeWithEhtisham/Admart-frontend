import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Topbar from '../components/Topbar'
import {
  PROJECT_CHANGE_EVENT,
  getCachedActiveProject,
} from '../utils/projects'
import {
  ACCEPTED_MIME,
  ASPECT_RATIOS,
  IMAGE_CAPABILITIES,
  MAX_FILE_MB,
  MAX_MULTI_IMAGES,
  MAX_PROMPT_LENGTH,
  MULTI_EDIT_ROLES,
  canGenerate,
  createImageJob,
  defaultModel,
  ensureRemoteImageUrls,
  fieldVisible,
  imageApiError,
  isRemoteUrl,
  listImageJobs,
  modelFamily,
  modelsForCapability,
  pollImageJob,
  sourceRemoteUrl,
  validationMessage,
} from '../utils/imageGeneration.js'

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

function Checkerboard({ className = '' }) {
  return (
    <div
      className={`absolute inset-0 opacity-40 ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(45deg, #3f3f46 25%, transparent 25%), linear-gradient(-45deg, #3f3f46 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #3f3f46 75%), linear-gradient(-45deg, transparent 75%, #3f3f46 75%)',
        backgroundSize: '16px 16px',
        backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
      }}
    />
  )
}

function ActionBtn({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
    >
      {children}
    </button>
  )
}

function previewSrc(img) {
  if (!img) return null
  if (img.previewUrl) return img.previewUrl
  if (img.url && (img.url.startsWith('blob:') || isRemoteUrl(img.url))) return img.url
  return sourceRemoteUrl(img)
}

async function downloadAsset(img) {
  if (!img?.url) return
  try {
    const res = await fetch(img.url)
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = img.fileName || 'admart-image.png'
    a.click()
    URL.revokeObjectURL(a.href)
  } catch {
    window.open(img.url, '_blank', 'noopener,noreferrer')
  }
}

export default function ImageGenPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const abortRef = useRef(null)

  const [activeProject, setActiveProject] = useState(getCachedActiveProject)
  const projectId = activeProject?.id

  const [capability, setCapability] = useState('textToImage')
  const [model, setModel] = useState(defaultModel('textToImage'))
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [numImages, setNumImages] = useState(1)
  const [resolution, setResolution] = useState('1K')
  const [seed, setSeed] = useState('')
  const [outputFormat, setOutputFormat] = useState('png')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [guidanceScale, setGuidanceScale] = useState(3.5)
  const [numInferenceSteps, setNumInferenceSteps] = useState(28)
  const [style, setStyle] = useState('AUTO')
  const [renderingSpeed, setRenderingSpeed] = useState('BALANCED')
  const [scale, setScale] = useState(2)
  const [faceEnhance, setFaceEnhance] = useState(true)
  const [rembgModel, setRembgModel] = useState('light')
  const [operatingResolution, setOperatingResolution] = useState('1024x1024')
  const [refineForeground, setRefineForeground] = useState(true)
  const [outputMask, setOutputMask] = useState(false)

  // { id, previewUrl?, remoteUrl?, file?, name }
  const [imageUrls, setImageUrls] = useState([])
  const [jobStatus, setJobStatus] = useState('idle')
  const [jobError, setJobError] = useState(null)
  const [results, setResults] = useState([])
  const [history, setHistory] = useState([])
  const [lastPrompt, setLastPrompt] = useState('')

  const family = modelFamily(model)
  const models = modelsForCapability(capability)
  const capMeta = IMAGE_CAPABILITIES.find((c) => c.id === capability)
  const showPrompt = fieldVisible('prompt', capability, family)
  const showImages = fieldVisible('imageUrls', capability, family)
  const showAspect = fieldVisible('aspectRatio', capability, family)
  const showResolution = fieldVisible('resolution', capability, family)
  const showNumImages = fieldVisible('numImages', capability, family)
  const showSeed = fieldVisible('seed', capability, family)
  const showGuidance = fieldVisible('guidance', capability, family)
  const showIdeogram = fieldVisible('ideogram', capability, family)
  const showUpscaleOpts = fieldVisible('upscaleOpts', capability, family)
  const showRembgOpts = fieldVisible('rembgOpts', capability, family)

  const formState = useMemo(
    () => ({ capability, prompt, imageUrls }),
    [capability, prompt, imageUrls],
  )
  const ready = Boolean(projectId) && canGenerate(formState)
  const blockReason = !projectId
    ? 'Select or create a project first.'
    : validationMessage(formState)
  const isBusy =
    jobStatus === 'queued' ||
    jobStatus === 'running' ||
    jobStatus === 'uploading'

  useEffect(() => {
    const onChange = (e) => setActiveProject(e.detail || getCachedActiveProject())
    window.addEventListener(PROJECT_CHANGE_EVENT, onChange)
    return () => window.removeEventListener(PROJECT_CHANGE_EVENT, onChange)
  }, [])

  useEffect(() => {
    if (!projectId) return undefined
    let cancelled = false
    ;(async () => {
      const jobs = await listImageJobs(projectId, { limit: 12 })
      if (cancelled || !Array.isArray(jobs)) return
      const thumbs = jobs
        .filter((j) => j.status === 'succeeded' && j.images?.length)
        .flatMap((j) =>
          j.images.map((img) => ({
            ...img,
            _transparent: j.capability === 'removeBackground',
            _prompt: j.prompt,
          })),
        )
        .slice(0, 12)
      if (thumbs.length) setHistory(thumbs)
    })()
    return () => {
      cancelled = true
    }
  }, [projectId])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      imageUrls.forEach((img) => {
        if (img.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(img.previewUrl)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cleanup on unmount only
  }, [])

  const switchCapability = (id) => {
    setCapability(id)
    setModel(defaultModel(id))
    setJobError(null)
    if (id === 'multiEdit' && imageUrls.length > MAX_MULTI_IMAGES) {
      setImageUrls((prev) => prev.slice(0, MAX_MULTI_IMAGES))
    }
  }

  const revokePreview = (img) => {
    if (img?.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(img.previewUrl)
  }

  const addFiles = (fileList) => {
    const files = Array.from(fileList || [])
    const accepted = []
    for (const file of files) {
      if (!ACCEPTED_MIME.includes(file.type)) {
        setJobError(`Unsupported type: ${file.name}. Use JPEG, PNG, or WebP.`)
        continue
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setJobError(`${file.name} exceeds ${MAX_FILE_MB} MB.`)
        continue
      }
      accepted.push({
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${file.name}`,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
        file,
      })
    }
    if (!accepted.length) return

    setImageUrls((prev) => {
      const max =
        capability === 'multiEdit'
          ? MAX_MULTI_IMAGES
          : capability === 'edit' ||
              capability === 'upscale' ||
              capability === 'removeBackground'
            ? 1
            : MAX_MULTI_IMAGES
      if (max === 1) {
        prev.forEach(revokePreview)
        return accepted.slice(0, 1)
      }
      return [...prev, ...accepted].slice(0, max)
    })
    setJobError(null)
  }

  const removeImage = (id) => {
    setImageUrls((prev) => {
      const target = prev.find((i) => i.id === id)
      revokePreview(target)
      return prev.filter((i) => i.id !== id)
    })
  }

  const chainTo = (nextCapability, assets) => {
    setCapability(nextCapability)
    setModel(defaultModel(nextCapability))
    setImageUrls(
      assets.map((u, i) => ({
        id: `chain_${Date.now()}_${i}`,
        previewUrl: u.url,
        remoteUrl: u.url,
        url: u.url,
        name: u.fileName || `result-${i + 1}.png`,
        chained: true,
      })),
    )
    setPrompt('')
    setResults([])
    setJobStatus('idle')
    setJobError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const buildPayload = (remoteUrls) => {
    const payload = { capability, model }
    if (showPrompt) payload.prompt = prompt.trim()
    if (showImages) payload.imageUrls = remoteUrls
    if (showAspect) payload.aspectRatio = aspectRatio
    if (showNumImages) payload.numImages = numImages
    if (showResolution) payload.resolution = resolution
    if (showAdvanced && showSeed && seed !== '') payload.seed = Number(seed)
    if (showAdvanced || showRembgOpts) payload.outputFormat = showRembgOpts ? 'png' : outputFormat
    if (showGuidance && showAdvanced) {
      payload.guidanceScale = guidanceScale
      payload.numInferenceSteps = numInferenceSteps
    }
    if (showIdeogram && showAdvanced) {
      payload.style = style
      payload.renderingSpeed = renderingSpeed
      if (negativePrompt.trim()) payload.negativePrompt = negativePrompt.trim()
    }
    if (showUpscaleOpts) {
      payload.scale = scale
      payload.faceEnhance = faceEnhance
    }
    if (showRembgOpts) {
      payload.rembgModel = rembgModel
      payload.operatingResolution = operatingResolution
      payload.refineForeground = refineForeground
      payload.outputMask = outputMask
      payload.outputFormat = 'png'
    }
    return payload
  }

  const handleGenerate = async () => {
    if (!ready || isBusy) return
    if (!projectId) {
      setJobError('Select or create a project first.')
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setJobError(null)
    setResults([])
    setLastPrompt(prompt.trim())

    try {
      let remoteUrls = []
      if (showImages) {
        setJobStatus('uploading')
        remoteUrls = await ensureRemoteImageUrls(projectId, imageUrls)
        // refresh previews that now have remoteUrl
        setImageUrls((prev) =>
          prev.map((img, i) =>
            remoteUrls[i]
              ? { ...img, remoteUrl: remoteUrls[i] }
              : img,
          ),
        )
      }

      setJobStatus('queued')
      const payload = buildPayload(remoteUrls)
      const job = await createImageJob(projectId, payload)
      const jobId = job.id || job.jobId
      if (!jobId) throw new Error('No job id returned from server.')

      if (job.status === 'running') setJobStatus('running')

      const done = await pollImageJob(projectId, jobId, {
        signal: controller.signal,
        onUpdate: (j) => {
          if (j.status === 'running') setJobStatus('running')
          else if (j.status === 'queued') setJobStatus('queued')
        },
      })

      if (done.status === 'failed') {
        setJobStatus('failed')
        setJobError(done.error || 'Generation failed. Adjust settings and try again.')
        return
      }

      const images = (done.images || []).map((img) => ({
        ...img,
        _transparent: done.capability === 'removeBackground',
        _prompt: done.prompt || prompt.trim(),
      }))
      setResults(images)
      setHistory((h) => [...images, ...h].slice(0, 12))
      setJobStatus('succeeded')
    } catch (err) {
      if (err?.name === 'AbortError') return
      setJobStatus('failed')
      setJobError(imageApiError(err))
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    addFiles(e.dataTransfer.files)
  }

  return (
    <AppLayout>
      <div className="flex min-h-screen flex-col">
        <Topbar title="Image Studio" />

        <div className="border-b border-border bg-panel px-6">
          <div className="flex flex-wrap items-center justify-between gap-2 py-2">
            <div className="flex gap-1 overflow-x-auto">
              {IMAGE_CAPABILITIES.map((c) => {
                const active = capability === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => switchCapability(c.id)}
                    className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                      active
                        ? 'bg-accent-blue/15 text-accent-blue'
                        : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                    }`}
                  >
                    {c.label}
                  </button>
                )
              })}
            </div>
            <p className="shrink-0 text-xs text-text-muted">
              Project:{' '}
              <span className="font-medium text-text-secondary">
                {activeProject?.name || 'None'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex w-[380px] shrink-0 flex-col border-r border-border bg-panel">
            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              {!projectId && (
                <div className="rounded-xl border border-warning/30 bg-warning/10 px-3 py-2.5 text-xs text-warning">
                  No active project.{' '}
                  <Link to="/onboarding" className="underline hover:text-text-primary">
                    Create one
                  </Link>{' '}
                  or pick a project in the sidebar.
                </div>
              )}

              {showImages && (
                <div>
                  <Label>
                    {capability === 'multiEdit'
                      ? `Source images (${imageUrls.length}/${MAX_MULTI_IMAGES})`
                      : 'Source image'}
                  </Label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer rounded-xl border border-dashed border-border-default bg-input/60 px-4 py-6 text-center transition hover:border-accent-blue/40 hover:bg-input"
                  >
                    <p className="text-sm font-medium text-text-secondary">
                      Drop image{capability === 'multiEdit' ? 's' : ''} or click to upload
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      JPEG, PNG, WebP · max {MAX_FILE_MB} MB
                      {capability === 'multiEdit' ? ' · min 2' : ''}
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_MIME.join(',')}
                    multiple={capability === 'multiEdit'}
                    className="hidden"
                    onChange={(e) => {
                      addFiles(e.target.files)
                      e.target.value = ''
                    }}
                  />

                  {imageUrls.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {imageUrls.map((img, idx) => (
                        <div
                          key={img.id}
                          className="group relative overflow-hidden rounded-lg border border-border-default bg-surface"
                        >
                          {previewSrc(img) ? (
                            <img
                              src={previewSrc(img)}
                              alt=""
                              className="aspect-square w-full object-cover"
                            />
                          ) : (
                            <div className="aspect-square bg-elevated" />
                          )}
                          {capability === 'multiEdit' && (
                            <span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                              {MULTI_EDIT_ROLES[idx] || `Image ${idx + 1}`}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeImage(img.id)
                            }}
                            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white opacity-0 transition group-hover:opacity-100"
                            aria-label="Remove"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {showPrompt && (
                <div>
                  <Label>Prompt</Label>
                  <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value.slice(0, MAX_PROMPT_LENGTH))}
                      placeholder={
                        capability === 'edit'
                          ? 'e.g. Replace the background with a soft beige studio backdrop'
                          : capability === 'multiEdit'
                            ? 'e.g. Place the person from image 1 into the cafe from image 2…'
                            : 'e.g. Product shot of a matte black water bottle on marble, soft studio light'
                      }
                      className="min-h-[110px] w-full resize-y rounded-xl border border-border-default bg-input p-3 pb-7 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                    />
                    <span className="pointer-events-none absolute bottom-2 right-3 font-mono text-xs text-text-muted">
                      {prompt.length} / {MAX_PROMPT_LENGTH}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <Label>Model</Label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                      {m.strength ? ` — ${m.strength}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {showAspect && (
                <div>
                  <Label>Aspect ratio</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {ASPECT_RATIOS.map((a) => (
                      <Chip
                        key={a.id}
                        active={aspectRatio === a.id}
                        onClick={() => setAspectRatio(a.id)}
                      >
                        <span className="block font-semibold text-text-primary">{a.label}</span>
                        <span className="text-[10px] text-text-tertiary">{a.sub}</span>
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {showResolution && (
                <div>
                  <Label>Resolution</Label>
                  <div className="flex gap-2">
                    {['0.5K', '1K', '2K', '4K'].map((r) => (
                      <Chip
                        key={r}
                        active={resolution === r}
                        onClick={() => setResolution(r)}
                        className="flex-1"
                      >
                        {r}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {showNumImages && (
                <div>
                  <Label>Number of images</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((n) => (
                      <Chip
                        key={n}
                        active={numImages === n}
                        onClick={() => setNumImages(n)}
                        className="flex h-10 w-10 items-center justify-center p-0"
                      >
                        {n}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {showUpscaleOpts && (
                <>
                  <div>
                    <Label>Scale</Label>
                    <div className="flex gap-2">
                      {[2, 4].map((s) => (
                        <Chip key={s} active={scale === s} onClick={() => setScale(s)} className="flex-1">
                          {s}×
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border-default bg-surface px-3 py-2.5">
                    <span className="text-sm text-text-secondary">Face enhance</span>
                    <input
                      type="checkbox"
                      checked={faceEnhance}
                      onChange={(e) => setFaceEnhance(e.target.checked)}
                      className="h-4 w-4 accent-accent-blue"
                    />
                  </label>
                </>
              )}

              {showRembgOpts && (
                <>
                  <div>
                    <Label>Quality</Label>
                    <div className="flex gap-2">
                      {[
                        { id: 'light', label: 'Light' },
                        { id: 'heavy', label: 'Heavy' },
                        { id: 'portrait', label: 'Portrait' },
                      ].map((o) => (
                        <Chip
                          key={o.id}
                          active={rembgModel === o.id}
                          onClick={() => setRembgModel(o.id)}
                          className="flex-1"
                        >
                          {o.label}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Operating resolution</Label>
                    <div className="flex gap-2">
                      {['1024x1024', '2048x2048'].map((r) => (
                        <Chip
                          key={r}
                          active={operatingResolution === r}
                          onClick={() => setOperatingResolution(r)}
                          className="flex-1"
                        >
                          {r.replace('x', ' × ')}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border-default bg-surface px-3 py-2.5">
                    <span className="text-sm text-text-secondary">Refine foreground</span>
                    <input
                      type="checkbox"
                      checked={refineForeground}
                      onChange={(e) => setRefineForeground(e.target.checked)}
                      className="h-4 w-4 accent-accent-blue"
                    />
                  </label>
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border-default bg-surface px-3 py-2.5">
                    <span className="text-sm text-text-secondary">Output mask</span>
                    <input
                      type="checkbox"
                      checked={outputMask}
                      onChange={(e) => setOutputMask(e.target.checked)}
                      className="h-4 w-4 accent-accent-blue"
                    />
                  </label>
                </>
              )}

              {(showSeed || showGuidance || showIdeogram) && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((v) => !v)}
                    className="text-xs font-medium text-text-secondary transition hover:text-text-primary"
                  >
                    {showAdvanced ? '▾ Hide advanced' : '▸ Advanced'}
                  </button>
                  {showAdvanced && (
                    <div className="mt-3 space-y-3 rounded-xl border border-border-default bg-surface/50 p-3">
                      {showSeed && (
                        <div>
                          <Label>Seed</Label>
                          <input
                            type="number"
                            value={seed}
                            onChange={(e) => setSeed(e.target.value)}
                            placeholder="Random"
                            className="w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm focus:border-accent-blue focus:outline-none"
                          />
                        </div>
                      )}
                      <div>
                        <Label>Output format</Label>
                        <div className="flex gap-2">
                          {['png', 'jpeg', 'webp'].map((f) => (
                            <Chip
                              key={f}
                              active={outputFormat === f}
                              onClick={() => setOutputFormat(f)}
                              className="flex-1 uppercase"
                            >
                              {f}
                            </Chip>
                          ))}
                        </div>
                      </div>
                      {showGuidance && (
                        <>
                          <div>
                            <Label>Guidance scale ({guidanceScale})</Label>
                            <input
                              type="range"
                              min={1}
                              max={10}
                              step={0.5}
                              value={guidanceScale}
                              onChange={(e) => setGuidanceScale(Number(e.target.value))}
                              className="w-full accent-accent-blue"
                            />
                          </div>
                          <div>
                            <Label>Inference steps ({numInferenceSteps})</Label>
                            <input
                              type="range"
                              min={4}
                              max={50}
                              value={numInferenceSteps}
                              onChange={(e) => setNumInferenceSteps(Number(e.target.value))}
                              className="w-full accent-accent-blue"
                            />
                          </div>
                        </>
                      )}
                      {showIdeogram && (
                        <>
                          <div>
                            <Label>Negative prompt</Label>
                            <textarea
                              value={negativePrompt}
                              onChange={(e) => setNegativePrompt(e.target.value)}
                              placeholder="Things to exclude…"
                              className="min-h-[64px] w-full resize-y rounded-lg border border-border-default bg-input p-2 text-sm focus:border-accent-blue focus:outline-none"
                            />
                          </div>
                          <div>
                            <Label>Style</Label>
                            <select
                              value={style}
                              onChange={(e) => setStyle(e.target.value)}
                              className="w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm"
                            >
                              {['AUTO', 'GENERAL', 'REALISTIC', 'DESIGN'].map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label>Rendering speed</Label>
                            <div className="flex gap-2">
                              {['TURBO', 'BALANCED', 'QUALITY'].map((s) => (
                                <Chip
                                  key={s}
                                  active={renderingSpeed === s}
                                  onClick={() => setRenderingSpeed(s)}
                                  className="flex-1 text-[10px]"
                                >
                                  {s}
                                </Chip>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-border bg-panel p-4">
              {jobError && (
                <p className="mb-2 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-xs text-error">
                  {jobError}
                  {(jobError.includes('credits') || jobError.includes('Credits')) && (
                    <>
                      {' '}
                      <Link to="/billing" className="underline">
                        Billing
                      </Link>
                    </>
                  )}
                </p>
              )}
              {!ready && blockReason && (
                <p className="mb-2 text-center text-xs text-text-tertiary">{blockReason}</p>
              )}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!ready || isBusy}
                className="w-full rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet px-5 py-3 text-sm font-bold text-white shadow-lg shadow-accent-violet/20 transition hover:opacity-90 disabled:opacity-50 disabled:shadow-none"
              >
                {isBusy
                  ? jobStatus === 'uploading'
                    ? 'Uploading…'
                    : jobStatus === 'queued'
                      ? 'Queued…'
                      : 'Generating…'
                  : capability === 'removeBackground'
                    ? 'Remove background'
                    : capability === 'upscale'
                      ? `Upscale ${scale}×`
                      : 'Generate'}
              </button>
              <p className="mt-2 text-center font-mono text-[11px] text-text-muted">
                {capMeta?.label} · live API
              </p>
            </div>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto bg-base p-7">
            <div className="mb-6">
              <h2 className="font-heading text-lg font-semibold text-text-primary">Canvas</h2>
              <p className="text-sm text-text-tertiary">
                {capability === 'textToImage' && 'Prompt → new image'}
                {capability === 'edit' && 'Prompt + image → edited result'}
                {capability === 'multiEdit' && 'Compose / transfer across multiple images'}
                {capability === 'upscale' && 'Higher resolution'}
                {capability === 'removeBackground' && 'Transparent PNG · checkerboard preview'}
              </p>
            </div>

            {jobStatus === 'idle' && results.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center pb-16">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border-default bg-surface text-3xl text-text-muted">
                  {showImages ? '⇪' : '✦'}
                </div>
                <h3 className="mt-4 font-heading text-xl font-semibold text-text-secondary">
                  {showImages ? 'Add a source image to start' : 'Describe what you want to create'}
                </h3>
                <p className="mt-1 max-w-sm text-center text-sm text-text-tertiary">
                  Results appear here. Chain any output into Edit, Upscale, or Remove BG.
                </p>
              </div>
            )}

            {isBusy && (
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: showNumImages ? numImages : 1 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-border-default bg-surface"
                  >
                    <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-accent-violet/20 border-t-accent-violet" />
                    <p className="mt-3 text-xs text-text-tertiary">
                      {jobStatus === 'uploading'
                        ? 'Uploading…'
                        : jobStatus === 'queued'
                          ? 'Queued…'
                          : 'Generating…'}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {jobStatus === 'succeeded' && results.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {results.map((img, i) => (
                    <div
                      key={img.url || img.fileName || i}
                      className="group relative overflow-hidden rounded-2xl border border-border-default bg-surface"
                    >
                      <div className="relative aspect-square bg-elevated">
                        {(img._transparent || capability === 'removeBackground') && (
                          <Checkerboard />
                        )}
                        {img.url ? (
                          <img
                            src={img.url}
                            alt=""
                            className="absolute inset-0 h-full w-full object-contain"
                          />
                        ) : null}
                      </div>

                      <div className="pointer-events-none absolute inset-0 flex flex-wrap items-center justify-center gap-1.5 bg-black/65 p-3 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
                        <ActionBtn onClick={() => downloadAsset(img)}>Download</ActionBtn>
                        <ActionBtn onClick={() => chainTo('edit', [img])}>Edit</ActionBtn>
                        <ActionBtn onClick={() => chainTo('upscale', [img])}>Upscale</ActionBtn>
                        <ActionBtn onClick={() => chainTo('removeBackground', [img])}>
                          Remove BG
                        </ActionBtn>
                        <ActionBtn
                          onClick={() =>
                            chainTo(capability === 'multiEdit' ? 'multiEdit' : 'edit', [img])
                          }
                        >
                          Use as input
                        </ActionBtn>
                        <ActionBtn onClick={() => navigate('/create')}>Use in video</ActionBtn>
                      </div>

                      <div className="border-t border-border px-3 py-2">
                        <p className="truncate text-xs text-text-secondary">
                          {lastPrompt?.slice(0, 80) ||
                            img._prompt?.slice(0, 80) ||
                            img.fileName ||
                            'Result'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {history.length > 0 && (
                  <div className="mt-8">
                    <h3 className="mb-3 text-sm font-semibold text-text-secondary">Recent</h3>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {history.map((img, i) => (
                        <button
                          key={`${img.url}_${i}`}
                          type="button"
                          onClick={() => chainTo('edit', [img])}
                          title="Use as edit input"
                          className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-elevated transition hover:ring-2 hover:ring-accent-blue/50"
                        >
                          {img._transparent && <Checkerboard />}
                          {img.url ? (
                            <img src={img.url} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {jobStatus === 'failed' && !jobError && (
              <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                Generation failed. Adjust settings and try again.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
