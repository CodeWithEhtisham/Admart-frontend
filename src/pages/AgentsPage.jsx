import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Topbar from '../components/Topbar'
import { AgentIcon, LiveDot } from '../components/AgentBits.jsx'
import AgentStylePicker from '../components/AgentStylePicker.jsx'
import { AGENT_STEPS, costText, deployAgent, getAgentCatalog, getInbox, listDeployments, PLATFORM_NAMES, whenText } from '../utils/agents'
import { getCachedActiveProject, listSocialAccounts, PROJECT_CHANGE_EVENT } from '../utils/projects'

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
                      <span className="block">{video ? 'Let me review the cuts' : 'Let me check the script first'}</span>
                      <span className="text-xs text-text-tertiary">
                        {video
                          ? 'See what will be cut and fix caption spelling before the video is made.'
                          : 'See the idea, script and caption, change them or pick another idea, before the video is made. Scheduled runs skip this.'}
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

// The catalog grouped by what people want done, instead of by how the agent is built.
const GOALS = [
  { id: 'videos', title: 'Make videos', hint: 'From an idea or a trending topic to a finished Short.', slugs: ['youtube-shorts', 'trend-finder', 'script-writer', 'voiceover'] },
  { id: 'repurpose', title: 'Edit and reuse your videos', hint: 'Clean up, cut into clips, or post one video everywhere.', slugs: ['video-editor', 'clip-maker', 'cross-poster'] },
  { id: 'grow', title: 'Grow your channels', hint: 'See what worked and what to do next.', slugs: ['growth-report'] },
]

const TONES = {
  working: 'border-accent-blue/40 bg-accent-blue/15 text-link',
  waiting: 'border-warning/50 bg-warning/15 text-warning-text',
  scheduled: 'border-accent-violet/40 bg-accent-violet/15 text-violet-text',
  failed: 'border-error/40 bg-error/10 text-danger',
  ready: 'border-success/40 bg-success/15 text-success-text',
  off: 'border-border-default bg-elevated text-text-tertiary',
}

/** What an added agent is doing right now, in plain words, and the one thing to do about it. */
function agentState(d) {
  const run = d.latestRun
  const open = `/agents/${d.id}`
  if (d.status === 'paused') return { tone: 'off', label: 'Paused', text: 'Switched off. It will not run until you turn it back on.', action: 'Open', to: open }
  if (run?.status === 'needs_review')
    return { tone: 'waiting', label: 'Waiting for you', text: `${run.title || 'Your result'} is ready. Check it before anything is posted.`, action: 'Review now', to: `${open}?run=${run.id}` }
  if (run?.status === 'running')
    return { tone: 'working', live: true, label: 'Working now', text: `${AGENT_STEPS[run.step]?.[1] || 'Getting started.'}`, action: 'Watch progress', to: `${open}?run=${run.id}` }
  if (run?.status === 'queued' && run.step === 'wait')
    return { tone: 'scheduled', label: 'Post scheduled', text: `${run.title || 'Your post'} goes out at the time you picked.`, action: 'Open', to: `${open}?run=${run.id}` }
  if (run?.status === 'queued') return { tone: 'working', label: 'Starting', text: 'It starts in a moment.', action: 'Watch progress', to: `${open}?run=${run.id}` }
  if (d.autopilot && d.nextRunAt)
    return { tone: 'scheduled', label: 'On Autopilot', text: `Next run ${whenText(d.nextRunAt)}. It runs by itself; you approve before it posts.`, action: 'Open', to: open }
  if (run?.status === 'failed') return { tone: 'failed', label: 'Last run failed', text: 'Open it to see what went wrong and try again. Credits for a failed run are refunded.', action: 'Open', to: `${open}?run=${run.id}` }
  return {
    tone: 'ready',
    label: 'Ready',
    text: run ? `Not running now. Last result: ${run.title || 'done'}.` : 'Not used yet. Start your first run.',
    action: 'Start a run',
    to: open,
  }
}

function StatePill({ state }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TONES[state.tone]}`}>
      {state.live ? <LiveDot /> : <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />}
      {state.label}
    </span>
  )
}

const smallButton =
  'inline-flex min-h-[36px] shrink-0 cursor-pointer items-center justify-center rounded-lg px-3 text-xs font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50'

/** One compact row per added agent: name, what it is doing now, and the one thing to do. */
function MyAgentCard({ d }) {
  const state = agentState(d)
  return (
    <article className="glass-card flex items-center gap-3 rounded-2xl p-3.5">
      <AgentIcon slug={d.agentType} kind={d.kind} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="truncate text-sm font-bold">{d.name}</h3>
          <StatePill state={state} />
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-text-tertiary" title={state.text}>
          {state.text}
        </p>
      </div>
      <Link
        to={state.to}
        className={`${smallButton} ${
          state.tone === 'waiting'
            ? 'ai-gradient text-white'
            : 'border border-border-default bg-elevated/60 text-text-secondary hover:border-accent-violet/50 hover:text-text-primary'
        }`}
      >
        {state.action}
      </Link>
    </article>
  )
}

/** One line per agent you can add; the full description is one hover or focus away. */
function CatalogRow({ agent, disabled, onAdd }) {
  const extra = [costText(agent), agent.needs.length ? `posts to ${agent.needs.map((p) => PLATFORM_NAMES[p] || p).join(', ')}` : '']
    .filter(Boolean)
    .join(' · ')
  return (
    <li className="flex items-center gap-3 px-3.5 py-3">
      <AgentIcon slug={agent.slug} kind={agent.kind} size="sm" />
      <div className="min-w-0 flex-1" title={`${agent.description}\n\n${extra}`}>
        <p className="truncate text-sm font-semibold">{agent.name}</p>
        <p className="line-clamp-2 text-xs text-text-tertiary">{agent.description}</p>
      </div>
      {agent.requiredPlan ? (
        <Link
          to="/billing"
          className={`${smallButton} border border-border-default text-text-secondary hover:text-text-primary`}
        >
          Upgrade
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => onAdd(agent)}
          disabled={disabled}
          aria-label={`Add ${agent.name}`}
          className={`${smallButton} border border-accent-violet/50 bg-accent-violet/15 text-text-primary hover:bg-accent-violet/30`}
        >
          + Add
        </button>
      )}
    </li>
  )
}

export default function AgentsPage() {
  const navigate = useNavigate()
  const [project, setProject] = useState(() => getCachedActiveProject())
  const [catalog, setCatalog] = useState([])
  const [deployments, setDeployments] = useState([])
  const [waiting, setWaiting] = useState([])
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

  const deployedBySlug = Object.fromEntries(deployments.map((d) => [d.agentType, d]))
  const grouped = new Set(GOALS.flatMap((g) => g.slugs))
  // Agents already added live under "My agents", so the catalog only offers the rest.
  const available = catalog.filter((a) => !deployedBySlug[a.slug])
  const goals = [
    ...GOALS.map((g) => ({ ...g, agents: g.slugs.map((slug) => available.find((a) => a.slug === slug)).filter(Boolean) })),
    { id: 'more', title: 'More agents', hint: '', agents: available.filter((a) => !grouped.has(a.slug)) },
  ].filter((g) => g.agents.length)

  return (
    <AppLayout>
      <div className="flex min-h-screen flex-col">
        <Topbar title="Agents" />
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 space-y-6 p-4 text-text-primary sm:p-6">
          <p className="max-w-2xl text-sm text-text-secondary">
            Agents work for you in the background. Add one, give it a topic or a video, and it does the job. You
            always approve before anything is posted.
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
                Needs you ({waiting.length})
              </h2>
              <ul className="divide-y divide-warning/20 overflow-hidden rounded-2xl border border-warning/40 bg-warning/5">
                {waiting.map((item) => (
                  <li key={item.runId}>
                    <Link
                      to={`/agents/${item.deploymentId}?run=${item.runId}`}
                      className="flex min-h-[44px] flex-wrap items-center gap-3 px-5 py-3 transition-colors duration-200 hover:bg-warning/10"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{item.title}</span>
                        <span className="block text-xs text-text-tertiary">{item.agent} finished this and is waiting for your OK</span>
                      </span>
                      <span className="text-sm font-semibold text-warning-text">
                        {{ concept: 'Pick an idea', script: 'Check the script', storyboard: 'Check the pictures' }[item.step] ||
                          'Review now'}{' '}
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {deployments.length ? (
            <section className="space-y-3" aria-labelledby="mine-title">
              <h2 id="mine-title" className="font-heading text-lg font-bold">
                My agents
              </h2>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {deployments.map((d) => (
                  <MyAgentCard key={d.id} d={d} />
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-3" aria-labelledby="add-title">
            <h2 id="add-title" className="font-heading text-lg font-bold">
              {deployments.length ? 'Add another agent' : 'Add your first agent'}
            </h2>
            {loading ? <p className="text-sm text-text-tertiary">Loading agents…</p> : null}
            <div className="grid items-start gap-4 lg:grid-cols-3">
              {goals.map((goal) => (
                <div key={goal.id} className="glass-card overflow-hidden rounded-2xl">
                  <div className="border-b border-border-default px-3.5 py-3">
                    <h3 className="text-sm font-semibold">{goal.title}</h3>
                    {goal.hint ? <p className="text-xs text-text-tertiary">{goal.hint}</p> : null}
                  </div>
                  <ul className="divide-y divide-border-default">
                    {goal.agents.map((agent) => (
                      <CatalogRow key={agent.slug} agent={agent} disabled={!project?.id} onAdd={setDeploying} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
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
