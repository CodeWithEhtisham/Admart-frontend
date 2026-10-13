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

/** Agent workflow steps: [label, what it does]. */
export const AGENT_STEPS = {
  research: ['Research', 'Looks up fresh facts about the topic on the web.'],
  concepts: ['Ideas', 'Suggests 3 different ideas for the video.'],
  script: ['Script', 'Writes what the voice says in each scene, plus the title and tags.'],
  voice: ['Voice', 'Records the narration for every scene.'],
  captions: ['Captions', 'Times the captions word by word to the voice.'],
  visuals: ['Pictures', 'Makes a picture or finds a stock clip for every scene.'],
  render: ['Video', 'Edits it all into a vertical video with music and captions.'],
  finish: ['Save', 'Saves the video and thumbnail to your Library.'],
  review: ['Your review', 'You watch it and decide. Nothing is posted without you.'],
}

const STATUS_TEXT = {
  queued: 'Waiting to start',
  needs_review: 'Ready for you',
  approved: 'Approved',
  succeeded: 'Done',
  failed: 'Failed',
  discarded: 'Discarded',
}

export function runTitle(run) {
  return run.title || run.concept?.title || run.input.topic || (run.input.auto ? 'Agent is picking a topic…' : (run.input.text || '').slice(0, 80))
}

export function runStatusText(run) {
  if (run.status === 'running') return `Working: ${AGENT_STEPS[run.step]?.[0] || 'getting started'}`
  return STATUS_TEXT[run.status] || run.status
}
