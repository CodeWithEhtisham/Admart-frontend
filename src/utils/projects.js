import api from './api'

// Broadcast when the active project changes so any component can react.
export const PROJECT_CHANGE_EVENT = 'admart:project-change'
const ACTIVE_KEY = 'admart_activeProject'

// Sensible visual fallbacks for projects the backend created without icon/color.
export const DEFAULT_PROJECT_COLOR = '#5b7cfa'
export const DEFAULT_PROJECT_ICON = '▶'

export function normalizeProject(project) {
  if (!project) return project
  return {
    ...project,
    color: project.color || DEFAULT_PROJECT_COLOR,
    icon: project.icon || DEFAULT_PROJECT_ICON,
    org: project.org || 'Personal',
  }
}

/**
 * Whether a freshly-authenticated user should be sent to onboarding.
 * Prefers the new `projectCount` field; falls back to `onboardingCompleted`
 * for backends that haven't shipped the project fields yet.
 */
export function needsOnboarding(user) {
  if (!user) return true
  if (typeof user.projectCount === 'number') return user.projectCount === 0
  return !user.onboardingCompleted
}

function safeAppPath(value) {
  if (!value || typeof value !== 'string') return '/dashboard'
  if (!value.startsWith('/') || value.startsWith('//')) return '/dashboard'
  if (value.startsWith('/auth')) return '/dashboard'
  return value
}

/**
 * After login/register/Google: first-time users (no project) go to onboarding.
 */
export async function postLoginPath(user, intended = '/dashboard') {
  const fallback = safeAppPath(intended)

  if (typeof user?.projectCount === 'number') {
    return user.projectCount === 0 ? '/onboarding' : fallback
  }
  if (user?.onboardingCompleted === true) return fallback
  if (user?.onboardingCompleted === false) return '/onboarding'

  try {
    const { projects } = await listProjects()
    return projects?.length ? fallback : '/onboarding'
  } catch {
    return '/onboarding'
  }
}

// ─── API calls ────────────────────────────────────────────────────────
export async function listProjects() {
  const { data } = await api.get('/api/projects')
  return {
    projects: (data.projects || []).map(normalizeProject),
    activeProjectId: data.activeProjectId ?? null,
  }
}

export async function createProject(payload) {
  const { data } = await api.post('/api/projects', payload)
  return normalizeProject(data)
}

export async function updateProject(id, payload) {
  const { data } = await api.patch(`/api/projects/${id}`, payload)
  return normalizeProject(data)
}

export async function deleteProject(id) {
  await api.delete(`/api/projects/${id}`)
}

export async function activateProject(id) {
  const { data } = await api.post(`/api/projects/${id}/activate`)
  return data // { activeProjectId }
}

// ─── Social accounts (scoped to a project) ────────────────────────────
export async function listSocialAccounts(projectId) {
  const { data } = await api.get(`/api/projects/${projectId}/social/accounts`)
  return data // array of social account objects
}

/**
 * Begin the OAuth handshake: ask the backend for the provider authorize URL,
 * then send the browser there. The backend handles the callback and redirects
 * the user back to /social?connected=<platform> (or ?error=<platform>).
 */
export async function connectPlatform(projectId, platform) {
  const { data } = await api.get(`/api/projects/${projectId}/social/connect/${platform}/url`)
  window.location.href = data.authUrl
  return data
}

export async function disconnectPlatform(projectId, platform) {
  const { data } = await api.delete(`/api/projects/${projectId}/social/disconnect/${platform}`)
  return data
}

export async function publishToAccounts(projectId, payload) {
  const { data } = await api.post(`/api/projects/${projectId}/publish`, payload)
  return data
}

export async function listYoutubePlaylists(projectId) {
  const { data } = await api.get(`/api/projects/${projectId}/social/youtube/playlists`)
  return data
}

export async function suggestYoutubeCopy(projectId, payload) {
  const { data } = await api.post(`/api/projects/${projectId}/publish/youtube/suggest`, payload)
  return data
}

export async function listAdAccounts(projectId) {
  const { data } = await api.get(`/api/projects/${projectId}/ads/accounts`)
  return data
}

export async function connectAdsProvider(projectId, provider) {
  const { data } = await api.get(`/api/projects/${projectId}/ads/connect/${provider}/url`)
  window.location.href = data.authUrl
  return data
}

export async function disconnectAdsProvider(projectId, provider) {
  const { data } = await api.delete(`/api/projects/${projectId}/ads/disconnect/${provider}`)
  return data
}

export async function boostAsAd(projectId, payload) {
  const { data } = await api.post(`/api/projects/${projectId}/ads/boost`, payload)
  return data
}

// ─── Active-project cache (keeps the switcher instant across reloads) ──
export function getCachedActiveProject() {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setActiveProject(project) {
  if (!project) return
  const normalized = normalizeProject(project)
  localStorage.setItem(ACTIVE_KEY, JSON.stringify(normalized))
  window.dispatchEvent(new CustomEvent(PROJECT_CHANGE_EVENT, { detail: normalized }))
  return normalized
}

export function clearActiveProject() {
  localStorage.removeItem(ACTIVE_KEY)
}

/**
 * Decide which project should be active given the list payload.
 * Priority: server's activeProjectId → previously cached project → most recent (projects[0]).
 */
export function resolveActiveProject({ projects, activeProjectId }) {
  if (!projects?.length) return null
  const cached = getCachedActiveProject()
  return (
    projects.find((p) => p.id === activeProjectId) ||
    (cached && projects.find((p) => p.id === cached.id)) ||
    projects[0]
  )
}
