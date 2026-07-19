import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Topbar from '../components/Topbar'
import {
  CAPABILITY_LABELS,
  formatCreditDate,
  formatPlanName,
  getCreditCosts,
  getCreditHistory,
  getCredits,
  notifyCreditsChanged,
} from '../utils/credits.js'

const PACKS = [
  { credits: 10, price: 5, per: 0.5, best: false },
  { credits: 50, price: 20, per: 0.4, best: false },
  { credits: 100, price: 35, per: 0.35, best: true },
  { credits: 250, price: 75, per: 0.3, best: false },
]

const PLAN_FEATURES = {
  free: ['Text to video', '720p exports', '1 connected account', 'Community support'],
  starter: ['1080p exports', '3 connected accounts', 'AI voiceover', 'Email support'],
  pro: [
    'Unlimited exports in HD',
    'Priority rendering queue',
    'Brand Kit & templates',
    'Multi-platform publishing',
    'Analytics dashboard',
  ],
  agency: ['Team workspaces', 'SSO', 'API access', 'SLA + onboarding'],
}

function TypeBadge({ type }) {
  const map = {
    usage: 'border-error/30 bg-error/15 text-error',
    purchase: 'border-accent-blue/30 bg-accent-blue/15 text-accent-blue',
    topup: 'border-success/30 bg-success/15 text-success',
  }
  const label = type === 'usage' ? 'Usage' : type === 'purchase' ? 'Purchase' : 'Top-up'
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${map[type] || map.usage}`}>
      {label}
    </span>
  )
}

export default function BillingPage() {
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const [balance, setBalance] = useState(null)
  const [costItems, setCostItems] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const showToast = useCallback((msg) => {
    setToast(msg)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [bal, costs, hist] = await Promise.all([
        getCredits(),
        getCreditCosts(),
        getCreditHistory(20),
      ])
      setBalance(bal)
      notifyCreditsChanged(bal)
      setCostItems(costs?.items?.length ? costs.items : Object.entries(costs?.byCapability || {}).map(
        ([capability, credits]) => ({
          capability,
          credits,
          perImage: capability === 'textToImage',
          notes: capability === 'textToImage' ? 'Cost × numImages' : 'Flat cost per job',
        }),
      ))
      setHistory(Array.isArray(hist) ? hist : [])
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Could not load credits.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const remaining = balance?.creditsRemaining ?? 0
  const total = balance?.creditsTotal ?? 0
  const used = balance?.creditsUsed ?? Math.max(0, total - remaining)
  const pct = total > 0 ? Math.min(100, Math.round((remaining / total) * 100)) : 0
  const planKey = String(balance?.plan || 'free').toLowerCase()
  const features = PLAN_FEATURES[planKey] || PLAN_FEATURES.free
  const resetLabel = balance?.creditsResetAt
    ? formatCreditDate(balance.creditsResetAt)
    : 'No automatic reset'

  return (
    <AppLayout>
      <Topbar title="Billing & Credits" />

      {toast && (
        <div
          role="status"
          className="animate-slide-up fixed bottom-8 right-8 z-50 rounded-xl border border-border-default bg-elevated px-4 py-3 text-sm text-text-primary shadow-xl"
        >
          {toast}
        </div>
      )}

      <main className="space-y-10 p-7">
        {error && (
          <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}{' '}
            <button type="button" onClick={load} className="underline">
              Retry
            </button>
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-accent-blue/40 bg-gradient-to-br from-accent-blue/10 via-accent-violet/10 to-transparent p-6 shadow-lg shadow-accent-blue/5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full border border-accent-blue/30 bg-accent-blue/15 px-3 py-1 text-xs font-semibold text-accent-blue">
                  ⚡ Current Plan
                </span>
                <h2 className="mt-4 font-heading text-3xl font-bold text-text-primary">
                  {loading ? '…' : formatPlanName(balance?.plan)}
                </h2>
                <p className="mt-1 text-text-secondary">
                  {total} credits allotment
                  {balance?.creditsResetAt ? ` · Resets ${resetLabel}` : ''}
                </p>
              </div>
            </div>
            <ul className="mt-6 space-y-2 text-sm text-text-secondary">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-success">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/create')}
                className="inline-flex items-center gap-2 rounded-xl border border-border-default bg-input px-4 py-2.5 text-sm font-semibold text-text-primary hover:border-accent-violet/40"
              >
                ↑ Upgrade plan
              </button>
              <button
                type="button"
                onClick={() => showToast('Plan management opens when billing checkout is connected.')}
                className="inline-flex items-center gap-2 rounded-xl bg-accent-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 hover:bg-accent-blue/90"
              >
                Manage Plan
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-border-default bg-panel p-6">
            <h3 className="font-heading text-lg font-semibold text-text-primary">Credit Balance</h3>
            <p className="mt-4 font-heading text-5xl font-bold text-text-primary">
              {loading ? '…' : remaining}
            </p>
            <p className="mt-1 text-text-secondary">
              of {loading ? '—' : total} plan credits
            </p>
            <p className="text-sm text-text-tertiary">{resetLabel}</p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-elevated">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-violet transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-border bg-surface px-3 py-3">
                <p className="text-xs text-text-tertiary">Used</p>
                <p className="font-mono text-lg font-semibold text-text-primary">
                  {loading ? '—' : used}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface px-3 py-3">
                <p className="text-xs text-text-tertiary">Remaining</p>
                <p className="font-mono text-lg font-semibold text-success">
                  {loading ? '—' : remaining}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface px-3 py-3">
                <p className="text-xs text-text-tertiary">Can generate</p>
                <p className="font-mono text-lg font-semibold text-text-primary">
                  {loading ? '—' : balance?.canGenerate ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-text-primary">Buy More Credits</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {PACKS.map((p) => (
              <div
                key={p.credits}
                className={`relative flex flex-col rounded-2xl border p-5 ${
                  p.best
                    ? 'border-accent-blue/50 bg-surface shadow-lg shadow-accent-blue/10'
                    : 'border-border-default bg-surface'
                }`}
              >
                {p.best && (
                  <span className="absolute -top-2.5 left-4 rounded-full bg-accent-blue px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Best Value
                  </span>
                )}
                <p className="font-heading text-2xl font-bold text-text-primary">{p.credits} cr</p>
                <p className="mt-1 text-2xl font-semibold text-text-primary">${p.price}</p>
                <p className="mt-1 text-sm text-text-tertiary">${p.per.toFixed(2)} / credit</p>
                <button
                  type="button"
                  onClick={() =>
                    showToast(`Purchasing ${p.credits} credits — checkout would open here.`)
                  }
                  className={`mt-5 w-full rounded-xl py-2.5 text-sm font-semibold transition ${
                    p.best
                      ? 'bg-accent-blue text-white hover:bg-accent-blue/90'
                      : 'border border-border-default bg-elevated text-text-primary hover:border-accent-blue/40'
                  }`}
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-text-primary">Image credit costs</h2>
          <p className="mt-1 text-sm text-text-tertiary">From GET /api/credits/costs</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(costItems.length ? costItems : []).map((row) => (
              <div
                key={row.capability}
                className="flex items-center justify-between rounded-xl border border-border-default bg-panel px-4 py-3"
              >
                <div>
                  <span className="text-text-secondary">
                    {CAPABILITY_LABELS[row.capability] || row.capability}
                  </span>
                  {row.notes && (
                    <p className="text-[11px] text-text-muted">{row.notes}</p>
                  )}
                </div>
                <span className="font-mono font-semibold text-accent-blue">
                  {row.credits}
                  {row.perImage ? ' × n' : ''} cr
                </span>
              </div>
            ))}
            {!loading && !costItems.length && (
              <p className="text-sm text-text-tertiary">No cost table returned yet.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border-default bg-surface p-6">
          <h2 className="font-heading text-xl font-bold text-text-primary">Payment Methods</h2>
          <div className="mt-5 flex flex-wrap gap-4">
            <div className="flex min-w-[200px] flex-1 items-center justify-between rounded-xl border border-border-default bg-panel px-4 py-3">
              <div>
                <p className="text-sm font-medium text-text-primary">Visa ending 4242</p>
                <p className="text-xs text-text-tertiary">Expires 12/28</p>
              </div>
              <span className="rounded-full border border-success/30 bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                Default
              </span>
            </div>
            <button
              type="button"
              className="flex min-w-[160px] flex-1 items-center justify-center rounded-xl border border-dashed border-border-default bg-input px-4 py-3 text-sm font-medium text-text-secondary hover:border-accent-blue/40 hover:text-text-primary"
            >
              + Add New Card
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border-default bg-surface">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="font-heading text-xl font-bold text-text-primary">Credit history</h2>
            <button
              type="button"
              onClick={load}
              className="text-xs font-medium text-accent-blue hover:underline"
            >
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Description</th>
                  <th className="px-6 py-3 font-medium">Model</th>
                  <th className="px-6 py-3 font-medium">Credits</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((t) => {
                  const cr = Number(t.credits) || 0
                  const label = CAPABILITY_LABELS[t.capability] || t.capability || 'Usage'
                  const desc = t.prompt?.trim()
                    ? `${label} — ${t.prompt.slice(0, 60)}${t.prompt.length > 60 ? '…' : ''}`
                    : label
                  return (
                    <tr key={t.id} className="border-b border-border/80 hover:bg-elevated/60">
                      <td className="px-6 py-3 text-text-secondary">
                        {formatCreditDate(t.createdAt)}
                      </td>
                      <td className="px-6 py-3">
                        <TypeBadge type="usage" />
                      </td>
                      <td className="max-w-xs truncate px-6 py-3 text-text-primary" title={desc}>
                        {desc}
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-text-tertiary">
                        {t.model || '—'}
                      </td>
                      <td className="px-6 py-3 font-mono font-medium text-error">
                        {cr > 0 ? `-${cr}` : cr}
                      </td>
                      <td className="px-6 py-3 text-text-secondary">{t.status || '—'}</td>
                    </tr>
                  )
                })}
                {!loading && !history.length && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-text-tertiary">
                      No credit spends yet. Generate an image to see history.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <p className="text-center text-sm text-text-tertiary">
          Questions?{' '}
          <Link to="/settings" className="text-accent-blue hover:underline">
            Contact support
          </Link>{' '}
          from Settings.
        </p>
      </main>
    </AppLayout>
  )
}
