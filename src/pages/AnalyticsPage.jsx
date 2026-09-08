import { Fragment, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Topbar from '../components/Topbar'
import {
  PROJECT_CHANGE_EVENT,
  getCachedActiveProject,
  getProjectAnalytics,
} from '../utils/projects.js'

const PLATFORM_META = {
  tiktok: { name: 'TikTok', color: '#00f2ea', dot: 'bg-tiktok' },
  youtube: { name: 'YouTube', color: '#ff4444', dot: 'bg-youtube' },
  instagram: { name: 'Instagram', color: '#e6683c', dot: 'bg-instagram' },
  facebook: { name: 'Facebook', color: '#1877f2', dot: 'bg-facebook' },
}

const RANGES = [
  { id: '7d', label: '7d' },
  { id: '30d', label: '30d' },
  { id: '90d', label: '90d' },
  { id: 'all', label: 'All time' },
]

function dayTotal(row, ids) {
  return ids.reduce((sum, id) => sum + Number(row?.[id] || 0), 0)
}

function formatWhen(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatAxis(iso) {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function Sparkline({ values, tone }) {
  const max = Math.max(...values, 1)
  const toneBar = {
    blue: 'bg-accent-blue',
    violet: 'bg-accent-violet',
    green: 'bg-success',
    yellow: 'bg-warning',
  }[tone]
  return (
    <div className="flex h-10 items-end gap-0.5">
      {values.map((v, i) => (
        <div
          key={i}
          className={`w-1 rounded-sm ${toneBar} opacity-85`}
          style={{ height: `${Math.max(8, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  )
}

function LineChart({ series, platformIds }) {
  const W = 640
  const H = 240
  const pad = { t: 16, r: 12, b: 36, l: 36 }
  const innerW = W - pad.l - pad.r
  const innerH = H - pad.t - pad.b
  const ids = (platformIds || []).filter((id) => PLATFORM_META[id])
  const rows = series?.length ? series : [{ date: '' }]
  const maxY = Math.max(1, ...rows.map((row) => dayTotal(row, ids)))
  const n = rows.length
  const labelEvery = Math.max(1, Math.ceil(n / 8))

  const toXY = (id, color) => {
    const pts = rows.map((row, i) => {
      const x = pad.l + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW)
      const y = pad.t + innerH - (Number(row[id] || 0) / maxY) * innerH
      return [x, y]
    })
    return { poly: pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' '), pts, color, id }
  }

  const plotted = ids.map((id) => toXY(id, PLATFORM_META[id].color))
  const yTicks = [0, maxY]

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border-default bg-surface p-5">
      <h3 className="font-heading text-lg font-semibold text-text-primary">Posts over time</h3>
      {!ids.length ? (
        <p className="mt-4 text-sm text-text-secondary">Connect a social account to plot posts over time.</p>
      ) : (
        <>
          <div className="mt-4 h-[240px]">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Posts over time">
            {yTicks.map((t) => {
              const y = pad.t + innerH - (t / maxY) * innerH
              return (
                <g key={t}>
                  <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <text x={pad.l - 8} y={y + 4} textAnchor="end" className="fill-text-muted font-mono text-[10px]">
                    {t}
                  </text>
                </g>
              )
            })}
            {plotted.map((s) => (
              <polyline
                key={s.id}
                fill="none"
                stroke={s.color}
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={s.poly}
              />
            ))}
            {rows.map((row, i) =>
              i % labelEvery === 0 || i === n - 1 ? (
                <text
                  key={row.date || i}
                  x={pad.l + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW)}
                  y={H - 10}
                  textAnchor="middle"
                  className="fill-text-tertiary font-mono text-[9px]"
                >
                  {formatAxis(row.date)}
                </text>
              ) : null,
            )}
          </svg>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs">
            {ids.map((id) => (
              <span key={id} className="inline-flex items-center gap-2 text-text-secondary">
                <span className="h-2 w-2 rounded-full" style={{ background: PLATFORM_META[id].color }} />
                {PLATFORM_META[id].name}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function MixDonut({ title, centerValue, centerLabel, segments }) {
  const size = 176
  const r = 62
  const stroke = 28
  const c = 2 * Math.PI * r
  const rows = (segments || []).filter((row) => Number(row.count || 0) >= 0)
  const total = rows.reduce((n, row) => n + Number(row.count || 0), 0)
  const sum = total || 1
  let dashAcc = 0
  const slices = rows.map((row) => {
    const pct = Number(row.count || 0) / sum
    const len = pct * c
    const offset = -dashAcc
    dashAcc += len
    return { ...row, pct, len, offset }
  })
  const cx = size / 2

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border-default bg-surface p-5">
      <h3 className="font-heading text-lg font-semibold text-text-primary">{title}</h3>
      <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-6">
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            {total === 0 ? (
              <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
            ) : (
              slices.map((s) => (
                <circle
                  key={s.id}
                  cx={cx}
                  cy={cx}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${s.len} ${c}`}
                  strokeDashoffset={s.offset}
                />
              ))
            )}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="font-heading text-2xl font-bold text-text-primary">{centerValue}</p>
            <p className="text-xs text-text-tertiary">{centerLabel}</p>
          </div>
        </div>
        <ul className="w-full max-w-[220px] space-y-2 text-sm">
          {slices.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-text-secondary">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: row.color }} />
                {row.label}
              </span>
              <span className="font-mono text-text-primary">{row.count}</span>
              <span className="w-10 text-right text-text-tertiary">{total ? Math.round(row.pct * 100) : 0}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function DonutChart({ byPlatform }) {
  const rows = (byPlatform || []).filter((row) => PLATFORM_META[row.id])
  const sendTotal = rows.reduce((n, row) => n + Number(row.count || 0), 0)
  return (
    <MixDonut
      title="Platform distribution"
      centerValue={sendTotal}
      centerLabel={sendTotal === 1 ? 'send' : 'sends'}
      segments={rows.map((row) => ({
        id: row.id,
        label: PLATFORM_META[row.id].name,
        count: row.count,
        color: PLATFORM_META[row.id].color,
      }))}
    />
  )
}

const STATUS_META = [
  { id: 'succeeded', name: 'Succeeded', color: '#22c55e' },
  { id: 'partial', name: 'Partial', color: '#eab308' },
  { id: 'failed', name: 'Failed', color: '#ef4444' },
]

function StatusDonut({ totals }) {
  const segments = STATUS_META.map((row) => ({
    id: row.id,
    label: row.name,
    count: Number(totals?.[row.id] || 0),
    color: row.color,
  }))
  const jobs = segments.reduce((n, row) => n + row.count, 0)
  return (
    <MixDonut
      title="Publish status"
      centerValue={jobs}
      centerLabel={jobs === 1 ? 'job' : 'jobs'}
      segments={segments}
    />
  )
}

function OutcomeBars({ byPlatform }) {
  const rows = (byPlatform || []).filter((row) => PLATFORM_META[row.id])
  const max = Math.max(1, ...rows.map((row) => Number(row.count || 0)))

  return (
    <div className="flex h-full min-w-0 flex-col rounded-2xl border border-border-default bg-surface p-5">
      <h3 className="font-heading text-lg font-semibold text-text-primary">Outcomes by platform</h3>
      <p className="mt-1 text-sm text-text-secondary">Succeeded vs failed sends for each connected account.</p>
      {!rows.length ? (
        <p className="mt-6 text-sm text-text-secondary">Connect a platform to see outcomes.</p>
      ) : (
        <div className="mt-8 flex flex-1 flex-col justify-center gap-8">
          {rows.map((row) => {
            const ok = Number(row.succeeded || 0)
            const bad = Number(row.failed || 0)
            const count = Number(row.count || 0)
            const width = `${(count / max) * 100}%`
            const split = ok + bad || 1
            return (
              <div key={row.id}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-text-secondary">
                    <span className={`h-2.5 w-2.5 rounded-full ${PLATFORM_META[row.id].dot}`} />
                    {PLATFORM_META[row.id].name}
                  </span>
                  <span className="font-mono text-xs text-text-tertiary">
                    {ok} ok · {bad} failed
                  </span>
                </div>
                <div className="h-5 w-full overflow-hidden rounded-full bg-elevated">
                  <div className="flex h-full" style={{ width: count ? width : '0%' }}>
                    <div className="h-full bg-success" style={{ width: `${(ok / split) * 100}%` }} />
                    <div className="h-full bg-error" style={{ width: `${(bad / split) * 100}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <div className="mt-6 flex flex-wrap gap-6 text-xs text-text-secondary">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm bg-success" /> Succeeded
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm bg-error" /> Failed
        </span>
      </div>
    </div>
  )
}

function formatCount(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  const v = Number(n)
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return String(Math.round(v))
}

function formatRate(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return `${Number(n).toFixed(1)}%`
}

function metricSum(rows, key) {
  let any = false
  let total = 0
  for (const row of rows) {
    const n = row[key]
    if (n == null || Number.isNaN(Number(n))) continue
    any = true
    total += Number(n)
  }
  return any ? total : null
}

function rateFromMetrics(views, likes, comments, shares) {
  if (!views) return null
  return (100 * ((likes || 0) + (comments || 0) + (shares || 0))) / views
}

function groupPosts(posts) {
  const groups = []
  const index = new Map()
  for (const row of posts || []) {
    const key = row.jobId || row.id
    if (!index.has(key)) {
      const group = { key, rows: [] }
      index.set(key, group)
      groups.push(group)
    }
    index.get(key).rows.push(row)
  }
  return groups
}

function RateBar({ rate }) {
  if (rate == null) return <span className="text-text-tertiary">—</span>
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-elevated">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-violet"
          style={{ width: `${Math.min(100, rate)}%` }}
        />
      </div>
      <span className="font-mono text-xs text-text-primary">{formatRate(rate)}</span>
    </div>
  )
}

function exportCsv(posts) {
  const groups = groupPosts(posts)
  const header = [
    'title',
    'platform',
    'kind',
    'status',
    'views',
    'likes',
    'comments',
    'shares',
    'engagementRate',
    'createdAt',
  ]
  const lines = [header.join(',')]
  const push = (row) =>
    lines.push(
      [
        `"${String(row.title || '').replace(/"/g, '""')}"`,
        row.platform || '',
        row.kind || '',
        row.status || '',
        row.views ?? '',
        row.likes ?? '',
        row.comments ?? '',
        row.shares ?? '',
        row.engagementRate ?? '',
        row.createdAt || '',
      ].join(','),
    )
  for (const group of groups) {
    group.rows.forEach(push)
    const views = metricSum(group.rows, 'views')
    const likes = metricSum(group.rows, 'likes')
    const comments = metricSum(group.rows, 'comments')
    const shares = metricSum(group.rows, 'shares')
    push({
      title: group.rows[0].title,
      platform: 'total',
      kind: group.rows[0].kind,
      status: '',
      views,
      likes,
      comments,
      shares,
      engagementRate: rateFromMetrics(views, likes, comments, shares),
      createdAt: group.rows[0].createdAt,
    })
  }
  const all = groups.flatMap((group) => group.rows)
  if (all.length) {
    const views = metricSum(all, 'views')
    const likes = metricSum(all, 'likes')
    const comments = metricSum(all, 'comments')
    const shares = metricSum(all, 'shares')
    push({
      title: 'All posts',
      platform: 'total',
      kind: '',
      status: '',
      views,
      likes,
      comments,
      shares,
      engagementRate: rateFromMetrics(views, likes, comments, shares),
      createdAt: '',
    })
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'admart-publish.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [projectId, setProjectId] = useState(() => getCachedActiveProject()?.id || '')

  useEffect(() => {
    const sync = () => setProjectId(getCachedActiveProject()?.id || '')
    window.addEventListener(PROJECT_CHANGE_EVENT, sync)
    return () => window.removeEventListener(PROJECT_CHANGE_EVENT, sync)
  }, [])

  useEffect(() => {
    if (!projectId) {
      setData(null)
      setLoading(false)
      setError('')
      return undefined
    }
    let cancelled = false
    setLoading(true)
    setError('')
    getProjectAnalytics(projectId, { range: dateRange, platform: platformFilter })
      .then((payload) => {
        if (!cancelled) setData(payload)
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load analytics.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [projectId, dateRange, platformFilter])

  const connected = data?.connectedPlatforms || []

  useEffect(() => {
    if (!data) return
    if (connected.length === 1 && platformFilter !== connected[0]) {
      setPlatformFilter(connected[0])
    } else if (connected.length > 1 && platformFilter !== 'all' && !connected.includes(platformFilter)) {
      setPlatformFilter('all')
    } else if (connected.length === 0 && platformFilter !== 'all') {
      setPlatformFilter('all')
    }
  }, [connected, data, platformFilter])

  const totals = data?.totals || { posts: 0, succeeded: 0, failed: 0, partial: 0, videos: 0, images: 0 }
  const series = data?.series || []
  const spark = useMemo(() => series.map((row) => dayTotal(row, connected)).slice(-15), [series, connected])
  const sends = (data?.byPlatform || []).reduce((n, row) => n + Number(row.count || 0), 0)
  const sparkPad = spark.length ? spark : [0]
  const postGroups = useMemo(() => groupPosts(data?.posts), [data?.posts])
  const allRows = useMemo(() => postGroups.flatMap((group) => group.rows), [postGroups])
  const grand = {
    views: metricSum(allRows, 'views'),
    likes: metricSum(allRows, 'likes'),
    comments: metricSum(allRows, 'comments'),
    shares: metricSum(allRows, 'shares'),
  }
  grand.engagementRate = rateFromMetrics(grand.views, grand.likes, grand.comments, grand.shares)

  const cards = [
    {
      label: 'Posts published',
      value: String(totals.posts),
      hint: `${totals.videos} video · ${totals.images} image · ${sends} platform send${sends === 1 ? '' : 's'}`,
      tone: 'blue',
    },
    { label: 'Succeeded', value: String(totals.succeeded), hint: 'Completed publishes', tone: 'green' },
    { label: 'Failed', value: String(totals.failed), hint: totals.partial ? `${totals.partial} partial` : 'No partial jobs', tone: 'yellow' },
    {
      label: 'Platforms used',
      value: String((data?.byPlatform || []).filter((row) => row.count > 0).length),
      hint: 'In this range',
      tone: 'violet',
    },
  ]

  return (
    <AppLayout>
      <Topbar title="Analytics" />
      <main className="space-y-8 p-7">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="flex rounded-xl border border-border-default bg-input p-1">
            {RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setDateRange(r.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  dateRange === r.id
                    ? 'bg-accent-blue text-white shadow-md shadow-accent-blue/20'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <select
            value={connected.length === 1 ? connected[0] : platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            disabled={!connected.length}
            className="rounded-xl border border-border-default bg-input px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue disabled:cursor-not-allowed disabled:opacity-50"
          >
            {!connected.length ? <option value="all">No platforms connected</option> : null}
            {connected.length > 1 ? <option value="all">All platforms</option> : null}
            {connected.map((id) => (
              <option key={id} value={id}>
                {PLATFORM_META[id]?.name || id}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!data?.posts?.length}
            onClick={() => exportCsv(data.posts)}
            className="inline-flex items-center gap-2 rounded-xl border border-border-default bg-elevated px-4 py-2 text-sm font-medium text-text-primary hover:border-accent-blue/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ↓ Export CSV
          </button>
        </div>

        {!projectId ? (
          <p className="rounded-xl border border-border-default bg-surface px-4 py-3 text-sm text-text-secondary">
            Select a project to see publish activity.
          </p>
        ) : null}
        {error ? (
          <p className="rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
        ) : null}
        {loading ? <p className="text-sm text-text-muted">Loading publish activity…</p> : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-border-default bg-surface p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">{card.label}</p>
                  <p className="mt-2 font-heading text-3xl font-bold text-text-primary">{card.value}</p>
                  <p className="mt-1 text-sm text-text-secondary">{card.hint}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Sparkline values={sparkPad} tone={card.tone} />
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-3">
          <div className="min-w-0 xl:col-span-2">
            <LineChart series={series} platformIds={connected} />
          </div>
          <DonutChart byPlatform={data?.byPlatform} />
        </section>

        <section className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-3">
          <StatusDonut totals={totals} />
          <div className="min-w-0 xl:col-span-2">
            <OutcomeBars byPlatform={data?.byPlatform} />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border-default bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-heading text-lg font-semibold text-text-primary">Published posts</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Each video is grouped. Every platform is its own row, then a total for that post.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-5 py-3 font-medium">Video</th>
                  <th className="px-5 py-3 font-medium">Platform</th>
                  <th className="px-5 py-3 font-medium">Views</th>
                  <th className="px-5 py-3 font-medium">Likes</th>
                  <th className="px-5 py-3 font-medium">Comments</th>
                  <th className="px-5 py-3 font-medium">Shares</th>
                  <th className="px-5 py-3 font-medium">Eng. Rate</th>
                  <th className="px-5 py-3 font-medium">Published</th>
                </tr>
              </thead>
              <tbody>
                {!postGroups.length ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-sm text-text-secondary">
                      No posts in this range.{' '}
                      <Link to="/library" className="font-medium text-accent-blue hover:underline">
                        Open library
                      </Link>{' '}
                      and publish an asset to see it here.
                    </td>
                  </tr>
                ) : (
                  postGroups.map((group) => {
                    const first = group.rows[0]
                    const span = group.rows.length + 1
                    const tot = {
                      views: metricSum(group.rows, 'views'),
                      likes: metricSum(group.rows, 'likes'),
                      comments: metricSum(group.rows, 'comments'),
                      shares: metricSum(group.rows, 'shares'),
                    }
                    tot.engagementRate = rateFromMetrics(tot.views, tot.likes, tot.comments, tot.shares)
                    return (
                      <Fragment key={group.key}>
                        {group.rows.map((row, i) => {
                          const meta = PLATFORM_META[row.platform]
                          return (
                            <tr key={row.id} className="border-b border-border/80">
                              {i === 0 ? (
                                <td className="px-5 py-3 align-top" rowSpan={span}>
                                  <div className="flex items-center gap-3">
                                    {first.sourceUrl && first.kind === 'image' ? (
                                      <img
                                        src={first.sourceUrl}
                                        alt=""
                                        className="h-10 w-[72px] shrink-0 rounded-lg object-cover"
                                      />
                                    ) : (
                                      <div className="h-10 w-[72px] shrink-0 overflow-hidden rounded-lg gradient-bg opacity-90" />
                                    )}
                                    <span className="font-medium text-text-primary">{first.title}</span>
                                  </div>
                                </td>
                              ) : null}
                              <td className="px-5 py-3">
                                <span className="inline-flex items-center gap-2 text-text-secondary">
                                  <span className={`h-2.5 w-2.5 rounded-full ${meta?.dot || 'bg-text-muted'}`} />
                                  {meta?.name || row.platform}
                                  {row.status && row.status !== 'succeeded' ? (
                                    <span className="text-xs text-text-tertiary">({row.status})</span>
                                  ) : null}
                                </span>
                              </td>
                              <td className="px-5 py-3 font-mono text-text-primary">{formatCount(row.views)}</td>
                              <td className="px-5 py-3 font-mono text-text-secondary">{formatCount(row.likes)}</td>
                              <td className="px-5 py-3 font-mono text-text-secondary">{formatCount(row.comments)}</td>
                              <td className="px-5 py-3 font-mono text-text-secondary">{formatCount(row.shares)}</td>
                              <td className="px-5 py-3">
                                <RateBar rate={row.engagementRate} />
                              </td>
                              <td className="px-5 py-3 text-text-tertiary">{formatWhen(row.createdAt)}</td>
                            </tr>
                          )
                        })}
                        <tr className="border-b border-border bg-elevated/40">
                            <td className="px-5 py-3 font-medium text-text-primary">Total</td>
                            <td className="px-5 py-3 font-mono font-medium text-text-primary">
                              {formatCount(tot.views)}
                            </td>
                            <td className="px-5 py-3 font-mono font-medium text-text-primary">
                              {formatCount(tot.likes)}
                            </td>
                            <td className="px-5 py-3 font-mono font-medium text-text-primary">
                              {formatCount(tot.comments)}
                            </td>
                            <td className="px-5 py-3 font-mono font-medium text-text-primary">
                              {formatCount(tot.shares)}
                            </td>
                            <td className="px-5 py-3">
                              <RateBar rate={tot.engagementRate} />
                            </td>
                            <td className="px-5 py-3 text-text-tertiary">{formatWhen(first.createdAt)}</td>
                          </tr>
                      </Fragment>
                    )
                  })
                )}
              </tbody>
              {allRows.length ? (
                <tfoot>
                  <tr className="border-t border-border bg-elevated/60">
                    <td className="px-5 py-3 font-medium text-text-primary">All posts</td>
                    <td className="px-5 py-3 font-medium text-text-primary">Total</td>
                    <td className="px-5 py-3 font-mono font-medium text-text-primary">{formatCount(grand.views)}</td>
                    <td className="px-5 py-3 font-mono font-medium text-text-primary">{formatCount(grand.likes)}</td>
                    <td className="px-5 py-3 font-mono font-medium text-text-primary">{formatCount(grand.comments)}</td>
                    <td className="px-5 py-3 font-mono font-medium text-text-primary">{formatCount(grand.shares)}</td>
                    <td className="px-5 py-3">
                      <RateBar rate={grand.engagementRate} />
                    </td>
                    <td className="px-5 py-3" />
                  </tr>
                </tfoot>
              ) : null}
            </table>
          </div>
        </section>
      </main>
    </AppLayout>
  )
}
