import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Topbar from '../components/Topbar'
import AgentSchedule from '../components/AgentSchedule.jsx'
import AgentModelSelect from '../components/AgentModelSelect.jsx'
import AgentTrendSetup from '../components/AgentTrendSetup.jsx'
import AgentSettingsDialog from '../components/AgentSettingsDialog.jsx'
import AgentVideoPicker from '../components/AgentVideoPicker.jsx'
import AgentClipMaker from '../components/AgentClipMaker.jsx'
import AgentReportSchedule from '../components/AgentReportSchedule.jsx'
import AgentActivity from '../components/AgentActivity.jsx'
import AgentComposer from '../components/AgentComposer.jsx'
import AgentDialog from '../components/AgentDialog.jsx'
import { AgentIcon, KindBadge, LiveDot, dangerButton, primaryButton, secondaryButton } from '../components/AgentBits.jsx'
import AgentWorkflow, { HowItWorks } from '../components/AgentWorkflow.jsx'
import { Glyphs } from '../components/glyphs'
import { Icon } from '../components/icons'
import {
  getDeployment,
  isScheduled,
  listRuns,
  removeDeployment,
  runAction,
  startRun,
  updateDeployment,
} from '../utils/agents'
import { formatCredits, getCredits, notifyCreditsChanged } from '../utils/credits'
import { creditUnitText } from '../utils/agentSchedule'
import { getCachedActiveProject, PROJECT_CHANGE_EVENT } from '../utils/projects'

const OPEN = ['queued', 'running']
const POLL_MS = 3000
const AUTOPILOT_POLL_MS = 15000

const headerButton = `${secondaryButton} px-3`

/** The header's "⋯" menu: holds Remove, with a confirm step. */
function MoreMenu({ onRemove }) {
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const root = useRef(null)
  const close = () => {
    setOpen(false)
    setConfirm(false)
  }

  useEffect(() => {
    if (!open) return undefined
    const onDoc = (e) => {
      if (!root.current?.contains(e.target)) {
        setOpen(false)
        setConfirm(false)
      }
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setConfirm(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
        className={`${secondaryButton} w-11 px-0`}
      >
        <Icon className="h-5 w-5">{Glyphs.more}</Icon>
      </button>
      {open ? (
        <div role="menu" aria-label="More actions" className="absolute right-0 top-full z-40 mt-2 w-64 rounded-xl border border-border-default bg-panel p-2 shadow-xl shadow-black/30">
          {confirm ? (
            <div className="space-y-3 p-2">
              <p className="text-sm font-medium">Remove this agent?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  role="menuitem"
                  onClick={async () => {
                    await onRemove()
                    close()
                  }}
                  className={`${dangerButton} flex-1 font-semibold`}
                >
                  Yes, remove
                </button>
                <button type="button" role="menuitem" autoFocus onClick={() => setConfirm(false)} className={`${secondaryButton} flex-1`}>
                  Keep
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              role="menuitem"
              autoFocus
              onClick={() => setConfirm(true)}
              className="flex min-h-[44px] w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-left text-sm font-medium text-danger transition-colors duration-200 hover:bg-error/10"
            >
              <Icon className="h-4 w-4">{Glyphs.trash}</Icon>
              Remove agent
            </button>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default function AgentDetailPage() {
  const { deploymentId } = useParams()
  const navigate = useNavigate()
  const [projectId, setProjectId] = useState(() => getCachedActiveProject()?.id)
  const [deployment, setDeployment] = useState(null)
  const [runs, setRuns] = useState([])
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
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

  const runnerOnline = deployment?.runnerOnline
  // A queued run only polls fast if the runner is there to pick it up.
  const working = runs.some(
    (r) => r.status === 'running' || (r.status === 'queued' && !isScheduled(r) && runnerOnline !== false),
  )
  const waiting = runs.some((r) => r.status === 'queued')
  const autopilot = Boolean(deployment?.autopilot)
  useEffect(() => {
    // Fast while something runs; slow with Autopilot on or a run waiting, so the page sees the runner come back.
    if (!working && !waiting && !autopilot) return undefined
    const t = setInterval(() => {
      setNow(Date.now())
      load()
    }, working ? POLL_MS : AUTOPILOT_POLL_MS)
    return () => clearInterval(t)
  }, [working, waiting, autopilot, load])

  // The deployment's estimate follows its chosen models; the catalog's uses the defaults.
  const agent = deployment?.agent && deployment.estimatedCredits
    ? { ...deployment.agent, estimatedCredits: deployment.estimatedCredits }
    : deployment?.agent
  const isText = agent?.inputKind === 'text'
  const canAutoTopic = !isText && Boolean(deployment?.config?.niche)
  // Same conditions as the sections AgentSettingsDialog shows.
  const hasSettings = Boolean(
    agent &&
      ((agent.kind === 'large' && agent.inputKind !== 'video') ||
        agent.review ||
        agent.styles?.length ||
        agent.voices?.length ||
        agent.tones?.length ||
        agent.lengths?.length ||
        agent.formats?.length ||
        agent.clipLengths?.length ||
        Object.keys(deployment.modelChoices || {}).length),
  )
  const clipMaker = Boolean(agent?.clipLengths?.length)
  const fresh = searchParams.get('run') === 'new' // the Clip Maker's start screen
  const selected = fresh
    ? null
    : runs.find((r) => r.id === searchParams.get('run')) ||
    runs.find((r) => r.status === 'needs_review') ||
    runs.find((r) => OPEN.includes(r.status) && !isScheduled(r)) ||
    (clipMaker ? null : runs[0])
  const select = (id) => setSearchParams({ run: id }, { replace: true })

  const saveModels = async (models) =>
    setDeployment(await updateDeployment(projectId, deploymentId, { config: { ...(deployment.config || {}), models } }))

  const saveTrendChoices = async (choices) =>
    setDeployment(await updateDeployment(projectId, deploymentId, { config: { ...(deployment.config || {}), ...choices } }))

  const run = (e) => {
    e.preventDefault()
    start(isText ? { text: value } : { topic: value })
  }

  const start = async (payload) => {
    setBusy(true)
    setError('')
    try {
      const created = await startRun(projectId, deploymentId, payload)
      setRuns((prev) => [created, ...prev])
      select(created.id)
      if (clipMaker) window.scrollTo({ top: 0, behavior: 'smooth' })
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

  const running = runs.some((r) => r.status === 'running')
  const active = deployment?.status === 'active'
  const estimate = active ? `About ${formatCredits(agent?.estimatedCredits)} credits. Refunded if it fails.` : 'This agent is paused. Resume it to run.'
  const modelSelect = deployment ? <AgentModelSelect compact deployment={deployment} onSave={saveModels} /> : null
  const field =
    'mt-2 w-full rounded-xl border border-border-default bg-input px-4 text-[15px] text-text-primary transition-colors duration-200 placeholder:text-text-muted focus:border-accent-violet focus:outline-none focus:ring-1 focus:ring-accent-violet'

  const composer = !deployment || !agent ? null : agent.inputKind === 'report' ? (
    <AgentComposer
      label="Get a report now"
      tools={modelSelect}
      actions={
        <>
          <span className="text-xs text-text-tertiary">{estimate}</span>
          <button type="button" disabled={busy || !active} onClick={() => start({})} className={primaryButton}>
            {busy ? 'Starting…' : 'Make the report'}
            {busy ? null : <Icon className="h-4 w-4">{Glyphs.arrowRight}</Icon>}
          </button>
        </>
      }
    >
      <h2 className="font-heading text-[1rem] font-semibold">Get a report now</h2>
      <p className="mt-0.5 text-sm text-text-tertiary">
        Covers the last {deployment.config?.period || 7} days and plans the next {deployment.config?.period || 7}.
      </p>
    </AgentComposer>
  ) : agent.inputKind === 'video' ? (
    <AgentVideoPicker
      agent={agent}
      config={deployment.config}
      projectId={projectId}
      busy={busy}
      paused={!active}
      onStart={start}
      modelLine={modelSelect}
    />
  ) : agent.steps?.includes('trends') ? (
    <AgentTrendSetup
      key={deployment.id}
      deployment={deployment}
      agent={agent}
      busy={busy}
      onSaveConfig={saveTrendChoices}
      onSaveModels={saveModels}
      onStart={start}
    />
  ) : (
    <AgentComposer
      label={{ 'youtube-shorts': 'Make a Short', 'trend-finder': 'Find trends' }[deployment.agentType] || 'Run now'}
      onSubmit={run}
      tools={modelSelect}
      actions={
        <>
          <span className="text-xs text-text-tertiary">{estimate}</span>
          <button type="submit" disabled={busy || (!value.trim() && !canAutoTopic) || !active} className={primaryButton}>
            {busy
              ? 'Starting…'
              : deployment.agentType === 'trend-finder'
                ? 'Find trends'
                : value.trim() || !canAutoTopic
                  ? 'Make it'
                  : 'Let the agent pick'}
            {busy ? null : <Icon className="h-4 w-4">{Glyphs.arrowRight}</Icon>}
          </button>
        </>
      }
    >
      <label className="block text-sm">
        <span className="font-heading text-[1rem] font-semibold">
          {{ 'youtube-shorts': 'Make a Short', 'trend-finder': 'Find trends' }[deployment.agentType] || 'Run now'}
        </span>
        <span className="mt-0.5 block text-text-tertiary">
          {canAutoTopic ? `${agent.inputLabel} (optional: leave it blank and the agent picks one)` : agent.inputLabel}
        </span>
        {isText ? (
          <textarea
            rows={4}
            maxLength={3000}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={agent.inputHint}
            className={`${field} resize-y py-3`}
          />
        ) : (
          <input value={value} maxLength={200} onChange={(e) => setValue(e.target.value)} placeholder={agent.inputHint} className={`${field} min-h-[48px]`} />
        )}
      </label>
    </AgentComposer>
  )

  return (
    <AppLayout>
      <div className="flex min-h-screen flex-col">
        <Topbar title={deployment?.name || 'Agent'} />
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-[1600px] flex-1 space-y-4 p-4 text-text-primary sm:p-6">
          <Link
            to="/agents"
            className="inline-flex min-h-[44px] items-center text-sm text-text-secondary transition-colors duration-200 hover:text-text-primary"
          >
            ← All agents
          </Link>

          {deployment ? (
            <section aria-labelledby="agent-name" className="glass-card relative z-[25] flex flex-wrap lg:z-10 items-center gap-x-4 gap-y-3 rounded-2xl px-4 py-3">
              <AgentIcon slug={deployment.agentType} kind={deployment.kind} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 id="agent-name" className="min-w-0 max-w-full truncate font-heading text-base font-bold text-text-primary sm:text-lg">
                    {deployment.name}
                  </h2>
                  <KindBadge kind={deployment.kind} />
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold ${
                      active ? 'border-success/40 bg-success/15 text-success-text' : 'border-border-default bg-elevated text-text-tertiary'
                    }`}
                  >
                    {active && running ? <LiveDot /> : <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-success' : 'bg-text-tertiary'}`} />}
                    {active ? (running ? 'Active · working' : 'Active') : 'Paused'}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-text-tertiary">
                  {agent?.estimatedCredits != null ? `~${formatCredits(agent.estimatedCredits)} cr ${creditUnitText(agent.creditUnit)} · ` : ''}
                  {formatCredits(deployment.creditsThisMonth)} credits this month
                  {deployment.monthlyCreditLimit ? ` of ${formatCredits(deployment.monthlyCreditLimit)} limit` : ''}
                  {deployment.config?.niche ? ` · Niche: ${deployment.config.niche}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {agent ? (
                  <button type="button" onClick={() => setShowSchedule(true)} aria-haspopup="dialog" className={headerButton}>
                    <Icon className="h-4 w-4">{Glyphs.calendar}</Icon>
                    <span className="sr-only sm:not-sr-only">Schedule</span>
                    {deployment.autopilot ? (
                      <span className="rounded-full bg-success/15 px-1.5 text-xs font-semibold text-success-text">On</span>
                    ) : null}
                  </button>
                ) : null}
                {hasSettings ? (
                  <button type="button" onClick={() => setShowSettings(true)} aria-haspopup="dialog" className={headerButton}>
                    <Icon className="h-4 w-4">{Glyphs.gear}</Icon>
                    <span className="sr-only sm:not-sr-only">Settings</span>
                  </button>
                ) : null}
                <button type="button" onClick={() => setStatus(active ? 'paused' : 'active')} className={headerButton}>
                  <Icon className="h-4 w-4">{active ? Glyphs.pause : Glyphs.play}</Icon>
                  <span className="sr-only sm:not-sr-only">{active ? 'Pause' : 'Resume'}</span>
                </button>
                <MoreMenu onRemove={remove} />
              </div>
            </section>
          ) : null}

          {error ? (
            <p role="alert" className="rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          ) : null}

          {deployment && clipMaker ? (
            <AgentClipMaker
              key={selected?.id || 'new'}
              deployment={deployment}
              runs={runs}
              run={selected}
              busy={busy}
              now={now}
              projectId={projectId}
              onSelect={select}
              onNew={() => select('new')}
              onStart={start}
              onAction={act}
              onSaveConfig={async (config) => setDeployment(await updateDeployment(projectId, deploymentId, { config }))}
            />
          ) : deployment ? (
            // Studio: canvas with the composer pinned under it, Activity on the right. Below lg: composer, canvas, Activity.
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_288px] 2xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="flex min-w-0 flex-col gap-4">
                <div className="order-2 min-w-0 lg:order-1">
                  {selected ? (
                    <AgentWorkflow
                      key={selected.id}
                      run={selected}
                      agent={agent}
                      busy={busy}
                      now={now}
                      runnerOnline={runnerOnline}
                      onAction={act}
                      onApprove={approve}
                    />
                  ) : (
                    <HowItWorks agent={agent} />
                  )}
                </div>
                <div className="relative z-20 order-1 min-w-0 lg:sticky lg:bottom-4 lg:order-2">{composer}</div>
              </div>

              <AgentActivity
                runs={runs}
                selectedId={selected?.id}
                runnerOnline={runnerOnline}
                now={now}
                onSelect={select}
                className="min-w-0 lg:sticky lg:top-[76px]"
              />
            </div>
          ) : null}
        </main>
      </div>

      {showSchedule && deployment && agent ? (
        <AgentDialog labelledBy="schedule-title" onClose={() => setShowSchedule(false)}>
          {agent.inputKind === 'report' ? (
            <AgentReportSchedule
              deployment={deployment}
              agent={agent}
              onSave={async (payload) => setDeployment(await updateDeployment(projectId, deploymentId, payload))}
            />
          ) : (
            <AgentSchedule
              deployment={deployment}
              agent={agent}
              onSave={async (payload) => setDeployment(await updateDeployment(projectId, deploymentId, payload))}
            />
          )}
        </AgentDialog>
      ) : null}

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
