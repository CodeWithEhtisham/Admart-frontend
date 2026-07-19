/**
 * Video generation helpers — mirrors imageGeneration.js with per-model field profiles.
 * DEFAULT_VIDEO_CATALOG matches backend content/video_catalog.py (static like image models).
 */

import api from './api'

export const MAX_FILE_MB = 15
export const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/webp']

/** Live prompt stats for the UI counter (no hard fal limit). */
export function promptStats(raw) {
  const text = String(raw || '')
  const trimmed = text.trim()
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0
  return { chars: text.length, words }
}

export const VIDEO_CAPABILITIES = [
  {
    id: 'textToVideo',
    label: 'Text to video',
    hint: 'Prompt only',
  },
  {
    id: 'imageToVideo',
    label: 'Image to video',
    hint: 'Prompt + start image',
  },
  {
    id: 'firstLastFrame',
    label: 'First → last',
    hint: 'Prompt + start & end frames',
  },
]

/** Full curated catalog — same as backend; used immediately so the picker never shows 1 stub. */
export const DEFAULT_VIDEO_CATALOG = {
  "textToVideo": [
    {
      "id": "fal-ai/veo3.1",
      "label": "Veo 3.1",
      "family": "veo",
      "default": true,
      "inputs": "text",
      "falImageKeys": {},
      "fields": {
        "seed": true,
        "duration": [
          "4s",
          "6s",
          "8s"
        ],
        "aspectRatio": [
          "16:9",
          "9:16"
        ],
        "resolution": [
          "720p",
          "1080p",
          "4k"
        ],
        "generateAudio": true,
        "negativePrompt": true
      },
      "strength": "Cinematic + native audio"
    },
    {
      "id": "bytedance/seedance-2.0/text-to-video",
      "label": "Seedance 2.0",
      "family": "seedance",
      "default": false,
      "inputs": "text",
      "falImageKeys": {},
      "fields": {
        "seed": true,
        "duration": [
          "auto",
          "4",
          "5",
          "6",
          "7",
          "8",
          "10",
          "12",
          "15"
        ],
        "aspectRatio": [
          "auto",
          "21:9",
          "16:9",
          "4:3",
          "1:1",
          "3:4",
          "9:16"
        ],
        "resolution": [
          "480p",
          "720p",
          "1080p",
          "4k"
        ],
        "generateAudio": true
      },
      "strength": "Multi-shot cinematic"
    },
    {
      "id": "fal-ai/kling-video/v2.5-turbo/pro/text-to-video",
      "label": "Kling 2.5 Turbo Pro",
      "family": "kling",
      "default": false,
      "inputs": "text",
      "falImageKeys": {},
      "fields": {
        "seed": true,
        "duration": [
          "5",
          "10"
        ],
        "aspectRatio": [
          "16:9",
          "9:16",
          "1:1"
        ]
      },
      "strength": "Fast motion quality"
    },
    {
      "id": "fal-ai/kling-video/v2.1/master/text-to-video",
      "label": "Kling 2.1 Master",
      "family": "kling",
      "default": false,
      "inputs": "text",
      "falImageKeys": {},
      "fields": {
        "seed": true,
        "duration": [
          "5",
          "10"
        ],
        "aspectRatio": [
          "16:9",
          "9:16",
          "1:1"
        ]
      },
      "strength": "High fidelity"
    },
    {
      "id": "fal-ai/minimax/hailuo-02/standard/text-to-video",
      "label": "Hailuo 02 Standard",
      "family": "minimax",
      "default": false,
      "inputs": "text",
      "falImageKeys": {},
      "fields": {
        "seed": true,
        "duration": [
          "6",
          "10"
        ]
      },
      "strength": "Social short clips"
    },
    {
      "id": "fal-ai/wan/v2.6/text-to-video",
      "label": "Wan 2.6",
      "family": "wan",
      "default": false,
      "inputs": "text",
      "falImageKeys": {},
      "fields": {
        "seed": true,
        "duration": [
          "5",
          "10"
        ],
        "aspectRatio": [
          "16:9",
          "9:16",
          "1:1"
        ],
        "resolution": [
          "720p",
          "1080p"
        ]
      },
      "strength": "Coherent scenes"
    },
    {
      "id": "fal-ai/pixverse/v5/text-to-video",
      "label": "PixVerse V5",
      "family": "pixverse",
      "default": false,
      "inputs": "text",
      "falImageKeys": {},
      "fields": {
        "seed": true,
        "duration": [
          "5",
          "8"
        ],
        "aspectRatio": [
          "16:9",
          "9:16",
          "1:1"
        ]
      },
      "strength": "Stylized clips"
    },
    {
      "id": "fal-ai/ltx-video-13b-distilled",
      "label": "LTX Video 13B",
      "family": "ltx",
      "default": false,
      "inputs": "text",
      "falImageKeys": {},
      "fields": {
        "seed": true,
        "aspectRatio": [
          "16:9",
          "9:16",
          "1:1"
        ]
      },
      "strength": "Fast / low cost"
    }
  ],
  "imageToVideo": [
    {
      "id": "fal-ai/veo3.1/image-to-video",
      "label": "Veo 3.1",
      "family": "veo",
      "default": true,
      "inputs": "image",
      "falImageKeys": {
        "start": "image_url"
      },
      "fields": {
        "seed": true,
        "duration": [
          "4s",
          "6s",
          "8s"
        ],
        "aspectRatio": [
          "auto",
          "16:9",
          "9:16"
        ],
        "resolution": [
          "720p",
          "1080p",
          "4k"
        ],
        "generateAudio": true
      },
      "strength": "Animate one frame"
    },
    {
      "id": "bytedance/seedance-2.0/image-to-video",
      "label": "Seedance 2.0",
      "family": "seedance",
      "default": false,
      "inputs": "image",
      "falImageKeys": {
        "start": "image_url"
      },
      "fields": {
        "seed": true,
        "duration": [
          "auto",
          "4",
          "5",
          "6",
          "8",
          "10",
          "12",
          "15"
        ],
        "aspectRatio": [
          "auto",
          "16:9",
          "9:16",
          "1:1"
        ],
        "resolution": [
          "480p",
          "720p",
          "1080p"
        ],
        "generateAudio": true
      },
      "strength": "Image + motion"
    },
    {
      "id": "fal-ai/kling-video/v2.5-turbo/pro/image-to-video",
      "label": "Kling 2.5 Turbo Pro",
      "family": "kling",
      "default": false,
      "inputs": "image",
      "falImageKeys": {
        "start": "image_url"
      },
      "fields": {
        "seed": true,
        "duration": [
          "5",
          "10"
        ]
      },
      "strength": "Smooth motion"
    },
    {
      "id": "fal-ai/kling-video/v2.1/master/image-to-video",
      "label": "Kling 2.1 Master",
      "family": "kling",
      "default": false,
      "inputs": "image",
      "falImageKeys": {
        "start": "image_url"
      },
      "fields": {
        "seed": true,
        "duration": [
          "5",
          "10"
        ]
      },
      "strength": "High fidelity I2V"
    },
    {
      "id": "fal-ai/minimax/hailuo-02/standard/image-to-video",
      "label": "Hailuo 02 Standard",
      "family": "minimax",
      "default": false,
      "inputs": "image",
      "falImageKeys": {
        "start": "image_url"
      },
      "fields": {
        "seed": true,
        "duration": [
          "6",
          "10"
        ]
      },
      "strength": "Product / social"
    },
    {
      "id": "fal-ai/wan/v2.6/image-to-video",
      "label": "Wan 2.6",
      "family": "wan",
      "default": false,
      "inputs": "image",
      "falImageKeys": {
        "start": "image_url"
      },
      "fields": {
        "seed": true,
        "duration": [
          "5",
          "10"
        ],
        "resolution": [
          "720p",
          "1080p"
        ]
      },
      "strength": "Coherent I2V"
    },
    {
      "id": "fal-ai/pixverse/v5/image-to-video",
      "label": "PixVerse V5",
      "family": "pixverse",
      "default": false,
      "inputs": "image",
      "falImageKeys": {
        "start": "image_url"
      },
      "fields": {
        "seed": true,
        "duration": [
          "5",
          "8"
        ]
      },
      "strength": "Stylized motion"
    }
  ],
  "firstLastFrame": [
    {
      "id": "fal-ai/veo3.1/first-last-frame-to-video",
      "label": "Veo 3.1 First→Last",
      "family": "veo",
      "default": true,
      "inputs": "firstLast",
      "falImageKeys": {
        "start": "first_frame_url",
        "end": "last_frame_url"
      },
      "fields": {
        "seed": true,
        "duration": [
          "4s",
          "6s",
          "8s"
        ],
        "aspectRatio": [
          "auto",
          "16:9",
          "9:16"
        ],
        "resolution": [
          "720p",
          "1080p",
          "4k"
        ],
        "generateAudio": true
      },
      "strength": "Start + end frames"
    },
    {
      "id": "fal-ai/veo3.1/fast/first-last-frame-to-video",
      "label": "Veo 3.1 Fast First→Last",
      "family": "veo",
      "default": false,
      "inputs": "firstLast",
      "falImageKeys": {
        "start": "first_frame_url",
        "end": "last_frame_url"
      },
      "fields": {
        "seed": true,
        "duration": [
          "4s",
          "6s",
          "8s"
        ],
        "aspectRatio": [
          "auto",
          "16:9",
          "9:16"
        ],
        "resolution": [
          "720p",
          "1080p"
        ],
        "generateAudio": true
      },
      "strength": "Faster transition"
    },
    {
      "id": "bytedance/seedance-2.0/image-to-video",
      "label": "Seedance 2.0 Start→End",
      "family": "seedance",
      "default": false,
      "inputs": "firstLast",
      "falImageKeys": {
        "start": "image_url",
        "end": "end_image_url"
      },
      "fields": {
        "seed": true,
        "duration": [
          "auto",
          "4",
          "5",
          "6",
          "8",
          "10"
        ],
        "aspectRatio": [
          "auto",
          "16:9",
          "9:16",
          "1:1"
        ],
        "resolution": [
          "480p",
          "720p",
          "1080p"
        ],
        "generateAudio": true
      },
      "strength": "Start + optional end"
    },
    {
      "id": "fal-ai/kling-video/v2.5-turbo/pro/image-to-video",
      "label": "Kling 2.5 Turbo Start→End",
      "family": "kling",
      "default": false,
      "inputs": "firstLast",
      "falImageKeys": {
        "start": "image_url",
        "end": "tail_image_url"
      },
      "fields": {
        "seed": true,
        "duration": [
          "5",
          "10"
        ]
      },
      "strength": "Start + end (tail)"
    }
  ]
}

let _catalog = DEFAULT_VIDEO_CATALOG

function isValidCatalog(data) {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.textToVideo) &&
    data.textToVideo.length > 0
  )
}

/** Optionally refresh from API; always keeps a full local catalog as baseline. */
export async function loadVideoCatalog() {
  try {
    const { data } = await api.get('/api/videos/models')
    if (isValidCatalog(data)) {
      _catalog = data
      return data
    }
  } catch (err) {
    console.warn('[video] catalog API unavailable, using local list', err?.response?.status || err?.message)
  }
  _catalog = DEFAULT_VIDEO_CATALOG
  return _catalog
}

export function getVideoCatalog() {
  return _catalog || DEFAULT_VIDEO_CATALOG
}

export function modelsForCapability(capability, catalog = getVideoCatalog()) {
  return catalog[capability] || []
}

export function defaultModel(capability, catalog = getVideoCatalog()) {
  const models = modelsForCapability(capability, catalog)
  return models.find((m) => m.default)?.id || models[0]?.id
}

export function getModelEntry(capability, modelId, catalog = getVideoCatalog()) {
  return modelsForCapability(capability, catalog).find((m) => m.id === modelId) || null
}

export function fieldOptions(entry, field) {
  const fields = entry?.fields || {}
  const val = fields[field]
  return Array.isArray(val) ? val : null
}

export function fieldEnabled(entry, field) {
  const fields = entry?.fields || {}
  return Boolean(fields[field])
}

/**
 * Expand a short video prompt with motion / camera / cinematic cues.
 * Keeps original intent.
 */
export function enhanceVideoPrompt(raw) {
  const base = String(raw || '').trim()
  if (!base) return ''

  const markers = ['cinematic lighting', 'smooth camera motion', 'high detail']
  if (markers.every((m) => base.toLowerCase().includes(m))) {
    return base
  }

  const extras = [
    'cinematic lighting',
    'smooth camera motion',
    'natural motion blur',
    'sharp subject focus',
    'high detail',
    'film-like color grading',
  ]
  const missing = extras.filter((e) => !base.toLowerCase().includes(e.toLowerCase()))
  return missing.length
    ? `${base.replace(/[.,\s]+$/, '')}, ${missing.join(', ')}`
    : base
}

export function canGenerateVideo({ capability, prompt, startImageUrl, endImageUrl, modelId }) {
  if (!(prompt || '').trim()) return false
  const entry = getModelEntry(capability, modelId)
  if (!entry) return false
  if (entry.inputs === 'image' && !startImageUrl) return false
  if (entry.inputs === 'firstLast' && (!startImageUrl || !endImageUrl)) return false
  return true
}

export function validationMessage({ capability, prompt, startImageUrl, endImageUrl, modelId }) {
  if (!(prompt || '').trim()) return 'Enter a prompt.'
  const entry = getModelEntry(capability, modelId)
  if (!entry) return 'Select a model.'
  if (entry.inputs === 'image' && !startImageUrl) return 'Upload a start image for this model.'
  if (entry.inputs === 'firstLast') {
    if (!startImageUrl) return 'Upload a start frame.'
    if (!endImageUrl) return 'Upload an end frame.'
  }
  return ''
}

export function videoApiError(err) {
  const data = err?.response?.data
  return data?.message || data?.detail || err?.message || 'Request failed'
}

export function formatGenerationError(err) {
  return videoApiError(err)
}

export async function uploadVideoFrame(projectId, file) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post(`/api/projects/${projectId}/videos/uploads`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function createVideoJob(projectId, payload) {
  const { data } = await api.post(`/api/projects/${projectId}/videos/jobs`, payload)
  return data
}

export async function getVideoJob(projectId, jobId) {
  const { data } = await api.get(`/api/projects/${projectId}/videos/jobs/${jobId}`)
  return data
}

export async function listVideoJobs(projectId, limit = 20) {
  const { data } = await api.get(`/api/projects/${projectId}/videos/jobs`, {
    params: { limit },
  })
  return data?.items ?? []
}

export async function cancelVideoJob(projectId, jobId) {
  const { data } = await api.post(`/api/projects/${projectId}/videos/jobs/${jobId}/cancel`)
  return data
}

/** Poll until terminal status. Videos are slower — default 3s. */
export async function pollVideoJob(projectId, jobId, { intervalMs = 3000, timeoutMs = 600000 } = {}) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    const job = await getVideoJob(projectId, jobId)
    if (job.status === 'succeeded' || job.status === 'failed') return job
    await new Promise((r) => setTimeout(r, intervalMs))
  }
  throw new Error('Video generation timed out. Check the library later.')
}

export function flattenJobVideos(jobs) {
  const items = []
  for (const job of jobs || []) {
    if (job.video?.url) {
      items.push({
        id: `${job.id}-0`,
        jobId: job.id,
        url: job.video.url,
        status: job.status,
        prompt: job.prompt,
        model: job.model,
        capability: job.capability,
        createdAt: job.createdAt,
        durationSeconds: job.durationSeconds,
        error: job.error,
      })
    } else if (job.status === 'queued' || job.status === 'running' || job.status === 'failed') {
      items.push({
        id: `${job.id}-pending`,
        jobId: job.id,
        url: null,
        status: job.status,
        prompt: job.prompt,
        model: job.model,
        capability: job.capability,
        createdAt: job.createdAt,
        error: job.error,
      })
    }
  }
  return items
}
