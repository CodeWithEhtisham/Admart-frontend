import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Topbar from '../components/Topbar'
import { SUPPORT_EMAIL } from '../utils/site'
import {
  CAPABILITY_LABELS,
  formatCredits,
  formatCreditDate,
  formatPlanName,
  getCreditCosts,
  getCreditHistory,
  getCredits,
  getMyPayments,
  getPaymentMethods,
  getPlans,
  getTopupPacks,
  notifyCreditsChanged,
  submitPayment,
} from '../utils/credits.js'
import { Glyphs } from '../components/glyphs'
import { Icon } from '../components/icons'

function TypeBadge({ type }) {
  const map = {
    usage: 'border-error/30 bg-error/15 text-danger',
    purchase: 'border-accent-blue/30 bg-accent-blue/15 text-link',
    topup: 'border-success/30 bg-success/15 text-success-text',
  }
  const label = type === 'usage' ? 'Usage' : type === 'purchase' ? 'Purchase' : 'Top-up'
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${map[type] || map.usage}`}>
      {label}
    </span>
  )
}

const PAYMENT_STATUS_LABELS = {
  pending: 'In process',
  paid: 'Paid',
  failed: 'Rejected',
  refunded: 'Refunded',
}

function PaymentStatusBadge({ status }) {
  const map = {
    pending: 'border-warning/30 bg-warning/15 text-warning',
    paid: 'border-success/30 bg-success/15 text-success-text',
    failed: 'border-error/30 bg-error/15 text-danger',
    refunded: 'border-border-default bg-surface text-text-tertiary',
  }
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${map[status] || map.pending}`}>
      {PAYMENT_STATUS_LABELS[status] || status}
    </span>
  )
}

export default function BillingPage() {
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const [balance, setBalance] = useState(null)
  const [plans, setPlans] = useState([])
  const [topupPacks, setTopupPacks] = useState([])
  const [costItems, setCostItems] = useState([])
  const [pricingFormula, setPricingFormula] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [methods, setMethods] = useState(null)
  const [myPayments, setMyPayments] = useState([])
  const [selectedPlanId, setSelectedPlanId] = useState(null)
  const [selectedPackId, setSelectedPackId] = useState(null)
  const [screenshot, setScreenshot] = useState(null)
  const [transactionId, setTransactionId] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const showToast = useCallback((msg) => {
    setToast(msg)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [bal, costs, hist, planData, topupData, methodData, payments] = await Promise.all([
        getCredits(),
        getCreditCosts(),
        getCreditHistory(20),
        getPlans(),
        getTopupPacks(),
        getPaymentMethods(),
        getMyPayments(),
      ])
      setBalance(bal)
      setPlans(Array.isArray(planData?.items) ? planData.items : [])
      setTopupPacks(Array.isArray(topupData?.items) ? topupData.items : Array.isArray(topupData) ? topupData : [])
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
      setMethods(methodData?.methods?.[0] || null)
      setMyPayments(Array.isArray(payments) ? payments : [])
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Could not load credits.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const pendingPayment = myPayments.find((p) => p.status === 'pending') || null
  const lastRejected = myPayments.find((p) => p.status === 'failed') || null
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || null
  const selectedPack = topupPacks.find((p) => p.id === selectedPackId) || null
  const selectedTarget = selectedPlan
    ? { type: 'subscription', ...selectedPlan, title: selectedPlan.name }
    : selectedPack
      ? { type: 'topup', ...selectedPack, title: selectedPack.name }
      : null

  const handleSelectPlan = useCallback((planId) => {
    setSelectedPlanId(planId)
    setSelectedPackId(null)
    setScreenshot(null)
    setTransactionId('')
    setNote('')
    setSubmitError(null)
    document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const handleSelectPack = useCallback((packId) => {
    setSelectedPackId(packId)
    setSelectedPlanId(null)
    setScreenshot(null)
    setTransactionId('')
    setNote('')
    setSubmitError(null)
    document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const copyAccountNumber = useCallback(() => {
    const value = methods?.accountNumber || ''
    if (!value) return
    navigator.clipboard?.writeText(value).then(
      () => showToast('Account number copied.'),
      () => {},
    )
  }, [methods, showToast])

  const handleSubmitPayment = useCallback(
    async (e) => {
      e.preventDefault()
      if (!selectedTarget) return
      if (!screenshot) {
        setSubmitError('Please attach the payment screenshot.')
        return
      }
      setSubmitting(true)
      setSubmitError(null)
      const form = new FormData()
      if (selectedTarget.type === 'topup') {
        form.append('paymentType', 'topup')
        form.append('pack', selectedTarget.id)
      } else {
        form.append('paymentType', 'subscription')
        form.append('plan', selectedTarget.id)
      }
      form.append('screenshot', screenshot)
      form.append('transactionId', transactionId)
      form.append('note', note)
      try {
        await submitPayment(form)
        showToast('Payment submitted — it is now in process until an admin reviews it.')
        setScreenshot(null)
        setTransactionId('')
        setNote('')
        setSelectedPlanId(null)
        setSelectedPackId(null)
        await load()
        document.getElementById(selectedTarget.type === 'topup' ? 'billing-topups' : 'billing-plans')?.scrollIntoView({ behavior: 'smooth' })
      } catch (err) {
        const data = err?.response?.data
        const message =
          data?.screenshot?.[0] ||
          data?.plan?.[0] ||
          data?.pack?.[0] ||
          data?.transactionId?.[0] ||
          data?.non_field_errors?.[0] ||
          data?.message ||
          err?.message ||
          'Could not submit payment.'
        setSubmitError(message)
        if (data?.non_field_errors?.[0]) await load()
      } finally {
        setSubmitting(false)
      }
    },
    [selectedTarget, screenshot, transactionId, note, showToast, load],
  )

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
  const resetLabel = balance?.creditsResetAt ? formatCreditDate(balance.creditsResetAt) : ''
  const hasActivePaidPlan =
    planKey !== 'free' && Boolean(balance?.creditsResetAt) && new Date(balance.creditsResetAt) > new Date()

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

      <main id="main-content" tabIndex={-1} className="space-y-10 p-4 sm:p-7">
        {error && (
          <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-danger">
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
                <span className="inline-flex items-center gap-1 rounded-full border border-accent-blue/30 bg-accent-blue/15 px-3 py-1 text-xs font-semibold text-link">
                  <Icon className="h-3.5 w-3.5">{Glyphs.bolt}</Icon> Current Plan
                </span>
                <h2 className="mt-4 font-heading text-3xl font-bold text-text-primary">
                  {loading ? '…' : formatPlanName(balance?.plan)}
                </h2>
                <p className="mt-1 text-text-secondary">
                  {totalLabel} credits allotment
                  {balance?.creditsResetAt ? ` · Ends ${resetLabel}` : ''}
                </p>
              </div>
            </div>
            <ul className="mt-6 space-y-2 text-sm text-text-secondary">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-success-text">✓</span>
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
                ↑ Change plan
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('billing-topups')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 rounded-xl border border-success/40 bg-success/15 px-4 py-2.5 text-sm font-semibold text-success-text hover:bg-success/25 transition"
              >
                <Icon className="h-4 w-4">{Glyphs.bolt}</Icon> Buy additional credits
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
            {resetLabel && <p className="text-sm text-text-tertiary">Plan ends {resetLabel}</p>}
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
                <p className="font-mono text-lg font-semibold text-success-text">
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
            Pay via EasyPaisa and submit the screenshot — credits are added to your
            balance once the payment is approved.
          </p>

          {pendingPayment && (
            <div className="mt-4 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
              Your <strong>{pendingPayment.planName}</strong> payment is{' '}
              <strong>in process</strong> since {formatCreditDate(pendingPayment.createdAt)}.
              You cannot submit another payment until it is reviewed.
            </div>
          )}
          {lastRejected && !pendingPayment && (
            <div className="mt-4 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-danger">
              Your last payment ({lastRejected.planName}) was rejected
              {lastRejected.message ? `: ${lastRejected.message}` : '.'}{' '}
              You can submit a new payment below.
            </div>
          )}

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const active = plan.id === planKey
              const inProcess = pendingPayment?.plan === plan.id
              const blockedByPending = Boolean(pendingPayment) && !inProcess
              const isSelected = selectedPlanId === plan.id
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border p-5 ${
                    isSelected
                      ? 'border-accent-blue bg-surface shadow-lg shadow-accent-blue/15 ring-2 ring-accent-blue/30'
                      : active
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
                  <p className="mt-3 rounded-xl border border-border bg-panel px-3 py-2 font-mono text-sm font-semibold text-link">
                    {formatCredits(plan.monthlyCredits)} credits monthly
                  </p>
                  <ul className="mt-5 flex-1 space-y-2 text-sm text-text-secondary">
                    {(plan.features || []).map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <span className="text-success-text">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={active || inProcess || blockedByPending}
                    title={
                      blockedByPending
                        ? 'You already have a payment under review.'
                        : undefined
                    }
                    className={`mt-5 w-full rounded-xl py-2.5 text-sm font-semibold transition ${
                      active
                        ? 'cursor-not-allowed border border-accent-blue/40 bg-accent-blue/10 text-link'
                        : inProcess
                          ? 'cursor-not-allowed border border-warning/40 bg-warning/10 text-warning'
                          : blockedByPending
                            ? 'cursor-not-allowed border border-border-default bg-elevated text-text-muted'
                            : isSelected
                              ? 'border border-accent-blue bg-accent-blue text-white'
                              : 'bg-accent-blue text-white hover:bg-accent-blue/90'
                    }`}
                  >
                    {active
                      ? 'Current Plan'
                      : inProcess
                        ? 'In process'
                        : blockedByPending
                          ? 'In process (another request)'
                          : isSelected
                            ? 'Selected'
                            : 'Subscribe'}
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        <section id="billing-topups">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-xl font-bold text-text-primary">Need Additional Credits?</h2>
              <p className="mt-1 text-sm text-text-tertiary">
                One-time credit booster packs. Credits never expire and do not alter your active subscription tier.
              </p>
            </div>
            <span className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-success-text">
              <Icon className="inline-block -mt-0.5 h-4 w-4">{Glyphs.bolt}</Icon> On-demand Boosters
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {topupPacks.map((pack) => {
              const inProcess = pendingPayment?.pack === pack.id
              const blockedByPending = Boolean(pendingPayment) && !inProcess
              const isSelected = selectedPackId === pack.id
              return (
                <div
                  key={pack.id}
                  className={`relative flex flex-col rounded-2xl border p-5 ${
                    isSelected
                      ? 'border-success bg-surface shadow-lg shadow-success/15 ring-2 ring-success/30'
                      : 'border-border-default bg-surface hover:border-border'
                  }`}
                >
                  {pack.popular && (
                    <span className="absolute -top-2.5 left-4 rounded-full bg-accent-violet px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      Popular Choice
                    </span>
                  )}
                  <p className="font-heading text-2xl font-bold text-text-primary">{pack.name}</p>
                  <p className="mt-1 text-sm text-text-tertiary">{pack.description}</p>
                  <p className="mt-4 text-2xl font-semibold text-text-primary">${pack.priceUsd} one-time</p>
                  <p className="mt-1 text-sm text-text-tertiary">
                    PKR {Number(pack.pricePkr || 0).toLocaleString()} approx
                  </p>
                  <p className="mt-3 rounded-xl border border-success/30 bg-success/10 px-3 py-2 font-mono text-sm font-semibold text-success-text">
                    +{formatCredits(pack.credits)} credits (never expires)
                  </p>
                  <ul className="mt-5 flex-1 space-y-2 text-sm text-text-secondary">
                    {(pack.features || []).map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <span className="text-success-text">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => handleSelectPack(pack.id)}
                    disabled={inProcess || blockedByPending}
                    title={
                      blockedByPending
                        ? 'You already have a payment under review.'
                        : undefined
                    }
                    className={`mt-5 w-full rounded-xl py-2.5 text-sm font-semibold transition ${
                      inProcess
                        ? 'cursor-not-allowed border border-warning/40 bg-warning/10 text-warning'
                        : blockedByPending
                          ? 'cursor-not-allowed border border-border-default bg-elevated text-text-muted'
                          : isSelected
                            ? 'border border-success bg-success text-white'
                            : 'border border-success/40 bg-success/10 text-success-text hover:bg-success hover:text-white'
                    }`}
                  >
                    {inProcess
                      ? 'In process'
                      : blockedByPending
                        ? 'In process (another request)'
                        : isSelected
                          ? 'Selected'
                          : 'Top-up now'}
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        {selectedTarget && !pendingPayment && (
          <section id="payment-section" className="rounded-2xl border border-border-default bg-surface p-6">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  selectedTarget.type === 'topup'
                    ? 'border border-success/30 bg-success/15 text-success-text'
                    : 'border border-accent-blue/30 bg-accent-blue/15 text-link'
                }`}
              >
                {selectedTarget.type === 'topup' ? 'Credit Top-up' : 'Plan Subscription'}
              </span>
            </div>
            <h2 className="mt-2 font-heading text-xl font-bold text-text-primary">
              Pay for {selectedTarget.name}
            </h2>
            <p className="mt-1 text-sm text-text-tertiary">
              Send{' '}
              <span className="font-semibold text-text-primary">
                PKR {Number(selectedTarget.pricePkr || 0).toLocaleString()}
              </span>{' '}
              to the EasyPaisa account below, then attach the payment screenshot.{' '}
              {selectedTarget.type === 'topup'
                ? `An admin will review it and your +${formatCredits(selectedTarget.credits)} credits will be added directly to your balance.`
                : 'An admin will review it and your monthly plan credits will be activated automatically.'}
            </p>
            {selectedTarget.type !== 'topup' && hasActivePaidPlan && (
              <p className="mt-3 rounded-xl border border-border-default bg-surface px-3.5 py-2.5 text-sm text-text-secondary">
                {selectedTarget.id === planKey
                  ? `Renewing early adds 30 days after your current period ends (${resetLabel}), and the new credits are added to your balance.`
                  : 'Switching plans starts a new 30-day period once approved. Your leftover credits stay usable until it ends.'}
              </p>
            )}

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-accent-blue/30 bg-accent-blue/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-link">
                  EasyPaisa
                </p>
                <p className="mt-2 font-mono text-2xl font-bold text-text-primary">
                  {methods?.accountNumber || '—'}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Account name: <span className="font-medium text-text-primary">{methods?.accountName || '—'}</span>
                </p>
                <button
                  type="button"
                  onClick={copyAccountNumber}
                  className="mt-3 rounded-xl border border-border-default bg-input px-4 py-2 text-sm font-semibold text-text-primary hover:border-accent-blue/40"
                >
                  Copy number
                </button>
              </div>

              <form className="space-y-3" onSubmit={handleSubmitPayment}>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-tertiary">
                    Payment screenshot *
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                    className="w-full rounded-xl border border-border-default bg-input px-3.5 py-2.5 text-sm text-text-primary file:mr-3 file:rounded-lg file:border-0 file:bg-accent-blue/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-link"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-tertiary">
                      Transaction ID
                    </label>
                    <input
                      required
                      className="w-full rounded-xl border border-border-default bg-input px-3.5 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent-blue"
                      placeholder="e.g. EP-123456789"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-tertiary">
                      Note (optional)
                    </label>
                    <input
                      className="w-full rounded-xl border border-border-default bg-input px-3.5 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent-blue"
                      placeholder="Anything the admin should know"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </div>
                {submitError && (
                  <p className="text-sm text-danger">{submitError}</p>
                )}
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={submitting || !screenshot}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 hover:bg-accent-blue/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? 'Submitting…' : 'Submit payment proof'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlanId(null)
                      setSelectedPackId(null)
                    }}
                    className="text-sm font-medium text-text-tertiary hover:text-text-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        <section>
          <h2 className="font-heading text-xl font-bold text-text-primary">Admart generation costs</h2>
          <p className="mt-1 text-sm text-text-tertiary">
            Final charges include Admart markup. Provider cost basis is shown here for testing.
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
                    : `${tier.label || `Base ${tier.falCost}`}: base ${tier.falCost} -> ${
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
                      base {formatCredits(row.falCost)} x {formatCredits(row.markupMultiplier)}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-right font-mono font-semibold text-link">
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

        {myPayments.length > 0 && (
          <section className="overflow-hidden rounded-2xl border border-border-default bg-surface">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-heading text-xl font-bold text-text-primary">My payment requests</h2>
              <button
                type="button"
                onClick={load}
                className="text-xs font-medium text-link hover:underline"
              >
                Refresh
              </button>
            </div>
            <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Scrollable table">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Item / Plan</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Proof</th>
                  </tr>
                </thead>
                <tbody>
                  {myPayments.map((p) => (
                    <tr key={p.id} className="border-b border-border/80 hover:bg-elevated/60">
                      <td className="px-6 py-3 text-text-secondary">
                        {formatCreditDate(p.createdAt)}
                      </td>
                      <td className="px-6 py-3 text-text-primary">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{p.planName}</span>
                          {p.paymentType === 'topup' && (
                            <span className="rounded-full border border-success/30 bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success-text">
                              Top-up
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 font-mono text-text-secondary">
                        {p.currency} {Number(p.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-3">
                        <PaymentStatusBadge status={p.status} />
                        {p.status === 'failed' && p.message && (
                          <p className="mt-1 max-w-xs text-xs text-danger">{p.message}</p>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        {p.screenshotUrl ? (
                          <a
                            href={p.screenshotUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-link hover:underline"
                          >
                            View
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-border-default bg-surface">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="font-heading text-xl font-bold text-text-primary">Credit history</h2>
            <button
              type="button"
              onClick={load}
              className="text-xs font-medium text-link hover:underline"
            >
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Scrollable table">
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
                        {t.model
                          ? t.model
                              .replace(/^fal[.-]?ai[/]/i, '')
                              .replace(/^fal[/]/i, '')
                          : '—'}
                      </td>
                      <td className="px-6 py-3 font-mono font-medium text-danger">
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
          Questions about a payment?{' '}
          {SUPPORT_EMAIL ? (
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-link underline">
              Email {SUPPORT_EMAIL}
            </a>
          ) : (
            'Contact our support team.'
          )}
        </p>
      </main>
    </AppLayout>
  )
}
