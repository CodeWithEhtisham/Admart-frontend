/** Image studio constants + API — contract from frontend-image-generation.md / docs/backend-image-generation.md */

import api from './api'

export const IMAGE_CAPABILITIES = [
  { id: 'textToImage', label: 'Text to image', needsPrompt: true, minImages: 0 },
  { id: 'edit', label: 'Image to image', needsPrompt: true, minImages: 1 },
  { id: 'multiEdit', label: 'Multi-edit', needsPrompt: true, minImages: 2 },
  { id: 'upscale', label: 'Upscale', needsPrompt: false, minImages: 1 },
  { id: 'removeBackground', label: 'Remove BG', needsPrompt: false, minImages: 1 },
]

export const TEXT_TO_IMAGE_MODELS = [
  { id: 'fal-ai/flux/dev', label: 'Flux Dev', family: 'flux', strength: 'Balanced quality' },
  { id: 'fal-ai/flux/schnell', label: 'Flux Schnell', family: 'flux', strength: 'Fast drafts' },
  { id: 'fal-ai/nano-banana-2', label: 'Nano Banana 2', family: 'nano', strength: 'Fast Google quality' },
  { id: 'fal-ai/nano-banana-pro', label: 'Nano Banana Pro', family: 'nano', strength: 'Higher fidelity' },
  { id: 'fal-ai/ideogram/v3', label: 'Ideogram V3', family: 'ideogram', strength: 'Text / posters / logos' },
  // Note: partner id is openai/… not fal-ai/openai/…
  { id: 'openai/gpt-image-2', label: 'GPT Image 2', family: 'openai', strength: 'Best typography' },
]

export const EDIT_MODELS = [
  { id: 'fal-ai/nano-banana-2/edit', label: 'Nano Banana 2 Edit', family: 'nano' },
  { id: 'fal-ai/nano-banana-pro/edit', label: 'Nano Banana Pro Edit', family: 'nano' },
  { id: 'fal-ai/flux-pro/kontext', label: 'Flux Kontext Pro', family: 'flux' },
  { id: 'openai/gpt-image-2/edit', label: 'GPT Image 2 Edit', family: 'openai' },
  { id: 'wan/v2.6/image-to-image', label: 'Wan 2.6 Edit', family: 'wan' },
]

export const UPSCALE_MODELS = [
  { id: 'fal-ai/esrgan', label: 'ESRGAN' },
  { id: 'fal-ai/seedvr/upscale/image', label: 'SeedVR2' },
  { id: 'fal-ai/topaz/upscale/image', label: 'Topaz' },
  { id: 'fal-ai/recraft/upscale/crisp', label: 'Recraft Crisp' },
  { id: 'fal-ai/ideogram/upscale', label: 'Ideogram Upscale' },
]

export const REMBG_MODELS = [
  { id: 'fal-ai/birefnet/v2', label: 'BiRefNet v2' },
  { id: 'fal-ai/birefnet', label: 'BiRefNet' },
  { id: 'fal-ai/bria/background/remove', label: 'Bria RMBG' },
]

export const DEFAULT_IMAGE_CATALOG = {
  textToImage: TEXT_TO_IMAGE_MODELS,
  edit: EDIT_MODELS,
  multiEdit: EDIT_MODELS,
  upscale: UPSCALE_MODELS,
  removeBackground: REMBG_MODELS,
}

export const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1', sub: 'Square' },
  { id: '16:9', label: '16:9', sub: 'Landscape' },
  { id: '9:16', label: '9:16', sub: 'Portrait' },
  { id: '4:3', label: '4:3', sub: 'Classic' },
  { id: '3:4', label: '3:4', sub: 'Tall' },
  { id: 'auto', label: 'Auto', sub: 'Model' },
]

export const MULTI_EDIT_ROLES = ['Subject', 'Scene', 'Style', 'Extra', 'Extra', 'Extra']

/** Live prompt stats for the UI counter (no hard fal limit). */
export function promptStats(raw) {
  const text = String(raw || '')
  const trimmed = text.trim()
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0
  return { chars: text.length, words }
}
export const MAX_MULTI_IMAGES = 6
export const MAX_FILE_MB = 15
export const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/webp']
export const POLL_INTERVAL_MS = 1750
export const POLL_MAX_MS = 5 * 60 * 1000

let _catalog = DEFAULT_IMAGE_CATALOG

function isValidCatalog(data) {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.textToImage) &&
    data.textToImage.length > 0
  )
}

export async function loadImageCatalog() {
  try {
    const { data } = await api.get('/api/images/models')
    if (isValidCatalog(data)) {
      _catalog = data
      return data
    }
  } catch (err) {
    console.warn('[image] catalog API unavailable, using local list', err?.response?.status || err?.message)
  }
  _catalog = DEFAULT_IMAGE_CATALOG
  return _catalog
}

export function getImageCatalog() {
  return _catalog || DEFAULT_IMAGE_CATALOG
}

export function modelsForCapability(capability, catalog = getImageCatalog()) {
  return catalog[capability] || DEFAULT_IMAGE_CATALOG[capability] || TEXT_TO_IMAGE_MODELS
}

export function defaultModel(capability, catalog = getImageCatalog()) {
  const models = modelsForCapability(capability, catalog)
  return models.find((m) => m.default)?.id || models[0]?.id
}

export function modelFamily(modelId, catalog = getImageCatalog()) {
  const all = Object.values(catalog || DEFAULT_IMAGE_CATALOG).filter(Array.isArray).flat()
  return all.find((m) => m.id === modelId)?.family ?? null
}

/** Visibility matrix from frontend-image-generation.md §4.5 */
export function fieldVisible(field, capability, family) {
  const matrix = {
    prompt: {
      textToImage: true,
      edit: true,
      multiEdit: true,
      upscale: false,
      removeBackground: false,
    },
    imageUrls: {
      textToImage: false,
      edit: true,
      multiEdit: true,
      upscale: true,
      removeBackground: true,
    },
    aspectRatio: {
      textToImage: true,
      edit: true,
      multiEdit: true,
      upscale: false,
      removeBackground: false,
    },
    resolution: {
      textToImage: family === 'nano',
      edit: family === 'nano',
      multiEdit: family === 'nano',
      upscale: false,
      removeBackground: false,
    },
    numImages: {
      textToImage: true,
      edit: true,
      multiEdit: true,
      upscale: false,
      removeBackground: false,
    },
    guidance: family === 'flux' && capability === 'textToImage',
    ideogram: family === 'ideogram' && capability === 'textToImage',
    negativePrompt:
      (family === 'ideogram' && capability === 'textToImage') ||
      (family === 'wan' && ['edit', 'multiEdit'].includes(capability)),
    upscaleOpts: capability === 'upscale',
    rembgOpts: capability === 'removeBackground',
  }

  if (field === 'seed') {
    return ['textToImage', 'edit', 'multiEdit'].includes(capability)
  }

  const entry = matrix[field]
  if (entry == null) return false
  // Boolean entries (guidance / ideogram / opts) already encode capability+family
  if (typeof entry === 'boolean') return entry
  return !!entry[capability]
}

/**
 * Expand a short text-to-image prompt with composition / lighting cues.
 * Keeps original intent.
 */
export function enhanceImagePrompt(raw) {
  const base = String(raw || '').trim()
  if (!base) return ''

  const markers = ['soft studio lighting', 'sharp focus', 'professional photography']
  if (markers.every((m) => base.toLowerCase().includes(m))) {
    return base
  }

  const extras = [
    'professional photography',
    'soft studio lighting',
    'sharp focus',
    'clean composition',
    'high detail',
    'natural color grading',
  ]
  const missing = extras.filter((e) => !base.toLowerCase().includes(e.toLowerCase()))
  return missing.length
    ? `${base.replace(/[.,\s]+$/, '')}, ${missing.join(', ')}`
    : base
}

export function canGenerate({ capability, prompt, imageUrls }) {
  const cap = IMAGE_CAPABILITIES.find((c) => c.id === capability)
  if (!cap) return false
  if (cap.needsPrompt && !prompt?.trim()) return false
  if ((imageUrls?.length ?? 0) < cap.minImages) return false
  return true
}

export function validationMessage({ capability, prompt, imageUrls }) {
  const n = imageUrls?.length ?? 0
  switch (capability) {
    case 'textToImage':
      return !prompt?.trim() ? 'Enter a prompt to generate.' : null
    case 'edit':
      if (n < 1) return 'Upload one source image.'
      if (!prompt?.trim()) return 'Describe the edit.'
      return null
    case 'multiEdit':
      if (n < 2) return 'Upload at least two images (Subject + Scene).'
      if (!prompt?.trim()) return 'Describe how to combine the images.'
      return null
    case 'upscale':
      return n < 1 ? 'Upload an image to upscale.' : null
    case 'removeBackground':
      return n < 1 ? 'Upload an image to remove the background.' : null
    default:
      return null
  }
}

export function isRemoteUrl(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url)
}

/** Resolve the HTTPS URL to send in imageUrls (never blob:). */
export function sourceRemoteUrl(img) {
  if (!img) return null
  if (img.remoteUrl && isRemoteUrl(img.remoteUrl)) return img.remoteUrl
  if (isRemoteUrl(img.url)) return img.url
  return null
}

/** Friendlier copy for fal / OpenAI content-safety blocks. */
export function formatGenerationError(raw) {
  const text = String(raw || '').trim()
  if (!text) return 'Generation failed. Adjust settings and try again.'

  const lower = text.toLowerCase()
  const isSafety =
    lower.includes('content checker') ||
    lower.includes('flagged') ||
    lower.includes('safety') ||
    lower.includes('nsfw') ||
    lower.includes('moderat') ||
    lower.includes('policy') ||
    lower.includes('sensitive')

  if (isSafety) {
    return (
      'This prompt or source image was blocked by the model’s content safety filter. ' +
      'Try a clearer, non-sensitive description (avoid violence, adult content, or real-person deepfakes), ' +
      'or use a different model such as Flux Dev / Nano Banana 2.'
    )
  }

  return text
}

export function imageApiError(err) {
  const status = err?.response?.status
  const data = err?.response?.data
  const message =
    data?.message || data?.detail || data?.error || (typeof data === 'string' ? data : null) || err?.message

  if (status === 402 || data?.code === 'INSUFFICIENT_CREDITS') {
    const left = data?.creditsRemaining
    return left != null
      ? `Insufficient credits (${left} remaining). Buy more on Billing.`
      : 'Insufficient credits. Buy more on Billing, then try again.'
  }
  if (status === 401) return 'Session expired. Please sign in again.'
  if (status === 404) return 'Project or job not found. Select a project and try again.'
  if (status === 413) return 'File too large. Max 15 MB per image.'
  if (status === 429) return 'Too many requests. Wait a moment and retry.'
  if (status === 502 || status === 503) return 'Image service is temporarily unavailable.'
  return formatGenerationError(message)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ─── API ──────────────────────────────────────────────────────────────

/**
 * POST /api/projects/:projectId/images/uploads
 * multipart field: file → { url, contentType?, byteSize? }
 */
export async function uploadImage(projectId, file) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post(`/api/projects/${projectId}/images/uploads`, form, {
    // Drop default application/json so the browser sets multipart boundary.
    headers: { 'Content-Type': undefined },
  })
  return data
}

/**
 * POST /api/projects/:projectId/images/jobs
 */
export async function createImageJob(projectId, payload) {
  const { data } = await api.post(`/api/projects/${projectId}/images/jobs`, payload)
  return data
}

/**
 * GET /api/projects/:projectId/images/jobs/:jobId
 */
export async function getImageJob(projectId, jobId) {
  const { data } = await api.get(`/api/projects/${projectId}/images/jobs/${jobId}`)
  return data
}

/**
 * GET /api/projects/:projectId/images/jobs?limit=
 * Optional — returns [] if endpoint missing.
 */
export async function listImageJobs(projectId, { limit = 50 } = {}) {
  try {
    const { data } = await api.get(`/api/projects/${projectId}/images/jobs`, {
      params: { limit },
    })
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.items)) return data.items
    if (Array.isArray(data?.results)) return data.results
    if (Array.isArray(data?.jobs)) return data.jobs
    return []
  } catch {
    return []
  }
}

/** Flatten succeeded jobs into gallery cards (newest first). */
export function flattenJobImages(jobs) {
  if (!Array.isArray(jobs)) return []
  const items = []
  for (const job of jobs) {
    if (!job || (job.status && job.status !== 'succeeded')) continue
    const images = job.images || []
    for (let i = 0; i < images.length; i++) {
      const img = images[i]
      const url = img?.url
      if (!url) continue
      items.push({
        ...img,
        url,
        jobId: job.id,
        capability: job.capability,
        model: job.model,
        _prompt: job.prompt,
        _transparent: job.capability === 'removeBackground',
        createdAt: job.createdAt || job.updatedAt,
        _key: `${job.id || 'job'}_${i}_${url}`,
      })
    }
  }
  return items
}

/**
 * POST /api/projects/:projectId/images/jobs/:jobId/cancel
 * Best-effort; returns updated job or null if endpoint missing.
 */
export async function cancelImageJob(projectId, jobId) {
  const { data } = await api.post(
    `/api/projects/${projectId}/images/jobs/${jobId}/cancel`,
  )
  return data
}

/**
 * Poll until succeeded | failed, or timeout (~5 min).
 */
export async function pollImageJob(
  projectId,
  jobId,
  { intervalMs = POLL_INTERVAL_MS, maxMs = POLL_MAX_MS, onUpdate, signal } = {},
) {
  const start = Date.now()
  while (Date.now() - start < maxMs) {
    if (signal?.aborted) {
      const err = new Error('Cancelled')
      err.name = 'AbortError'
      throw err
    }
    const job = await getImageJob(projectId, jobId)
    onUpdate?.(job)
    if (job.status === 'succeeded' || job.status === 'failed') return job
    await sleep(intervalMs)
  }
  throw new Error('Generation timed out. Try again.')
}

/**
 * Upload any local File entries, return HTTPS URLs in order.
 * Items that already have a remote URL are passed through.
 */
export async function ensureRemoteImageUrls(projectId, images) {
  const urls = []
  for (const img of images) {
    const existing = sourceRemoteUrl(img)
    if (existing) {
      urls.push(existing)
      continue
    }
    if (!img.file) {
      throw new Error('Source image is missing. Re-upload and try again.')
    }
    const uploaded = await uploadImage(projectId, img.file)
    if (!uploaded?.url) throw new Error('Upload failed — no URL returned.')
    img.remoteUrl = uploaded.url
    urls.push(uploaded.url)
  }
  return urls
}
