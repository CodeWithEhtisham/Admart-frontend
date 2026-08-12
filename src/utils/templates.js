import api from './api'
import { needsOnboarding } from './projects'

export const PENDING_TEMPLATE_USE_KEY = 'admart:pending-template-use'

export async function listTemplates(params = {}) {
  const { data } = await api.get('/api/templates', { params })
  return data
}

export async function getTemplate(templateId) {
  const { data } = await api.get(`/api/templates/${templateId}`)
  return data
}

export async function recordTemplateUse(templateId) {
  const { data } = await api.post(`/api/templates/${templateId}/use`)
  return data
}

export function setPendingTemplateUse(payload) {
  if (!payload) return
  localStorage.setItem(PENDING_TEMPLATE_USE_KEY, JSON.stringify(payload))
}

export function getPendingTemplateUse() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_TEMPLATE_USE_KEY) || 'null')
  } catch {
    return null
  }
}

export function clearPendingTemplateUse() {
  localStorage.removeItem(PENDING_TEMPLATE_USE_KEY)
}

export function postAuthDestination(user, fallback = '/dashboard') {
  if (needsOnboarding(user)) return '/onboarding'
  const pending = getPendingTemplateUse()
  if (pending?.returnTo) return pending.returnTo
  if (pending?.id) return `/templates?resumeTemplate=${encodeURIComponent(pending.id)}`
  return fallback
}
