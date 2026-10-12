import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Topbar from '../components/Topbar'
import { AgentIcon, KindBadge, StatusBadge } from '../components/AgentBits.jsx'
import { deployAgent, getAgentCatalog, listDeployments, PLATFORM_NAMES } from '../utils/agents'
import { formatCredits } from '../utils/credits'
import { getCachedActiveProject, listSocialAccounts, PROJECT_CHANGE_EVENT } from '../utils/projects'

const TABS = [
  ['all', 'All'],
  ['small', 'Single tasks'],
  ['large', 'Full automations'],
]

const fieldClass =
  'mt-1 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue'

/** Large agents: Connect → Brief → Rules. Small agents: one confirm step. */
function DeployDialog({ agent, projectId, onClose, onDeployed }) {
  const steps = agent.kind === 'large' ? ['Connect', 'Brief', 'Rules'] : ['Confirm']
  const [step, setStep] = useState(0)
  const [connected, setConnected] = useState(null)
  const [niche, setNiche] = useState('')
  const [style, setStyle] = useState('')
  const [checkpoints, setCheckpoints] = useState('all')
  const [music, setMusic] = useState(true)
  const [stock, setStock] = useState(true)
  const [limit, setLimit] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!agent.needs.length) return
    listSocialAccounts(projectId)
      .then((rows) => setConnected(new Set((rows || []).filter((a) => a.connected).map((a) => a.platform))))
      .catch(() => setConnected(new Set()))
  }, [agent, projectId])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const deploy = async () => {
    setBusy(true)
    setError('')
    try {
      const deployment = await deployAgent(projectId, {
        agentType: agent.slug,
        config:
          agent.kind === 'large'
            ? { niche: niche.trim(), style, checkpoints, music, stock }
            : {},
        monthlyCreditLimit: limit.trim() || null,
      })
      onDeployed(deployment)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not deploy the agent.')
      setBusy(false)
    }
  }

  const name = steps[step]
  const last = step === steps.length - 1
  const missing = agent.needs.filter((p) => connected && !connected.has(p))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="deploy-title"
        className="w-full max-w-lg rounded-2xl border border-border-default bg-panel p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <AgentIcon slug={agent.slug} kind={agent.kind} />
          <div>
            <h2 id="deploy-title" className="font-heading text-lg font-semibold">
              Deploy {agent.name}
            </h2>
            {steps.length > 1 ? (
              <p className="text-xs text-text-tertiary">
                Step {step + 1} of {steps.length} · {name}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 space-y-4 text-sm">
          {name === 'Connect' ? (
            <>
              <p className="text-text-secondary">This agent needs these accounts to publish what it makes:</p>
              {agent.needs.map((p) => (
                <div key={p} className="flex items-center justify-between rounded-xl border border-border-default bg-input px-4 py-3">
                  <span className="font-medium">{PLATFORM_NAMES[p] || p}</span>
                  {connected === null ? (
                    <span className="text-xs text-text-tertiary">Checking…</span>
                  ) : connected.has(p) ? (
                    <span className="rounded-full border border-success/40 bg-success/15 px-2 py-0.5 text-xs font-semibold text-success-text">
                      Connected
                    </span>
                  ) : (
                    <Link to="/social" className="text-sm font-medium text-link hover:underline">
                      Connect →
                    </Link>
                  )}
                </div>
              ))}
              {missing.length ? (
                <p className="text-xs text-text-tertiary">
                  You can deploy now and connect later. Videos are saved to your library either way.
                </p>
              ) : null}
            </>
          ) : null}

          {name === 'Brief' ? (
            <>
              <label className="block">
                <span className="text-text-tertiary">Channel topic or niche (optional)</span>
                <textarea
                  rows={3}
                  maxLength={300}
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. Quick coffee facts and brewing tips for beginners"
                  className={`${fieldClass} resize-none`}
                />
              </label>
              {agent.styles?.length ? (
                <label className="block">
                  <span className="text-text-tertiary">Visual style</span>
                  <select value={style} onChange={(e) => setStyle(e.target.value)} className={fieldClass}>
                    <option value="">Let the agent choose per video</option>
                    {agent.styles.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <p className="text-xs text-text-tertiary">
                Tone of voice and caption colour come from your{' '}
                <Link to="/brand-kit" className="text-link hover:underline">
                  Brand Kit
                </Link>
                .
              </p>
            </>
          ) : null}

          {name === 'Rules' || name === 'Confirm' ? (
            <>
              {name === 'Confirm' ? <p className="text-text-secondary">{agent.description}</p> : null}
              {agent.review ? (
                <>
                  <fieldset className="rounded-xl border border-border-default bg-input px-4 py-3">
                    <legend className="px-1 font-medium">Check-ins</legend>
                    {[
                      ['all', 'Every step', 'Pick the concept, edit the script and check the storyboard before money is spent on the next stage.'],
                      ['final', 'Final video only', 'The agent decides everything and you review the finished Short.'],
                    ].map(([id, label, hint]) => (
                      <label key={id} className="mt-2 flex cursor-pointer items-start gap-2">
                        <input type="radio" name="checkpoints" className="mt-1" checked={checkpoints === id} onChange={() => setCheckpoints(id)} />
                        <span>
                          <span className="block font-medium">{label}</span>
                          <span className="text-xs text-text-tertiary">{hint}</span>
                        </span>
                      </label>
                    ))}
                    <p className="mt-2 text-xs text-text-tertiary">Either way, nothing is posted until you approve it.</p>
                  </fieldset>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={music} onChange={(e) => setMusic(e.target.checked)} />
                    Background music (quieter under the voice)
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={stock} onChange={(e) => setStock(e.target.checked)} />
                    Use free stock video where it fits
                  </label>
                </>
              ) : null}
              <div className="rounded-xl border border-border-default bg-input px-4 py-3">
                <p className="font-medium">Runs: when you click Run now</p>
                <p className="mt-1 text-xs text-text-tertiary">Scheduled runs are coming soon.</p>
              </div>
              <label className="block">
                <span className="text-text-tertiary">Monthly credit limit (optional)</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="No limit"
                  className={fieldClass}
                />
              </label>
              <p className="text-xs text-text-tertiary">About {formatCredits(agent.estimatedCredits)} credits per run.</p>
            </>
          ) : null}

          {error ? (
            <p role="alert" className="text-danger">
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={step ? () => setStep(step - 1) : onClose}
            className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-secondary"
          >
            {step ? 'Back' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={last ? deploy : () => setStep(step + 1)}
            disabled={busy}
            className="rounded-lg gradient-bg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {last ? (busy ? 'Deploying…' : 'Deploy') : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AgentsPage() {
  const navigate = useNavigate()
  const [project, setProject] = useState(() => getCachedActiveProject())
  const [catalog, setCatalog] = useState([])
  const [deployments, setDeployments] = useState([])
  const [tab, setTab] = useState('all')
  const [deploying, setDeploying] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const active = getCachedActiveProject()
    setProject(active)
    setLoading(true)
    setError('')
    try {
      const [agents, mine] = await Promise.all([
        getAgentCatalog(),
        active?.id ? listDeployments(active.id) : Promise.resolve([]),
      ])
      setCatalog(agents)
      setDeployments(mine)
    } catch {
      setError('Could not load agents. Refresh to try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    window.addEventListener(PROJECT_CHANGE_EVENT, load)
    return () => window.removeEventListener(PROJECT_CHANGE_EVENT, load)
  }, [load])

  const shown = catalog.filter((a) => tab === 'all' || a.kind === tab)
  const deployedBySlug = Object.fromEntries(deployments.map((d) => [d.agentType, d]))

  return (
    <AppLayout>
      <div className="flex min-h-screen flex-col">
        <Topbar title="Agents" />
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 space-y-8 p-4 text-text-primary sm:p-7">
          <p className="max-w-2xl text-sm text-text-secondary">
            Agents do the work for you. Single-task agents do one job. Full automations chain several jobs into a
            finished result, and always ask for your approval before anything is posted.
          </p>

          {error ? (
            <p role="alert" className="rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          ) : null}

          {!loading && !project?.id ? (
            <p className="text-sm text-text-secondary">
              Agents belong to a project.{' '}
              <Link to="/onboarding" className="font-medium text-link hover:underline">
                Create a project
              </Link>{' '}
              first.
            </p>
          ) : null}

          {deployments.length ? (
            <section className="space-y-3">
              <h2 className="font-heading text-lg font-bold">My agents</h2>
              <div className="divide-y divide-border-default overflow-hidden rounded-2xl border border-border-default bg-surface">
                {deployments.map((d) => (
                  <Link
                    key={d.id}
                    to={`/agents/${d.id}`}
                    className="flex flex-wrap items-center gap-3 px-5 py-4 transition hover:bg-elevated"
                  >
                    <AgentIcon slug={d.agentType} kind={d.kind} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{d.name}</p>
                      <p className="text-xs text-text-tertiary">
                        {formatCredits(d.creditsThisMonth)} credits this month
                        {d.monthlyCreditLimit ? ` of ${formatCredits(d.monthlyCreditLimit)}` : ''}
                      </p>
                    </div>
                    <StatusBadge status={d.status} />
                    <span className="text-sm font-medium text-link">Open →</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-heading text-lg font-bold">Agent catalog</h2>
              <div role="tablist" aria-label="Agent type" className="flex gap-1 rounded-xl border border-border-default bg-input p-1">
                {TABS.map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={tab === id}
                    onClick={() => setTab(id)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                      tab === id ? 'bg-elevated text-text-primary' : 'text-text-tertiary hover:text-text-primary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? <p className="text-sm text-text-tertiary">Loading agents…</p> : null}

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {shown.map((agent) => {
                const deployed = deployedBySlug[agent.slug]
                return (
                  <article key={agent.slug} className="flex flex-col rounded-2xl border border-border-default bg-surface p-5">
                    <div className="flex items-start gap-3">
                      <AgentIcon slug={agent.slug} kind={agent.kind} />
                      <div className="min-w-0">
                        <h3 className="font-heading font-bold">{agent.name}</h3>
                        <div className="mt-1">
                          <KindBadge kind={agent.kind} />
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 flex-1 text-sm text-text-secondary">{agent.description}</p>
                    <dl className="mt-4 space-y-1 text-xs text-text-tertiary">
                      {agent.uses.length ? (
                        <div>
                          <dt className="inline">Built from: </dt>
                          <dd className="inline">{agent.uses.join(', ')}</dd>
                        </div>
                      ) : null}
                      {agent.needs.length ? (
                        <div>
                          <dt className="inline">Needs: </dt>
                          <dd className="inline">{agent.needs.map((p) => PLATFORM_NAMES[p] || p).join(', ')}</dd>
                        </div>
                      ) : null}
                      <div>
                        <dt className="inline">Cost: </dt>
                        <dd className="inline">about {formatCredits(agent.estimatedCredits)} credits per run</dd>
                      </div>
                    </dl>
                    {deployed ? (
                      <Link
                        to={`/agents/${deployed.id}`}
                        className="mt-5 rounded-xl border border-border-default px-4 py-2 text-center text-sm font-semibold text-text-secondary hover:text-text-primary"
                      >
                        Open
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeploying(agent)}
                        disabled={!project?.id}
                        className="mt-5 rounded-xl gradient-bg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Deploy
                      </button>
                    )}
                  </article>
                )
              })}
            </div>
            {!loading ? <p className="text-sm text-text-tertiary">More agents are on the way.</p> : null}
          </section>
        </main>
      </div>

      {deploying && project?.id ? (
        <DeployDialog
          agent={deploying}
          projectId={project.id}
          onClose={() => setDeploying(null)}
          onDeployed={(d) => navigate(`/agents/${d.id}`)}
        />
      ) : null}
    </AppLayout>
  )
}
