/** Superadmin panel API — contract from docs/SUPERADMIN-PLAN.md */

import api from './api'

let adminStatusPromise = null

/** Resolve the backend user's staff/superuser flags (cached after first fetch). */
export function getAdminStatus(force = false) {
  if (force || !adminStatusPromise) {
    adminStatusPromise = api
      .get('/api/auth/me')
      .then(({ data }) => ({
        isStaff: Boolean(data.isStaff),
        isSuperuser: Boolean(data.isSuperuser),
        email: data.email || '',
      }))
      .catch(() => ({ isStaff: false, isSuperuser: false, email: '' }))
  }
  return adminStatusPromise
}

export function resetAdminStatus() {
  adminStatusPromise = null
}

export async function getAdminStats() {
  const { data } = await api.get('/api/admin/stats')
  return data
}

export async function getAdminUsage() {
  const { data } = await api.get('/api/admin/usage')
  return data
}

export async function getAdminRevenue() {
  const { data } = await api.get('/api/admin/revenue')
  return data
}

export async function getAdminPlans() {
  const { data } = await api.get('/api/admin/plans')
  return data?.items ?? []
}

export async function getAdminUsers(params = {}) {
  const { data } = await api.get('/api/admin/users', { params })
  return data
}

export async function getAdminUser(userId) {
  const { data } = await api.get(`/api/admin/users/${userId}`)
  return data
}

export async function patchAdminUser(userId, patch) {
  const { data } = await api.patch(`/api/admin/users/${userId}`, patch)
  return data
}

export async function changeAdminUserPlan(userId, payload) {
  const { data } = await api.post(`/api/admin/users/${userId}/plan`, payload)
  return data
}

export async function adjustAdminUserCredits(userId, payload) {
  const { data } = await api.post(`/api/admin/users/${userId}/credits`, payload)
  return data
}

export async function deleteAdminUser(userId) {
  const { data } = await api.delete(`/api/admin/users/${userId}`)
  return data
}

export async function createAdminUser(payload) {
  const { data } = await api.post('/api/admin/users', payload)
  return data
}

export async function getAdminPayments(params = {}) {
  const { data } = await api.get('/api/admin/payments', { params })
  return data?.items ?? []
}

export async function createAdminPayment(payload) {
  const { data } = await api.post('/api/admin/payments', payload)
  return data
}

export async function getAdminSettings() {
  const { data } = await api.get('/api/admin/settings')
  return data
}

export async function updateAdminSettings(payload) {
  const { data } = await api.put('/api/admin/settings', payload)
  return data
}

export function formatAdminNumber(value, fallback = '—') {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return fallback
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return String(n)
}

export function formatAdminDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export function formatAdminDateTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function timeAgo(iso) {
  if (!iso) return '—'
  const then = new Date(iso).getTime()
  if (!Number.isFinite(then)) return '—'
  const diff = Date.now() - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatAdminDate(iso)
}
