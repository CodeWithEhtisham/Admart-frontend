import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import VidifySidebar from '../components/VidifySidebar.jsx'

const SPARK = (seed, n = 15) =>
  Array.from({ length: n }, (_, i) => {
    const x = Math.sin(seed + i * 0.7) * 0.5 + 0.5
    return Math.round(20 + x * 80)
  })

function Sparkline15({ tone }) {
  const seed = tone === 'blue' ? 1 : tone === 'violet' ? 2 : tone === 'green' ? 3 : 4
  const values = useMemo(() => SPARK(seed), [seed])
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

const LINE_POINTS = {
  tiktok: [12, 14, 16, 15, 18, 19, 20, 21, 22, 21, 20, 22, 23, 22, 24],
  youtube: [8, 9, 10, 11, 10, 12, 13, 12, 14, 15, 14, 13, 14, 15, 16],
  instagram: [5, 6, 6, 7, 8, 7, 8, 9, 8, 9, 10, 9, 10, 11, 10],
  facebook: [2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7],
}

const APR_LABELS = ['Apr 1', 'Apr 4', 'Apr 8', 'Apr 12', 'Apr 16', 'Apr 20', 'Apr 24', 'Apr 28']

const TOP_VIDEOS = [
  {
    id: '1',
    title: 'Summer Drop — Teaser',
    platform: 'T',
    platformName: 'TikTok',
    views: '42.1K',
    likes: '2.1K',
    comments: '412',
    shares: '890',
    eng: 6.2,
    published: 'Apr 12, 2026',
  },
  {
    id: '2',
    title: 'Brand Story — Vertical',
    platform: 'Y',
    platformName: 'YouTube',
    views: '28.4K',
    likes: '1.4K',
    comments: '302',
    shares: '210',
    eng: 4.1,
    published: 'Apr 10, 2026',
  },
  {
    id: '3',
    title: 'Product Walkthrough',
    platform: 'I',
    platformName: 'Instagram',
    views: '19.8K',
    likes: '980',
    comments: '156',
    shares: '412',
    eng: 5.5,
    published: 'Apr 9, 2026',
  },
  {
    id: '4',
    title: 'Flash Sale Promo',
    platform: 'F',
    platformName: 'Facebook',
    views: '12.2K',
    likes: '620',
    comments: '98',
    shares: '134',
    eng: 3.8,
    published: 'Apr 7, 2026',
  },
  {
    id: '5',
    title: 'Tutorial — Onboarding',
    platform: 'T',
    platformName: 'TikTok',
    views: '11.0K',
    likes: '890',
    comments: '201',
    shares: '340',
    eng: 5.9,
    published: 'Apr 5, 2026',
  },
  {
    id: '6',
    title: 'Customer Spotlight',
    platform: 'Y',
    platformName: 'YouTube',
    views: '9.4K',
    likes: '540',
    comments: '112',
    shares: '88',
    eng: 4.4,
    published: 'Apr 3, 2026',
  },
]

const PLATFORM_DOT = {
  T: 'bg-tiktok',
  Y: 'bg-youtube',
  I: 'bg-instagram',
  F: 'bg-facebook',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const ENG_STACK = MONTHS.map((_, i) => ({
  likes: 20 + (i % 5) * 4,
  comments: 12 + (i % 4) * 3,
  shares: 8 + (i % 3) * 2,
}))

function LineChart() {
  const W = 520
  const H = 200
  const pad = { t: 16, r: 16, b: 36, l: 44 }
  const innerW = W - pad.l - pad.r
  const innerH = H - pad.t - pad.b
  const maxY = 24

  const toXY = (arr, color) => {
    const n = arr.length
    const pts = arr.map((v, i) => {
      const x = pad.l + (i / (n - 1)) * innerW
      const y = pad.t + innerH - (v / maxY) * innerH
      return [x, y]
    })
    const poly = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
    return { poly, pts, color }
  }

  const series = [
    toXY(LINE_POINTS.tiktok, '#00f2ea'),
    toXY(LINE_POINTS.youtube, '#ff4444'),
    toXY(LINE_POINTS.instagram, '#e6683c'),
    toXY(LINE_POINTS.facebook, '#1877f2'),
  ]

  const yTicks = [0, 6, 12, 18, 24]

  return (
    <div className="rounded-2xl border border-border-default bg-surface p-5">
      <h3 className="font-heading text-lg font-semibold text-text-primary">Views Over Time</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full max-h-[240px]" role="img" aria-label="Views over time chart">
        {yTicks.map((t) => {
          const y = pad.t + innerH - (t / maxY) * innerH
          return (
            <g key={t}>
              <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x={pad.l - 8} y={y + 4} textAnchor="end" className="fill-text-muted font-mono text-[10px]">
                {t === 24 ? '24K' : `${t}K`}
              </text>
            </g>
          )
        })}
        {series.map((s) => (
          <polyline
            key={s.color}
            fill="none"
            stroke={s.color}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={s.poly}
          />
        ))}
        {series.map((s) =>
          s.pts.map((p, i) => (
            <circle key={`${s.color}-${i}`} cx={p[0]} cy={p[1]} r="3.5" fill={s.color} stroke="#1a1a1f" strokeWidth="1" />
          ))
        )}
        {APR_LABELS.map((lab, i) => {
          const x = pad.l + (i / (APR_LABELS.length - 1)) * innerW
          return (
            <text
              key={lab}
              x={x}
              y={H - 10}
              textAnchor="middle"
              className="fill-text-tertiary font-mono text-[9px]"
            >
              {lab}
            </text>
          )
        })}
      </svg>
      <div className="mt-3 flex flex-wrap gap-4 text-xs">
        {[
          ['TikTok', '#00f2ea'],
          ['YouTube', '#ff4444'],
          ['Instagram', '#e6683c'],
          ['Facebook', '#1877f2'],
        ].map(([name, c]) => (
          <span key={name} className="inline-flex items-center gap-2 text-text-secondary">
            <span className="h-2 w-2 rounded-full" style={{ background: c }} />
            {name}
          </span>
        ))}
      </div>
    </div>
  )
}

function DonutChart() {
  const r = 52
  const c = 2 * Math.PI * r
  const segments = [
    { pct: 0.44, color: '#00f2ea', label: 'TikTok', value: '54.6K' },
    { pct: 0.31, color: '#ff4444', label: 'YouTube', value: '38.4K' },
    { pct: 0.18, color: '#e6683c', label: 'Instagram', value: '22.3K' },
    { pct: 0.08, color: '#1877f2', label: 'Facebook', value: '9.9K' },
  ]

  return (
    <div className="w-[340px] shrink-0 rounded-2xl border border-border-default bg-surface p-5">
      <h3 className="font-heading text-lg font-semibold text-text-primary">Platform Distribution</h3>
      <div className="relative mx-auto mt-4 flex h-[140px] w-[140px] items-center justify-center">
        <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
          {(() => {
            let dashAcc = 0
            return segments.map((s) => {
              const len = s.pct * c
              const offset = -dashAcc
              dashAcc += len
              return (
                <circle
                  key={s.label}
                  cx="70"
                  cy="70"
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="36"
                  strokeLinecap="butt"
                  strokeDasharray={`${len} ${c}`}
                  strokeDashoffset={offset}
                />
              )
            })
          })()}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="font-heading text-xl font-bold text-text-primary">124K</p>
          <p className="text-[11px] text-text-tertiary">total views</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {[
          { pct: '44%', ...segments[0] },
          { pct: '31%', ...segments[1] },
          { pct: '18%', ...segments[2] },
          { pct: '8%', ...segments[3] },
        ].map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-text-secondary">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: row.color }} />
              {row.label}
            </span>
            <span className="font-mono text-text-primary">{row.value}</span>
            <span className="w-10 text-right text-text-tertiary">{row.pct}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState('30d')
  const [platformFilter, setPlatformFilter] = useState('all')

  const ranges = [
    { id: '7d', label: '7d' },
    { id: '30d', label: '30d' },
    { id: '90d', label: '90d' },
    { id: 'all', label: 'All time' },
  ]

  return (
    <div className="min-h-screen bg-base font-body text-text-primary">
      <VidifySidebar />
      <div className="ml-[260px] min-h-screen">
        <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between gap-4 border-b border-border bg-panel/90 px-7 backdrop-blur-md">
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm text-text-secondary">
            <Link to="/dashboard" className="hover:text-text-primary">
              Dashboard
            </Link>
            <span className="text-text-muted">/</span>
            <span className="font-heading text-lg font-bold text-text-primary">Analytics</span>
          </nav>

          <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
            <div className="flex rounded-xl border border-border-default bg-input p-1">
              {ranges.map((r) => (
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
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="rounded-xl border border-border-default bg-input px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
            >
              <option value="all">All platforms</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
            </select>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-border-default bg-elevated px-4 py-2 text-sm font-medium text-text-primary hover:border-accent-blue/40"
            >
              ↓ Export CSV
            </button>

            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold text-white gradient-bg"
              aria-hidden
            >
              E
            </div>
          </div>
        </header>

        <main className="space-y-8 p-7">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: 'Total Views',
                value: '124K',
                trend: '↑ +18.2%',
                icon: '◎',
                tone: 'blue',
              },
              {
                label: 'Total Engagement',
                value: '8.4K',
                trend: '↑ +12.5%',
                icon: '✦',
                tone: 'violet',
              },
              {
                label: 'Videos Published',
                value: '18',
                trend: '↑ +3',
                icon: '▶',
                tone: 'green',
              },
              {
                label: 'Avg Engagement Rate',
                value: '4.8%',
                trend: '↓ -0.3%',
                icon: '◇',
                tone: 'yellow',
              },
            ].map((card) => (
              <div key={card.label} className="rounded-2xl border border-border-default bg-surface p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">{card.label}</p>
                    <p className="mt-2 font-heading text-3xl font-bold text-text-primary">{card.value}</p>
                    <p className="mt-1 text-sm text-text-secondary">{card.trend}</p>
                  </div>
                  <span className="text-2xl opacity-80" aria-hidden>
                    {card.icon}
                  </span>
                </div>
                <div className="mt-4 flex justify-end">
                  <Sparkline15 tone={card.tone} />
                </div>
              </div>
            ))}
          </section>

          <section className="flex flex-col gap-6 xl:flex-row xl:items-start">
            <div className="min-w-0 flex-1">
              <LineChart />
            </div>
            <DonutChart />
          </section>

          <section className="rounded-2xl border border-border-default bg-surface p-5">
            <h3 className="font-heading text-lg font-semibold text-text-primary">Engagement Breakdown</h3>
            <div className="mt-6 flex gap-2 border-b border-border pb-2 pl-1">
              {ENG_STACK.map((row, i) => {
                const total = row.likes + row.comments + row.shares
                return (
                  <div key={MONTHS[i]} className="flex min-h-0 flex-1 flex-col items-center gap-2">
                    <div className="flex h-44 w-full max-w-[40px] flex-col justify-end overflow-hidden rounded-t-md bg-elevated">
                      <div
                        className="w-full bg-success"
                        style={{ height: `${(row.shares / total) * 100}%`, minHeight: '4px' }}
                        title="Shares"
                      />
                      <div
                        className="w-full bg-accent-violet"
                        style={{ height: `${(row.comments / total) * 100}%`, minHeight: '4px' }}
                        title="Comments"
                      />
                      <div
                        className="w-full bg-accent-blue"
                        style={{ height: `${(row.likes / total) * 100}%`, minHeight: '4px' }}
                        title="Likes"
                      />
                    </div>
                    <span className="font-mono text-[10px] text-text-muted">{MONTHS[i]}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-6 text-xs text-text-secondary">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm bg-accent-blue" /> Likes
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm bg-accent-violet" /> Comments
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm bg-success" /> Shares
              </span>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-border-default bg-surface">
            <div className="border-b border-border px-5 py-4">
              <h3 className="font-heading text-lg font-semibold text-text-primary">Top Performing Videos</h3>
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
                  {TOP_VIDEOS.map((row) => (
                    <tr
                      key={row.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate('/result')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          navigate('/result')
                        }
                      }}
                      className="cursor-pointer border-b border-border/80 transition hover:bg-elevated/80"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-[72px] shrink-0 overflow-hidden rounded-lg gradient-bg opacity-90" />
                          <span className="font-medium text-text-primary">{row.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-2 text-text-secondary">
                          <span className={`h-2.5 w-2.5 rounded-full ${PLATFORM_DOT[row.platform]}`} />
                          {row.platformName}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono text-text-primary">{row.views}</td>
                      <td className="px-5 py-3 font-mono text-text-secondary">{row.likes}</td>
                      <td className="px-5 py-3 font-mono text-text-secondary">{row.comments}</td>
                      <td className="px-5 py-3 font-mono text-text-secondary">{row.shares}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-elevated">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-violet"
                              style={{ width: `${Math.min(100, row.eng * 12)}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs text-text-primary">{row.eng}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-text-tertiary">{row.published}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
