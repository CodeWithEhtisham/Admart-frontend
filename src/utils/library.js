/**
 * Library assets — contract from frontend-library.md
 * Prefer GET /api/projects/:id/library over mapping image jobs.
 */

import api from './api'
import { cancelImageJob } from './imageGeneration'
import { cancelVideoJob } from './videoGeneration'
import { getCachedActiveProject } from './projects'

export const LIBRARY_TABS = [
  { id: 'all', label: 'All' },
  { id: 'video', label: 'Videos' },
  { id: 'image', label: 'Images' },
]

export const LIBRARY_CHANGE_EVENT = 'admart:library-updated'

export function notifyLibraryChanged(detail = {}) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(LIBRARY_CHANGE_EVENT, { detail }))
}

function toIso(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

export function formatLibraryDate(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    const now = Date.now()
    const diff = now - d.getTime()
    if (diff < 60_000) return 'Just now'
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
    if (diff < 172_800_000) return 'Yesterday'
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return '—'
  }
}

export function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(Number(seconds))) return null
  const s = Math.max(0, Math.floor(Number(seconds)))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

function normalizeStatus(status) {
  const s = String(status || 'ready').toLowerCase()
  if (s === 'succeeded' || s === 'completed') return 'ready'
  if (s === 'cancelled' || s === 'canceled' || s === 'error') return 'failed'
  if (['ready', 'generating', 'published', 'scheduled', 'failed'].includes(s)) return s
  if (s === 'queued' || s === 'running' || s === 'pending') return 'generating'
  return s
}

export function normalizeLibraryAsset(raw, fallbackType = 'image') {
  if (!raw) return null
  const id = raw.id ?? raw.jobId ?? raw.job_id
  if (id == null || id === '') return null
  const mediaType = raw.mediaType || raw.media_type || raw.type || fallbackType
  const sourceUrl = raw.sourceUrl || raw.source_url || raw.url || raw.imageUrl || ''
  const thumbnailUrl =
    raw.thumbnailUrl || raw.thumbnail_url || raw.posterUrl || sourceUrl || ''
  const createdAt =
    toIso(raw.createdAt || raw.created_at || raw.updatedAt || raw.updated_at) ||
    new Date().toISOString()

  return {
    id: String(id),
    projectId: raw.projectId || raw.project_id || null,
    mediaType: mediaType === 'video' ? 'video' : 'image',
    title:
      raw.title ||
      raw.prompt ||
      raw.fileName ||
      (mediaType === 'video' ? 'Untitled video' : 'Untitled image'),
    status: normalizeStatus(raw.status),
    thumbnailUrl,
    sourceUrl,
    prompt: raw.prompt || '',
    model: raw.model || '',
    capability: raw.capability || '',
    durationSeconds: raw.durationSeconds ?? raw.duration_seconds ?? null,
    width: raw.width ?? null,
    height: raw.height ?? null,
    jobId: raw.jobId || raw.job_id || null,
    createdAt,
    updatedAt: toIso(raw.updatedAt || raw.updated_at) || createdAt,
  }
}

/**
 * GET /api/projects/:projectId/library
 * @param {'all'|'image'|'video'} mediaType
 */
export async function listLibraryAssets(
  mediaType = 'all',
  { projectId, limit = 50, cursor } = {},
) {
  const pid = projectId || getCachedActiveProject()?.id
  if (!pid) {
    return { items: [], nextCursor: null, projectId: null, source: 'none' }
  }

  const params = {
    mediaType: mediaType === 'all' ? 'all' : mediaType,
    limit: Math.min(Math.max(1, limit), 100),
  }
  if (cursor) params.cursor = cursor

  const { data } = await api.get(`/api/projects/${pid}/library`, { params })
  const rawItems = data?.items ?? []
  const items = rawItems.map((item) => normalizeLibraryAsset(item)).filter(Boolean)

  return {
    items,
    nextCursor: data?.nextCursor ?? null,
    projectId: pid,
    source: 'library',
  }
}

const LIBRARY_UPLOAD_ACCEPT =
  'image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm'

export function libraryUploadAccept() {
  return LIBRARY_UPLOAD_ACCEPT
}

/**
 * POST /api/projects/:projectId/library/uploads — user image or video.
 */
export async function uploadLibraryMedia(file, projectId) {
  const pid = projectId || getCachedActiveProject()?.id
  if (!pid) throw new Error('No active project.')
  if (!file) throw new Error('Choose an image or video file.')

  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post(`/api/projects/${pid}/library/uploads`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  const asset = normalizeLibraryAsset(data)
  notifyLibraryChanged({ projectId: pid, action: 'upload', assetId: asset?.id })
  return asset
}

/**
 * DELETE /api/projects/:projectId/library/:assetId → 204
 */
export async function deleteLibraryAsset(assetId, projectId) {
  const pid = projectId || getCachedActiveProject()?.id
  if (!pid || !assetId) throw new Error('Missing project or asset.')
  await api.delete(`/api/projects/${pid}/library/${assetId}`)
  notifyLibraryChanged({ projectId: pid, action: 'delete', assetId })
}

/**
 * Cancel in-progress generation via image/video job cancel.
 */
export async function cancelLibraryAsset(asset, projectId) {
  const pid = projectId || getCachedActiveProject()?.id
  if (!pid || !asset) throw new Error('Missing project or asset.')
  if (asset.status !== 'generating') {
    throw new Error('Only generating items can be cancelled.')
  }
  if (!asset.jobId) {
    throw new Error('Missing job id for cancel.')
  }
  const data =
    asset.mediaType === 'video'
      ? await cancelVideoJob(pid, asset.jobId)
      : await cancelImageJob(pid, asset.jobId)
  notifyLibraryChanged({ projectId: pid, action: 'cancel', assetId: asset.id })
  return data
}

export function canCancelLibraryAsset(asset) {
  return (
    asset?.status === 'generating' &&
    (asset.mediaType === 'image' || asset.mediaType === 'video') &&
    Boolean(asset.jobId)
  )
}
