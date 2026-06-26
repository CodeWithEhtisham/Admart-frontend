import api from './api'

// Broadcast when the active project changes so any component can react.
export const PROJECT_CHANGE_EVENT = 'vidify:project-change'
const ACTIVE_KEY = 'vidify_activeProject'

// Sensible visual fallbacks for projects the backend created without icon/color.
export const DEFAULT_PROJECT_COLOR = '#2563eb'
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

export async function connectPlatform(projectId, platform) {
  const { data } = await api.post(`/api/projects/${projectId}/social/connect/${platform}`)
  return data
}

export async function disconnectPlatform(projectId, platform) {
  const { data } = await api.delete(`/api/projects/${projectId}/social/disconnect/${platform}`)
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
