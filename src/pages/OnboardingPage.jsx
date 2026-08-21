import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createProject, setActiveProject } from '../utils/projects'

const PRESET_COLORS = ['#5b7cfa', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

const PROJECT_ICONS = ['▶', '✦', '◇', '☀', '⚡', '◎', '◈', '✸']

const DEFAULT_PROJECT_NAME = 'My First Project'

/** Keep the cached user in sync so routing/refresh don't bounce back to onboarding. */
function markUserHasProject(activeProjectId) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    user.projectCount = (user.projectCount || 0) + 1
    user.activeProjectId = activeProjectId
    user.onboardingCompleted = true
    localStorage.setItem('user', JSON.stringify(user))
  } catch {
    // ignore cache write failures
  }
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [projectName, setProjectName] = useState('')
  const [projectIcon, setProjectIcon] = useState(PROJECT_ICONS[0])
  const [projectColor, setProjectColor] = useState(PRESET_COLORS[0])

  // A user needs at least one project to enter the workspace, so "Skip" still
  // creates a sensibly-named default project rather than leaving them with none.
  const finish = async ({ withProject }) => {
    setSaving(true)
    setError('')
    try {
      const project = await createProject({
        name: withProject ? projectName.trim() || DEFAULT_PROJECT_NAME : DEFAULT_PROJECT_NAME,
        icon: projectIcon,
        color: projectColor,
        org: 'Personal',
      })
      setActiveProject(project)
      markUserHasProject(project.id)
      navigate('/dashboard')
    } catch (err) {
      console.error('Failed to create project:', err)
      setError(
        err.response?.data?.name?.[0] ||
          err.response?.data?.detail ||
          'Could not create your project. Please try again.',
      )
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-base font-body text-text-primary">
      <header className="fixed left-0 right-0 top-0 z-50 flex h-[60px] items-center justify-between border-b border-border bg-panel/85 px-6 backdrop-blur-md">
        <Link
          to="/"
          className="font-heading text-lg font-bold tracking-tight text-text-primary"
        >
          <span className="gradient-text animate-float inline-block">Admart</span>
        </Link>
        <button
          type="button"
          onClick={() => finish({ withProject: false })}
          disabled={saving}
          className="font-mono text-sm text-text-tertiary transition hover:text-text-secondary disabled:opacity-50"
        >
          Skip for now
        </button>
      </header>

      <main className="flex min-h-screen flex-col items-center justify-center px-4 pb-16 pt-24">
        <div className="w-full max-w-[640px] animate-slide-up rounded-[20px] border border-border-default bg-panel p-10 shadow-xl shadow-black/20">
          <div className="space-y-8">
            <div>
              <h1 className="font-heading text-2xl font-bold text-text-primary">
                Create your first project
              </h1>
              <p className="mt-2 text-text-secondary">
                Projects keep your videos, assets, and brand kit organized. You can create more later — or skip and do it anytime.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="project-name" className="text-sm font-medium text-text-secondary">
                Project name
              </label>
              <input
                id="project-name"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Summer Campaign"
                className="w-full rounded-xl border border-border-default bg-input px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
              />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-text-secondary">Project icon</p>
              <div className="flex flex-wrap items-center gap-3">
                {PROJECT_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setProjectIcon(ic)}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-white transition ${
                      projectIcon === ic
                        ? 'ring-2 ring-white/40 ring-offset-2 ring-offset-panel'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: projectColor }}
                    aria-label={`Icon ${ic}`}
                    aria-pressed={projectIcon === ic}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-text-secondary">Project color</p>
              <div className="flex flex-wrap items-center gap-3">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setProjectColor(c)}
                    className={`h-9 w-9 rounded-full border-2 transition ${
                      projectColor === c
                        ? 'border-white shadow-lg ring-2 ring-accent-blue/50'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Color ${c}`}
                  />
                ))}
                <label className="flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-border-default bg-elevated hover:border-accent-violet/50">
                  <span className="sr-only">Custom color</span>
                  <input
                    type="color"
                    value={projectColor}
                    onChange={(e) => setProjectColor(e.target.value)}
                    className="h-12 w-12 cursor-pointer border-0 bg-transparent p-0"
                  />
                </label>
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-error/30 bg-error/10 px-4 py-2.5 text-sm text-error">
                {error}
              </p>
            )}

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => finish({ withProject: false })}
                disabled={saving}
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-text-tertiary hover:text-text-secondary disabled:opacity-50"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => finish({ withProject: true })}
                disabled={saving || !projectName.trim()}
                className="rounded-xl bg-accent-blue px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {saving ? 'Creating…' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
