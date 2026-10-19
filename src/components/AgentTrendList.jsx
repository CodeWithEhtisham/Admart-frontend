import { useState } from 'react'
import useShortsAgent from '../utils/useShortsAgent'
import { HookScore } from './AgentRunViews.jsx'
import { trendSummary } from '../utils/trends'
import { formatCredits } from '../utils/credits'
import AgentModelSelect from './AgentModelSelect.jsx'
import { primaryButton, secondaryButton as btn } from './AgentBits.jsx'

const MOMENTUM = {
  rising: { label: 'Rising', glyph: '↗', tone: 'bg-success/10 text-success-text' },
  hot: { label: 'Hot', glyph: '', tone: 'bg-warning/10 text-warning-text' },
}

const hostname = (uri) => {
  try {
    return new URL(uri).hostname
  } catch {
    return uri
  }
}

/** Trend Finder results: each trend can start a Short or join the Shorts agent's Autopilot queue. */
export default function AgentTrendList({ run }) {
  const { shorts, queued, busy, error, ensureShorts, makeShort, addToAutopilot, saveModels } = useShortsAgent()
  const [confirming, setConfirming] = useState('')
  const summary = trendSummary(run)

  const toggleShort = async (topic) => {
    if (confirming === topic) return setConfirming('')
    setConfirming(topic)
    if (!(await ensureShorts())) setConfirming('')
  }

  return (
    <div className="space-y-3 text-sm">
      {error ? (
        <p role="alert" className="text-danger">
          {error}
        </p>
      ) : null}
      {summary ? <p className="text-xs text-text-tertiary">{summary}</p> : null}
      <ul className="space-y-3">
        {run.trends.map((t) => (
          <li key={t.topic} className="rounded-xl border border-border-default bg-input p-4 transition-colors duration-200 hover:border-accent-violet/40">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{t.topic}</p>
              {t.category ? (
                <span className="rounded-full border border-border-default px-2 py-0.5 text-xs text-text-secondary">{t.category}</span>
              ) : null}
              {MOMENTUM[t.momentum] ? (
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${MOMENTUM[t.momentum].tone}`}>
                  {MOMENTUM[t.momentum].glyph ? <span aria-hidden="true">{MOMENTUM[t.momentum].glyph} </span> : null}
                  {MOMENTUM[t.momentum].label}
                </span>
              ) : null}
            </div>
            {t.why_now ? <p className="mt-1 text-text-secondary">{t.why_now}</p> : null}
            {t.hook ? (
              <div className="mt-2 space-y-1">
                <HookScore concept={t} />
                <p className="text-text-secondary">“{t.hook}”</p>
              </div>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {shorts !== undefined ? (
                <>
                  <button
                    type="button"
                    className={btn}
                    disabled={Boolean(busy)}
                    aria-expanded={confirming === t.topic}
                    onClick={() => toggleShort(t.topic)}
                  >
                    {busy === t.topic ? 'Working…' : 'Make a Short'}
                  </button>
                  <button
                    type="button"
                    className={btn}
                    disabled={Boolean(busy) || queued.has(t.topic)}
                    onClick={() => addToAutopilot(t.topic)}
                  >
                    {queued.has(t.topic) ? '✓ In Autopilot queue' : 'Add to Autopilot'}
                  </button>
                </>
              ) : null}
              {!t.sources?.length && t.source?.uri ? (
                <a href={t.source.uri} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-link hover:underline">
                  Source: {t.source.title || new URL(t.source.uri).hostname}
                </a>
              ) : null}
            </div>
            {confirming === t.topic && shorts ? (
              <div className="mt-3 space-y-3 rounded-xl border border-accent-violet/40 bg-accent-violet/5 p-3">
                <p className="text-sm font-medium">Make a Short about this</p>
                <AgentModelSelect deployment={shorts} onSave={saveModels} />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className={primaryButton}
                    disabled={Boolean(busy)}
                    onClick={() => makeShort(t.topic)}
                  >
                    {busy === t.topic ? 'Starting…' : 'Start the Short'}
                  </button>
                  <button type="button" className={btn} disabled={Boolean(busy)} onClick={() => setConfirming('')}>
                    Cancel
                  </button>
                  {shorts.estimatedCredits ? (
                    <span className="text-xs text-text-tertiary">
                      About {formatCredits(shorts.estimatedCredits)} credits. Refunded if it fails.
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
            {t.sources?.length ? (
              <div className="mt-3 text-xs">
                <p className="text-text-tertiary">
                  {t.sources.length} source{t.sources.length === 1 ? '' : 's'}
                </p>
                <ul className="mt-1 space-y-1">
                  {t.sources.map((s) => (
                    <li key={s.uri} className="min-w-0 truncate">
                      <a href={s.uri} target="_blank" rel="noreferrer" className="text-link hover:underline">
                        {s.source ? `${s.source}: ` : ''}
                        {s.title || hostname(s.uri)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
