/** Credits API — contract from frontend-credits.md */

import api from './api'

export const CREDITS_CHANGE_EVENT = 'admart:credits-change'

export const CAPABILITY_LABELS = {
  textToImage: 'Text to image',
  edit: 'Edit',
  multiEdit: 'Multi-edit',
  upscale: 'Upscale',
  removeBackground: 'Remove background',
  textToVideo: 'Text to video',
  imageToVideo: 'Image to video',
  firstLastFrame: 'First → last frame',
}

/** Broadcast balance updates so sidebar / topbar stay in sync. */
export function notifyCreditsChanged(partial) {
  if (typeof window === 'undefined' || !partial) return
  window.dispatchEvent(new CustomEvent(CREDITS_CHANGE_EVENT, { detail: partial }))
}

export async function getCredits() {
  const { data } = await api.get('/api/credits')
  return data
}

export async function getCreditCosts() {
  const { data } = await api.get('/api/credits/costs')
  return data
}

export async function quoteCredits(payload) {
  const { data } = await api.post('/api/credits/quote', payload)
  return data
}

export async function getCreditHistory(limit = 20) {
  const { data } = await api.get('/api/credits/history', { params: { limit } })
  return data?.items ?? (Array.isArray(data) ? data : [])
}

export function formatCredits(value, fallback = '—') {
  if (value == null || value === '') return fallback
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  if (n === 0) return '0'
  if (Math.abs(n) < 0.01) return n.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
  return n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

/** Estimate cost before Generate (frontend-credits.md). */
export function estimateJobCost(byCapability, capability, numImages = 1) {
  if (!byCapability) return null
  const unit = byCapability[capability]
  if (unit == null || Number.isNaN(Number(unit))) return null
  if (capability === 'textToImage') return Number(unit) * (numImages || 1)
  return Number(unit)
}

export function formatPlanName(plan) {
  if (!plan) return '—'
  return String(plan).charAt(0).toUpperCase() + String(plan).slice(1)
}

export function formatCreditDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

/** Pull creditsRemaining from a 402 / job payload and broadcast. */
export function syncCreditsFromPayload(payload) {
  if (payload?.creditsRemaining == null) return
  const remaining = Number(payload.creditsRemaining)
  notifyCreditsChanged({
    creditsRemaining: remaining,
    canGenerate: payload.canGenerate ?? remaining > 0,
  })
}

export function creditsFromApiError(err) {
  const data = err?.response?.data
  if (data?.creditsRemaining != null) {
    syncCreditsFromPayload(data)
  }
  return data
}
