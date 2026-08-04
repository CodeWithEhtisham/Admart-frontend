import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Topbar from '../components/Topbar'
import {
  PROJECT_CHANGE_EVENT,
  getCachedActiveProject,
} from '../utils/projects'
import {
  CREDITS_CHANGE_EVENT,
  creditsFromApiError,
  estimateJobCost,
  formatCredits,
  getCreditCosts,
  getCredits,
  notifyCreditsChanged,
  quoteCredits,
  syncCreditsFromPayload,
} from '../utils/credits.js'
import {
  ACCEPTED_MIME,
  ASPECT_RATIOS,
  IMAGE_CAPABILITIES,
  MAX_FILE_MB,
  MAX_MULTI_IMAGES,
  MULTI_EDIT_ROLES,
  canGenerate,
  createImageJob,
  defaultModel,
  enhanceImagePrompt,
  ensureRemoteImageUrls,
  fieldVisible,
  flattenJobImages,
  formatGenerationError,
  getImageCatalog,
  imageApiError,
  isRemoteUrl,
  listImageJobs,
  loadImageCatalog,
  modelFamily,
  modelsForCapability,
  pollImageJob,
  promptStats,
  sourceRemoteUrl,
  validationMessage,
} from '../utils/imageGeneration.js'
import { saveGeneratedAsset } from '../utils/generatedAssets.js'
import { notifyLibraryChanged } from '../utils/library.js'
import {
  enhancePromptRemote,
  promptEnhancementError,
} from '../utils/promptEnhancement.js'

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

function ModelPicker({ models, value, onChange, costsByModel = {} }) {
  const rootRef = useRef(null)
  const [open, setOpen] = useState(false)
  const selected = models.find((m) => m.id === value) || models[0]

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close the popover when the model catalog changes.
    setOpen(false)
  }, [models])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
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
          {selected?.strength ? (
            <p className="mt-0.5 truncate text-[11px] text-text-tertiary">{selected.strength}</p>
          ) : selected?.family ? (
            <p className="mt-0.5 truncate text-[11px] capitalize text-text-tertiary">
              {selected.family}
            </p>
          ) : null}
          {costsByModel[selected?.id]?.credits ? (
            <p className="mt-0.5 text-[11px] text-text-tertiary">
              From {formatCredits(costsByModel[selected.id].credits)} cr
            </p>
          ) : null}
        </div>
        <ChevronDown open={open} />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute left-0 right-0 z-40 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-border-default bg-panel p-1 shadow-xl shadow-black/40"
        >
          {models.map((m) => {
            const active = m.id === value
            return (
              <li key={m.id} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(m.id)
                    setOpen(false)
                  }}
                  className={`flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left transition ${
                    active
                      ? 'bg-accent-blue/15 text-accent-blue'
                      : 'text-text-secondary hover:bg-elevated hover:text-text-primary'
                  }`}
                >
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      active ? 'bg-accent-blue' : 'bg-text-muted/50'
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{m.label}</span>
                    {m.strength ? (
                      <span
                        className={`mt-0.5 block text-[11px] ${
                          active ? 'text-accent-blue/80' : 'text-text-tertiary'
                        }`}
                      >
                        {m.strength}
                      </span>
                    ) : null}
                    {costsByModel[m.id]?.credits ? (
                      <span
                        className={`mt-1 block font-mono text-[11px] ${
                          active ? 'text-accent-blue/80' : 'text-text-tertiary'
                        }`}
                      >
                        From {formatCredits(costsByModel[m.id].credits)} cr
                      </span>
                    ) : null}
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
  const [enhancingPrompt, setEnhancingPrompt] = useState(false)
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
  const [savedResultKeys, setSavedResultKeys] = useState(() => new Set())
  const [gallery, setGallery] = useState([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [lastPrompt, setLastPrompt] = useState('')
  const [creditsRemaining, setCreditsRemaining] = useState(null)
  const [canGenerateCredits, setCanGenerateCredits] = useState(true)
  const [byCapability, setByCapability] = useState(null)
  const [costsByModel, setCostsByModel] = useState({})
  const [creditQuote, setCreditQuote] = useState(null)
  const [imageCatalog, setImageCatalog] = useState(getImageCatalog)

  const reloadGallery = async (pid) => {
    if (!pid) return
    setGalleryLoading(true)
    try {
      const jobs = await listImageJobs(pid, { limit: 50 })
      setGallery(flattenJobImages(jobs))
    } catch {
      /* keep previous gallery */
    } finally {
      setGalleryLoading(false)
    }
  }

  const goPublish = (img) => {
    if (!img?.url) return
    navigate('/publish', {
      state: {
        type: 'image',
        imageUrl: img.url,
        title: (img._prompt || lastPrompt || img.fileName || 'Admart image').slice(0, 120),
        prompt: img._prompt || lastPrompt || '',
        model: img.model,
        capability: img.capability || capability,
      },
    })
  }

  const goImageToVideo = (img) => {
    if (!img?.url) return
    navigate('/video-gen', {
      state: {
        sourceImage: {
          url: img.url,
          title: (img._prompt || lastPrompt || img.fileName || 'Generated image').slice(0, 120),
          prompt: img._prompt || lastPrompt || '',
          model: img.model,
          capability: img.capability || capability,
          jobId: img.jobId,
        },
      },
    })
  }

  const resultKey = (img) => img?.url || img?.fileName || img?.jobId || ''

  const saveResult = (img) => {
    if (!img?.url) return
    const key = resultKey(img)
    saveGeneratedAsset({
      id: key,
      type: 'image',
      title: (img._prompt || lastPrompt || img.fileName || 'Admart image').slice(0, 120),
      prompt: img._prompt || lastPrompt || '',
      thumbnailUrl: img.url,
      sourceUrl: img.url,
      jobId: img.jobId,
      status: 'Ready',
    })
    setSavedResultKeys((prev) => new Set(prev).add(key))
    if (projectId) reloadGallery(projectId)
  }

  const family = modelFamily(model, imageCatalog)
  const models = modelsForCapability(capability, imageCatalog)
  const capMeta = IMAGE_CAPABILITIES.find((c) => c.id === capability)
  const showPrompt = fieldVisible('prompt', capability, family)
  const showImages = fieldVisible('imageUrls', capability, family)
  const showAspect = fieldVisible('aspectRatio', capability, family)
  const showResolution = fieldVisible('resolution', capability, family)
  const showNumImages = fieldVisible('numImages', capability, family)
  const showSeed = fieldVisible('seed', capability, family)
  const showGuidance = fieldVisible('guidance', capability, family)
  const showIdeogram = fieldVisible('ideogram', capability, family)
  const showNegativePrompt = fieldVisible('negativePrompt', capability, family)
  const showUpscaleOpts = fieldVisible('upscaleOpts', capability, family)
  const showRembgOpts = fieldVisible('rembgOpts', capability, family)

  const formState = useMemo(
    () => ({ capability, prompt, imageUrls }),
    [capability, prompt, imageUrls],
  )
  const fallbackEstimatedCost = estimateJobCost(byCapability, capability, numImages)
  const estimatedCost = creditQuote?.credits ?? fallbackEstimatedCost
  const formReady = Boolean(projectId) && canGenerate(formState)
  const hasCredits =
    canGenerateCredits &&
    (creditsRemaining == null ||
      estimatedCost == null ||
      Number(creditsRemaining) >= Number(estimatedCost))
  const ready = formReady && hasCredits
  const blockReason = !projectId
    ? 'Select or create a project first.'
    : !hasCredits
      ? `Need ${formatCredits(estimatedCost)} credits, you have ${formatCredits(creditsRemaining)}.`
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
    let cancelled = false
    loadImageCatalog().then((data) => {
      if (!cancelled && data) setImageCatalog(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const available = modelsForCapability(capability, imageCatalog)
    if (available.length && !available.some((m) => m.id === model)) {
      setModel(defaultModel(capability, imageCatalog))
    }
  }, [capability, imageCatalog, model])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [bal, costs] = await Promise.all([getCredits(), getCreditCosts()])
        if (cancelled) return
        if (bal) {
          setCreditsRemaining(bal.creditsRemaining)
          setCanGenerateCredits(bal.canGenerate ?? bal.creditsRemaining > 0)
          notifyCreditsChanged(bal)
        }
        if (costs?.byCapability) setByCapability(costs.byCapability)
        if (costs?.byModel) setCostsByModel(costs.byModel)
      } catch {
        /* badge stays optional if credits API down */
      }
    })()
    const onCredits = (e) => {
      if (e.detail?.creditsRemaining != null) {
        setCreditsRemaining(e.detail.creditsRemaining)
      }
      if (e.detail?.canGenerate != null) {
        setCanGenerateCredits(e.detail.canGenerate)
      }
    }
    window.addEventListener(CREDITS_CHANGE_EVENT, onCredits)
    return () => {
      cancelled = true
      window.removeEventListener(CREDITS_CHANGE_EVENT, onCredits)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const settings = {
      numImages,
      resolution,
      aspectRatio,
      renderingSpeed,
      scale,
      operatingResolution,
    }
    ;(async () => {
      try {
        const quote = await quoteCredits({
          kind: 'image',
          capability,
          model,
          settings,
        })
        if (!cancelled) setCreditQuote(quote)
      } catch {
        if (!cancelled) setCreditQuote(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [
    aspectRatio,
    capability,
    model,
    numImages,
    operatingResolution,
    renderingSpeed,
    resolution,
    scale,
  ])

  useEffect(() => {
    if (!projectId) {
      setGallery([])
      return undefined
    }
    let cancelled = false
    ;(async () => {
      setGalleryLoading(true)
      try {
        const jobs = await listImageJobs(projectId, { limit: 50 })
        if (!cancelled) setGallery(flattenJobImages(jobs))
      } finally {
        if (!cancelled) setGalleryLoading(false)
      }
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
    setModel(defaultModel(id, imageCatalog))
    setJobError(null)
    // Text to image never uses uploads — clear any leftover sources
    if (id === 'textToImage') {
      setImageUrls((prev) => {
        prev.forEach((img) => {
          if (img?.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(img.previewUrl)
        })
        return []
      })
    } else if (id === 'multiEdit' && imageUrls.length > MAX_MULTI_IMAGES) {
      setImageUrls((prev) => prev.slice(0, MAX_MULTI_IMAGES))
    }
  }

  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || enhancingPrompt) return
    const original = prompt.trim()
    setEnhancingPrompt(true)
    setJobError(null)
    try {
      const data = await enhancePromptRemote({
        kind: 'image',
        prompt: original,
        negativePrompt,
        context: {
          capability,
          model,
          aspectRatio: showAspect ? aspectRatio : undefined,
          resolution: showResolution ? resolution : undefined,
          numImages: showNumImages ? numImages : undefined,
        },
      })
      const enhanced = data?.enhancedPrompt?.trim()
      setPrompt(enhanced || enhanceImagePrompt(original))
      if (!negativePrompt.trim() && data?.negativePrompt?.trim()) {
        setNegativePrompt(data.negativePrompt.trim())
      }
    } catch (err) {
      setPrompt(enhanceImagePrompt(original))
      setJobError(`Prompt enhancer unavailable; used local polish. ${promptEnhancementError(err)}`)
    } finally {
      setEnhancingPrompt(false)
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
          ? model === 'wan/v2.6/image-to-image'
            ? 3
            : MAX_MULTI_IMAGES
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
    setModel(defaultModel(nextCapability, imageCatalog))
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
    if (showAdvanced && showNegativePrompt && negativePrompt.trim()) {
      payload.negativePrompt = negativePrompt.trim()
    }
    if (showIdeogram && showAdvanced) {
      payload.style = style
      payload.renderingSpeed = renderingSpeed
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
    setSavedResultKeys(new Set())
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
      notifyLibraryChanged({ projectId, action: 'job-created', jobId })

      syncCreditsFromPayload(job)
      if (job.creditsRemaining != null) {
        setCreditsRemaining(job.creditsRemaining)
        setCanGenerateCredits(job.canGenerate ?? job.creditsRemaining > 0)
      }

      if (job.status === 'running') setJobStatus('running')

      const done = await pollImageJob(projectId, jobId, {
        signal: controller.signal,
        onUpdate: (j) => {
          if (j.status === 'running') setJobStatus('running')
          else if (j.status === 'queued') setJobStatus('queued')
          syncCreditsFromPayload(j)
        },
      })

      if (done.status === 'failed') {
        setJobStatus('failed')
        setJobError(formatGenerationError(done.error))
        notifyLibraryChanged({ projectId, action: 'job-failed', jobId })
        return
      }

      const images = (done.images || []).map((img) => ({
        ...img,
        _transparent: done.capability === 'removeBackground',
        _prompt: done.prompt || prompt.trim(),
      }))
      setResults(images)
      setJobStatus('succeeded')
      notifyLibraryChanged({ projectId, action: 'job-succeeded', jobId })
      await reloadGallery(projectId)

      try {
        const bal = await getCredits()
        setCreditsRemaining(bal.creditsRemaining)
        setCanGenerateCredits(bal.canGenerate ?? bal.creditsRemaining > 0)
        notifyCreditsChanged(bal)
      } catch {
        /* ignore refresh errors */
      }
    } catch (err) {
      if (err?.name === 'AbortError') return
      creditsFromApiError(err)
      const data = err?.response?.data
      if (data?.creditsRemaining != null) {
        setCreditsRemaining(data.creditsRemaining)
        setCanGenerateCredits(data.canGenerate ?? data.creditsRemaining > 0)
      }
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
      <div className="flex h-dvh flex-col overflow-hidden">
        <div className="shrink-0">
          <Topbar title="Image Studio" />
        </div>

        <div className="shrink-0 border-b border-border bg-panel px-6">
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

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex min-h-0 w-[380px] shrink-0 flex-col border-r border-border bg-panel">
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
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
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={
                        capability === 'edit'
                          ? 'e.g. Replace the background with a soft beige studio backdrop'
                          : capability === 'multiEdit'
                            ? 'e.g. Place the person from image 1 into the cafe from image 2…'
                            : 'e.g. Product shot of a matte black water bottle on marble, soft studio light'
                      }
                      className="min-h-[110px] w-full resize-y rounded-xl border border-border-default bg-input p-3 pb-10 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                    />
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
                      {capability === 'textToImage' ? (
                        <button
                          type="button"
                          onClick={handleEnhancePrompt}
                          disabled={!prompt.trim() || enhancingPrompt}
                          className="rounded-lg bg-accent-violet px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm shadow-accent-violet/25 transition hover:bg-accent-violet/90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {enhancingPrompt ? 'Enhancing…' : '✦ Enhance prompt'}
                        </button>
                      ) : (
                        <span />
                      )}
                      <span className="font-mono text-xs text-text-muted">
                        {promptStats(prompt).words} words · {promptStats(prompt).chars} chars
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label>Model</Label>
                <ModelPicker
                  models={models}
                  value={model}
                  onChange={setModel}
                  costsByModel={costsByModel}
                />
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

              {(showSeed || showGuidance || showIdeogram || showNegativePrompt) && (
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
                      {showNegativePrompt && !showIdeogram && (
                        <div>
                          <Label>Negative prompt</Label>
                          <textarea
                            value={negativePrompt}
                            onChange={(e) => setNegativePrompt(e.target.value)}
                            placeholder="Things to exclude..."
                            className="min-h-[64px] w-full resize-y rounded-lg border border-border-default bg-input p-2 text-sm focus:border-accent-blue focus:outline-none"
                          />
                        </div>
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

            <div className="shrink-0 border-t border-border bg-panel/95 p-4 backdrop-blur-sm">
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
                <p className="mb-2 text-center text-xs text-text-tertiary">
                  {blockReason}
                  {!hasCredits && (
                    <>
                      {' '}
                      <Link to="/billing" className="text-accent-blue underline">
                        Billing
                      </Link>
                    </>
                  )}
                </p>
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
                    ? estimatedCost != null
                      ? `Remove background · ${formatCredits(estimatedCost)} cr`
                      : 'Remove background'
                    : capability === 'upscale'
                    ? estimatedCost != null
                      ? `Upscale ${scale}× · ${formatCredits(estimatedCost)} cr`
                      : `Upscale ${scale}×`
                    : estimatedCost != null
                      ? `Generate · ${formatCredits(estimatedCost)} cr`
                      : 'Generate'}
              </button>
              <p className="mt-2 text-center font-mono text-[11px] text-text-muted">
                {capMeta?.label}
                {estimatedCost != null ? ` · est. ${formatCredits(estimatedCost)} cr` : ''}
                {creditQuote?.unitPrice ? ` · ${formatCredits(creditQuote.unitPrice)} / ${creditQuote.unit}` : ''}
                {creditsRemaining != null ? ` · ${formatCredits(creditsRemaining)} left` : ''}
              </p>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-base p-7">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-semibold text-text-primary">Canvas</h2>
                <p className="text-sm text-text-tertiary">
                  {capability === 'textToImage' && 'Prompt → new image'}
                  {capability === 'edit' && 'Prompt + image → image to image'}
                  {capability === 'multiEdit' && 'Compose / transfer across multiple images'}
                  {capability === 'upscale' && 'Higher resolution'}
                  {capability === 'removeBackground' && 'Transparent PNG · checkerboard preview'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => reloadGallery(projectId)}
                disabled={!projectId || galleryLoading}
                className="rounded-lg border border-border-default bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary disabled:opacity-50"
              >
                {galleryLoading ? 'Loading…' : 'Refresh gallery'}
              </button>
            </div>

            {jobStatus === 'idle' && results.length === 0 && gallery.length === 0 && !galleryLoading && (
              <div className="mb-10 flex flex-col items-center justify-center py-12">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border-default bg-surface text-3xl text-text-muted">
                  {showImages ? '⇪' : '✦'}
                </div>
                <h3 className="mt-4 font-heading text-xl font-semibold text-text-secondary">
                  {showImages ? 'Add a source image to start' : 'Describe what you want to create'}
                </h3>
                <p className="mt-1 max-w-sm text-center text-sm text-text-tertiary">
                  New results appear here. All project images show in My images below.
                </p>
              </div>
            )}

            {isBusy && (
              <div className="mb-8 grid grid-cols-2 gap-4">
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
              <section className="mb-10">
                <h3 className="mb-3 text-sm font-semibold text-text-primary">Just created</h3>
                <div className="grid grid-cols-2 gap-4">
                  {results.map((img, i) => {
                    const key = resultKey(img) || String(i)
                    const saved = savedResultKeys.has(key)
                    return (
                      <div
                        key={key}
                        className="group overflow-hidden rounded-2xl border border-accent-blue/30 bg-surface"
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
                          <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                            <div className="flex flex-wrap items-center justify-center gap-2 px-3">
                              <ActionBtn
                                onClick={() => saveResult(img)}
                              >
                                {saved ? 'Saved' : 'Save'}
                              </ActionBtn>
                              <ActionBtn onClick={() => goPublish(img)}>Publish</ActionBtn>
                              <ActionBtn onClick={() => downloadAsset(img)}>Download</ActionBtn>
                              <ActionBtn onClick={() => chainTo('edit', [img])}>
                                Image to image
                              </ActionBtn>
                              <ActionBtn onClick={() => chainTo('upscale', [img])}>Upscale</ActionBtn>
                              <ActionBtn onClick={() => chainTo('removeBackground', [img])}>
                                Remove BG
                              </ActionBtn>
                              <ActionBtn onClick={() => goImageToVideo(img)}>Image to video</ActionBtn>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 border-t border-border p-3">
                          <p className="truncate text-xs text-text-secondary">
                            {lastPrompt?.slice(0, 80) ||
                              img._prompt?.slice(0, 80) ||
                              img.fileName ||
                              'Result'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => saveResult(img)}
                              className="rounded-lg bg-accent-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-blue/90"
                            >
                              {saved ? 'Saved' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={() => goPublish(img)}
                              className="rounded-lg border border-border-default bg-elevated px-3 py-1.5 text-xs font-medium text-text-primary"
                            >
                              Publish
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadAsset(img)}
                              className="rounded-lg border border-border-default bg-elevated px-3 py-1.5 text-xs font-medium text-text-primary"
                            >
                              Download
                            </button>
                            <button
                              type="button"
                              onClick={() => chainTo('edit', [img])}
                              className="rounded-lg border border-border-default bg-elevated px-3 py-1.5 text-xs font-medium text-text-secondary"
                            >
                              Image to image
                            </button>
                            <button
                              type="button"
                              onClick={() => chainTo('upscale', [img])}
                              className="rounded-lg border border-border-default bg-elevated px-3 py-1.5 text-xs font-medium text-text-secondary"
                            >
                              Upscale
                            </button>
                            <button
                              type="button"
                              onClick={() => chainTo('removeBackground', [img])}
                              className="rounded-lg border border-border-default bg-elevated px-3 py-1.5 text-xs font-medium text-text-secondary"
                            >
                              Remove BG
                            </button>
                            <button
                              type="button"
                              onClick={() => goImageToVideo(img)}
                              className="rounded-lg border border-border-default bg-elevated px-3 py-1.5 text-xs font-medium text-text-secondary"
                            >
                              Image to video
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {jobStatus === 'failed' && !jobError && (
              <div className="mb-6 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                Generation failed. Adjust settings and try again.
              </div>
            )}

            {/* All project images — current + previous */}
            <section>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-text-primary">
                  My images
                  {gallery.length > 0 ? (
                    <span className="ml-2 font-mono text-text-muted">({gallery.length})</span>
                  ) : null}
                </h3>
              </div>

              {galleryLoading && gallery.length === 0 ? (
                <p className="text-sm text-text-tertiary">Loading your images…</p>
              ) : gallery.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border-default bg-panel/50 px-4 py-8 text-center text-sm text-text-tertiary">
                  No saved images for this project yet. Generate one to fill this gallery.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                  {gallery.map((img) => (
                    <div
                      key={img._key || img.url}
                      className="group overflow-hidden rounded-xl border border-border-default bg-surface"
                    >
                      <div className="relative aspect-square bg-elevated">
                        {img._transparent && <Checkerboard />}
                        <img
                          src={img.url}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                          <div className="flex flex-wrap items-center justify-center gap-1.5 px-2">
                            <ActionBtn onClick={() => saveResult(img)}>Save</ActionBtn>
                            <ActionBtn onClick={() => goPublish(img)}>Publish</ActionBtn>
                            <ActionBtn onClick={() => downloadAsset(img)}>Download</ActionBtn>
                            <ActionBtn onClick={() => chainTo('edit', [img])}>
                              Image to image
                            </ActionBtn>
                            <ActionBtn onClick={() => chainTo('upscale', [img])}>Upscale</ActionBtn>
                            <ActionBtn onClick={() => chainTo('removeBackground', [img])}>
                              Remove BG
                            </ActionBtn>
                            <ActionBtn onClick={() => goImageToVideo(img)}>Image to video</ActionBtn>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-border px-2.5 py-2">
                        <p className="truncate text-[11px] text-text-secondary">
                          {img._prompt || img.fileName || img.capability || 'Image'}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => saveResult(img)}
                            className="rounded-md bg-accent-blue/15 px-2 py-0.5 text-[10px] font-semibold text-accent-blue hover:bg-accent-blue/25"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => goPublish(img)}
                            className="rounded-md bg-elevated px-2 py-0.5 text-[10px] font-medium text-text-tertiary hover:text-text-primary"
                          >
                            Publish
                          </button>
                          <button
                            type="button"
                            onClick={() => chainTo('edit', [img])}
                            className="rounded-md bg-elevated px-2 py-0.5 text-[10px] font-medium text-text-tertiary hover:text-text-primary"
                          >
                            Image to image
                          </button>
                          <button
                            type="button"
                            onClick={() => chainTo('upscale', [img])}
                            className="rounded-md bg-elevated px-2 py-0.5 text-[10px] font-medium text-text-tertiary hover:text-text-primary"
                          >
                            Upscale
                          </button>
                          <button
                            type="button"
                            onClick={() => chainTo('removeBackground', [img])}
                            className="rounded-md bg-elevated px-2 py-0.5 text-[10px] font-medium text-text-tertiary hover:text-text-primary"
                          >
                            Remove BG
                          </button>
                          <button
                            type="button"
                            onClick={() => goImageToVideo(img)}
                            className="rounded-md bg-elevated px-2 py-0.5 text-[10px] font-medium text-text-tertiary hover:text-text-primary"
                          >
                            Image to video
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
