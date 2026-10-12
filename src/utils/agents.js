import api from './api'

export const PLATFORM_NAMES = { youtube: 'YouTube', facebook: 'Facebook', instagram: 'Instagram' }

// Agents: a catalog of small (one task) and large (full automation) agents, deployed per project.
export async function getAgentCatalog() {
  const { data } = await api.get('/api/agents/catalog')
  return data
}

export async function listDeployments(projectId) {
  const { data } = await api.get(`/api/projects/${projectId}/agents`)
  return data
}

export async function deployAgent(projectId, payload) {
  const { data } = await api.post(`/api/projects/${projectId}/agents`, payload)
  return data
}

export async function getDeployment(projectId, id) {
  const { data } = await api.get(`/api/projects/${projectId}/agents/${id}`)
  return data
}

export async function updateDeployment(projectId, id, payload) {
  const { data } = await api.patch(`/api/projects/${projectId}/agents/${id}`, payload)
  return data
}

export async function removeDeployment(projectId, id) {
  await api.delete(`/api/projects/${projectId}/agents/${id}`)
}

export async function listRuns(projectId, id) {
  const { data } = await api.get(`/api/projects/${projectId}/agents/${id}/runs`)
  return data
}

export async function startRun(projectId, id, payload) {
  const { data } = await api.post(`/api/projects/${projectId}/agents/${id}/runs`, payload)
  return data
}

export async function runAction(projectId, id, runId, action, payload = {}) {
  const { data } = await api.post(`/api/projects/${projectId}/agents/${id}/runs/${runId}/${action}`, payload)
  return data
}

export async function getInbox(projectId) {
  const { data } = await api.get(`/api/projects/${projectId}/agents/inbox`)
  return data
}
