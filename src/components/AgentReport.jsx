import { Link } from 'react-router-dom'
import useShortsAgent from '../utils/useShortsAgent'
import { HookScore } from './AgentRunViews.jsx'

const btn =
  'rounded-lg border border-border-default px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50'
const MOOD = {
  better: ['▲ Better than last period', 'border-success/40 bg-success/15 text-success-text'],
  same: ['● About the same as last period', 'border-border-default bg-input text-text-secondary'],
  worse: ['▼ Down from last period', 'border-error/40 bg-error/10 text-danger'],
}

const pct = (now, before) => (now == null || !before ? null : Math.round((100 * (now - before)) / before))
const num = (v, money) =>
  v == null ? '–' : money ? `$${Number(v).toFixed(2)}` : Number(v).toLocaleString(undefined, { maximumFractionDigits: 1 })

function Figure({ label, now, before, money }) {
  const change = pct(now, before)
  return (
    <div className="rounded-xl border border-border-default bg-input p-3">
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className="mt-1 font-heading text-xl font-bold">{num(now, money)}</p>
      {change != null ? (
        <p className={`text-xs font-medium ${change > 0 ? 'text-success-text' : change < 0 ? 'text-danger' : 'text-text-tertiary'}`}>
          {change > 0 ? '▲' : change < 0 ? '▼' : '●'} {Math.abs(change)}% vs before ({num(before, money)})
        </p>
      ) : before != null ? (
        <p className="text-xs text-text-tertiary">was {num(before, money)}</p>
      ) : null}
    </div>
  )
}

const subs = (y) => (y ? (y.subscribersGained || 0) - (y.subscribersLost || 0) : null)
const hours = (y) => (y?.estimatedMinutesWatched == null ? null : y.estimatedMinutesWatched / 60)

function List({ title, items }) {
  if (!items?.length) return null
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-text-secondary">
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  )
}

/** A Growth Report: verdict, numbers vs the previous period, what worked, and the next-period plan. */
export default function AgentReport({ run }) {
  const { shorts, queued, busy, error, makeShort, addToAutopilot } = useShortsAgent()
  const report = run.report
  const numbers = run.numbers || {}
  if (!report) return null
  const yt = numbers.youtube
  const [moodText, moodClass] = MOOD[report.mood] || MOOD.same
  const goal = report.goal

  return (
    <div className="space-y-5 text-sm">
      <div className="space-y-2">
        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${moodClass}`}>{moodText}</span>
        <p className="text-[1rem] leading-relaxed">{report.verdict}</p>
        <p className="text-xs text-text-tertiary">
          {numbers.start} to {numbers.end}
        </p>
      </div>

      {(numbers.notes || []).includes('reconnect_youtube') ? (
        <p className="rounded-xl border border-accent-blue/40 bg-accent-blue/5 px-3 py-2 text-xs">
          Reconnect YouTube on{' '}
          <Link to="/social" className="font-medium text-link hover:underline">
            Social Accounts
          </Link>{' '}
          to add watch time, subscribers and revenue to your reports.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {yt ? (
          <>
            <Figure label="YouTube views" now={yt.now?.views} before={yt.before?.views} />
            <Figure label="Watch hours" now={hours(yt.now)} before={hours(yt.before)} />
            <Figure label="New subscribers" now={subs(yt.now)} before={subs(yt.before)} />
            {yt.revenue_now != null ? <Figure label="Revenue" now={yt.revenue_now} before={yt.revenue_before} money /> : null}
            {yt.subscribers_total ? <Figure label="Subscribers in total" now={yt.subscribers_total} /> : null}
          </>
        ) : null}
        {numbers.instagram_followers != null ? <Figure label="Instagram followers" now={numbers.instagram_followers} /> : null}
        {numbers.facebook_followers != null ? <Figure label="Facebook followers" now={numbers.facebook_followers} /> : null}
        {numbers.posts?.count || numbers.posts?.count_before ? (
          <Figure label="Posts via Admart" now={numbers.posts.count} before={numbers.posts.count_before} />
        ) : null}
      </div>

      {goal ? (
        <div>
          <p className="font-semibold">
            Goal: {num(goal.target)} {goal.label} · {goal.value == null ? 'no data yet' : `${num(goal.value)} (${goal.pct}%)`}
          </p>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-input" aria-hidden>
            <div className="h-full rounded-full gradient-bg" style={{ width: `${Math.min(100, goal.pct || 0)}%` }} />
          </div>
        </div>
      ) : null}

      {numbers.posts?.top?.length || yt?.top?.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {yt?.top?.length ? (
            <div>
              <h3 className="font-semibold">Top YouTube videos</h3>
              <ol className="mt-1 list-decimal space-y-1 pl-5 text-text-secondary">
                {yt.top.slice(0, 5).map((v) => (
                  <li key={v.video}>
                    {v.title || v.video} · {num(v.views)} views · {Math.round(v.averageViewPercentage || 0)}% watched
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
          {numbers.posts?.top?.length ? (
            <div>
              <h3 className="font-semibold">Best posts via Admart</h3>
              <ol className="mt-1 list-decimal space-y-1 pl-5 text-text-secondary">
                {numbers.posts.top.map((p) => (
                  <li key={`${p.title}-${p.platform}`}>
                    {p.title} · {p.platform} · {num(p.views)} views
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      ) : null}

      {numbers.best_days?.length ? (
        <p className="text-xs text-text-secondary">
          Best days so far: {numbers.best_days.slice(0, 3).map((d) => `${d.day} (${num(d.avg_views)} avg views)`).join(' · ')}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <List title="What worked" items={report.wins} />
        <List title="What didn't" items={report.losses} />
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">Plan for the next {numbers.period} days</h3>
          {shorts ? (
            <button
              type="button"
              className={`${btn} ml-auto`}
              disabled={Boolean(busy) || report.plan.every((p) => queued.has(p.topic))}
              onClick={() => addToAutopilot(report.plan.map((p) => p.topic))}
            >
              {report.plan.every((p) => queued.has(p.topic)) ? '✓ Plan in Autopilot' : 'Approve plan: add all to Autopilot'}
            </button>
          ) : null}
        </div>
        {shorts === null ? (
          <p className="mt-1 text-xs text-text-tertiary">
            Start the{' '}
            <Link to="/agents" className="text-link hover:underline">
              YouTube Shorts Creator
            </Link>{' '}
            to turn this plan into videos in one click.
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="mt-1 text-danger">
            {error}
          </p>
        ) : null}
        <ul className="mt-2 space-y-2">
          {report.plan.map((p, i) => (
            <li key={i} className="rounded-xl border border-border-default bg-input p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                {p.day} {p.time} · {p.platform} · {p.format}
              </p>
              <p className="mt-1 font-semibold">{p.topic}</p>
              {p.hook ? (
                <div className="mt-1 space-y-1">
                  <HookScore concept={p} />
                  <p className="text-text-secondary">“{p.hook}”</p>
                </div>
              ) : null}
              {p.why ? <p className="mt-1 text-xs text-text-tertiary">Why: {p.why}</p> : null}
              {shorts ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" className={btn} disabled={Boolean(busy)} onClick={() => makeShort(p.topic)}>
                    {busy === p.topic ? 'Working…' : 'Make a Short'}
                  </button>
                  <button
                    type="button"
                    className={btn}
                    disabled={Boolean(busy) || queued.has(p.topic)}
                    onClick={() => addToAutopilot(p.topic)}
                  >
                    {queued.has(p.topic) ? '✓ In Autopilot queue' : 'Add to Autopilot'}
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold">3 things to do</h3>
        <ol className="mt-1 list-decimal space-y-1 pl-5 text-text-secondary">
          {report.actions.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ol>
      </div>
    </div>
  )
}
