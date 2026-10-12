import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Topbar from '../components/Topbar'
import { getInbox } from '../utils/agents'
import { getCachedActiveProject, PROJECT_CHANGE_EVENT } from '../utils/projects'

const WAITING_TEXT = {
  concept: 'Pick a concept',
  script: 'Review the script',
  storyboard: 'Review the storyboard',
  final: 'Your Short is ready to review',
}

function ago(iso) {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

/** Notifications are agent runs that need you (check-ins, finished Shorts) and recent failures. */
export default function NotificationsPage() {
  const [items, setItems] = useState(null)

  const load = useCallback(() => {
    const projectId = getCachedActiveProject()?.id
    ;(projectId ? getInbox(projectId) : Promise.resolve({ items: [] }))
      .then((data) => setItems(data.items || []))
      .catch(() => setItems([]))
  }, [])

  useEffect(() => {
    load()
    window.addEventListener(PROJECT_CHANGE_EVENT, load)
    return () => window.removeEventListener(PROJECT_CHANGE_EVENT, load)
  }, [load])

  return (
    <AppLayout>
      <div className="flex min-h-screen flex-col">
        <Topbar title="Notifications" />

        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl flex-1 p-4 text-text-primary sm:p-7">
          {items === null ? <p className="text-sm text-text-tertiary">Loading…</p> : null}

          {items?.length ? (
            <ul className="divide-y divide-border-default overflow-hidden rounded-2xl border border-border-default bg-surface">
              {items.map((item) => (
                <li key={item.runId}>
                  <Link to={`/agents/${item.deploymentId}`} className="flex items-start gap-3 px-5 py-4 transition hover:bg-elevated">
                    <span
                      aria-hidden
                      className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${item.status === 'failed' ? 'bg-error' : 'bg-accent-blue'}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">
                        {item.status === 'failed' ? 'A run failed' : WAITING_TEXT[item.step] || 'Waiting for you'}
                      </span>
                      <span className="block truncate text-sm text-text-secondary">
                        {item.agent} · {item.title}
                      </span>
                      {item.status === 'failed' && item.error ? (
                        <span className="mt-1 block text-xs text-text-tertiary">{item.error}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-xs text-text-tertiary">{ago(item.updatedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          {items && !items.length ? (
            <section className="mx-auto mt-6 w-full max-w-lg rounded-2xl border border-border-default bg-panel p-8 text-center sm:mt-16">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-blue/15 text-link">
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <h2 className="mt-5 font-heading text-xl font-bold text-text-primary">You're all caught up</h2>
              <p className="mt-2 text-sm text-text-secondary">
                When an agent needs you — a concept to pick, a script to check or a finished Short to approve — it shows
                up here.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  to="/agents"
                  className="rounded-xl bg-accent-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Open Agents
                </Link>
                <Link
                  to="/library"
                  className="rounded-xl border border-border-default bg-elevated px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:border-accent-blue/40"
                >
                  Open Library
                </Link>
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </AppLayout>
  )
}
