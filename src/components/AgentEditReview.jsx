import { useMemo, useState } from 'react'

const REASONS = {
  pause: ['Pause', 'bg-slate-400/20 decoration-slate-400'],
  filler: ['Um/uh', 'bg-amber-500/20 decoration-amber-500'],
  retake: ['Restart', 'bg-fuchsia-500/20 decoration-fuchsia-500'],
  'black frames': ['Black frames', 'bg-red-500/20 decoration-red-500'],
  'frozen frames': ['Frozen frames', 'bg-red-500/20 decoration-red-500'],
  manual: ['Your cut', 'bg-sky-500/20 decoration-sky-500'],
}
const btn = 'rounded-lg border border-border-default px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary'
const primaryBtn = 'rounded-xl gradient-bg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50'
const field =
  'rounded-lg border border-border-default bg-input px-2 py-1 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue'

const seconds = (n) => `${n.toFixed(1)}s`
const inside = (w, c) => (w.start + w.end) / 2 >= c.start && (w.start + w.end) / 2 <= c.end

/** The transcript with the planned cuts struck through: keep or add cuts, fix caption spelling. */
export default function AgentEditReview({ run, busy, onContinue, onDiscard }) {
  const words = useMemo(() => run.transcript || [], [run.transcript])
  const [cuts, setCuts] = useState(() => (run.cuts || []).map((c) => ({ ...c })))
  const [edits, setEdits] = useState({})
  const [selected, setSelected] = useState(null) // {word: index} or {cut: index}
  const [draft, setDraft] = useState('')

  // Words and pause-only cuts in time order.
  const items = useMemo(() => {
    const out = words.map((w, index) => ({ kind: 'word', index, at: w.start, cut: cuts.findIndex((c) => inside(w, c)) }))
    cuts.forEach((c, index) => {
      if (!words.some((w) => inside(w, c))) out.push({ kind: 'gap', index, at: c.start })
    })
    return out.sort((a, b) => a.at - b.at)
  }, [words, cuts])

  const removed = cuts.filter((c) => !c.keep).reduce((n, c) => n + c.end - c.start, 0)
  const total = run.sourceSeconds || 0
  const toggleKeep = (i) => setCuts((prev) => prev.map((c, j) => (j === i ? { ...c, keep: !c.keep } : c)))
  const word = selected?.word != null ? words[selected.word] : null
  const wordCut = selected?.word != null ? cuts.findIndex((c) => inside(words[selected.word], c)) : -1

  const select = (item) => {
    if (item.kind === 'gap') return setSelected({ cut: item.index })
    setSelected({ word: item.index })
    setDraft(edits[item.index] ?? words[item.index].word)
  }
  const cutWord = () => setCuts((prev) => [...prev, { start: word.start, end: word.end, reasons: ['manual'], keep: false }])
  const removeCut = (i) => setCuts((prev) => prev.filter((_, j) => j !== i))
  const saveSpelling = () => {
    const text = draft.trim()
    if (text) setEdits((prev) => ({ ...prev, [selected.word]: text }))
  }

  const submit = () =>
    onContinue({
      cuts,
      captions: Object.entries(edits).map(([index, value]) => ({ index: Number(index), word: value })),
    })

  return (
    <div className="space-y-4 text-sm">
      <p className="text-text-secondary">
        Struck-through parts will be cut. Click any word or pause to keep it, cut it or fix its spelling.
      </p>

      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(REASONS).map(([key, [label, cls]]) =>
          cuts.some((c) => c.reasons.includes(key)) ? (
            <span key={key} className={`rounded px-1.5 py-0.5 line-through ${cls}`}>
              {label}
            </span>
          ) : null,
        )}
        <span className="ml-auto font-medium text-text-primary">
          Removes {seconds(removed)}
          {total ? ` of ${seconds(total)}` : ''}
        </span>
      </div>

      <div className="max-h-80 overflow-y-auto rounded-xl border border-border-default bg-input p-3 leading-8" aria-label="Transcript">
        {items.map((item) => {
          const cut = item.kind === 'gap' ? cuts[item.index] : cuts[item.cut]
          const struck = cut && !cut.keep
          const cls = cut ? REASONS[cut.reasons[0]]?.[1] || REASONS.manual[1] : ''
          const isSelected =
            (item.kind === 'word' && selected?.word === item.index) || (item.kind === 'gap' && selected?.cut === item.index)
          return (
            <button
              key={`${item.kind}-${item.index}`}
              type="button"
              onClick={() => select(item)}
              aria-pressed={isSelected}
              className={`mr-1 rounded px-0.5 ${struck ? `line-through decoration-2 ${cls} text-text-tertiary` : cut ? 'underline decoration-dotted' : ''} ${isSelected ? 'ring-2 ring-accent-blue' : ''}`}
            >
              {item.kind === 'gap' ? `⏸ ${seconds(cut.end - cut.start)}` : edits[item.index] ?? words[item.index].word}
            </button>
          )
        })}
        {!items.length ? <span className="text-text-tertiary">No speech was found, so only pauses and frames are checked.</span> : null}
      </div>

      {selected ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-accent-blue/40 bg-accent-blue/5 p-3">
          {selected.cut != null ? (
            <>
              <span>
                {REASONS[cuts[selected.cut].reasons[0]]?.[0] || 'Cut'} · {seconds(cuts[selected.cut].end - cuts[selected.cut].start)}
              </span>
              <button type="button" className={btn} onClick={() => toggleKeep(selected.cut)}>
                {cuts[selected.cut].keep ? 'Cut it' : 'Keep it'}
              </button>
            </>
          ) : (
            <>
              <span className="font-medium">“{words[selected.word].word}”</span>
              {wordCut >= 0 && cuts[wordCut].reasons.includes('manual') ? (
                <button type="button" className={btn} onClick={() => removeCut(wordCut)}>
                  Undo cut
                </button>
              ) : wordCut >= 0 ? (
                <button type="button" className={btn} onClick={() => toggleKeep(wordCut)}>
                  {cuts[wordCut].keep ? 'Cut it' : `Keep this ${(REASONS[cuts[wordCut].reasons[0]]?.[0] || 'part').toLowerCase()}`}
                </button>
              ) : (
                <button type="button" className={btn} onClick={cutWord}>
                  Cut this word
                </button>
              )}
              <label className="flex items-center gap-1.5 text-xs text-text-tertiary">
                Caption spelling
                <input value={draft} maxLength={40} onChange={(e) => setDraft(e.target.value)} className={field} />
              </label>
              <button type="button" className={btn} onClick={saveSpelling}>
                Save spelling
              </button>
            </>
          )}
          <button type="button" className="ml-auto text-xs text-text-tertiary hover:text-text-primary" onClick={() => setSelected(null)}>
            Close
          </button>
        </div>
      ) : null}

      {run.captionFixes?.length ? (
        <div>
          <p className="font-medium">Caption spelling fixed by the AI</p>
          <ul className="mt-1 flex flex-wrap gap-2 text-xs">
            {run.captionFixes.map((fix) => {
              const undone = edits[fix.index] === fix.from
              return (
                <li key={fix.index} className="rounded-lg border border-border-default px-2 py-1">
                  {fix.from} → <span className="font-semibold">{undone ? fix.from : fix.to}</span>{' '}
                  <button
                    type="button"
                    className="ml-1 text-link hover:underline"
                    onClick={() =>
                      setEdits((prev) => {
                        const next = { ...prev }
                        if (undone) delete next[fix.index]
                        else next[fix.index] = fix.from
                        return next
                      })
                    }
                  >
                    {undone ? 'Redo' : 'Undo'}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      {run.audioCleanUrl ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-xs text-text-tertiary">
            Original sound
            <audio src={run.audioUrl} controls className="mt-1 h-8 w-full" />
          </label>
          <label className="text-xs text-text-tertiary">
            Cleaned sound
            <audio src={run.audioCleanUrl} controls className="mt-1 h-8 w-full" />
          </label>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={submit} className={primaryBtn}>
          Looks good → make the video
        </button>
        <button type="button" disabled={busy} onClick={() => setCuts((prev) => prev.map((c) => ({ ...c, keep: true })))} className={btn}>
          Keep everything
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onDiscard}
          className="rounded-xl border border-error/50 px-4 py-2 text-sm font-medium text-danger hover:bg-error/10 disabled:opacity-50"
        >
          Discard
        </button>
      </div>
    </div>
  )
}
