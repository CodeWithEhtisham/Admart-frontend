import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listDeployments, startRun, updateDeployment } from './agents'
import { getCredits, notifyCreditsChanged } from './credits'
import { getCachedActiveProject } from './projects'

/**
 * The project's YouTube Shorts Creator, with the two actions other agents offer on a topic:
 * start a Short now, or add the topic to its Autopilot queue. `shorts` is undefined while loading, null if none.
 */
export default function useShortsAgent() {
  const navigate = useNavigate()
  const projectId = getCachedActiveProject()?.id
  const [shorts, setShorts] = useState(undefined)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!projectId) return
    listDeployments(projectId)
      .then((rows) => setShorts(rows.find((d) => d.agentType === 'youtube-shorts') || null))
      .catch(() => setShorts(null))
  }, [projectId])

  const queued = new Set(shorts?.topicQueue || [])

  const makeShort = async (topic) => {
    setBusy(topic)
    setError('')
    try {
      const created = await startRun(projectId, shorts.id, { topic })
      getCredits().then(notifyCreditsChanged).catch(() => {})
      navigate(`/agents/${shorts.id}?run=${created.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start the Short.')
      setBusy('')
    }
  }

  const addToAutopilot = async (topics) => {
    const fresh = [].concat(topics).filter((t) => !queued.has(t))
    if (!fresh.length) return
    setBusy(fresh[0])
    setError('')
    try {
      setShorts(await updateDeployment(projectId, shorts.id, { topicQueue: [...(shorts.topicQueue || []), ...fresh] }))
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add it to Autopilot.')
    } finally {
      setBusy('')
    }
  }

  return { shorts, queued, busy, error, makeShort, addToAutopilot }
}
