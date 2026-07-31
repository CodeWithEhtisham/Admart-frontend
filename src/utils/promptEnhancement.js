import api from './api'

export async function enhancePromptRemote({ kind, prompt, negativePrompt, context = {} }) {
  const payload = {
    kind,
    prompt,
    context,
  }
  if (negativePrompt?.trim()) payload.negativePrompt = negativePrompt.trim()
  const { data } = await api.post('/api/prompts/enhance', payload)
  return data
}

export function promptEnhancementError(err) {
  const status = err?.response?.status
  const data = err?.response?.data
  if (status === 401) return 'Please sign in again.'
  if (status === 429) return 'Too many enhancement requests. Wait a moment and retry.'
  return data?.message || data?.detail || err?.message || 'Prompt enhancer unavailable.'
}
