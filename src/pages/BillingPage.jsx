import { useCallback, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import VidifySidebar from '../components/VidifySidebar.jsx'

const PACKS = [
  { credits: 10, price: 5, per: 0.5, best: false },
  { credits: 50, price: 20, per: 0.4, best: false },
  { credits: 100, price: 35, per: 0.35, best: true },
  { credits: 250, price: 75, per: 0.3, best: false },
]

const COST_REF = [
  { label: 'Short video', cost: '1cr' },
  { label: 'Quality video', cost: '2cr' },
  { label: 'AI image', cost: '0.5cr' },
  { label: 'Voiceover', cost: '0.5cr' },
  { label: 'Captions', cost: '0.5cr' },
  { label: 'Premium video', cost: '4cr' },
]

const TXNS = [
  {
    date: 'Apr 14, 2026',
    type: 'usage',
    desc: 'Generated — Summer Teaser',
    credits: '-2',
    amount: '—',
  },
  {
    date: 'Apr 13, 2026',
    type: 'purchase',
    desc: 'Credit pack — 50 credits',
    credits: '+50',
    amount: '$20.00',
  },
  {
    date: 'Apr 12, 2026',
    type: 'topup',
    desc: 'Bonus credits — promo',
    credits: '+10',
    amount: '$0.00',
  },
  {
    date: 'Apr 10, 2026',
    type: 'usage',
    desc: 'Voiceover + captions',
    credits: '-1',
    amount: '—',
  },
  {
    date: 'Apr 8, 2026',
    type: 'usage',
    desc: 'Premium video render',
    credits: '-4',
    amount: '—',
  },
  {
    date: 'Apr 5, 2026',
    type: 'purchase',
    desc: 'Credit pack — 100 credits',
    credits: '+100',
    amount: '$35.00',
  },
]

function TypeBadge({ type }) {
  const map = {
    usage: 'border-error/30 bg-error/15 text-error',
    purchase: 'border-accent-blue/30 bg-accent-blue/15 text-accent-blue',
    topup: 'border-success/30 bg-success/15 text-success',
  }
  const label = type === 'usage' ? 'Usage' : type === 'purchase' ? 'Purchase' : 'Top-up'
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${map[type]}`}>{label}</span>
  )
}

export default function BillingPage() {
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const showToast = useCallback((msg) => {
    setToast(msg)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }, [])

  return (
    <div className="min-h-screen bg-base font-body text-text-primary">
      <VidifySidebar />
      <div className="ml-[260px] min-h-screen">
        <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between gap-4 border-b border-border bg-panel/90 px-7 backdrop-blur-md">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-secondary">
            <Link to="/dashboard" className="hover:text-text-primary">
              Dashboard
            </Link>
            <span className="text-text-muted">/</span>
            <span className="font-heading text-lg font-bold text-text-primary">Billing &amp; Credits</span>
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
            className="animate-slide-up fixed bottom-8 right-8 z-50 rounded-xl border border-border-default bg-elevated px-4 py-3 text-sm text-text-primary shadow-xl"
          >
            {toast}
          </div>
        )}

        <main className="space-y-10 p-7">
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-2xl border border-accent-blue/40 bg-gradient-to-br from-accent-blue/10 via-accent-violet/10 to-transparent p-6 shadow-lg shadow-accent-blue/5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-accent-blue/30 bg-accent-blue/15 px-3 py-1 text-xs font-semibold text-accent-blue">
                    ⚡ Current Plan
                  </span>
                  <h2 className="mt-4 font-heading text-3xl font-bold text-text-primary">Pro</h2>
                  <p className="mt-1 text-text-secondary">$49/month · Renews May 1, 2026</p>
                </div>
              </div>
              <ul className="mt-6 space-y-2 text-sm text-text-secondary">
                {[
                  'Unlimited exports in HD',
                  'Priority rendering queue',
                  'Brand Kit & templates',
                  'Multi-platform publishing',
                  'Analytics dashboard',
                ].map((f) => (
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
                  ↑ Upgrade to Agency
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 hover:bg-accent-blue/90"
                >
                  Manage Plan
                </button>
              </div>
              <p className="mt-4 text-xs text-text-tertiary">Auto-renewal is on. You can cancel anytime from Manage Plan.</p>
            </div>

            <div className="rounded-2xl border border-border-default bg-panel p-6">
              <h3 className="font-heading text-lg font-semibold text-text-primary">Credit Balance</h3>
              <p className="mt-4 font-heading text-5xl font-bold text-text-primary">42</p>
              <p className="mt-1 text-text-secondary">of 200 monthly credits</p>
              <p className="text-sm text-text-tertiary">Resets May 1, 2026</p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-elevated">
                <div className="h-full w-[21%] rounded-full bg-gradient-to-r from-accent-blue to-accent-violet" />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-border bg-surface px-3 py-3">
                  <p className="text-xs text-text-tertiary">Used</p>
                  <p className="font-mono text-lg font-semibold text-text-primary">158</p>
                </div>
                <div className="rounded-xl border border-border bg-surface px-3 py-3">
                  <p className="text-xs text-text-tertiary">Remaining</p>
                  <p className="font-mono text-lg font-semibold text-success">42</p>
                </div>
                <div className="rounded-xl border border-border bg-surface px-3 py-3">
                  <p className="text-xs text-text-tertiary">Bonus</p>
                  <p className="font-mono text-lg font-semibold text-text-muted">0</p>
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
                    onClick={() => showToast(`Purchasing ${p.credits} credits — checkout would open here.`)}
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
            <h2 className="font-heading text-xl font-bold text-text-primary">Credit Cost Reference</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {COST_REF.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-xl border border-border-default bg-panel px-4 py-3"
                >
                  <span className="text-text-secondary">{row.label}</span>
                  <span className="font-mono font-semibold text-accent-blue">{row.cost}</span>
                </div>
              ))}
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
            <div className="mt-4 flex flex-wrap gap-3">
              {['JazzCash', 'EasyPaisa', 'Bank Transfer'].map((name) => (
                <button
                  key={name}
                  type="button"
                  className="rounded-xl border border-border-default bg-input px-4 py-2.5 text-sm text-text-secondary hover:border-accent-blue/30 hover:text-text-primary"
                >
                  {name}
                </button>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-border-default bg-surface">
            <div className="border-b border-border px-6 py-4">
              <h2 className="font-heading text-xl font-bold text-text-primary">Transaction History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Description</th>
                    <th className="px-6 py-3 font-medium">Credits</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {TXNS.map((t, i) => (
                    <tr key={i} className="border-b border-border/80 hover:bg-elevated/60">
                      <td className="px-6 py-3 text-text-secondary">{t.date}</td>
                      <td className="px-6 py-3">
                        <TypeBadge type={t.type} />
                      </td>
                      <td className="px-6 py-3 text-text-primary">{t.desc}</td>
                      <td
                        className={`px-6 py-3 font-mono font-medium ${
                          t.credits.startsWith('-') ? 'text-error' : 'text-success'
                        }`}
                      >
                        {t.credits}
                      </td>
                      <td className="px-6 py-3 font-mono text-text-secondary">{t.amount}</td>
                      <td className="px-6 py-3">
                        <button
                          type="button"
                          className="text-accent-blue hover:underline"
                          onClick={() => showToast('PDF download would start here.')}
                        >
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <p className="text-center text-sm text-text-tertiary">
            Questions? <Link to="/settings" className="text-accent-blue hover:underline">Contact support</Link> from
            Settings.
          </p>
        </main>
      </div>
    </div>
  )
}
