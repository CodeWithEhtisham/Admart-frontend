import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Topbar from '../components/Topbar'
import {
  PROJECT_CHANGE_EVENT,
  getCachedActiveProject,
  getProjectCalendar,
} from '../utils/projects.js'

const PLATFORMS = [
  { code: 'T', label: 'TikTok', className: 'bg-tiktok' },
  { code: 'Y', label: 'YouTube', className: 'bg-youtube' },
  { code: 'I', label: 'Instagram', className: 'bg-instagram' },
  { code: 'F', label: 'Facebook', className: 'bg-facebook' },
]
const PLATFORM_CLASS = Object.fromEntries(PLATFORMS.map((p) => [p.code, p.className]))

function platformClass(code) {
  return PLATFORM_CLASS[code] || 'bg-accent-violet'
}

function platformName(ev) {
  return ev.platformName || PLATFORMS.find((p) => p.code === ev.platform)?.label || 'Generation'
}

function statusStyle(ev) {
  return STATUS_STYLES[ev.status] || STATUS_STYLES.scheduled
}

function statusLine(ev) {
  const st = statusStyle(ev)
  const where = platformName(ev)
  if (ev.status === 'published') return `Published on ${where}`
  if (ev.status === 'failed') return `Failed on ${where}`
  if (ev.status === 'scheduled') return `Scheduled for ${where}`
  if (ev.status === 'generating') return `Generating · ${where}`
  return `${st.label} · ${where}`
}

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

function mapApiEvent(ev) {
  const jsDate = new Date(ev.at)
  return {
    ...ev,
    jsDate,
    y: jsDate.getFullYear(),
    m: jsDate.getMonth(),
    d: jsDate.getDate(),
    time: ev.time || jsDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
  }
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const [today] = useState(() => new Date())
  const [currentYear, setCurrentYear] = useState(() => today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(() => today.getMonth())
  const [selectedDay, setSelectedDay] = useState(() => new Date(today))
  const [panelOpen, setPanelOpen] = useState(false)
  const [viewMode, setViewMode] = useState('month')
  const [platformOn, setPlatformOn] = useState(() => ({
    T: true,
    Y: true,
    I: true,
    F: true,
  }))
  const [rawEvents, setRawEvents] = useState([])
  const [error, setError] = useState('')
  const [projectId, setProjectId] = useState(() => getCachedActiveProject()?.id || '')

  useEffect(() => {
    const sync = () => setProjectId(getCachedActiveProject()?.id || '')
    window.addEventListener(PROJECT_CHANGE_EVENT, sync)
    return () => window.removeEventListener(PROJECT_CHANGE_EVENT, sync)
  }, [])

  useEffect(() => {
    if (!projectId) {
      setRawEvents([])
      setError('')
      return undefined
    }
    let cancelled = false
    setError('')
    getProjectCalendar(projectId, { year: currentYear, month: currentMonth + 1 })
      .then((payload) => {
        if (!cancelled) setRawEvents(payload.events || [])
      })
      .catch((err) => {
        if (!cancelled) {
          setRawEvents([])
          setError(err.response?.data?.message || 'Could not load calendar.')
        }
      })
    return () => {
      cancelled = true
    }
  }, [projectId, currentYear, currentMonth])

  const gridCells = useMemo(() => buildMonthGrid(currentYear, currentMonth), [currentYear, currentMonth])

  const eventsWithDate = useMemo(() => rawEvents.map(mapApiEvent), [rawEvents])

  const filteredPool = useMemo(
    () => eventsWithDate.filter((e) => !e.platform || platformOn[e.platform]),
    [eventsWithDate, platformOn],
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
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth())
    setSelectedDay(new Date(today))
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
    <AppLayout>
      <div className="min-h-screen pb-24">
        <Topbar title="Calendar" />

        <div className="flex flex-wrap items-center gap-4 border-b border-border bg-panel/90 px-5 py-3 lg:px-7">
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
          </div>
        </div>

        <main className="p-7">
          {!projectId ? (
            <p className="mb-4 rounded-xl border border-border-default bg-surface px-4 py-3 text-sm text-text-secondary">
              Select a project to see scheduled posts and generations.
            </p>
          ) : null}
          {error ? (
            <p className="mb-4 rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
          ) : null}
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
                  const isToday = sameCalendarDay(cell.jsDate, today)
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
                          const st = statusStyle(ev)
                          return (
                            <span
                              key={ev.id}
                              className={`flex items-center gap-1.5 truncate rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${st.pill}`}
                            >
                              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${st.dot}`} />
                              <span className="truncate">{`${ev.platform || 'AI'} · ${st.label}`}</span>
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
                const isToday = sameCalendarDay(d, today)
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
                        const st = statusStyle(ev)
                        return (
                          <div key={ev.id} className={`rounded-lg border bg-gradient-to-br px-2 py-2 text-xs ${st.bar}`}>
                            <div className="flex items-center gap-1">
                              <span
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white ${platformClass(ev.platform)}`}
                              >
                                {ev.platform || 'AI'}
                              </span>
                              <span className="font-medium leading-tight text-text-primary">{ev.title}</span>
                            </div>
                            <p className="mt-1 text-[10px] text-text-tertiary">{statusLine(ev)}</p>
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
                <p className="text-center text-text-secondary">No activity this month for the selected platforms.</p>
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
                      const st = statusStyle(ev)
                      return (
                        <div
                          key={ev.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-default bg-surface px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${platformClass(ev.platform)}`}
                            >
                              {ev.platform || 'AI'}
                            </span>
                            <div>
                              <p className="font-medium">{ev.title}</p>
                              <p className="text-xs text-text-tertiary">{statusLine(ev)}</p>
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
                <p className="text-sm text-text-secondary">No activity for this day.</p>
                <p className="mt-2 text-xs text-text-muted">Try another day or create something new.</p>
              </div>
            )}
            {panelEvents.map((ev) => {
              const st = statusStyle(ev)
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
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${platformClass(ev.platform)}`}
                      >
                        {ev.platform || 'AI'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-text-secondary">{statusLine(ev)}</p>
                    {ev.error ? <p className="mt-1 text-xs text-error">{ev.error}</p> : null}
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
    </AppLayout>
  )
}
