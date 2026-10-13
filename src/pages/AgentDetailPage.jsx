import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Topbar from '../components/Topbar'
import AgentAutopilot from '../components/AgentAutopilot.jsx'
import AgentSettingsDialog from '../components/AgentSettingsDialog.jsx'
import { AgentIcon, KindBadge, StatusBadge } from '../components/AgentBits.jsx'
import AgentWorkflow, { HowItWorks } from '../components/AgentWorkflow.jsx'
import {
  getDeployment,
  listRuns,
  runStatusText,
  runTitle,
  removeDeployment,
  runAction,
  startRun,
  updateDeployment,
} from '../utils/agents'
import { formatCredits, getCredits, notifyCreditsChanged } from '../utils/credits'
import { getCachedActiveProject, PROJECT_CHANGE_EVENT } from '../utils/projects'

const OPEN = ['queued', 'running']
const POLL_MS = 3000
const AUTOPILOT_POLL_MS = 15000

export default function AgentDetailPage() {
  const { deploymentId } = useParams()
  const navigate = useNavigate()
  const [projectId, setProjectId] = useState(() => getCachedActiveProject()?.id)
  const [deployment, setDeployment] = useState(null)
  const [runs, setRuns] = useState([])
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [searchParams, setSearchParams] = useSearchParams()

  const load = useCallback(async () => {
    if (!projectId) return
    try {
      const [d, r] = await Promise.all([getDeployment(projectId, deploymentId), listRuns(projectId, deploymentId)])
      setDeployment(d)
      setRuns(r)
    } catch (err) {
      if (err.response?.status === 404) navigate('/agents', { replace: true })
      else setError('Could not load this agent. Refresh to try again.')
    }
  }, [projectId, deploymentId, navigate])

  useEffect(() => {
    load()
  }, [load])

  // Agents belong to a project: switching project goes back to the catalog.
  useEffect(() => {
    const leave = (e) => {
      const next = e.detail?.id
      if (projectId && next && next !== projectId) navigate('/agents')
      else if (next) setProjectId(next) // project only just loaded (e.g. opened from a link)
    }
    window.addEventListener(PROJECT_CHANGE_EVENT, leave)
    return () => window.removeEventListener(PROJECT_CHANGE_EVENT, leave)
  }, [navigate, projectId])

  const working = runs.some((r) => OPEN.includes(r.status))
  const autopilot = Boolean(deployment?.autopilot)
  useEffect(() => {
    // Fast while something runs; slow with Autopilot on, so scheduled runs appear without a reload.
    if (!working && !autopilot) return undefined
    const t = setInterval(() => {
      setNow(Date.now())
      load()
    }, working ? POLL_MS : AUTOPILOT_POLL_MS)
    return () => clearInterval(t)
  }, [working, autopilot, load])

  const agent = deployment?.agent
  const isText = agent?.inputKind === 'text'
  const canAutoTopic = !isText && Boolean(deployment?.config?.niche)
  const selected =
    runs.find((r) => r.id === searchParams.get('run')) ||
    runs.find((r) => r.status === 'needs_review') ||
    runs.find((r) => OPEN.includes(r.status)) ||
    runs[0]
  const select = (id) => setSearchParams({ run: id }, { replace: true })

  const run = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const created = await startRun(projectId, deploymentId, isText ? { text: value } : { topic: value })
      setRuns((prev) => [created, ...prev])
      select(created.id)
      setValue('')
      getCredits().then(notifyCreditsChanged).catch(() => {})
    } catch (err) {
      const data = err.response?.data
      setError(
        data?.code === 'INSUFFICIENT_CREDITS'
          ? `Not enough credits: this run needs ${formatCredits(data.creditsRequired)}.`
          : data?.message || 'Could not start the run.',
      )
    } finally {
      setBusy(false)
    }
  }

  const setStatus = async (status) => {
    setDeployment(await updateDeployment(projectId, deploymentId, { status }))
  }

  const remove = async () => {
    try {
      await removeDeployment(projectId, deploymentId)
      navigate('/agents')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove the agent.')
      setConfirmRemove(false)
    }
  }

  const approve = async (r) => {
    setBusy(true)
    try {
      await runAction(projectId, deploymentId, r.id, 'approve')
      navigate('/publish', {
        state: {
          type: 'video',
          videoUrl: r.videoUrl,
          thumbnailUrl: r.thumbnailUrl,
          title: r.title,
          prompt: r.description,
          tags: r.tags,
          assetId: r.libraryAssetId,
        },
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Could not approve this run.')
      setBusy(false)
    }
  }

  const act = async (r, action, payload) => {
    setBusy(true)
    setError('')
    try {
      const updated = await runAction(projectId, deploymentId, r.id, action, payload)
      setRuns((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      if (['discard', 'regenerate', 'retry'].includes(action)) getCredits().then(notifyCreditsChanged).catch(() => {})
    } catch (err) {
      setError(err.response?.data?.message || 'That did not work. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AppLayout>
      <div className="flex min-h-screen flex-col">
        <Topbar title={deployment?.name || 'Agent'} />
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 space-y-6 p-4 text-text-primary sm:p-7">
          <Link to="/agents" className="text-sm text-text-secondary hover:text-text-primary">
            ← All agents
          </Link>

          {deployment ? (
            <section className="flex flex-wrap items-start gap-4 rounded-2xl border border-border-default bg-surface p-5">
              <AgentIcon slug={deployment.agentType} kind={deployment.kind} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading text-lg font-bold">{deployment.name}</h2>
                  <KindBadge kind={deployment.kind} />
                  <StatusBadge status={deployment.status} />
                </div>
                <p className="mt-1 text-sm text-text-secondary">{agent?.description}</p>
                <p className="mt-2 text-xs text-text-tertiary">
                  {formatCredits(deployment.creditsThisMonth)} credits this month
                  {deployment.monthlyCreditLimit ? ` of ${formatCredits(deployment.monthlyCreditLimit)} limit` : ''}
                  {deployment.config?.niche ? ` · Niche: ${deployment.config.niche}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="rounded-xl border border-border-default px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
                >
                  Settings
                </button>
                <button
                  type="button"
                  onClick={() => setStatus(deployment.status === 'active' ? 'paused' : 'active')}
                  className="rounded-xl border border-border-default px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
                >
                  {deployment.status === 'active' ? 'Pause' : 'Resume'}
                </button>
                {confirmRemove ? (
                  <>
                    <button
                      type="button"
                      onClick={remove}
                      className="rounded-xl border border-error/50 px-4 py-2 text-sm font-semibold text-danger hover:bg-error/10"
                    >
                      Yes, remove
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmRemove(false)}
                      className="rounded-xl border border-border-default px-4 py-2 text-sm text-text-secondary"
                    >
                      Keep
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmRemove(true)}
                    className="rounded-xl border border-border-default px-4 py-2 text-sm font-medium text-text-secondary hover:text-danger"
                  >
                    Remove
                  </button>
                )}
              </div>
            </section>
          ) : null}

          {error ? (
            <p role="alert" className="rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          ) : null}

          {deployment ? (
            <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
              <aside className="space-y-4">
              {agent ? (
                <form onSubmit={run} className="rounded-2xl border border-border-default bg-surface p-4">
                  <label className="block text-sm">
                    <span className="font-heading text-[1rem] font-semibold">
                      {deployment?.agentType === 'youtube-shorts' ? 'Make a Short' : 'Run now'}
                    </span>
                    <span className="mt-1 block text-text-tertiary">
                      {canAutoTopic ? `${agent.inputLabel} (optional: leave it blank and the agent picks one)` : agent.inputLabel}
                    </span>
                    {isText ? (
                      <textarea
                        rows={5}
                        maxLength={3000}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={agent.inputHint}
                        className="mt-1 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-sm focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                      />
                    ) : (
                      <input
                        value={value}
                        maxLength={200}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={agent.inputHint}
                        className="mt-1 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-sm focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                      />
                    )}
                  </label>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={busy || (!value.trim() && !canAutoTopic) || deployment?.status !== 'active'}
                      className="rounded-xl gradient-bg px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busy ? 'Starting…' : value.trim() || !canAutoTopic ? 'Make it' : 'Let the agent pick'}
                    </button>
                    <span className="text-xs text-text-tertiary">
                      {deployment?.status === 'active'
                        ? `About ${formatCredits(agent.estimatedCredits)} credits. Refunded if it fails.`
                        : 'This agent is paused. Resume it to run.'}
                    </span>
                  </div>
                </form>
              ) : null}

                {runs.length ? (
                  <nav aria-label="Runs" className="overflow-hidden rounded-2xl border border-border-default bg-surface">
                    <ul className="max-h-[60vh] divide-y divide-border-default overflow-y-auto">
                      {runs.map((r) => {
                        const active = r.id === selected?.id
                        return (
                          <li key={r.id}>
                            <button
                              type="button"
                              onClick={() => select(r.id)}
                              aria-current={active ? 'true' : undefined}
                              className={`block w-full px-4 py-3 text-left transition ${active ? 'bg-accent-blue/10' : 'hover:bg-elevated'}`}
                            >
                              <span className="block truncate text-sm font-medium">{runTitle(r)}</span>
                              <span
                                className={`mt-0.5 block text-xs ${
                                  r.status === 'needs_review'
                                    ? 'font-semibold text-link'
                                    : r.status === 'failed'
                                      ? 'text-danger'
                                      : 'text-text-tertiary'
                                }`}
                              >
                                {runStatusText(r)} · {new Date(r.createdAt).toLocaleDateString()}
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </nav>
                ) : null}
              </aside>

              <div className="min-w-0">
                {selected ? (
                  <AgentWorkflow
                    key={selected.id}
                    run={selected}
                    agent={agent}
                    busy={busy}
                    now={now}
                    onAction={act}
                    onApprove={approve}
                  />
                ) : (
                  <HowItWorks agent={agent} />
                )}
              </div>
            </div>
          ) : null}

          {agent?.inputKind === 'topic' && deployment ? (
            <AgentAutopilot
              key={deployment.id}
              deployment={deployment}
              agent={agent}
              onSave={async (payload) => setDeployment(await updateDeployment(projectId, deploymentId, payload))}
            />
          ) : null}
        </main>
      </div>

      {showSettings && deployment ? (
        <AgentSettingsDialog
          deployment={deployment}
          onClose={() => setShowSettings(false)}
          onSave={async (payload) => setDeployment(await updateDeployment(projectId, deploymentId, payload))}
        />
      ) : null}
    </AppLayout>
  )
}
