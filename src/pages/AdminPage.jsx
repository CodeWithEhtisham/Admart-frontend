import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AppLayout from '../components/AppLayout'
import Topbar from '../components/Topbar'
import {
  adjustAdminUserCredits,
  changeAdminUserPlan,
  createAdminPayment,
  createAdminUser,
  deleteAdminUser,
  formatAdminDateTime,
  getAdminPayments,
  getAdminPlans,
  getAdminRevenue,
  getAdminSettings,
  getAdminStats,
  getAdminUsage,
  getAdminUser,
  getAdminUsers,
  getAdminStatus,
  patchAdminUser,
  timeAgo,
  updateAdminSettings,
} from '../utils/admin'
import { notifyCreditsChanged } from '../utils/credits'

const inputCls =
  'w-full rounded-xl border border-border-default bg-input px-3.5 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent-blue'
const selectCls = `${inputCls} appearance-none bg-input`
const btnCls =
  'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition'
const btnPrimary = `${btnCls} bg-accent-blue text-white hover:bg-accent-blue/90 disabled:opacity-50`
const btnGhost = `${btnCls} border border-border-default bg-elevated text-text-primary hover:border-accent-blue/40 hover:text-accent-blue`

const PLAN_COLORS = {
  free: 'border-border-default bg-surface text-text-secondary',
  basic: 'border-accent-blue/30 bg-accent-blue/10 text-accent-blue',
  plus: 'border-accent-violet/30 bg-accent-violet/10 text-accent-violet',
  pro: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
}

const PAYMENT_COLORS = {
  paid: 'border-success/30 bg-success/10 text-success',
  pending: 'border-warning/30 bg-warning/10 text-warning',
  failed: 'border-error/30 bg-error/10 text-error',
  refunded: 'border-border-default bg-surface text-text-tertiary',
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'customers', label: 'Customers' },
  { id: 'payments', label: 'Payments' },
  { id: 'plans', label: 'Plans' },
  { id: 'usage', label: 'Usage & Credits' },
  { id: 'settings', label: 'Settings' },
]

function combineJobSeries(image, video) {
  const merged = {}
  ;[...(image || []), ...(video || [])].forEach((d) => {
    merged[d.date] = merged[d.date] || { date: d.date, total: 0, succeeded: 0, failed: 0 }
    merged[d.date].total += d.total
    merged[d.date].succeeded += d.succeeded
    merged[d.date].failed += d.failed
  })
  return Object.values(merged)
}

function initials(user) {
  const first = user?.firstName || ''
  const last = user?.lastName || ''
  const text = `${first} ${last}`.trim() || user?.email || '?'
  return text
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function Avatar({ user, size = 'h-9 w-9' }) {
  return (
    <div
      className={`${size} flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent-blue/30 to-accent-violet/30 text-xs font-bold text-text-primary`}
    >
      {user?.avatarUrl ? (
        <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        initials(user)
      )}
    </div>
  )
}

function PlanBadge({ plan }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
        PLAN_COLORS[plan] || PLAN_COLORS.free
      }`}
    >
      {plan}
    </span>
  )
}

function StatusPill({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        active ? 'border-success/30 bg-success/10 text-success' : 'border-error/30 bg-error/10 text-error'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-success' : 'bg-error'}`} />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function PaymentPill({ status }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
        PAYMENT_COLORS[status] || PAYMENT_COLORS.pending
      }`}
    >
      {status}
    </span>
  )
}

function KpiCard({ label, value, sub, icon, tone = 'text-text-primary' }) {
  return (
    <div className="rounded-2xl border border-border-default bg-panel p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-text-tertiary">{label}</span>
        {icon && <span className="text-base">{icon}</span>}
      </div>
      <p className={`mt-2 font-heading text-2xl font-bold ${tone}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-text-muted">{sub}</p>}
    </div>
  )
}

function MiniBarChart({ items, stacks = [{ key: 'value', color: 'bg-accent-blue' }], format = (v) => String(v) }) {
  const max = Math.max(1, ...items.map((d) => stacks.reduce((sum, st) => sum + Number(d[st.key] || 0), 0)))
  if (!items.length) {
    return <div className="flex h-28 items-center justify-center text-xs text-text-muted">No data yet</div>
  }
  return (
    <div className="flex h-28 items-end gap-1">
      {items.map((d, i) => {
        const total = stacks.reduce((sum, st) => sum + Number(d[st.key] || 0), 0)
        return (
          <div
            key={i}
            className="group relative flex h-full flex-1 flex-col justify-end gap-px"
            title={stacks
              .map((st) => `${st.label || st.key}: ${format(Number(d[st.key] || 0))}`)
              .join(' · ')}
          >
            {stacks.map((st, j) => {
              const v = Number(d[st.key] || 0)
              if (v <= 0) return null
              return (
                <div
                  key={j}
                  className={`${st.color} w-full rounded-sm group-hover:opacity-80`}
                  style={{ height: `${(v / max) * 100}%` }}
                />
              )
            })}
            {total === 0 && <div className="h-0.5 w-full bg-border-default" />}
          </div>
        )
      })}
    </div>
  )
}

function ChartCard({ title, hint, children, right }) {
  return (
    <div className="rounded-2xl border border-border-default bg-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          {hint && <p className="mt-0.5 text-xs text-text-muted">{hint}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  )
}

function Toast({ message }) {
  if (!message) return null
  return (
    <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 animate-slide-up rounded-xl border border-border-default bg-panel px-5 py-3 text-sm font-medium text-text-primary shadow-xl">
      {message}
    </div>
  )
}

function Drawer({ onClose, children }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border-default bg-panel shadow-2xl">
        {children}
      </aside>
    </>
  )
}

export default function AdminPage() {
  const [tab, setTab] = useState('overview')
  const [status, setStatus] = useState(null)
  const [stats, setStats] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [drawerUserId, setDrawerUserId] = useState(null)

  const showToast = useCallback((msg) => {
    setToast(msg)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2800)
  }, [])

  const loadStats = useCallback(async (silent = false) => {
    try {
      const data = await getAdminStats()
      setStats(data)
      setLastUpdated(new Date())
      setError('')
    } catch (err) {
      if (!silent) setError(err?.response?.data?.detail || 'Could not load admin stats.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    getAdminStatus(true).then((s) => {
      if (active) setStatus(s)
    })
    loadStats(true)
    const id = window.setInterval(() => loadStats(true), 10000)
    return () => {
      active = false
      window.clearInterval(id)
    }
  }, [loadStats])

  const isStaff = Boolean(status?.isStaff)
  const isSuperuser = Boolean(status?.isSuperuser)

  if (status && !isStaff) {
    return (
      <AppLayout>
        <Topbar title="Admin" />
        <div className="mx-auto w-full max-w-7xl px-6 py-16">
          <div className="mx-auto max-w-md rounded-2xl border border-border-default bg-panel p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-error/10 text-xl">
              🔒
            </div>
            <h1 className="font-heading text-xl font-bold text-text-primary">Staff access required</h1>
            <p className="mt-2 text-sm text-text-secondary">
              This area is restricted to Admart staff. Sign in with a staff account to continue.
            </p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Topbar title="Admin" />
      <div className="mx-auto w-full max-w-7xl px-6 pb-12 pt-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-bold text-text-primary">Admin Panel</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> LIVE
              </span>
            </div>
            <p className="mt-1 text-sm text-text-secondary">
              Customers, plans, payments, credits and usage — staff view, superuser actions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-text-muted">
                Updated {formatAdminDateTime(lastUpdated.toISOString())}
              </span>
            )}
            <button className={btnGhost} onClick={() => { setRefreshKey((k) => k + 1); loadStats(true) }}>
              ⟳ Refresh
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-1 rounded-2xl border border-border-default bg-panel p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                tab === t.id
                  ? 'bg-accent-blue/15 text-accent-blue'
                  : 'text-text-tertiary hover:bg-elevated hover:text-text-primary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        {loading && !stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-border-default bg-panel" />
            ))}
          </div>
        ) : (
          <>
            {tab === 'overview' && (
              <OverviewTab stats={stats} onOpenUser={setDrawerUserId} />
            )}
            {tab === 'customers' && (
              <CustomersTab
                isSuperuser={isSuperuser}
                refreshKey={refreshKey}
                showToast={showToast}
                onOpenUser={setDrawerUserId}
              />
            )}
            {tab === 'payments' && (
              <PaymentsTab isSuperuser={isSuperuser} refreshKey={refreshKey} showToast={showToast} />
            )}
            {tab === 'plans' && <PlansTab refreshKey={refreshKey} onGoCustomers={() => setTab('customers')} />}
            {tab === 'usage' && <UsageTab refreshKey={refreshKey} />}
            {tab === 'settings' && (
              <SettingsTab isSuperuser={isSuperuser} refreshKey={refreshKey} showToast={showToast} />
            )}
          </>
        )}
      </div>

      {drawerUserId && (
        <UserDrawer
          userId={drawerUserId}
          isSuperuser={isSuperuser}
          showToast={showToast}
          onClose={() => setDrawerUserId(null)}
          onChanged={() => setRefreshKey((k) => k + 1)}
        />
      )}

      <Toast message={toast} />
    </AppLayout>
  )
}

/* ------------------------------ Overview tab ------------------------------ */

function OverviewTab({ stats, onOpenUser }) {
  const s = stats || {}
  const totals = s.totals || {}
  const credits = s.credits || {}
  const jobs = s.jobs || {}
  const revenue = s.revenue || {}
  const social = s.social || {}
  const recent = s.recent || {}
  const charts = s.charts || {}

  const signups = charts.signups || []
  const revenueSeries = charts.revenue || []
  const creditsSeries = charts.creditsConsumed || []
  const jobSeries = useMemo(() => combineJobSeries(charts.jobs?.image, charts.jobs?.video), [charts.jobs])

  const customers = recent.users || []
  const payments = recent.payments || []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Total customers" value={formatNum(totals.totalCustomers)} sub={`${formatNum(totals.activeLast30)} active (30d)`} icon="👥" />
        <KpiCard label="Paid customers" value={formatNum(s.plans?.paidCustomers)} sub={`${formatNum(s.plans?.freeCustomers)} free`} icon="💳" />
        <KpiCard label="New this month" value={formatNum(totals.newThisMonth)} sub="last 30 days" icon="📈" />
        <KpiCard label="Disabled accounts" value={formatNum(totals.disabled)} sub="not active" icon="🚫" />
        <KpiCard label="Jobs" value={formatNum(jobs.combined?.total)} sub={`${formatNum(jobs.combined?.running)} running · ${formatNum(jobs.combined?.queued)} queued`} icon="🎨" />
        <KpiCard label="Social accounts" value={formatNum(social.total)} sub={formatPlatforms(social.byPlatform)} icon="🔗" />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="MRR" value={`$${formatNum(revenue.mrrUsd)}`} sub="active subscriptions" tone="text-success" />
        <KpiCard label="Revenue (30d)" value={`$${formatNum(revenue.revenueThisMonthUsd)}`} sub={`${formatNum(revenue.paymentsThisMonth)} payments`} tone="text-accent-blue" />
        <KpiCard label="Success rate" value={`${formatNum(jobs.combined?.successRate)}%`} sub={`${formatNum(jobs.combined?.succeeded)} succeeded · ${formatNum(jobs.combined?.failed)} failed`} tone="text-accent-violet" />
        <KpiCard label="Credits used" value={formatNum(credits.used)} sub={`of ${formatNum(credits.issued)} issued · ${formatNum(credits.remaining)} left`} tone="text-warning" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ChartCard title="Signups" hint="new customers / day">
          <MiniBarChart items={signups} format={formatNum} />
        </ChartCard>
        <ChartCard title="Revenue" hint="paid revenue USD / day">
          <MiniBarChart items={revenueSeries} stacks={[{ key: 'value', color: 'bg-accent-violet' }]} format={formatMoney} />
        </ChartCard>
        <ChartCard title="Credits consumed" hint="Admart credits / day">
          <MiniBarChart items={creditsSeries} stacks={[{ key: 'value', color: 'bg-warning' }]} format={formatNum} />
        </ChartCard>
        <ChartCard title="Jobs per day" hint="succeeded vs failed" right={
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-success" /> ok</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-error" /> fail</span>
          </div>
        }>
          <MiniBarChart items={jobSeries} stacks={[{ key: 'succeeded', color: 'bg-success' }, { key: 'failed', color: 'bg-error' }]} format={formatNum} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-default bg-panel p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Recent customers</h3>
          {customers.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-muted">No customers yet</p>
          ) : (
            <ul className="divide-y divide-border-default">
              {customers.map((u) => (
                <li
                  key={u.id}
                  onClick={() => onOpenUser(u.id)}
                  className="flex cursor-pointer items-center gap-3 py-2.5 transition hover:bg-elevated/60"
                >
                  <Avatar user={u} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{u.email}</p>
                    <p className="text-xs text-text-muted">{u.firstName && u.lastName ? `${u.firstName} ${u.lastName} · ` : ''}{timeAgo(u.lastActiveAt || u.createdAt)}</p>
                  </div>
                  <PlanBadge plan={u.plan} />
                  <StatusPill active={u.isActive} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border-default bg-panel p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Recent payments</h3>
          {payments.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-muted">No payments recorded yet</p>
          ) : (
            <ul className="divide-y divide-border-default">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/10 text-xs font-bold text-success">$</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{p.email}</p>
                    <p className="text-xs text-text-muted">{formatAdminDateTime(p.createdAt)}</p>
                  </div>
                  <span className="font-mono text-sm font-semibold text-text-primary">
                    {p.currency} {formatMoney(p.amount)}
                  </span>
                  <PaymentPill status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------ Customers tab ----------------------------- */

function CustomersTab({ isSuperuser, refreshKey, showToast, onOpenUser }) {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [plan, setPlan] = useState('')
  const [statusFlag, setStatusFlag] = useState('')
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const t = window.setTimeout(() => setSearch(searchInput.trim()), 400)
    return () => window.clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [search, plan, statusFlag])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAdminUsers({ search, plan, status: statusFlag, page, pageSize: 20 })
      setUsers(data.items || [])
      setTotal(data.total || 0)
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Could not load customers.')
    } finally {
      setLoading(false)
    }
  }, [search, plan, statusFlag, page, showToast])

  useEffect(() => {
    load()
  }, [load, refreshKey, version])

  const totalPages = Math.max(1, Math.ceil(total / 20))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border-default bg-panel p-3">
        <input
          className={`${inputCls} max-w-xs`}
          placeholder="Search name or email…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select className={`${selectCls} max-w-[9rem]`} value={plan} onChange={(e) => setPlan(e.target.value)}>
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="basic">Basic</option>
          <option value="plus">Plus</option>
          <option value="pro">Pro</option>
        </select>
        <select className={`${selectCls} max-w-[10rem]`} value={statusFlag} onChange={(e) => setStatusFlag(e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-text-muted">{formatNum(total)} customers</span>
          {isSuperuser && (
            <button className={btnPrimary} onClick={() => setShowCreate(true)}>
              + Add customer
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-default bg-panel">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-default text-xs uppercase tracking-wide text-text-tertiary">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Credits</th>
                <th className="px-4 py-3 font-medium">Jobs</th>
                <th className="px-4 py-3 font-medium">Social</th>
                <th className="px-4 py-3 font-medium">Revenue</th>
                <th className="px-4 py-3 font-medium">Last active</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {users.map((u) => (
                <tr key={u.id} onClick={() => onOpenUser(u.id)} className="cursor-pointer transition hover:bg-elevated/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={u} />
                      <div className="min-w-0">
                        <p className="max-w-[14rem] truncate font-medium text-text-primary">
                          {u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.email}
                        </p>
                        <p className="max-w-[14rem] truncate text-xs text-text-muted">{u.firstName ? u.email : '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><PlanBadge plan={u.plan} /></td>
                  <td className="px-4 py-3"><StatusPill active={u.isActive} /></td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-text-primary">{formatNum(u.creditsRemaining)}</span>
                    <span className="text-xs text-text-muted"> / {formatNum(u.creditsTotal)}</span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{formatNum(u.jobCount)}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatNum(u.socialCount)}</td>
                  <td className="px-4 py-3 font-mono text-text-primary">${formatMoney(u.paymentsTotal)}</td>
                  <td className="px-4 py-3 text-text-secondary">{timeAgo(u.lastActiveAt || u.createdAt)}</td>
                  <td className="px-4 py-3 text-text-muted">{formatAdminDateTime(u.createdAt)}</td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-text-muted">No customers match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border-default px-4 py-3">
          <span className="text-xs text-text-muted">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button className={btnGhost} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ← Prev
            </button>
            <button className={btnGhost} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next →
            </button>
          </div>
        </div>
      </div>

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          showToast={showToast}
          onCreated={() => {
            setSearchInput('')
            setSearch('')
            setPage(1)
            setVersion((v) => v + 1)
          }}
        />
      )}
    </div>
  )
}

function CreateUserModal({ onClose, showToast, onCreated }) {
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', plan: 'free' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!form.email) {
      setError('Email is required.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await createAdminUser(form)
      showToast('Customer created.')
      onCreated()
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not create customer.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border-default bg-panel p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-heading text-lg font-bold text-text-primary">Add customer</h2>
        <p className="mt-1 text-xs text-text-muted">Creates an account with the default free credit grant and an active subscription.</p>
        <div className="mt-4 space-y-3">
          <input className={inputCls} placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input className={inputCls} placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <input className={inputCls} placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
          <select className={selectCls} value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="plus">Plus</option>
            <option value="pro">Pro</option>
          </select>
          {error && <p className="text-xs text-error">{error}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className={btnGhost} onClick={onClose}>Cancel</button>
          <button className={btnPrimary} disabled={busy} onClick={submit}>
            {busy ? 'Creating…' : 'Create customer'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------ Detail drawer ----------------------------- */

function UserDrawer({ userId, isSuperuser, showToast, onClose, onChanged }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [planDraft, setPlanDraft] = useState({ plan: 'free', creditsMode: 'reset' })
  const [creditDraft, setCreditDraft] = useState({ amount: '', reason: 'grant', notes: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAdminUser(userId)
      setUser(data)
      setPlanDraft((d) => ({ ...d, plan: data.plan || 'free' }))
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Could not load customer detail.')
    } finally {
      setLoading(false)
    }
  }, [userId, showToast])

  useEffect(() => {
    load()
  }, [load])

  const patch = async (payload, label, refresh = true) => {
    setBusy(label)
    try {
      await patchAdminUser(userId, payload)
      showToast(`${label} updated.`)
      if (refresh) {
        await load()
        onChanged()
      }
    } catch (err) {
      showToast(err?.response?.data?.detail || `Could not ${label.toLowerCase()}.`)
    } finally {
      setBusy('')
    }
  }

  const changePlan = async () => {
    setBusy('plan')
    try {
      const res = await changeAdminUserPlan(userId, planDraft)
      showToast(`Plan changed to ${planDraft.plan}.`)
      notifyCreditsChanged({ creditsRemaining: res.creditsRemaining })
      await load()
      onChanged()
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Could not change plan.')
    } finally {
      setBusy('')
    }
  }

  const adjustCredits = async () => {
    const amount = Number(creditDraft.amount)
    if (!Number.isFinite(amount) || amount === 0) {
      showToast('Enter a non-zero credit amount.')
      return
    }
    setBusy('credits')
    try {
      await adjustAdminUserCredits(userId, { amount, reason: creditDraft.reason, notes: creditDraft.notes })
      showToast('Credits adjusted.')
      await load()
      onChanged()
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Could not adjust credits.')
    } finally {
      setBusy('')
    }
  }

  const removeUser = async () => {
    if (!window.confirm('Delete this customer permanently? This cannot be undone.')) return
    setBusy('delete')
    try {
      await deleteAdminUser(userId)
      showToast('Customer deleted.')
      onChanged()
      onClose()
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Could not delete customer.')
    } finally {
      setBusy('')
    }
  }

  return (
    <Drawer onClose={onClose}>
      <div className="flex items-center justify-between border-b border-border-default px-5 py-4">
        <h2 className="font-heading text-lg font-bold text-text-primary">Customer</h2>
        <button className="rounded-lg p-2 text-text-tertiary transition hover:bg-elevated hover:text-text-primary" onClick={onClose}>
          ✕
        </button>
      </div>

      {loading ? (
        <div className="flex-1 space-y-3 p-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-surface" />
          ))}
        </div>
      ) : user ? (
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="flex items-center gap-3">
            <Avatar user={user} size="h-12 w-12" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-text-primary">
                {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
              </p>
              <p className="truncate text-xs text-text-muted">{user.email}</p>
            </div>
            <PlanBadge plan={user.plan} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border-default bg-surface p-3">
              <p className="text-xs text-text-muted">Credits remaining</p>
              <p className="mt-1 font-mono text-lg font-bold text-text-primary">{formatNum(user.creditsRemaining)}</p>
              <p className="text-xs text-text-muted">of {formatNum(user.creditsTotal)} · {formatNum(user.creditsUsed)} used</p>
            </div>
            <div className="rounded-xl border border-border-default bg-surface p-3">
              <p className="text-xs text-text-muted">Payments total</p>
              <p className="mt-1 font-mono text-lg font-bold text-success">${formatMoney(user.paymentsTotal)}</p>
              <p className="text-xs text-text-muted">{formatNum(user.jobCount)} jobs · {formatNum(user.projectCount)} projects</p>
            </div>
          </div>

          <div className="rounded-xl border border-border-default bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Account</p>
            <dl className="mt-2 space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-text-muted">Status</dt><dd><StatusPill active={user.isActive} /></dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Onboarding</dt><dd className="text-text-primary">{user.onboardingCompleted ? 'Completed' : 'Pending'}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Joined</dt><dd className="text-text-primary">{formatAdminDateTime(user.createdAt)}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Last active</dt><dd className="text-text-primary">{user.lastActiveAt ? timeAgo(user.lastActiveAt) : '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Credits reset</dt><dd className="text-text-primary">{user.creditsResetAt ? formatAdminDateSafe(user.creditsResetAt) : '—'}</dd></div>
              {user.subscription && (
                <div className="flex justify-between">
                  <dt className="text-text-muted">Subscription</dt>
                  <dd className="capitalize text-text-primary">
                    {user.subscription.status} · renews {formatAdminDateSafe(user.subscription.currentPeriodEnd)}
                  </dd>
                </div>
              )}
            </dl>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className={btnGhost}
                disabled={!!busy}
                onClick={() => patch({ isActive: !user.isActive }, user.isActive ? 'Deactivate' : 'Activate')}
              >
                {user.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                className={btnGhost}
                disabled={!!busy}
                onClick={() => patch({ onboardingCompleted: false }, 'Reset onboarding')}
              >
                Reset onboarding
              </button>
            </div>
          </div>

          {isSuperuser && (
            <div className="rounded-xl border border-border-default bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent-blue">Superuser · Change plan</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <select
                  className={`${selectCls} max-w-[8rem]`}
                  value={planDraft.plan}
                  onChange={(e) => setPlanDraft({ ...planDraft, plan: e.target.value })}
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="plus">Plus</option>
                  <option value="pro">Pro</option>
                </select>
                <select
                  className={`${selectCls} max-w-[10rem]`}
                  value={planDraft.creditsMode}
                  onChange={(e) => setPlanDraft({ ...planDraft, creditsMode: e.target.value })}
                >
                  <option value="reset">Reset credits</option>
                  <option value="keep">Keep credits</option>
                  <option value="topup">Top up diff</option>
                </select>
                <button className={btnPrimary} disabled={!!busy} onClick={changePlan}>
                  {busy === 'plan' ? 'Applying…' : 'Change plan'}
                </button>
              </div>
            </div>
          )}

          {isSuperuser && (
            <div className="rounded-xl border border-border-default bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent-violet">Superuser · Adjust credits</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <input
                  className={`${inputCls} max-w-[7rem] font-mono`}
                  type="number"
                  placeholder="+/- amount"
                  value={creditDraft.amount}
                  onChange={(e) => setCreditDraft({ ...creditDraft, amount: e.target.value })}
                />
                <select
                  className={`${selectCls} max-w-[9rem]`}
                  value={creditDraft.reason}
                  onChange={(e) => setCreditDraft({ ...creditDraft, reason: e.target.value })}
                >
                  <option value="grant">Grant</option>
                  <option value="adjust">Adjustment</option>
                  <option value="reset">Reset</option>
                  <option value="plan_change">Plan change</option>
                </select>
              </div>
              <input
                className={`${inputCls} mt-2`}
                placeholder="Notes (optional)"
                value={creditDraft.notes}
                onChange={(e) => setCreditDraft({ ...creditDraft, notes: e.target.value })}
              />
              <button className={`${btnPrimary} mt-2`} disabled={!!busy} onClick={adjustCredits}>
                {busy === 'credits' ? 'Applying…' : 'Apply credits'}
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border-default bg-surface p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Projects ({formatNum(user.projectCount)})</p>
              <ul className="space-y-1.5 text-sm">
                {(user.projects || []).map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2">
                    <span className="truncate text-text-primary">{p.name}</span>
                    <span className="shrink-0 text-xs text-text-muted">{formatAdminDateSafe(p.createdAt)}</span>
                  </li>
                ))}
                {(user.projects || []).length === 0 && <li className="text-xs text-text-muted">No projects</li>}
              </ul>
            </div>
            <div className="rounded-xl border border-border-default bg-surface p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Credit history</p>
              <ul className="space-y-1.5 text-sm">
                {(user.creditAdjustments || []).map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2">
                    <span className="truncate text-text-primary">
                      {c.amount > 0 ? '+' : ''}{formatNum(c.amount)}
                      <span className="text-xs text-text-muted"> · {c.reason}</span>
                    </span>
                    <span className="shrink-0 text-xs text-text-muted">{formatAdminDateSafe(c.createdAt)}</span>
                  </li>
                ))}
                {(user.creditAdjustments || []).length === 0 && <li className="text-xs text-text-muted">No adjustments</li>}
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-border-default bg-surface p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Recent jobs</p>
            <ul className="space-y-1.5 text-sm">
              {(user.jobs || []).map((j, i) => (
                <li key={i} className="flex items-center justify-between gap-2">
                  <span className="truncate capitalize text-text-primary">{j.capability} · {j.model || '—'}</span>
                  <span className="shrink-0 text-xs text-text-muted">
                    {j.status} · {formatNum(j.credits)} cr
                  </span>
                </li>
              ))}
              {(user.jobs || []).length === 0 && <li className="text-xs text-text-muted">No jobs</li>}
            </ul>
          </div>

          {isSuperuser && (
            <button className={`${btnCls} w-full justify-center border border-error/30 bg-error/10 text-error hover:bg-error/20`} disabled={!!busy} onClick={removeUser}>
              {busy === 'delete' ? 'Deleting…' : 'Delete customer'}
            </button>
          )}
        </div>
      ) : null}
    </Drawer>
  )
}

/* ------------------------------ Payments tab ------------------------------ */

function PaymentsTab({ isSuperuser, refreshKey, showToast }) {
  const [payments, setPayments] = useState([])
  const [revenue, setRevenue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusFlag, setStatusFlag] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [email, setEmail] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setEmail(emailInput.trim()), 400)
    return () => window.clearTimeout(t)
  }, [emailInput])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [items, rev] = await Promise.all([
        getAdminPayments({ status: statusFlag, email, limit: 200 }),
        getAdminRevenue(),
      ])
      setPayments(items)
      setRevenue(rev)
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Could not load payments.')
    } finally {
      setLoading(false)
    }
  }, [statusFlag, email, showToast])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  const byStatus = revenue?.byStatus || {}

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Total revenue" value={`$${formatMoney(revenue?.totalRevenueUsd)}`} sub="all time, paid" tone="text-success" />
        <KpiCard label="This month" value={`$${formatMoney(revenue?.thisMonthUsd)}`} sub="last 30 days" tone="text-accent-blue" />
        <KpiCard label="Paid" value={formatNum(byStatus.paid || 0)} sub={`${formatNum(byStatus.failed || 0)} failed`} />
        <KpiCard label="Pending" value={formatNum(byStatus.pending || 0)} sub={`${formatNum(byStatus.refunded || 0)} refunded`} />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border-default bg-panel p-3">
        <input className={`${inputCls} max-w-xs`} placeholder="Filter by email…" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
        <select className={`${selectCls} max-w-[9rem]`} value={statusFlag} onChange={(e) => setStatusFlag(e.target.value)}>
          <option value="">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        {isSuperuser && (
          <button className={`${btnPrimary} ml-auto`} onClick={() => setShowForm(true)}>
            + Record payment
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-default bg-panel">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-default text-xs uppercase tracking-wide text-text-tertiary">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 text-text-muted">{formatAdminDateTime(p.createdAt)}</td>
                  <td className="px-4 py-3 font-medium text-text-primary">{p.email}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-text-primary">{p.currency} {formatMoney(p.amount)}</td>
                  <td className="px-4 py-3 capitalize text-text-secondary">{p.method}</td>
                  <td className="px-4 py-3"><PaymentPill status={p.status} /></td>
                  <td className="px-4 py-3 text-xs text-text-muted">{p.providerRef || '—'}</td>
                </tr>
              ))}
              {!loading && payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-text-muted">No payments match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <RecordPaymentModal onClose={() => setShowForm(false)} showToast={showToast} onCreated={load} />
      )}
    </div>
  )
}

function RecordPaymentModal({ onClose, showToast, onCreated }) {
  const [form, setForm] = useState({ email: '', amount: '', currency: 'USD', method: 'manual', status: 'paid', notes: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!form.email || !form.amount) {
      setError('Email and amount are required.')
      return
    }
    if (!Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) {
      setError('Amount must be a positive number.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await createAdminPayment({ ...form, amount: Number(form.amount) })
      showToast('Payment recorded.')
      onCreated()
      onClose()
    } catch (err) {
      setError(err?.response?.data?.userId?.[0] || err?.response?.data?.detail || 'Could not record payment.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border-default bg-panel p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-heading text-lg font-bold text-text-primary">Record payment</h2>
        <p className="mt-1 text-xs text-text-muted">Manual entry — no gateway involved.</p>
        <div className="mt-4 space-y-3">
          <input className={inputCls} placeholder="Customer email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input className={`${inputCls} font-mono`} type="number" placeholder="Amount *" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <select className={selectCls} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              <option value="USD">USD</option>
              <option value="PKR">PKR</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select className={selectCls} value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
              <option value="manual">Manual</option>
              <option value="stripe">Stripe</option>
              <option value="paypal">PayPal</option>
              <option value="bank">Bank</option>
              <option value="cash">Cash</option>
            </select>
            <select className={selectCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <input className={inputCls} placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          {error && <p className="text-xs text-error">{error}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className={btnGhost} onClick={onClose}>Cancel</button>
          <button className={btnPrimary} disabled={busy} onClick={submit}>
            {busy ? 'Recording…' : 'Record payment'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------- Plans tab ------------------------------- */

function PlansTab({ refreshKey, onGoCustomers }) {
  const [plans, setPlans] = useState([])
  const [revenue, setRevenue] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([getAdminPlans(), getAdminRevenue()])
      .then(([items, rev]) => {
        if (!active) return
        setPlans(items)
        setRevenue(rev)
      })
      .catch(() => {
        /* silent — card grid stays empty */
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [refreshKey])

  const byPlanRevenue = (revenue?.byPlan || []).reduce((acc, item) => {
    acc[item.plan] = item.totalUsd
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl border border-border-default bg-panel" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((p) => {
            const isFree = p.id === 'free'
            return (
              <div
                key={p.id}
                className={`relative flex flex-col rounded-2xl border bg-panel p-5 ${
                  isFree ? 'border-border-default' : 'border-accent-blue/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-lg font-bold text-text-primary">{p.name}</h3>
                  <PlanBadge plan={p.id} />
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-heading text-3xl font-bold text-text-primary">
                    ${formatNum(p.priceUsd)}
                  </span>
                  <span className="text-sm text-text-muted">/mo · {formatNum(p.pricePkr)} PKR</span>
                </div>
                <p className="mt-2 text-sm text-text-secondary">
                  {formatNum(p.monthlyCredits)} Admart credits / month
                </p>
                <ul className="mt-4 flex-1 space-y-1.5 text-sm text-text-secondary">
                  {(p.features || []).map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-0.5 text-success">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border-default pt-4 text-center">
                  <div>
                    <p className="font-heading text-xl font-bold text-text-primary">{formatNum(p.subscriberCount)}</p>
                    <p className="text-xs text-text-muted">customers</p>
                  </div>
                  <div>
                    <p className="font-heading text-xl font-bold text-accent-blue">{formatNum(p.activeSubscriptions)}</p>
                    <p className="text-xs text-text-muted">active subs</p>
                  </div>
                </div>
                <div className="mt-3 rounded-xl bg-surface px-3 py-2 text-center text-xs text-text-muted">
                  ${formatMoney(byPlanRevenue[p.id] || 0)} all-time revenue
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="rounded-2xl border border-border-default bg-panel p-4 text-sm text-text-secondary">
        <span className="font-semibold text-text-primary">Change a customer's plan?</span> Open the{' '}
        <button className="font-semibold text-accent-blue hover:underline" onClick={onGoCustomers}>
          Customers
        </button>{' '}
        tab and use the plan action in any customer's detail panel (superuser only).
      </div>
    </div>
  )
}

/* -------------------------------- Usage tab ------------------------------- */

function UsageTab({ refreshKey }) {
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getAdminUsage()
      .then((data) => {
        if (active) setUsage(data)
      })
      .catch(() => {
        /* silent */
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [refreshKey])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl border border-border-default bg-panel" />
        <div className="h-72 animate-pulse rounded-2xl border border-border-default bg-panel" />
      </div>
    )
  }

  const consumers = usage?.topConsumers || []

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <JobKindCard kind="Image" data={usage?.image} />
        <JobKindCard kind="Video" data={usage?.video} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-default bg-panel">
        <div className="border-b border-border-default px-4 py-3">
          <h3 className="text-sm font-semibold text-text-primary">Top consumers</h3>
          <p className="text-xs text-text-muted">By credits used, across all time</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-default text-xs uppercase tracking-wide text-text-tertiary">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Credits used</th>
                <th className="px-4 py-3 font-medium">Jobs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {consumers.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={u} />
                      <span className="max-w-[16rem] truncate font-medium text-text-primary">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><PlanBadge plan={u.plan} /></td>
                  <td className="px-4 py-3 font-mono font-semibold text-warning">{formatNum(u.creditsUsed)}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatNum(u.jobs)}</td>
                </tr>
              ))}
              {consumers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-text-muted">No usage yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function JobKindCard({ kind, data }) {
  const status = data?.byStatus || {}
  const capabilities = data?.byCapability || {}
  const total = status.total || 0
  const segments = [
    { key: 'succeeded', label: 'Succeeded', color: 'bg-success', count: status.succeeded || 0 },
    { key: 'failed', label: 'Failed', color: 'bg-error', count: status.failed || 0 },
    { key: 'running', label: 'Running', color: 'bg-accent-blue', count: status.running || 0 },
    { key: 'queued', label: 'Queued', color: 'bg-warning', count: status.queued || 0 },
  ]
  const max = Math.max(1, ...segments.map((s) => s.count))

  return (
    <div className="rounded-2xl border border-border-default bg-panel p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-base font-bold text-text-primary">{kind} jobs</h3>
        <span className="rounded-full border border-border-default bg-surface px-2.5 py-0.5 text-xs font-semibold text-text-secondary">
          {formatNum(total)} total
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {segments.map((s) => (
          <div key={s.key}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span className={`h-2 w-2 rounded-sm ${s.color}`} /> {s.label}
              </span>
              <span className="font-mono text-text-primary">{formatNum(s.count)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
              <div className={`h-full ${s.color}`} style={{ width: `${(s.count / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border-default pt-4">
        {Object.entries(capabilities).map(([cap, count]) => (
          <span key={cap} className="inline-flex items-center gap-1 rounded-full border border-border-default bg-surface px-2.5 py-0.5 text-xs font-medium capitalize text-text-secondary">
            {cap.replace(/_/g, ' ')} <span className="font-mono text-text-primary">{formatNum(count)}</span>
          </span>
        ))}
        {Object.keys(capabilities).length === 0 && (
          <span className="text-xs text-text-muted">No capabilities used yet.</span>
        )}
      </div>
    </div>
  )
}

/* ------------------------------- Settings tab ----------------------------- */

function SettingsTab({ isSuperuser, refreshKey, showToast }) {
  const [settings, setSettings] = useState(null)
  const [defaultFreeCredits, setDefaultFreeCredits] = useState('')
  const [maintenanceBanner, setMaintenanceBanner] = useState('')
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true
    getAdminSettings()
      .then((data) => {
        if (!active) return
        setSettings(data)
        setDefaultFreeCredits(data.defaultFreeCredits)
        setMaintenanceBanner(data.maintenanceBanner)
        setLoaded(true)
      })
      .catch(() => {
        /* silent */
      })
    return () => {
      active = false
    }
  }, [refreshKey])

  const save = async () => {
    setSaving(true)
    try {
      const data = await updateAdminSettings({
        defaultFreeCredits,
        maintenanceBanner,
      })
      setSettings(data)
      setDefaultFreeCredits(data.defaultFreeCredits)
      setMaintenanceBanner(data.maintenanceBanner)
      showToast('Settings saved.')
    } catch (err) {
      showToast(err?.response?.data?.detail || 'Could not save settings.')
    } finally {
      setSaving(false)
    }
  }

  const platforms = settings?.platforms || {}
  const platformRows = [
    { id: 'youtube', name: 'YouTube' },
    { id: 'facebook', name: 'Facebook' },
    { id: 'instagram', name: 'Instagram' },
    { id: 'tiktok', name: 'TikTok' },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="rounded-2xl border border-border-default bg-panel p-5">
          <h3 className="text-sm font-semibold text-text-primary">Platform settings</h3>
          <p className="mt-0.5 text-xs text-text-muted">
            Connect and publish toggles derive from backend credentials and Meta app review.
          </p>
          <div className="mt-4 divide-y divide-border-default">
            {platformRows.map((row) => {
              const p = platforms[row.id] || {}
              return (
                <div key={row.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${p.connectEnabled ? 'bg-success' : 'bg-border-default'}`} />
                    <span className="text-sm font-medium text-text-primary">{row.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={p.connectEnabled ? 'text-success' : 'text-text-muted'}>
                      {p.connectEnabled ? 'Connect enabled' : 'Not configured'}
                    </span>
                    <span className={`rounded-full border px-2 py-0.5 ${p.publishEnabled ? 'border-success/30 bg-success/10 text-success' : 'border-border-default bg-surface text-text-tertiary'}`}>
                      {p.publishEnabled ? 'Publish on' : 'Publish off'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="mt-3 rounded-xl bg-surface px-3 py-2 text-xs text-text-muted">
            Runtime toggling of social publishing is part of the planned social-account integration.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border-default bg-panel p-5">
          <h3 className="text-sm font-semibold text-text-primary">Defaults & messages</h3>
          {!loaded ? (
            <div className="mt-4 h-24 animate-pulse rounded-xl bg-surface" />
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-tertiary">
                  Default free credits
                </label>
                <input
                  className={`${inputCls} max-w-[10rem] font-mono`}
                  type="number"
                  value={defaultFreeCredits}
                  onChange={(e) => setDefaultFreeCredits(e.target.value)}
                  disabled={!isSuperuser}
                />
                <p className="mt-1 text-xs text-text-muted">
                  Grant for customers created manually by an admin.
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-tertiary">
                  Maintenance banner
                </label>
                <textarea
                  className={`${inputCls} min-h-[80px] resize-none`}
                  placeholder="Shown when the platform is in maintenance…"
                  value={maintenanceBanner}
                  onChange={(e) => setMaintenanceBanner(e.target.value)}
                  disabled={!isSuperuser}
                />
              </div>
              {isSuperuser ? (
                <button className={btnPrimary} disabled={saving} onClick={save}>
                  {saving ? 'Saving…' : 'Save settings'}
                </button>
              ) : (
                <p className="rounded-xl bg-surface px-3 py-2 text-xs text-text-muted">
                  Only superusers can change these settings.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------- helpers -------------------------------- */

function formatNum(value) {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return '—'
  if (Math.abs(n) >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M`
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100)
}

function formatMoney(value) {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return '0'
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function formatAdminDateSafe(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}

function formatPlatforms(byPlatform) {
  const entries = Object.entries(byPlatform || {})
  if (!entries.length) return 'none connected'
  return entries
    .sort((a, b) => b[1] - a[1])
    .map(([p, c]) => `${p} ${c}`)
    .join(' · ')
}
