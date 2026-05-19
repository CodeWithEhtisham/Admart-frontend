import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import VidifySidebar from '../components/VidifySidebar.jsx'

const INITIAL = {
  firstName: 'Ehtisham',
  lastName: 'Khan',
  email: 'ehtisham.khan@example.com',
  timezone: 'PKT',
  language: 'en',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  aspect: '9:16',
  videoStyle: 'cinematic',
  aiModel: 'vidify-v2',
  voiceover: 'neutral-en',
  autoCaptions: true,
  autoMusic: true,
  notif: {
    genEmail: true,
    genPush: true,
    pubEmail: true,
    pubPush: false,
    weeklyEmail: true,
    weeklyPush: false,
    creditEmail: true,
    creditPush: true,
  },
  webhookUrl: 'https://api.example.com/hooks/vidify',
  teamInviteEmail: '',
  teamInviteRole: 'editor',
}

const TEAM = [
  {
    id: '1',
    name: 'Ehtisham',
    email: 'ehtisham.khan@example.com',
    role: 'Admin',
    initial: 'E',
  },
  {
    id: '2',
    name: 'Abdullah Abid',
    email: 'abdullah@example.com',
    role: 'Editor',
    initial: 'A',
  },
  {
    id: '3',
    name: 'Sarah Ahmed',
    email: 'sarah@example.com',
    role: 'Viewer',
    initial: 'S',
  },
]

const TABS = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'preferences', label: 'Preferences', icon: '🎛️' },
  { id: 'api', label: 'API & Webhooks', icon: '🔑' },
  { id: 'team', label: 'Team', icon: '👥' },
  { id: 'danger', label: 'Danger Zone', icon: '⚠️', danger: true },
]

function Toggle({ checked, onChange, ariaLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? 'bg-accent-blue' : 'bg-elevated'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? 'left-5' : 'left-0.5'
        }`}
      />
    </button>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [toast, setToast] = useState(null)
  const [apiKeyVisible, setApiKeyVisible] = useState(false)
  const [savedSnapshot, setSavedSnapshot] = useState(INITIAL)
  const [savedTeam, setSavedTeam] = useState(TEAM)
  const [form, setForm] = useState(INITIAL)
  const [team, setTeam] = useState(TEAM)

  const dirty = useMemo(
    () =>
      JSON.stringify(form) !== JSON.stringify(savedSnapshot) || JSON.stringify(team) !== JSON.stringify(savedTeam),
    [form, savedSnapshot, team, savedTeam]
  )

  const showToast = useCallback((msg) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2400)
  }, [])

  const update = useCallback((patch) => {
    setForm((f) => ({ ...f, ...patch }))
  }, [])

  const updateNotif = useCallback((key, val) => {
    setForm((f) => ({ ...f, notif: { ...f.notif, [key]: val } }))
  }, [])

  const handleSave = () => {
    setSavedSnapshot(form)
    setSavedTeam(team)
    showToast('Settings saved successfully.')
    navigate('.', { replace: true })
  }

  const handleCancel = () => {
    setForm(savedSnapshot)
    setTeam(savedTeam)
  }

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        'Delete your Vidify account permanently? This cannot be undone. Type of action: irreversible data loss.'
      )
    ) {
      showToast('Account deletion requested — this is a demo.')
    }
  }

  const maskedKey = apiKeyVisible ? 'vid_sk_live_7f3a9c2e1b8d4a6f0e2c9b1d' : 'vid_sk_live_••••••••••••••••••••'

  return (
    <div className="min-h-screen bg-base font-body text-text-primary">
      <VidifySidebar />
      <div className="ml-[260px] flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex h-[60px] shrink-0 items-center justify-between gap-4 border-b border-border bg-panel/90 px-7 backdrop-blur-md">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-secondary">
            <Link to="/dashboard" className="hover:text-text-primary">
              Dashboard
            </Link>
            <span className="text-text-muted">/</span>
            <span className="font-heading text-lg font-bold text-text-primary">Settings</span>
          </nav>
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold text-white gradient-bg"
            aria-hidden
          >
            E
          </div>
        </header>

        {toast && (
          <div
            role="status"
            className="animate-slide-up fixed bottom-8 right-8 z-[60] rounded-xl border border-border-default bg-elevated px-4 py-3 text-sm text-text-primary shadow-xl"
          >
            {toast}
          </div>
        )}

        <div className="flex min-h-0 flex-1">
          <aside className="w-[220px] shrink-0 border-r border-border bg-panel py-6">
            <nav className="flex flex-col gap-1 px-3">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                    t.danger
                      ? activeTab === t.id
                        ? 'bg-error/15 text-error'
                        : 'text-error/80 hover:bg-error/10'
                      : activeTab === t.id
                        ? 'bg-accent-blue/15 text-accent-blue'
                        : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                  }`}
                >
                  <span aria-hidden>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto p-8 pb-28">
              {activeTab === 'profile' && (
                <div className="mx-auto max-w-2xl space-y-8">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-text-primary">Profile Picture</h2>
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl font-heading text-2xl font-bold text-white gradient-bg">
                        E
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-xl border border-border-default bg-elevated px-4 py-2 text-sm font-medium text-text-primary hover:border-accent-blue/40"
                        >
                          Upload
                        </button>
                        <button
                          type="button"
                          className="rounded-xl border border-border-default bg-input px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
                        >
                          Remove
                        </button>
                      </div>
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
                        <p className="mt-1 text-xs text-text-muted">Signed in with Google — email cannot be changed here.</p>
                      </label>
                      <label className="block text-sm">
                        <span className="text-text-tertiary">Timezone</span>
                        <select
                          value={form.timezone}
                          onChange={(e) => update({ timezone: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                        >
                          <option value="PKT">Pakistan Time (PKT)</option>
                          <option value="UTC">UTC</option>
                          <option value="EST">Eastern (US)</option>
                        </select>
                      </label>
                      <label className="block text-sm">
                        <span className="text-text-tertiary">Language</span>
                        <select
                          value={form.language}
                          onChange={(e) => update({ language: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                        >
                          <option value="en">English</option>
                          <option value="ur">Urdu</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h2 className="font-heading text-xl font-bold text-text-primary">Change Password</h2>
                    <div className="mt-4 grid gap-4">
                      <label className="block text-sm">
                        <span className="text-text-tertiary">Current password</span>
                        <input
                          type="password"
                          value={form.currentPassword}
                          onChange={(e) => update({ currentPassword: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                          autoComplete="current-password"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="text-text-tertiary">New password</span>
                        <input
                          type="password"
                          value={form.newPassword}
                          onChange={(e) => update({ newPassword: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                          autoComplete="new-password"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="text-text-tertiary">Confirm new password</span>
                        <input
                          type="password"
                          value={form.confirmPassword}
                          onChange={(e) => update({ confirmPassword: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                          autoComplete="new-password"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="mx-auto max-w-2xl space-y-10">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-text-primary">Default Video Settings</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm">
                        <span className="text-text-tertiary">Aspect ratio</span>
                        <select
                          value={form.aspect}
                          onChange={(e) => update({ aspect: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                        >
                          <option value="9:16">9:16 (Vertical)</option>
                          <option value="16:9">16:9 (Landscape)</option>
                          <option value="1:1">1:1 (Square)</option>
                        </select>
                      </label>
                      <label className="block text-sm">
                        <span className="text-text-tertiary">Video style</span>
                        <select
                          value={form.videoStyle}
                          onChange={(e) => update({ videoStyle: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                        >
                          <option value="cinematic">Cinematic</option>
                          <option value="minimal">Minimal</option>
                          <option value="bold">Bold &amp; bright</option>
                        </select>
                      </label>
                      <label className="block text-sm">
                        <span className="text-text-tertiary">AI model</span>
                        <select
                          value={form.aiModel}
                          onChange={(e) => update({ aiModel: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                        >
                          <option value="vidify-v2">Vidify v2 (recommended)</option>
                          <option value="vidify-v1">Vidify v1</option>
                        </select>
                      </label>
                      <label className="block text-sm">
                        <span className="text-text-tertiary">Voiceover</span>
                        <select
                          value={form.voiceover}
                          onChange={(e) => update({ voiceover: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                        >
                          <option value="neutral-en">Neutral — English</option>
                          <option value="warm-en">Warm — English</option>
                        </select>
                      </label>
                    </div>
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between rounded-xl border border-border-default bg-surface px-4 py-3">
                        <div>
                          <p className="font-medium text-text-primary">Auto-captions</p>
                          <p className="text-xs text-text-tertiary">Generate captions on every render</p>
                        </div>
                        <Toggle
                          checked={form.autoCaptions}
                          onChange={(v) => update({ autoCaptions: v })}
                          ariaLabel="Auto-captions"
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-border-default bg-surface px-4 py-3">
                        <div>
                          <p className="font-medium text-text-primary">Auto-music</p>
                          <p className="text-xs text-text-tertiary">Suggest background music automatically</p>
                        </div>
                        <Toggle checked={form.autoMusic} onChange={(v) => update({ autoMusic: v })} ariaLabel="Auto-music" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="font-heading text-xl font-bold text-text-primary">Notifications</h2>
                    <div className="mt-4 overflow-hidden rounded-xl border border-border-default">
                      <div className="grid grid-cols-[1fr_88px_88px] gap-2 border-b border-border bg-elevated px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                        <span>Event</span>
                        <span className="text-center">Email</span>
                        <span className="text-center">Push</span>
                      </div>
                      {[
                        { label: 'Generation Complete', eKey: 'genEmail', pKey: 'genPush' },
                        { label: 'Publish Success', eKey: 'pubEmail', pKey: 'pubPush' },
                        { label: 'Weekly Report', eKey: 'weeklyEmail', pKey: 'weeklyPush' },
                        { label: 'Credit Low Warning', eKey: 'creditEmail', pKey: 'creditPush' },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className="grid grid-cols-[1fr_88px_88px] items-center gap-2 border-b border-border/80 px-4 py-3 last:border-0"
                        >
                          <span className="text-sm text-text-primary">{row.label}</span>
                          <div className="flex justify-center">
                            <Toggle
                              checked={form.notif[row.eKey]}
                              onChange={(v) => updateNotif(row.eKey, v)}
                              ariaLabel={`${row.label} email`}
                            />
                          </div>
                          <div className="flex justify-center">
                            <Toggle
                              checked={form.notif[row.pKey]}
                              onChange={(v) => updateNotif(row.pKey, v)}
                              ariaLabel={`${row.label} push`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'api' && (
                <div className="mx-auto max-w-2xl space-y-8">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-text-primary">API Key</h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <input
                        readOnly
                        value={maskedKey}
                        className="min-w-[240px] flex-1 rounded-xl border border-border-default bg-input px-3 py-2.5 font-mono text-sm text-text-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setApiKeyVisible((v) => !v)}
                        className="rounded-xl border border-border-default bg-elevated px-4 py-2.5 text-sm font-medium text-text-primary hover:border-accent-blue/40"
                      >
                        {apiKeyVisible ? 'Hide' : 'Reveal'}
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast('API key regenerated — update your integrations.')}
                        className="rounded-xl border border-border-default bg-elevated px-4 py-2.5 text-sm font-medium text-text-primary hover:border-accent-blue/40"
                      >
                        Regenerate
                      </button>
                    </div>
                  </div>
                  <div>
                    <h2 className="font-heading text-lg font-semibold text-text-primary">Webhook URL</h2>
                    <input
                      value={form.webhookUrl}
                      onChange={(e) => update({ webhookUrl: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 font-mono text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                    />
                  </div>
                  <div className="rounded-2xl border border-border-default bg-surface p-5">
                    <h3 className="font-heading text-lg font-semibold text-text-primary">Usage</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-border bg-panel px-4 py-3">
                        <p className="text-xs text-text-tertiary">Calls (30d)</p>
                        <p className="font-mono text-xl font-semibold text-text-primary">142</p>
                      </div>
                      <div className="rounded-xl border border-border bg-panel px-4 py-3">
                        <p className="text-xs text-text-tertiary">Remaining</p>
                        <p className="font-mono text-xl font-semibold text-accent-blue">48</p>
                      </div>
                      <div className="rounded-xl border border-border bg-panel px-4 py-3">
                        <p className="text-xs text-text-tertiary">Uptime</p>
                        <p className="font-mono text-xl font-semibold text-success">99.8%</p>
                      </div>
                    </div>
                    <a
                      href="https://docs.vidify.example"
                      className="mt-4 inline-flex text-sm font-medium text-accent-blue hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      API documentation →
                    </a>
                  </div>
                </div>
              )}

              {activeTab === 'team' && (
                <div className="mx-auto max-w-2xl space-y-8">
                  <div className="space-y-3">
                    {team.map((m) => (
                      <div
                        key={m.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-default bg-surface px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full font-heading text-sm font-bold text-white gradient-bg">
                            {m.initial}
                          </div>
                          <div>
                            <p className="font-medium text-text-primary">{m.name}</p>
                            <p className="text-xs text-text-tertiary">{m.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full border border-border-default bg-panel px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                            {m.role}
                          </span>
                          {m.role !== 'Admin' && (
                            <button
                              type="button"
                              onClick={() => {
                                setTeam((t) => t.filter((x) => x.id !== m.id))
                                showToast('Member removed from team.')
                              }}
                              className="rounded-lg border border-error/30 px-2 py-1 text-xs font-medium text-error hover:bg-error/10"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-dashed border-border-default bg-input p-4">
                    <p className="text-sm font-medium text-text-primary">Invite teammate</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <input
                        type="email"
                        placeholder="colleague@company.com"
                        value={form.teamInviteEmail}
                        onChange={(e) => update({ teamInviteEmail: e.target.value })}
                        className="min-w-[200px] flex-1 rounded-xl border border-border-default bg-surface px-3 py-2.5 text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                      />
                      <select
                        value={form.teamInviteRole}
                        onChange={(e) => update({ teamInviteRole: e.target.value })}
                        className="rounded-xl border border-border-default bg-surface px-3 py-2.5 text-text-primary"
                      >
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          showToast('Invite sent (demo).')
                          update({ teamInviteEmail: '' })
                        }}
                        className="rounded-xl bg-accent-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-blue/90"
                      >
                        Send Invite
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'danger' && (
                <div className="mx-auto max-w-2xl space-y-6">
                  <div className="rounded-2xl border border-error/30 bg-error/5 p-6">
                    <h2 className="font-heading text-xl font-bold text-error">Danger Zone</h2>
                    <p className="mt-2 text-sm text-text-secondary">
                      Irreversible actions for your Vidify workspace. Proceed with care.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border-default bg-surface p-5">
                    <h3 className="font-heading text-lg font-semibold text-text-primary">Export Data</h3>
                    <p className="mt-1 text-sm text-text-tertiary">
                      Download a ZIP of your videos metadata, analytics exports, and account settings.
                    </p>
                    <button
                      type="button"
                      onClick={() => showToast('Preparing data export…')}
                      className="mt-4 rounded-xl border border-border-default bg-elevated px-4 py-2.5 text-sm font-semibold text-text-primary hover:border-accent-blue/40"
                    >
                      Export Data
                    </button>
                  </div>
                  <div className="rounded-2xl border border-error/40 bg-error/5 p-5">
                    <h3 className="font-heading text-lg font-semibold text-error">Delete Account</h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      Permanently delete your account and associated content. This cannot be undone.
                    </p>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      className="mt-4 rounded-xl bg-error px-4 py-2.5 text-sm font-semibold text-white hover:bg-error/90"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-panel/95 px-8 py-4 backdrop-blur-md">
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
                  disabled={!dirty}
                  className="rounded-xl bg-accent-blue px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-blue/20 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-accent-blue/90"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
