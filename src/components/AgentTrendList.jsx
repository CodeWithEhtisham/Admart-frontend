import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listDeployments, startRun, updateDeployment } from '../utils/agents'
import { getCredits, notifyCreditsChanged } from '../utils/credits'
import { getCachedActiveProject } from '../utils/projects'
import { HookScore } from './AgentRunViews.jsx'

const btn =
  'rounded-lg border border-border-default px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50'

/** Trend Finder results: each trend can start a Short or join the Shorts agent's Autopilot queue. */
export default function AgentTrendList({ run }) {
  const navigate = useNavigate()
  const projectId = getCachedActiveProject()?.id
  const [shorts, setShorts] = useState(undefined) // the project's Shorts agent, null if none
  const [busy, setBusy] = useState('')
  const [queued, setQueued] = useState(() => new Set())
  const [error, setError] = useState('')

  useEffect(() => {
    if (!projectId) return
    listDeployments(projectId)
      .then((rows) => setShorts(rows.find((d) => d.agentType === 'youtube-shorts') || null))
      .catch(() => setShorts(null))
  }, [projectId])

  useEffect(() => {
    if (shorts) setQueued(new Set(shorts.topicQueue || []))
  }, [shorts])

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

  const addToAutopilot = async (topic) => {
    setBusy(topic)
    setError('')
    try {
      setShorts(await updateDeployment(projectId, shorts.id, { topicQueue: [...(shorts.topicQueue || []), topic] }))
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add it to Autopilot.')
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="space-y-3 text-sm">
      {shorts === null ? (
        <p className="rounded-xl border border-border-default bg-input px-3 py-2 text-xs text-text-secondary">
          To turn a trend into a video, start the{' '}
          <Link to="/agents" className="font-medium text-link hover:underline">
            YouTube Shorts Creator
          </Link>{' '}
          first.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-danger">
          {error}
        </p>
      ) : null}
      <ul className="space-y-3">
        {run.trends.map((t) => (
          <li key={t.topic} className="rounded-xl border border-border-default bg-input p-4">
            <p className="font-semibold">{t.topic}</p>
            {t.why_now ? <p className="mt-1 text-text-secondary">{t.why_now}</p> : null}
            {t.hook ? (
              <div className="mt-2 space-y-1">
                <HookScore concept={t} />
                <p className="text-text-secondary">“{t.hook}”</p>
              </div>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {shorts ? (
                <>
                  <button type="button" className={btn} disabled={Boolean(busy)} onClick={() => makeShort(t.topic)}>
                    {busy === t.topic ? 'Working…' : 'Make a Short'}
                  </button>
                  <button
                    type="button"
                    className={btn}
                    disabled={Boolean(busy) || queued.has(t.topic)}
                    onClick={() => addToAutopilot(t.topic)}
                  >
                    {queued.has(t.topic) ? '✓ In Autopilot queue' : 'Add to Autopilot'}
                  </button>
                </>
              ) : null}
              {t.source?.uri ? (
                <a href={t.source.uri} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-link hover:underline">
                  Source: {t.source.title || new URL(t.source.uri).hostname}
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
