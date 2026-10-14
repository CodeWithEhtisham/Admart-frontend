import { formatCredits } from './credits'
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
  prepare: ['Check video', 'Reads your video: length, shape and sound.'],
  transcribe: ['Transcript', 'Writes down every word you say, with its exact timing.'],
  clean_audio: ['Clean audio', 'Removes background noise and evens out your voice.'],
  plan_edit: ['Edit plan', 'Finds pauses, um/uh, restarts and bad frames to cut, and fixes caption spelling.'],
  render_edit: ['Video', 'Makes the edited video in your format, with captions and levelled sound.'],
  package: ['Title & thumbnail', 'Writes the title, description and thumbnail text from what you said.'],
  trends: ['Trends', "Searches the web for what's rising this week in your niche, with a hook for each."],
  fetch: ['Check video', 'Reads your video: length, shape and sound.'],
  listen: ['Transcript', 'Writes down what is said in the first 3 minutes.'],
  write_post: ['Posts', 'Writes a post for each connected platform from what is said in the video.'],
  wait: ['Scheduled', 'Waits until the time you picked.'],
  post: ['Post', 'Posts it to each platform you picked.'],
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
  return run.title || run.concept?.title || run.input.topic || run.input.title || (run.input.auto ? 'Agent is picking a topic…' : (run.input.text || '').slice(0, 80))
}

/** A Cross-poster run waiting for its scheduled time. */
export const isScheduled = (run) => run.status === 'queued' && run.step === 'wait'

export const whenText = (iso) =>
  new Date(iso).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

export function runStatusText(run) {
  if (isScheduled(run) && run.postAt) return `Scheduled: ${whenText(run.postAt)}`
  if (run.status === 'running') return `Working: ${AGENT_STEPS[run.step]?.[0] || 'getting started'}`
  return STATUS_TEXT[run.status] || run.status
}

/** "about 2 credits per run" / "about 1 credit per minute of video". */
export function costText(agent) {
  const unit = agent?.creditUnit === 'minute' ? 'minute of video' : 'run'
  return `about ${formatCredits(agent?.estimatedCredits)} credits per ${unit}`
}
