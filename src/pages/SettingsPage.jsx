import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Topbar from '../components/Topbar'
import api from '../utils/api'
import { getStoredUser, initialsFor } from '../utils/user.js'
import { clearSession } from '../utils/auth'
import { Glyphs } from '../components/glyphs'
import { Icon } from '../components/icons'

// Only fields the API actually saves (PATCH /api/auth/me) live in the form.
const INITIAL = {
  firstName: '',
  lastName: '',
  email: '',
  avatarUrl: '',
  googleId: '',
  hasPassword: true,
}

const TABS = [
  { id: 'profile', label: 'Profile', icon: Glyphs.user },
  { id: 'preferences', label: 'Preferences', icon: Glyphs.sliders, soon: 'Default video style, captions and notification settings.' },
  { id: 'api', label: 'API & Webhooks', icon: Glyphs.key, soon: 'API keys and webhooks for connecting Admart to your own tools.' },
  { id: 'team', label: 'Team', icon: Glyphs.users, soon: 'Invite teammates to share projects and credits.' },
  { id: 'danger', label: 'Danger Zone', icon: Glyphs.alert, danger: true },
]

function formFromUser(user, base = INITIAL) {
  return {
    ...base,
    firstName: user?.firstName || user?.first_name || '',
    lastName: user?.lastName || user?.last_name || '',
    email: user?.email || '',
    avatarUrl: user?.avatarUrl || user?.avatar_url || '',
    googleId: user?.googleId || user?.google_id || '',
    hasPassword: user?.hasPassword !== false,
  }
}

function updateStoredUser(user) {
  if (typeof window === 'undefined' || !user) return
  window.localStorage.setItem('user', JSON.stringify(user))
}

function ComingSoon({ title, text }) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-border-default bg-panel p-8 text-center">
      <h2 className="font-heading text-xl font-bold text-text-primary">{title}</h2>
      <p className="mt-2 text-sm text-text-secondary">{text}</p>
      <p className="mt-4 inline-block rounded-full bg-accent-blue/15 px-3 py-1 text-xs font-semibold text-link">Coming soon</p>
    </div>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [toast, setToast] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteSecret, setDeleteSecret] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [savedSnapshot, setSavedSnapshot] = useState(INITIAL)
  const [form, setForm] = useState(INITIAL)

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(savedSnapshot), [form, savedSnapshot])

  const showToast = useCallback((msg) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2400)
  }, [])

  useEffect(() => {
    let cancelled = false

    const applyUser = (user) => {
      const nextForm = formFromUser(user)
      setForm(nextForm)
      setSavedSnapshot(nextForm)
    }

    applyUser(getStoredUser())

    api.get('/api/auth/me')
      .then(({ data }) => {
        if (cancelled) return
        updateStoredUser(data)
        applyUser(data)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  const update = useCallback((patch) => {
    setForm((f) => ({ ...f, ...patch }))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.patch('/api/auth/me', {
        firstName: form.firstName,
        lastName: form.lastName,
        avatarUrl: form.avatarUrl || null,
      })
      updateStoredUser(data)
      const nextForm = formFromUser(data, form)
      setForm(nextForm)
      setSavedSnapshot(nextForm)
      showToast('Settings saved successfully.')
      navigate('.', { replace: true })
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Could not save profile settings.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm(savedSnapshot)
  }

  const handleDeleteAccount = async (e) => {
    e.preventDefault()
    setDeleting(true)
    setDeleteError('')
    try {
      await api.post(
        '/api/auth/delete-account',
        form.hasPassword ? { password: deleteSecret } : { confirmEmail: deleteSecret },
      )
      clearSession()
      navigate('/', { replace: true })
    } catch (err) {
      const data = err?.response?.data
      setDeleteError(
        err?.response?.status === 429
          ? 'Too many attempts. Please wait a minute and try again.'
          : data?.password?.[0] || data?.confirmEmail?.[0] || data?.message || 'Could not delete your account.',
      )
      setDeleting(false)
    }
  }

  const profileInitial = initialsFor(form)
  const isGoogleAccount = Boolean(form.googleId)

  return (
    <AppLayout>
      <div className="flex min-h-screen flex-col">
        <Topbar title="Settings" />

        {toast && (
          <div
            role="status"
            className="animate-slide-up fixed bottom-8 right-8 z-[60] rounded-xl border border-border-default bg-elevated px-4 py-3 text-sm text-text-primary shadow-xl"
          >
            {toast}
          </div>
        )}

        <div id="main-content" role="main" tabIndex={-1} className="flex min-h-0 flex-1 flex-col md:flex-row">
          {/* Tabs: a horizontal scroller on phones, a side column from md up. */}
          <aside className="shrink-0 border-b border-border bg-panel py-3 md:w-[220px] md:border-b-0 md:border-r md:py-6">
            <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto px-3 md:flex-col">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-left text-sm font-medium transition md:w-full ${
                    t.danger
                      ? activeTab === t.id
                        ? 'bg-error/15 text-danger'
                        : 'text-danger hover:bg-error/10'
                      : activeTab === t.id
                        ? 'bg-accent-blue/15 text-link'
                        : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                  }`}
                >
                  <Icon className="h-4 w-4">{t.icon}</Icon>
                  {t.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto p-4 pb-28 sm:p-8 sm:pb-28">
              {activeTab === 'profile' && (
                <div className="mx-auto max-w-2xl space-y-8">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-text-primary">Profile Picture</h2>
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-2xl font-heading text-2xl font-bold text-white gradient-bg">
                        {form.avatarUrl ? (
                          <img src={form.avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          profileInitial
                        )}
                      </div>
                      {form.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => update({ avatarUrl: '' })}
                          className="rounded-xl border border-border-default bg-input px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
                        >
                          Remove photo
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h2 className="font-heading text-xl font-bold text-text-primary">Personal Info</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm">
                        <span className="text-text-tertiary">First name</span>
                        <input
                          value={form.firstName}
                          onChange={(e) => update({ firstName: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="text-text-tertiary">Last name</span>
                        <input
                          value={form.lastName}
                          onChange={(e) => update({ lastName: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                        />
                      </label>
                      <label className="block text-sm sm:col-span-2">
                        <span className="text-text-tertiary">Email</span>
                        <input
                          readOnly
                          value={form.email}
                          className="mt-1 w-full cursor-not-allowed rounded-xl border border-border-default bg-elevated px-3 py-2.5 text-text-secondary"
                        />
                        <p className="mt-1 text-xs text-text-muted">
                          {isGoogleAccount
                            ? 'Signed in with Google - email cannot be changed here.'
                            : 'Email is used for sign in and cannot be changed here.'}
                        </p>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h2 className="font-heading text-xl font-bold text-text-primary">Password</h2>
                    <p className="mt-2 text-sm text-text-secondary">
                      {isGoogleAccount
                        ? 'You sign in with Google, so there is no Admart password to change.'
                        : 'To change your password, we email you a secure one-time link.'}
                    </p>
                    {!isGoogleAccount && (
                      <Link
                        to="/auth/forgot-password"
                        className="mt-3 inline-block rounded-xl border border-border-default bg-elevated px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-accent-blue/40"
                      >
                        Email me a reset link
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {TABS.filter((t) => t.soon && t.id === activeTab).map((t) => (
                <ComingSoon key={t.id} title={t.label} text={t.soon} />
              ))}

              {activeTab === 'danger' && (
                <form
                  onSubmit={handleDeleteAccount}
                  className="mx-auto max-w-2xl rounded-2xl border border-error/40 bg-error/5 p-6"
                >
                  <h2 className="font-heading text-lg font-semibold text-danger">Delete account</h2>
                  <p className="mt-2 text-sm text-text-secondary">This permanently deletes, and cannot be undone:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-secondary">
                    <li>your profile and sign-in</li>
                    <li>all projects, generated images and videos, and uploads</li>
                    <li>connected social and ad accounts (Admart&apos;s access tokens are erased)</li>
                    <li>your plan and remaining credits</li>
                  </ul>
                  <p className="mt-3 text-sm text-text-secondary">
                    Payment records (amount, plan and transaction ID) are kept for accounting, without your account.
                    You may also want to remove Admart&apos;s access in your Google, Facebook or TikTok settings. See
                    the <Link to="/privacy#data-deletion" className="text-link underline">Privacy Policy</Link>.
                  </p>
                  <label htmlFor="delete-confirm" className="mt-5 block text-sm font-medium text-text-primary">
                    {form.hasPassword ? 'Enter your password to confirm' : `Type your email (${form.email}) to confirm`}
                  </label>
                  <input
                    id="delete-confirm"
                    type={form.hasPassword ? 'password' : 'email'}
                    autoComplete={form.hasPassword ? 'current-password' : 'off'}
                    value={deleteSecret}
                    onChange={(e) => setDeleteSecret(e.target.value)}
                    aria-invalid={Boolean(deleteError)}
                    aria-describedby={deleteError ? 'delete-error' : undefined}
                    className="mt-2 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-text-primary focus:border-error focus:outline-none focus:ring-1 focus:ring-error"
                  />
                  {deleteError && (
                    <p id="delete-error" role="alert" className="mt-2 text-sm text-danger">
                      {deleteError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={!deleteSecret || deleting}
                    className="mt-5 rounded-xl bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deleting ? 'Deleting…' : 'Delete my account permanently'}
                  </button>
                </form>
              )}
            </div>

            {activeTab === 'profile' && (
              <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-panel/95 px-4 py-4 backdrop-blur-md sm:px-8">
                <p className={`text-sm ${dirty ? 'text-warning' : 'text-text-tertiary'}`}>
                  {dirty ? 'You have unsaved changes' : 'No unsaved changes'}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={!dirty}
                    className="rounded-xl border border-border-default bg-input px-4 py-2.5 text-sm font-medium text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!dirty || saving}
                    className="rounded-xl bg-accent-blue px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-blue/20 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-accent-blue/90"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
