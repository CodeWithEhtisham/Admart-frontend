import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

/** Reference "today" for demo (matches product brief) */
const TODAY = new Date(2026, 3, 15)

const PLATFORMS = [
  { code: 'T', label: 'TikTok', className: 'bg-tiktok' },
  { code: 'Y', label: 'YouTube', className: 'bg-youtube' },
  { code: 'I', label: 'Instagram', className: 'bg-instagram' },
  { code: 'F', label: 'Facebook', className: 'bg-facebook' },
]

const STATUS_STYLES = {
  published: {
    pill: 'border-success/40 bg-success/20 text-success',
    dot: 'bg-success',
    bar: 'from-success/30 to-success/10',
    label: 'Published',
  },
  scheduled: {
    pill: 'border-warning/40 bg-warning/20 text-warning',
    dot: 'bg-warning',
    bar: 'from-warning/30 to-warning/10',
    label: 'Scheduled',
  },
  generating: {
    pill: 'border-accent-violet/40 bg-accent-violet/20 text-accent-violet',
    dot: 'bg-accent-violet',
    bar: 'from-accent-violet/30 to-accent-violet/10',
    label: 'Generating',
  },
  failed: {
    pill: 'border-error/40 bg-error/20 text-error',
    dot: 'bg-error',
    bar: 'from-error/30 to-error/10',
    label: 'Failed',
  },
}

/** April 2026 — spread across multiple days */
const MOCK_EVENTS = [
  { id: 'e1', y: 2026, m: 3, d: 1, title: 'April Kickoff Reel', status: 'published', platform: 'T', time: '8:00 AM' },
  { id: 'e2', y: 2026, m: 3, d: 3, title: 'Product Teaser — Vertical', status: 'scheduled', platform: 'I', time: '11:30 AM' },
  { id: 'e3', y: 2026, m: 3, d: 3, title: 'YouTube Short — Tips', status: 'generating', platform: 'Y', time: '2:00 PM' },
  { id: 'e4', y: 2026, m: 3, d: 5, title: 'Flash Sale Countdown', status: 'scheduled', platform: 'T', time: '9:15 AM' },
  { id: 'e5', y: 2026, m: 3, d: 7, title: 'Customer Story', status: 'published', platform: 'F', time: '10:00 AM' },
  { id: 'e6', y: 2026, m: 3, d: 9, title: 'Tutorial — Onboarding', status: 'published', platform: 'Y', time: '3:45 PM' },
  { id: 'e7', y: 2026, m: 3, d: 12, title: 'UGC Remix', status: 'generating', platform: 'T', time: '7:00 AM' },
  { id: 'e8', y: 2026, m: 3, d: 12, title: 'Carousel Ad', status: 'failed', platform: 'I', time: '4:20 PM' },
  { id: 'e9', y: 2026, m: 3, d: 15, title: 'Mid-month Promo', status: 'scheduled', platform: 'F', time: '12:00 PM' },
  { id: 'e10', y: 2026, m: 3, d: 18, title: 'Brand Anthem', status: 'scheduled', platform: 'Y', time: '6:30 PM' },
  { id: 'e11', y: 2026, m: 3, d: 22, title: 'Earth Day Spot', status: 'published', platform: 'I', time: '8:00 AM' },
  { id: 'e12', y: 2026, m: 3, d: 24, title: 'Live Clip — Highlights', status: 'generating', platform: 'T', time: '5:10 PM' },
  { id: 'e13', y: 2026, m: 3, d: 28, title: 'Month-end Recap', status: 'scheduled', platform: 'Y', time: '9:00 AM' },
  { id: 'e14', y: 2026, m: 3, d: 30, title: 'April Finale', status: 'scheduled', platform: 'T', time: '7:45 PM' },
]

function sameCalendarDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function buildMonthGrid(year, monthIndex) {
  const first = new Date(year, monthIndex, 1)
  const startPad = first.getDay()
  const nDays = new Date(year, monthIndex + 1, 0).getDate()
  const cells = []
  const prevLast = new Date(year, monthIndex, 0).getDate()
  for (let i = 0; i < startPad; i++) {
    const dayNum = prevLast - startPad + i + 1
    cells.push({
      jsDate: new Date(year, monthIndex - 1, dayNum),
      inMonth: false,
    })
  }
  for (let d = 1; d <= nDays; d++) {
    cells.push({
      jsDate: new Date(year, monthIndex, d),
      inMonth: true,
    })
  }
  let n = 1
  const nextMonth = monthIndex === 11 ? 0 : monthIndex + 1
  const nextYear = monthIndex === 11 ? year + 1 : year
  while (cells.length % 7 !== 0) {
    cells.push({
      jsDate: new Date(nextYear, nextMonth, n),
      inMonth: false,
    })
    n += 1
  }
  return cells
}

function startOfWeek(d) {
  const x = new Date(d)
  const day = x.getDay()
  x.setDate(x.getDate() - day)
  x.setHours(0, 0, 0, 0)
  return x
}

function addDays(d, n) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function Sidebar() {
  const location = useLocation()
  const navCls = (path) => {
    const active = location.pathname === path
    return `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      active ? 'bg-accent-blue/15 text-accent-blue' : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
    }`
  }

  return (
    <aside className="fixed bottom-0 left-0 top-0 z-40 flex w-[260px] flex-col border-r border-border bg-panel">
      <div className="flex h-[60px] items-center border-b border-border px-4">
        <Link to="/" className="font-heading text-lg font-bold">
          <span className="gradient-text">V</span>
          <span className="text-text-primary">idify</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Main</p>
          <div className="space-y-1">
            <Link to="/dashboard" className={navCls('/dashboard')}>
              <span className="text-lg" aria-hidden>
                ◎
              </span>
              <span>Dashboard</span>
            </Link>
            <Link to="/create" className={navCls('/create')}>
              <span className="text-lg" aria-hidden>
                ✦
              </span>
              <span>Create New</span>
            </Link>
            <Link to="/library" className={`${navCls('/library')} justify-between`}>
              <span className="flex items-center gap-3">
                <span className="text-lg" aria-hidden>
                  ▤
                </span>
                <span>My Videos</span>
              </span>
              <span className="rounded-full bg-accent-blue/20 px-2 py-0.5 text-xs font-semibold text-accent-blue">18</span>
            </Link>
            <Link to="/templates" className={navCls('/templates')}>
              <span className="text-lg" aria-hidden>
                ⧉
              </span>
              <span>Templates</span>
            </Link>
          </div>
        </div>
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Publish</p>
          <div className="space-y-1">
            <Link to="/calendar" className={navCls('/calendar')}>
              <span className="text-lg" aria-hidden>
                ⌁
              </span>
              <span>Calendar</span>
            </Link>
            <Link to="/social" className={navCls('/social')}>
              <span className="text-lg" aria-hidden>
                ⚡
              </span>
              <span>Social Accounts</span>
            </Link>
          </div>
        </div>
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Analyze</p>
          <div className="space-y-1">
            <Link to="/analytics" className={navCls('/analytics')}>
              <span className="text-lg" aria-hidden>
                📈
              </span>
              <span>Analytics</span>
            </Link>
          </div>
        </div>
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Settings</p>
          <div className="space-y-1">
            <Link to="/settings" className={navCls('/settings')}>
              <span className="text-lg" aria-hidden>
                ◇
              </span>
              <span>Brand Kit</span>
            </Link>
            <Link to="/billing" className={navCls('/billing')}>
              <span className="text-lg" aria-hidden>
                ◫
              </span>
              <span>Billing</span>
            </Link>
            <Link to="/settings" className={navCls('/settings')}>
              <span className="text-lg" aria-hidden>
                ⚙
              </span>
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </nav>
      <div className="mt-auto border-t border-border p-3">
        <div className="rounded-xl border border-border-default bg-surface p-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-text-secondary">Credits</span>
            <span className="font-mono font-semibold text-text-primary">42</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
            <div className="h-full w-[21%] rounded-full bg-gradient-to-r from-accent-blue to-accent-violet" />
          </div>
          <p className="mt-1 text-xs text-text-tertiary">42 / 200</p>
        </div>
      </div>
    </aside>
  )
}

function eventToDate(ev) {
  return new Date(ev.y, ev.m, ev.d)
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const [currentYear, setCurrentYear] = useState(2026)
  const [currentMonth, setCurrentMonth] = useState(3)
  const [selectedDay, setSelectedDay] = useState(() => new Date(2026, 3, 15))
  const [panelOpen, setPanelOpen] = useState(false)
  const [viewMode, setViewMode] = useState('month')
  const [platformOn, setPlatformOn] = useState(() => ({
    T: true,
    Y: true,
    I: true,
    F: true,
  }))

  const gridCells = useMemo(() => buildMonthGrid(currentYear, currentMonth), [currentYear, currentMonth])

  const eventsWithDate = useMemo(
    () => MOCK_EVENTS.map((e) => ({ ...e, jsDate: eventToDate(e) })),
    []
  )

  const filteredPool = useMemo(
    () => eventsWithDate.filter((e) => platformOn[e.platform]),
    [eventsWithDate, platformOn]
  )

  const eventsForDay = (day) => filteredPool.filter((e) => sameCalendarDay(e.jsDate, day)).sort((a, b) => a.time.localeCompare(b.time))

  const monthAgenda = useMemo(() => {
    const inMonth = filteredPool.filter((e) => e.y === currentYear && e.m === currentMonth)
    const byDay = new Map()
    for (const ev of inMonth) {
      const k = ev.d
      if (!byDay.has(k)) byDay.set(k, [])
      byDay.get(k).push(ev)
    }
    return [...byDay.entries()].sort((a, b) => a[0] - b[0])
  }, [filteredPool, currentYear, currentMonth])

  const weekDays = useMemo(() => {
    const anchor = new Date(currentYear, currentMonth, 15)
    const start = startOfWeek(anchor)
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [currentYear, currentMonth])

  const goPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1)
      setCurrentMonth(11)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const goNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1)
      setCurrentMonth(0)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  const goToday = () => {
    setCurrentYear(TODAY.getFullYear())
    setCurrentMonth(TODAY.getMonth())
    setSelectedDay(new Date(TODAY))
    setPanelOpen(true)
  }

  const togglePlatform = (code) => {
    setPlatformOn((p) => ({ ...p, [code]: !p[code] }))
  }

  const openDay = (d) => {
    setSelectedDay(d)
    setPanelOpen(true)
  }

  const selectedLabel = selectedDay
    ? `${MONTH_NAMES[selectedDay.getMonth()]} ${selectedDay.getDate()}, ${selectedDay.getFullYear()}`
    : ''

  const panelEvents = selectedDay ? eventsForDay(selectedDay) : []

  const maxPills = 3

  return (
    <div className="min-h-screen bg-base font-body text-text-primary">
      <Sidebar />

      <div className="ml-[260px] min-h-screen pb-24">
        <header className="sticky top-0 z-30 flex min-h-[72px] flex-wrap items-center gap-4 border-b border-border bg-panel/90 px-5 py-3 backdrop-blur-md lg:px-7">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={goPrevMonth}
              className="rounded-lg border border-border-default bg-elevated px-2.5 py-1.5 text-text-secondary hover:text-text-primary"
              aria-label="Previous month"
            >
              ‹
            </button>
            <h1 className="min-w-[160px] font-heading text-lg font-bold">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h1>
            <button
              type="button"
              onClick={goNextMonth}
              className="rounded-lg border border-border-default bg-elevated px-2.5 py-1.5 text-text-secondary hover:text-text-primary"
              aria-label="Next month"
            >
              ›
            </button>
            <button
              type="button"
              onClick={goToday}
              className="rounded-xl border border-accent-blue/40 bg-accent-blue/15 px-3 py-1.5 text-sm font-medium text-accent-blue"
            >
              Today
            </button>
          </div>

          <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
            <div className="flex rounded-xl border border-border-default bg-input p-1">
              {['month', 'week', 'day'].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setViewMode(v)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
                    viewMode === v ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {v === 'day' ? 'Day List' : v}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 border-l border-border pl-3" aria-label="Filter by platform">
              {PLATFORMS.map((p) => (
                <button
                  key={p.code}
                  type="button"
                  onClick={() => togglePlatform(p.code)}
                  title={p.label}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white transition ${
                    p.className
                  } ${platformOn[p.code] ? 'opacity-100 ring-2 ring-white/40' : 'opacity-35 grayscale'}`}
                >
                  {p.code}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => navigate('/create')}
              className="inline-flex items-center gap-2 rounded-xl gradient-bg px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-blue/20"
            >
              + New Post
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full font-heading text-sm font-bold text-white gradient-bg" aria-hidden>
              E
            </div>
          </div>
        </header>

        <main className="p-7">
          {viewMode === 'month' && (
            <div className="overflow-hidden rounded-2xl border border-border-default bg-panel">
              <div className="grid grid-cols-7 border-b border-border-default bg-surface text-center text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="px-2 py-3">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {gridCells.map((cell, idx) => {
                  const num = cell.jsDate.getDate()
                  const isToday = sameCalendarDay(cell.jsDate, TODAY)
                  const list = eventsForDay(cell.jsDate)
                  const shown = list.slice(0, maxPills)
                  const more = Math.max(0, list.length - shown.length)
                  return (
                    <button
                      key={`${idx}-${cell.jsDate.getTime()}`}
                      type="button"
                      onClick={() => openDay(cell.jsDate)}
                      className={`min-h-[120px] border-b border-r border-border p-2 text-left transition hover:bg-elevated/60 ${
                        cell.inMonth ? 'bg-panel' : 'bg-input/50'
                      } ${idx % 7 === 6 ? 'border-r-0' : ''}`}
                    >
                      <div className="mb-2 flex justify-end">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                            isToday
                              ? 'bg-accent-blue text-white'
                              : cell.inMonth
                                ? 'text-text-primary'
                                : 'text-text-muted'
                          }`}
                        >
                          {num}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {shown.map((ev) => {
                          const st = STATUS_STYLES[ev.status]
                          return (
                            <span
                              key={ev.id}
                              className={`flex items-center gap-1.5 truncate rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${st.pill}`}
                            >
                              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${st.dot}`} />
                              <span className="truncate">{ev.title}</span>
                            </span>
                          )
                        })}
                        {more > 0 && (
                          <span className="text-[10px] font-semibold text-text-tertiary">+{more} more</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {viewMode === 'week' && (
            <div className="grid gap-4 lg:grid-cols-7">
              {weekDays.map((d) => {
                const isToday = sameCalendarDay(d, TODAY)
                const list = eventsForDay(d)
                return (
                  <div
                    key={d.getTime()}
                    className={`flex flex-col rounded-2xl border border-border-default p-3 ${
                      isToday ? 'bg-accent-blue/10 ring-1 ring-accent-blue/40' : 'bg-panel'
                    }`}
                  >
                    <button type="button" onClick={() => openDay(d)} className="mb-3 text-left">
                      <p className="text-[10px] font-semibold uppercase text-text-muted">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]}
                      </p>
                      <p className={`font-heading text-xl font-bold ${isToday ? 'text-accent-blue' : 'text-text-primary'}`}>
                        {d.getDate()}
                      </p>
                    </button>
                    <div className="flex flex-1 flex-col gap-2">
                      {list.length === 0 && <p className="text-xs text-text-muted">No posts</p>}
                      {list.map((ev) => {
                        const st = STATUS_STYLES[ev.status]
                        return (
                          <div key={ev.id} className={`rounded-lg border bg-gradient-to-br px-2 py-2 text-xs ${st.bar}`}>
                            <div className="flex items-center gap-1">
                              <span
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white ${
                                  PLATFORMS.find((p) => p.code === ev.platform)?.className
                                }`}
                              >
                                {ev.platform}
                              </span>
                              <span className="font-medium leading-tight text-text-primary">{ev.title}</span>
                            </div>
                            <p className="mt-1 text-[10px] text-text-tertiary">{ev.time}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {viewMode === 'day' && (
            <div className="space-y-6">
              {monthAgenda.length === 0 && (
                <p className="text-center text-text-secondary">No content this month for the selected platforms.</p>
              )}
              {monthAgenda.map(([dayNum, evs]) => (
                <div key={dayNum} className="rounded-2xl border border-border-default bg-panel p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-heading text-lg font-semibold">
                      {MONTH_NAMES[currentMonth]} {dayNum}
                    </h2>
                    <button
                      type="button"
                      onClick={() => openDay(new Date(currentYear, currentMonth, dayNum))}
                      className="text-sm font-medium text-accent-blue hover:underline"
                    >
                      Open day
                    </button>
                  </div>
                  <div className="space-y-3">
                    {evs.map((ev) => {
                      const st = STATUS_STYLES[ev.status]
                      return (
                        <div
                          key={ev.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-default bg-surface px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${
                                PLATFORMS.find((p) => p.code === ev.platform)?.className
                              }`}
                            >
                              {ev.platform}
                            </span>
                            <div>
                              <p className="font-medium">{ev.title}</p>
                              <p className="text-xs text-text-tertiary">{ev.time}</p>
                            </div>
                          </div>
                          <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${st.pill}`}>{st.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <div
          className={`fixed bottom-0 left-[260px] right-0 z-20 flex flex-wrap items-center gap-6 border-t border-border bg-panel/95 px-7 py-3 backdrop-blur ${
            panelOpen ? 'mr-[300px]' : ''
          }`}
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">Legend</span>
          {Object.entries(STATUS_STYLES).map(([k, v]) => (
            <span key={k} className="flex items-center gap-2 text-xs text-text-secondary">
              <span className={`h-2 w-2 rounded-full ${v.dot}`} />
              {v.label}
            </span>
          ))}
          <span className="ml-auto flex items-center gap-2 text-xs text-text-secondary">
            <span className="h-2 w-2 rounded-full bg-accent-blue" />
            Today
          </span>
        </div>
      </div>

      <aside
        className={`fixed bottom-0 right-0 top-0 z-[50] w-[300px] border-l border-border bg-panel shadow-2xl transition-transform duration-300 ease-out ${
          panelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!panelOpen}
      >
        <div className="flex h-[60px] items-center justify-between border-b border-border px-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Content</p>
            <p className="font-heading text-lg font-bold">{selectedLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => setPanelOpen(false)}
            className="rounded-lg p-2 text-text-muted hover:bg-elevated hover:text-text-primary"
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>
        <div className="flex h-[calc(100%-60px)] flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {panelEvents.length === 0 && (
              <div className="rounded-xl border border-dashed border-border-default bg-input px-4 py-10 text-center">
                <p className="text-sm text-text-secondary">No posts scheduled for this day.</p>
                <p className="mt-2 text-xs text-text-muted">Try another day or create something new.</p>
              </div>
            )}
            {panelEvents.map((ev) => {
              const st = STATUS_STYLES[ev.status]
              return (
                <article
                  key={ev.id}
                  className="overflow-hidden rounded-xl border border-border-default bg-surface"
                >
                  <div
                    className={`h-24 bg-gradient-to-br ${st.bar} relative flex items-center justify-center`}
                  >
                    <span className="font-heading text-3xl text-white/90">▶</span>
                    <span
                      className={`absolute left-3 top-3 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${st.pill}`}
                    >
                      {st.label}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading font-semibold leading-snug">{ev.title}</h3>
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                          PLATFORMS.find((p) => p.code === ev.platform)?.className
                        }`}
                      >
                        {ev.platform}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-text-tertiary">{ev.time}</p>
                  </div>
                </article>
              )
            })}
          </div>
          <div className="border-t border-border p-5">
            <button
              type="button"
              onClick={() => {
                navigate('/create')
                setPanelOpen(false)
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-default bg-elevated py-3 text-sm font-semibold text-text-primary transition hover:border-accent-blue/40"
            >
              + Schedule New Post
            </button>
          </div>
        </div>
      </aside>

      {panelOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[45] bg-black/40 lg:left-[260px]"
          aria-label="Close panel overlay"
          onClick={() => setPanelOpen(false)}
        />
      )}
    </div>
  )
}
