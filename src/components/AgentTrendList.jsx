import { useState } from 'react'
import useShortsAgent from '../utils/useShortsAgent'
import { HookScore } from './AgentRunViews.jsx'
import { trendSummary } from '../utils/trends'
import AgentMakeShort from './AgentMakeShort.jsx'
import { secondaryButton as btn } from './AgentBits.jsx'

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
  const { shorts, queued, busy, error, ensureShorts, makeShort, addToAutopilot, saveModels, saveConfig } = useShortsAgent()
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
              <AgentMakeShort
                shorts={shorts}
                topic={t.topic}
                busy={busy}
                onStart={makeShort}
                onCancel={() => setConfirming('')}
                saveModels={saveModels}
                saveConfig={saveConfig}
              />
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
