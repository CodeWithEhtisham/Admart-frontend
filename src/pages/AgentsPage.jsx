import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Topbar from '../components/Topbar'
import { AgentIcon, KindBadge, StatusBadge, primaryButton, secondaryButton } from '../components/AgentBits.jsx'
import AgentStylePicker from '../components/AgentStylePicker.jsx'
import { costText, deployAgent, getAgentCatalog, getInbox, listDeployments, PLATFORM_NAMES } from '../utils/agents'
import { formatCredits } from '../utils/credits'
import { getCachedActiveProject, listSocialAccounts, PROJECT_CHANGE_EVENT } from '../utils/projects'

const TABS = [
  ['all', 'All'],
  ['small', 'Single tasks'],
  ['large', 'Full automations'],
]

const fieldClass =
  'mt-1 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue'

/** One screen: what it needs, an optional niche, and everything else under "More options". */
function DeployDialog({ agent, projectId, onClose, onDeployed }) {
  const large = agent.kind === 'large'
  const video = agent.inputKind === 'video'
  const [connected, setConnected] = useState(null)
  const [niche, setNiche] = useState('')
  const [look, setLook] = useState({})
  const [checkpoints, setCheckpoints] = useState(video ? 'all' : 'final')
  const [music, setMusic] = useState(!video)
  const [stock, setStock] = useState(true)
  const [captions, setCaptions] = useState(true)
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
        config: video
          ? { ...look, checkpoints, music, captions }
          : large
            ? { niche: niche.trim(), ...look, checkpoints, music, stock }
            : look,
        monthlyCreditLimit: limit.trim() || null,
      })
      onDeployed(deployment)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start the agent.')
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="deploy-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border-default bg-panel p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <AgentIcon slug={agent.slug} kind={agent.kind} />
          <div>
            <h2 id="deploy-title" className="font-heading text-lg font-semibold">
              {agent.name}
            </h2>
            <p className="text-xs text-text-tertiary first-letter:uppercase">{costText(agent)}</p>
          </div>
        </div>

        <div className="mt-5 space-y-4 text-sm">
          <p className="text-text-secondary">{agent.description}</p>

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
                  Connect (optional) →
                </Link>
              )}
            </div>
          ))}

          {large && !video ? (
            <label className="block">
              <span className="text-text-tertiary">What is your channel about? (optional)</span>
              <input
                maxLength={300}
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. Quick coffee facts for beginners"
                className={fieldClass}
              />
              <span className="mt-1 block text-xs text-text-tertiary">With this, the agent can pick topics for you.</span>
            </label>
          ) : null}

          {agent.voices?.length || agent.tones?.length || agent.styles?.length || agent.formats?.length || agent.clipLengths?.length ? (
            <section aria-labelledby="look-title" className="rounded-xl border border-border-default bg-input px-4 py-3">
              <h3 id="look-title" className="mb-3 font-medium">
                {video ? 'How to edit' : agent.voices?.length ? 'Voice & style' : 'Style'}
              </h3>
              <AgentStylePicker agent={agent} value={look} onChange={(patch) => setLook((prev) => ({ ...prev, ...patch }))} />
            </section>
          ) : null}

          <details className="rounded-xl border border-border-default bg-input px-4 py-3">
            <summary className="cursor-pointer font-medium">More options</summary>
            <div className="mt-3 space-y-4">
              {agent.clipLengths?.length ? (
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={checkpoints === 'all'}
                    onChange={(e) => setCheckpoints(e.target.checked ? 'all' : 'final')}
                  />
                  <span>
                    <span className="block">Let me pick the clips</span>
                    <span className="text-xs text-text-tertiary">See every moment the agent found, with its score, and trim it before the clips are made.</span>
                  </span>
                </label>
              ) : null}
              {agent.review ? (
                <>
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={checkpoints === 'all'}
                      onChange={(e) => setCheckpoints(e.target.checked ? 'all' : 'final')}
                    />
                    <span>
                      <span className="block">{video ? 'Let me review the cuts' : 'Let me check each step'}</span>
                      <span className="text-xs text-text-tertiary">
                        {video
                          ? 'See what will be cut and fix caption spelling before the video is made.'
                          : 'Pick the concept, edit the script and check the pictures before the video is made.'}
                      </span>
                    </span>
                  </label>
                  {video ? (
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={captions} onChange={(e) => setCaptions(e.target.checked)} />
                      Burn in captions
                    </label>
                  ) : null}
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={music} onChange={(e) => setMusic(e.target.checked)} />
                    Background music
                  </label>
                  {agent.styles?.length ? (
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={stock} onChange={(e) => setStock(e.target.checked)} />
                      Use free stock video where it fits
                    </label>
                  ) : null}
                </>
              ) : null}
              <label className="block">
                <span className="text-text-tertiary">Monthly credit limit</span>
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
            </div>
          </details>

          {agent.review ? <p className="text-xs text-text-tertiary">Nothing is posted until you approve it.</p> : null}

          {error ? (
            <p role="alert" className="text-danger">
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={deploy}
            disabled={busy}
            className="rounded-lg gradient-bg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? 'Starting…' : 'Start'}
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
  const [waiting, setWaiting] = useState([])
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
      const [agents, mine, inbox] = await Promise.all([
        getAgentCatalog(),
        active?.id ? listDeployments(active.id) : Promise.resolve([]),
        active?.id ? getInbox(active.id) : Promise.resolve({ items: [] }),
      ])
      setCatalog(agents)
      setDeployments(mine)
      setWaiting((inbox.items || []).filter((i) => i.status === 'needs_review'))
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

  // Full automations first: the Shorts agent is the main thing people come here for.
  const shown = catalog
    .filter((a) => tab === 'all' || a.kind === tab)
    .sort((a, b) => (a.kind === 'large' ? 0 : 1) - (b.kind === 'large' ? 0 : 1))
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

          {waiting.length ? (
            <section className="space-y-3" aria-labelledby="waiting-title">
              <h2 id="waiting-title" className="font-heading text-lg font-bold">
                Waiting for you ({waiting.length})
              </h2>
              <ul className="glass-card ai-glow divide-y divide-border-default overflow-hidden rounded-2xl">
                {waiting.map((item) => (
                  <li key={item.runId}>
                    <Link
                      to={`/agents/${item.deploymentId}?run=${item.runId}`}
                      className="flex min-h-[44px] flex-wrap items-center gap-3 px-5 py-3 transition-colors duration-200 hover:bg-elevated/70"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{item.title}</span>
                        <span className="block text-xs text-text-tertiary">{item.agent}</span>
                      </span>
                      <span className="text-sm font-medium text-link">
                        {{ concept: 'Pick a concept', script: 'Review script', storyboard: 'Review storyboard' }[item.step] ||
                          'Review Short'}{' '}
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {deployments.length ? (
            <section className="space-y-3">
              <h2 className="font-heading text-lg font-bold">My agents</h2>
              <div className="glass-card divide-y divide-border-default overflow-hidden rounded-2xl">
                {deployments.map((d) => (
                  <Link
                    key={d.id}
                    to={`/agents/${d.id}`}
                    className="flex flex-wrap items-center gap-3 px-5 py-4 transition-colors duration-200 hover:bg-elevated/70"
                  >
                    <AgentIcon slug={d.agentType} kind={d.kind} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{d.name}</p>
                      <p className="text-xs text-text-tertiary">
                        {formatCredits(d.creditsThisMonth)} credits this month
                        {d.monthlyCreditLimit ? ` of ${formatCredits(d.monthlyCreditLimit)}` : ''}
                      </p>
                    </div>
                    {d.autopilot ? (
                      <span className="rounded-full border border-accent-blue/60 bg-accent-blue/15 px-2 py-0.5 text-xs font-semibold text-text-primary">
                        Autopilot
                      </span>
                    ) : null}
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
                  <article
                    key={agent.slug}
                    className="glass-card flex flex-col rounded-2xl p-5 transition-[border-color,box-shadow] duration-200 hover:border-accent-violet/40 hover:ai-glow"
                  >
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
                        <dd className="inline">{costText(agent)}</dd>
                      </div>
                    </dl>
                    {deployed ? (
                      <Link
                        to={`/agents/${deployed.id}`}
                        className={`${secondaryButton} mt-5 font-semibold`}
                      >
                        Open
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeploying(agent)}
                        disabled={!project?.id}
                        className={`${primaryButton} mt-5`}
                      >
                        Start
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
