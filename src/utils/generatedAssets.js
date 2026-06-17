const STORAGE_KEY = 'admart.generatedAssets.v1'
const MAX_SAVED_ASSETS = 24

export const GENERATED_ASSETS_EVENT = 'admart:generated-assets-updated'

function parseAssets(raw) {
  if (!raw) return []
  try {
    const assets = JSON.parse(raw)
    return Array.isArray(assets) ? assets.filter(Boolean) : []
  } catch {
    return []
  }
}

function notifyAssetsChanged() {
  window.dispatchEvent(new CustomEvent(GENERATED_ASSETS_EVENT))
}

export function getSavedAssets() {
  if (typeof window === 'undefined') return []
  return parseAssets(window.localStorage.getItem(STORAGE_KEY))
}

export function saveGeneratedAsset(asset) {
  const now = new Date().toISOString()
  const id = asset.id || asset.jobId || `asset-${Date.now()}`
  const normalized = {
    id,
    type: asset.type || 'image',
    title: asset.title || 'Generated image',
    prompt: asset.prompt || '',
    status: asset.status || 'Ready',
    thumbnailUrl: asset.thumbnailUrl || asset.imageUrl || asset.sourceUrl || '',
    sourceUrl: asset.sourceUrl || asset.imageUrl || asset.thumbnailUrl || '',
    width: asset.width || null,
    height: asset.height || null,
    aspectRatio: asset.aspectRatio || '',
    resolution: asset.resolution || '',
    style: asset.style || '',
    createdAt: asset.createdAt || now,
  }

  const current = getSavedAssets().filter((item) => item.id !== normalized.id)
  const next = [normalized, ...current].slice(0, MAX_SAVED_ASSETS)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  notifyAssetsChanged()
  return normalized
}

export function formatAssetDate(value) {
  if (!value) return 'Just now'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Just now'
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function slugify(value) {
  return String(value || 'admart-image')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'admart-image'
}

export function downloadFilename(title, extension = 'png') {
  return `${slugify(title)}.${extension}`
}

export async function downloadAsset(url, filename) {
  if (!url) {
    throw new Error('No image is available to download.')
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Could not download the image file.')
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename || downloadFilename('admart-image')
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}
