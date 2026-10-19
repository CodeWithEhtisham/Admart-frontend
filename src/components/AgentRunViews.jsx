import { useState } from 'react'
import { formatCredits } from '../utils/credits'
import { dangerButton as dangerBtn, primaryButton as primaryBtn, secondaryButton as secondaryBtn } from './AgentBits.jsx'

const field =
  'w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue'

const BAND_STYLE = {
  STRONG: 'border-success/40 bg-success/15 text-success-text',
  WORKABLE: 'border-warning/60 bg-warning/15 text-text-primary',
  WEAK: 'border-error/40 bg-error/10 text-danger',
}

/** Hook score from the hook formulas checker, e.g. "Hook 74 · strong". */
export function HookScore({ concept }) {
  if (concept.score == null) return null
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 text-xs">
      <span
        title="A quick check of the opening line: specific, talks to you, has stakes and a question. A guide, not a promise."
        className={`rounded-full border px-2 py-0.5 font-semibold ${BAND_STYLE[concept.band] || BAND_STYLE.WORKABLE}`}
      >
        Hook {concept.score} · {(concept.band || '').toLowerCase()}
      </span>
      {concept.formula ? <span className="text-text-tertiary">{concept.formula}</span> : null}
    </span>
  )
}

/** Title tips from the title + thumbnail checker. */
export function TitleCheck({ run }) {
  if (!run.titleCheck?.length) return run.title ? <p className="text-xs text-success-text">✓ Title and thumbnail text look good</p> : null
  return (
    <ul className="space-y-0.5 text-xs text-text-secondary" aria-label="Title tips">
      {run.titleCheck.map((tip) => (
        <li key={tip}>
          <span aria-hidden className="text-warning-text">▲</span> {tip}
        </li>
      ))}
    </ul>
  )
}

export function Research({ research, open = false }) {
  if (!research?.notes) return null
  return (
    <details open={open} className="rounded-xl border border-border-default bg-input px-4 py-3 text-sm">
      <summary className="flex min-h-[32px] cursor-pointer items-center font-medium">Research notes</summary>
      <p className="mt-2 whitespace-pre-line text-text-secondary">{research.notes}</p>
      {research.sources?.length ? (
        <ul className="mt-2 space-y-1 text-xs">
          {research.sources.map((s) => (
            <li key={s.uri}>
              <a href={s.uri} target="_blank" rel="noreferrer noopener" className="text-link hover:underline">
                {s.title || s.uri}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </details>
  )
}

export function ConceptPicker({ run, styles, busy, onContinue, onDiscard }) {
  const [index, setIndex] = useState(0)
  const [hook, setHook] = useState(run.concepts[0]?.hook || '')
  const [style, setStyle] = useState(run.concepts[0]?.style || '')
  const choose = (i) => {
    setIndex(i)
    setHook(run.concepts[i].hook)
    setStyle(run.concepts[i].style)
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">Pick the concept to produce. You can tweak the opening line and style.</p>
      <Research research={run.research} />
      <fieldset className="grid gap-3 md:grid-cols-3">
        <legend className="sr-only">Concepts</legend>
        {run.concepts.map((c, i) => (
          <label
            key={i}
            className={`cursor-pointer rounded-xl border p-4 text-sm transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent-violet ${
              index === i ? 'border-accent-violet bg-accent-violet/10 ai-glow' : 'border-border-default bg-input hover:border-accent-violet/40'
            }`}
          >
            <input type="radio" name={`concept-${run.id}`} checked={index === i} onChange={() => choose(i)} className="sr-only" />
            <span className="block font-semibold">{c.title}</span>
            <span className="mt-2 block">
              <HookScore concept={c} />
            </span>
            <span className="mt-2 block text-text-secondary">“{c.hook}”</span>
            <span className="mt-2 block text-xs text-text-tertiary">{c.angle}</span>
            <span className="mt-2 inline-block rounded-full border border-border-default px-2 py-0.5 text-xs text-text-secondary">
              {styles.find((s) => s.id === c.style)?.label || c.style}
            </span>
          </label>
        ))}
      </fieldset>
      {run.concepts[index]?.fix && run.concepts[index]?.band !== 'STRONG' ? (
        <p className="text-xs text-text-tertiary">Tip for this hook: {run.concepts[index].fix}</p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
        <label className="block text-sm">
          <span className="text-text-tertiary">Opening line (hook)</span>
          <input value={hook} maxLength={200} onChange={(e) => setHook(e.target.value)} className={`mt-1 ${field}`} />
        </label>
        <label className="block text-sm">
          <span className="text-text-tertiary">Visual style</span>
          <select value={style} onChange={(e) => setStyle(e.target.value)} className={`mt-1 ${field}`}>
            {styles.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => onContinue({ index, hook, style })} className={primaryBtn}>
          Write the script →
        </button>
        <button type="button" disabled={busy} onClick={onDiscard} className={dangerBtn}>
          Discard (refund credits)
        </button>
      </div>
    </div>
  )
}

const MIN_SCENES = 3
const MAX_SCENES = 7

export function ScriptEditor({ run, busy, onContinue, onDiscard }) {
  const [title, setTitle] = useState(run.title)
  const [thumb, setThumb] = useState(run.thumbnailText || '')
  const [description, setDescription] = useState(run.description)
  const [tags, setTags] = useState(run.tags.join(', '))
  const [scenes, setScenes] = useState(() =>
    run.scenes.map((s) => ({ narration: s.narration, image_prompt: s.imagePrompt, visual: s.visual, stock_query: s.stockQuery })),
  )
  const setScene = (i, patch) => setScenes((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s)))
  const words = scenes.reduce((n, s) => n + s.narration.split(/\s+/).filter(Boolean).length, 0)
  const valid = scenes.length >= MIN_SCENES && scenes.every((s) => s.narration.trim() && s.image_prompt.trim())

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        Edit anything before the voice and visuals are made. About {words} words ≈ {Math.round(words / 2.6)} seconds.
      </p>
      <label className="block text-sm">
        <span className="text-text-tertiary">Title</span>
        <input value={title} maxLength={90} onChange={(e) => setTitle(e.target.value)} className={`mt-1 ${field}`} />
      </label>
      <label className="block text-sm">
        <span className="text-text-tertiary">Thumbnail text (2-4 words that add to the title)</span>
        <input value={thumb} maxLength={40} onChange={(e) => setThumb(e.target.value)} className={`mt-1 ${field}`} />
      </label>
      <TitleCheck run={run} />
      <ol className="space-y-3">
        {scenes.map((s, i) => (
          <li key={i} className="rounded-xl border border-border-default bg-input p-3">
            <div className="mb-2 flex items-center justify-between text-xs text-text-tertiary">
              <span>Scene {i + 1}</span>
              {scenes.length > MIN_SCENES ? (
                <button type="button" onClick={() => setScenes((p) => p.filter((_, j) => j !== i))} className="text-danger hover:underline">
                  Remove scene
                </button>
              ) : null}
            </div>
            <label className="block text-sm">
              <span className="sr-only">Narration for scene {i + 1}</span>
              <textarea
                rows={2}
                maxLength={400}
                value={s.narration}
                onChange={(e) => setScene(i, { narration: e.target.value })}
                className={`${field} resize-y`}
              />
            </label>
            <div className="mt-2 grid gap-2 sm:grid-cols-[150px_1fr]">
              <label className="block text-xs">
                <span className="text-text-tertiary">Visual</span>
                <select value={s.visual} onChange={(e) => setScene(i, { visual: e.target.value })} className={`mt-1 ${field}`}>
                  <option value="image">AI image</option>
                  <option value="stock">Stock video</option>
                </select>
              </label>
              {s.visual === 'stock' ? (
                <label className="block text-xs">
                  <span className="text-text-tertiary">Stock search (falls back to an AI image)</span>
                  <input
                    value={s.stock_query}
                    maxLength={60}
                    onChange={(e) => setScene(i, { stock_query: e.target.value })}
                    className={`mt-1 ${field}`}
                  />
                </label>
              ) : null}
              <label className={`block text-xs ${s.visual === 'stock' ? 'sm:col-span-2' : ''}`}>
                <span className="text-text-tertiary">Image idea</span>
                <input
                  value={s.image_prompt}
                  maxLength={600}
                  onChange={(e) => setScene(i, { image_prompt: e.target.value })}
                  className={`mt-1 ${field}`}
                />
              </label>
            </div>
          </li>
        ))}
      </ol>
      {scenes.length < MAX_SCENES ? (
        <button
          type="button"
          onClick={() => setScenes((p) => [...p, { narration: '', image_prompt: '', visual: 'image', stock_query: '' }])}
          className={secondaryBtn}
        >
          + Add scene
        </button>
      ) : null}
      <label className="block text-sm">
        <span className="text-text-tertiary">Description</span>
        <textarea rows={3} maxLength={4900} value={description} onChange={(e) => setDescription(e.target.value)} className={`mt-1 ${field}`} />
      </label>
      <label className="block text-sm">
        <span className="text-text-tertiary">Tags (comma separated)</span>
        <input value={tags} maxLength={500} onChange={(e) => setTags(e.target.value)} className={`mt-1 ${field}`} />
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || !valid}
          onClick={() => onContinue({ title, thumbnail_text: thumb, description, tags: tags.split(','), scenes })}
          className={primaryBtn}
        >
          Approve script → make voice &amp; visuals
        </button>
        <button type="button" disabled={busy} onClick={onDiscard} className={dangerBtn}>
          Discard (refund credits)
        </button>
      </div>
    </div>
  )
}

export function SceneVisual({ scene }) {
  if (scene.clipUrl) {
    return <video src={scene.clipUrl} muted loop autoPlay playsInline className="aspect-[9/16] w-full rounded-lg bg-black object-cover" />
  }
  if (scene.imageUrl) return <img src={scene.imageUrl} alt="" className="aspect-[9/16] w-full rounded-lg object-cover" />
  return <div className="flex aspect-[9/16] w-full items-center justify-center rounded-lg bg-elevated text-xs text-text-tertiary">Making…</div>
}

function RedoForm({ scene, index, busy, redoCredits, onRegenerate }) {
  const [open, setOpen] = useState(false)
  const [visual, setVisual] = useState(scene.visual === 'stock' || scene.clipUrl ? 'stock' : 'image')
  const [prompt, setPrompt] = useState(scene.imagePrompt)
  const [query, setQuery] = useState(scene.stockQuery)
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs font-medium text-link hover:underline">
        Redo this scene
      </button>
    )
  }
  return (
    <div className="space-y-2 text-xs">
      <select value={visual} onChange={(e) => setVisual(e.target.value)} aria-label={`Visual type for scene ${index + 1}`} className={field}>
        <option value="image">New AI image ({formatCredits(redoCredits)} credits)</option>
        <option value="stock">Different stock video (free)</option>
      </select>
      {visual === 'image' ? (
        <textarea rows={2} value={prompt} onChange={(e) => setPrompt(e.target.value)} aria-label="Image idea" className={field} />
      ) : (
        <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Stock search" className={field} />
      )}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => onRegenerate({ scene: index, visual, prompt, query })}
          className="cursor-pointer rounded-lg ai-gradient px-3 py-1.5 font-semibold text-white disabled:opacity-50"
        >
          Redo
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-border-default px-3 py-1.5 text-text-secondary">
          Cancel
        </button>
      </div>
    </div>
  )
}

export function Storyboard({ run, busy, redoCredits, onContinue, onRegenerate, onDiscard }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        Check every scene before the final edit. Redo any picture or clip you don't like.
      </p>
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {run.scenes.map((s, i) => (
          <li key={i} className="space-y-2 rounded-xl border border-border-default bg-input p-2">
            <SceneVisual scene={s} />
            <p className="text-xs">{s.narration}</p>
            {s.audioUrl ? <audio src={s.audioUrl} controls className="h-8 w-full" aria-label={`Voice for scene ${i + 1}`} /> : null}
            {s.credit?.by ? <p className="text-[11px] text-text-tertiary">Video: {s.credit.by} / Pexels</p> : null}
            <RedoForm scene={s} index={i} busy={busy} redoCredits={redoCredits} onRegenerate={onRegenerate} />
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => onContinue({})} className={primaryBtn}>
          Looks good → edit the video
        </button>
        <button type="button" disabled={busy} onClick={onDiscard} className={dangerBtn}>
          Discard
        </button>
      </div>
    </div>
  )
}

export function FinalReview({ run, busy, onApprove, onDiscard }) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row">
      <video
        src={run.videoUrl}
        poster={run.thumbnailUrl || undefined}
        controls
        playsInline
        className="aspect-[9/16] w-full max-w-[320px] shrink-0 self-center rounded-2xl bg-black object-contain shadow-2xl shadow-black/40 sm:w-[300px] sm:self-start"
      />
      <div className="min-w-0 flex-1 space-y-2 text-sm">
        <p className="font-heading text-lg font-semibold">{run.title}</p>
        <p className="whitespace-pre-line text-text-secondary">{run.description}</p>
        {run.tags.length ? <p className="text-xs text-text-tertiary">Tags: {run.tags.join(', ')}</p> : null}
        {run.checks.length ? (
          <ul className="space-y-0.5 text-xs text-success-text" aria-label="Quality checks">
            {run.checks.map((c) => (
              <li key={c}>✓ {c}</li>
            ))}
          </ul>
        ) : null}
        <p className="text-xs text-text-tertiary">{run.music ? `Music: ${run.music}` : 'No background music'}</p>
        {run.thumbnailUrl ? (
          <a href={run.thumbnailUrl} target="_blank" rel="noreferrer" className="inline-block text-xs text-link hover:underline">
            View thumbnail
          </a>
        ) : null}
        {run.status === 'needs_review' ? (
          <div className="flex flex-wrap gap-2 pt-2">
            <button type="button" onClick={onApprove} disabled={busy} className={primaryBtn}>
              Approve &amp; publish…
            </button>
            <button type="button" onClick={onDiscard} disabled={busy} className={dangerBtn}>
              Discard
            </button>
          </div>
        ) : (
          <p className="pt-2 text-xs text-text-tertiary">Saved in your Library.</p>
        )}
      </div>
    </div>
  )
}

export function ScriptView({ run }) {
  const text = [
    run.title,
    '',
    ...run.scenes.map((s, i) => `${i + 1}. ${s.narration}\n   Image: ${s.imagePrompt}`),
    '',
    run.description,
    run.tags.length ? `Tags: ${run.tags.join(', ')}` : '',
  ].join('\n')
  return (
    <div className="space-y-3 text-sm">
      <p className="font-heading text-[1rem] font-semibold">{run.title}</p>
      {run.thumbnailText ? <p className="text-xs text-text-tertiary">Thumbnail text: {run.thumbnailText}</p> : null}
      <TitleCheck run={run} />
      <ol className="space-y-2">
        {run.scenes.map((s, i) => (
          <li key={i} className="rounded-xl border border-border-default bg-input px-3 py-2">
            <p>{s.narration}</p>
            {s.imagePrompt ? <p className="mt-1 text-xs text-text-tertiary">Image: {s.imagePrompt}</p> : null}
          </li>
        ))}
      </ol>
      <p className="text-text-secondary">{run.description}</p>
      {run.tags.length ? <p className="text-xs text-text-tertiary">Tags: {run.tags.join(', ')}</p> : null}
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(text)}
        className={secondaryBtn}
      >
        Copy script
      </button>
    </div>
  )
}
