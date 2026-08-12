import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Topbar from '../components/Topbar'
import {
  CAPABILITY_LABELS,
  activatePlan,
  formatCredits,
  formatCreditDate,
  formatPlanName,
  getCreditCosts,
  getCreditHistory,
  getCredits,
  getPlans,
  notifyCreditsChanged,
} from '../utils/credits.js'

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

function updateStoredUserPlan(balance) {
  if (typeof window === 'undefined' || !balance) return
  try {
    const stored = JSON.parse(window.localStorage.getItem('user') || '{}') || {}
    window.localStorage.setItem(
      'user',
      JSON.stringify({
        ...stored,
        plan: balance.plan,
        planDetails: balance.planDetails,
        creditsTotal: balance.creditsTotal,
        creditsUsed: balance.creditsUsed,
        creditsRemaining: balance.creditsRemaining,
        creditsResetAt: balance.creditsResetAt,
      }),
    )
  } catch {
    // Keep billing usable even if localStorage contains stale/non-JSON data.
  }
}

export default function BillingPage() {
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const [balance, setBalance] = useState(null)
  const [plans, setPlans] = useState([])
  const [costItems, setCostItems] = useState([])
  const [pricingFormula, setPricingFormula] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [activatingPlan, setActivatingPlan] = useState(null)
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
      const [bal, costs, hist, planData] = await Promise.all([
        getCredits(),
        getCreditCosts(),
        getCreditHistory(20),
        getPlans(),
      ])
      setBalance(bal)
      setPlans(Array.isArray(planData?.items) ? planData.items : [])
      setPricingFormula(Array.isArray(costs?.pricingFormula) ? costs.pricingFormula : [])
      notifyCreditsChanged(bal)
      setCostItems(costs?.items?.length ? costs.items : Object.entries(costs?.byCapability || {}).map(
        ([capability, credits]) => ({
          capability,
          credits,
          perImage: capability === 'textToImage',
          notes: capability === 'textToImage' ? 'Cost x numImages' : 'Flat cost per job',
        }),
      ))
      setHistory(Array.isArray(hist) ? hist : [])
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Could not load credits.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleActivatePlan = useCallback(
    async (planId) => {
      setActivatingPlan(planId)
      setError(null)
      try {
        const nextBalance = await activatePlan(planId)
        setBalance(nextBalance)
        updateStoredUserPlan(nextBalance)
        showToast(nextBalance?.message || 'Plan activated for testing.')
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Could not activate plan.')
      } finally {
        setActivatingPlan(null)
      }
    },
    [showToast],
  )

  useEffect(() => {
    load()
  }, [load])

  const remaining = Number(balance?.creditsRemaining ?? 0)
  const total = Number(balance?.creditsTotal ?? 0)
  const used = Number(balance?.creditsUsed ?? Math.max(0, total - remaining))
  const remainingLabel = formatCredits(remaining)
  const totalLabel = formatCredits(total)
  const usedLabel = formatCredits(used)
  const pct = total > 0 ? Math.min(100, Math.round((remaining / total) * 100)) : 0
  const planKey = String(balance?.plan || 'free').toLowerCase()
  const currentPlan = balance?.planDetails || plans.find((p) => p.id === planKey)
  const features = currentPlan?.features || ['Choose a plan to unlock generation credits']
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
                  {totalLabel} credits allotment
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
                onClick={() => document.getElementById('billing-plans')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 rounded-xl border border-border-default bg-input px-4 py-2.5 text-sm font-semibold text-text-primary hover:border-accent-violet/40"
              >
                ↑ Choose plan
              </button>
              <button
                type="button"
                onClick={() => showToast('Payment checkout is not connected yet. Plan buttons are for testing.')}
                className="inline-flex items-center gap-2 rounded-xl bg-accent-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 hover:bg-accent-blue/90"
              >
                Manage Plan
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-border-default bg-panel p-6">
            <h3 className="font-heading text-lg font-semibold text-text-primary">Credit Balance</h3>
            <p className="mt-4 font-heading text-5xl font-bold text-text-primary">
              {loading ? '…' : remainingLabel}
            </p>
            <p className="mt-1 text-text-secondary">
              of {loading ? '—' : totalLabel} plan credits
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
                  {loading ? '—' : usedLabel}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface px-3 py-3">
                <p className="text-xs text-text-tertiary">Remaining</p>
                <p className="font-mono text-lg font-semibold text-success">
                  {loading ? '—' : remainingLabel}
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

        <section id="billing-plans">
          <h2 className="font-heading text-xl font-bold text-text-primary">Business Plans</h2>
          <p className="mt-1 text-sm text-text-tertiary">
            Payment is not connected yet. Activating a plan here is for local testing.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const active = plan.id === planKey
              const busy = activatingPlan === plan.id
              return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border p-5 ${
                  active
                    ? 'border-accent-blue/50 bg-surface shadow-lg shadow-accent-blue/10'
                    : 'border-border-default bg-surface'
                }`}
              >
                {active && (
                  <span className="absolute -top-2.5 left-4 rounded-full bg-accent-blue px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Current
                  </span>
                )}
                <p className="font-heading text-2xl font-bold text-text-primary">{plan.name}</p>
                <p className="mt-1 text-sm text-text-tertiary">{plan.description}</p>
                <p className="mt-4 text-2xl font-semibold text-text-primary">${plan.priceUsd} / month</p>
                <p className="mt-1 text-sm text-text-tertiary">
                  PKR {Number(plan.pricePkr || 0).toLocaleString()} approx
                </p>
                <p className="mt-3 rounded-xl border border-border bg-panel px-3 py-2 font-mono text-sm font-semibold text-accent-blue">
                  {formatCredits(plan.monthlyCredits)} credits monthly
                </p>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-text-secondary">
                  {(plan.features || []).map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span className="text-success">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => handleActivatePlan(plan.id)}
                  disabled={active || busy || Boolean(activatingPlan)}
                  className={`mt-5 w-full rounded-xl py-2.5 text-sm font-semibold transition ${
                    active
                      ? 'cursor-not-allowed border border-accent-blue/40 bg-accent-blue/10 text-accent-blue'
                      : 'bg-accent-blue text-white hover:bg-accent-blue/90 disabled:cursor-not-allowed disabled:opacity-60'
                  }`}
                >
                  {active ? 'Current Plan' : busy ? 'Activating...' : 'Activate for Testing'}
                </button>
              </div>
              )
            })}
          </div>
        </section>

        <section>
          <h2 className="font-heading text-xl font-bold text-text-primary">Admart generation costs</h2>
          <p className="mt-1 text-sm text-text-tertiary">
            Final charges include Admart markup. fal cost basis is shown here for testing.
          </p>
          {pricingFormula.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {pricingFormula.map((tier, index) => (
                <span
                  key={`${tier.label || tier.falCost || 'formula'}-${index}`}
                  className="rounded-full border border-border bg-panel px-3 py-1 text-xs text-text-tertiary"
                >
                  {tier.formula
                    ? `${tier.label}: ${tier.formula}`
                    : `${tier.label || `fal ${tier.falCost}`}: fal ${tier.falCost} -> ${
                        tier.admartCredits || tier.markupMultiplier
                      } cr`}
                </span>
              ))}
            </div>
          )}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(costItems.length ? costItems : []).map((row) => (
              <div
                key={row.capability}
                className="flex items-center justify-between gap-4 rounded-xl border border-border-default bg-panel px-4 py-3"
              >
                <div className="min-w-0">
                  <span className="text-text-secondary">
                    {CAPABILITY_LABELS[row.capability] || row.capability}
                  </span>
                  {row.notes && (
                    <p className="text-[11px] text-text-muted">{row.notes}</p>
                  )}
                  {row.falCost && row.markupMultiplier && (
                    <p className="text-[11px] text-text-muted">
                      fal {formatCredits(row.falCost)} x {formatCredits(row.markupMultiplier)}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-right font-mono font-semibold text-accent-blue">
                  {formatCredits(row.credits)}
                  {row.perImage ? ' x n' : ''} cr
                </span>
              </div>
            ))}
            {!loading && !costItems.length && (
              <p className="text-sm text-text-tertiary">No cost table returned yet.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border-default bg-surface p-6">
          <h2 className="font-heading text-xl font-bold text-text-primary">Payment Setup</h2>
          <div className="mt-5 rounded-xl border border-dashed border-border-default bg-input px-4 py-4">
            <p className="text-sm font-medium text-text-primary">Checkout is not connected yet.</p>
            <p className="mt-1 text-sm text-text-tertiary">
              When payment is integrated, successful payment webhooks will activate plans and renew credits.
            </p>
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
                        {cr > 0 ? `-${formatCredits(cr)}` : formatCredits(cr)}
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
