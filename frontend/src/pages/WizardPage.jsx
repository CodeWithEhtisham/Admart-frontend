import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const INPUT_TABS = [
  { id: 'text', label: 'Text to Video', icon: '✦' },
  { id: 'image', label: 'Image to Video', icon: '🖼' },
  { id: 'template', label: 'From Template', icon: '◈' },
]

const SUGGESTIONS = [
  'cinematic transitions',
  'slow motion close-ups',
  'text overlays',
  'product showcase',
  'upbeat music',
  'CTA ending',
  'voiceover',
]

const TEMPLATES = [
  'Product Ad',
  'Social Story',
  'Tutorial',
  'Testimonial',
  'Promo',
  'Announcement',
]

const ASPECTS = [
  { id: '9:16', label: '9:16', sub: 'TikTok', icon: '📱' },
  { id: '16:9', label: '16:9', sub: 'YouTube', icon: '🖥' },
  { id: '1:1', label: '1:1', sub: 'Feed', icon: '⬛' },
  { id: '4:5', label: '4:5', sub: 'Instagram', icon: '🖼' },
]

const STYLES = ['Cinematic', 'Minimal', 'Dynamic', 'Corporate', 'Artistic', 'Custom']

const MODELS = [
  { id: 'mochi', name: 'Mochi Fast', credits: 1, speed: 3 },
  { id: 'cog', name: 'CogVideoX Quality', credits: 2, speed: 2 },
  { id: 'wan', name: 'Wan 2.1 Premium', credits: 4, speed: 1 },
]

const PLATFORMS = ['TikTok', 'YouTube', 'Instagram', 'Facebook']

const STEP_LABELS = ['Input', 'Configure', 'Enhance', 'Generate']

function StepProgress({ currentStep }) {
  return (
    <div className="border-b border-border bg-panel px-9 py-5">
      <div className="mx-auto flex max-w-2xl items-center justify-center">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1
          const done = currentStep > stepNum
          const active = currentStep === stepNum
          const future = currentStep < stepNum
          return (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex w-full flex-col items-center gap-2">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-medium font-mono transition-colors ${
                    done
                      ? 'border-accent-blue bg-accent-blue/20 text-text-primary'
                      : active
                        ? 'border-accent-violet bg-accent-violet/15 text-text-primary ring-2 ring-accent-violet/40'
                        : 'border-border-default bg-surface text-text-muted'
                  }`}
                >
                  {done ? '✓' : stepNum}
                </div>
                <span
                  className={`text-center text-[11px] font-semibold uppercase tracking-wide ${
                    active ? 'text-text-primary' : done ? 'text-text-secondary' : 'text-text-muted'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div
                  className={`mx-1 mb-7 h-px w-full min-w-[16px] max-w-[72px] ${
                    done ? 'bg-accent-blue/55' : future ? 'bg-border-default' : 'bg-border-default'
                  }`}
                  aria-hidden
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function WizardPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [inputTab, setInputTab] = useState('text')
  const [prompt, setPrompt] = useState('')
  const [animDirection, setAnimDirection] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  const [selectedAspect, setSelectedAspect] = useState('16:9')
  const [duration, setDuration] = useState(15)
  const [selectedStyle, setSelectedStyle] = useState('Cinematic')
  const [selectedModel, setSelectedModel] = useState('cog')
  const [voiceover, setVoiceover] = useState(false)
  const [bgMusic, setBgMusic] = useState(true)
  const [autoCaptions, setAutoCaptions] = useState(true)

  const [videoTitle, setVideoTitle] = useState('Summer launch — kinetic typography')
  const [platformTab, setPlatformTab] = useState('TikTok')
  const [platformDesc, setPlatformDesc] = useState({
    TikTok: '',
    YouTube: '',
    Instagram: '',
    Facebook: '',
  })
  const [tags, setTags] = useState(['vidify', 'launch', '2026'])
  const [tagInput, setTagInput] = useState('')
  const [thumbChoice, setThumbChoice] = useState(0)

  const modelCredits = MODELS.find((m) => m.id === selectedModel)?.credits ?? 2
  const captionCost = autoCaptions ? 0.5 : 0
  const thumbCost = 0.5
  const totalCredits = modelCredits + captionCost + thumbCost

  const creditsRemaining = 42

  const currentPlatformDesc = platformDesc[platformTab] ?? ''
  const platformCharMax = 500

  const reviewRows = useMemo(
    () => [
      { k: 'Mode', v: INPUT_TABS.find((t) => t.id === inputTab)?.label ?? 'Text to Video' },
      { k: 'Aspect ratio', v: selectedAspect },
      { k: 'Duration', v: `${duration}s` },
      { k: 'Style', v: selectedStyle },
      { k: 'Model', v: MODELS.find((m) => m.id === selectedModel)?.name ?? '' },
      { k: 'Voiceover', v: voiceover ? 'On' : 'Off' },
      { k: 'Background music', v: bgMusic ? 'On' : 'Off' },
      { k: 'Auto captions', v: autoCaptions ? 'On' : 'Off' },
      { k: 'Title', v: videoTitle },
    ],
    [inputTab, selectedAspect, duration, selectedStyle, selectedModel, voiceover, bgMusic, autoCaptions, videoTitle],
  )

  const addTag = () => {
    const t = tagInput.trim()
    if (!t || tags.includes(t)) return
    setTags((prev) => [...prev, t])
    setTagInput('')
  }

  const removeTag = (t) => setTags((prev) => prev.filter((x) => x !== t))

  const durationTicks = [5, 15, 30, 45, 60]

  const sidebarAfter = Math.max(0, creditsRemaining - totalCredits)

  return (
    <div className="flex min-h-screen flex-col bg-base font-body text-text-primary">
      <header className="flex h-[60px] shrink-0 items-center gap-4 border-b border-border bg-panel px-6">
        <Link
          to="/dashboard"
          className="text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          ← Back
        </Link>
        <span className="h-5 w-px bg-border-default" aria-hidden />
        <h1 className="font-heading text-lg font-semibold tracking-tight">Create New Video</h1>
      </header>

      <StepProgress currentStep={currentStep} />

      <div className="flex min-h-0 flex-1">
        <main className="min-h-0 flex-1 overflow-y-auto px-9 py-7">
          <div className="mx-auto max-w-3xl animate-slide-up">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2 border-b border-border pb-1">
                  {INPUT_TABS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setInputTab(t.id)}
                      className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                        inputTab === t.id
                          ? 'bg-surface text-text-primary border border-b-0 border-border-default'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <span className="mr-1.5">{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </div>

                {inputTab === 'text' && (
                  <div className="space-y-4">
                    <h2 className="font-heading text-xl font-semibold">Describe your video</h2>
                    <div className="relative">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value.slice(0, 1000))}
                        placeholder="High-energy product reveal with neon accents, quick cuts, and a confident voiceover…"
                        className="min-h-[180px] w-full resize-y rounded-xl border border-border-default bg-input px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue/40"
                      />
                      <div className="mt-1 flex items-center justify-between text-xs text-text-tertiary font-mono">
                        <span>
                          {prompt.length}/1000
                        </span>
                        <button
                          type="button"
                          className="rounded-lg bg-accent-violet px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-accent-violet/25 transition hover:bg-accent-violet/90"
                        >
                          ✦ Enhance with AI
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() =>
                            setPrompt((p) => (p ? `${p}, ${s}` : s).slice(0, 1000))
                          }
                          className="rounded-full border border-border-default bg-elevated px-3 py-1 text-xs text-text-secondary transition hover:border-accent-blue/40 hover:text-text-primary"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {inputTab === 'image' && (
                  <div className="space-y-4">
                    <h2 className="font-heading text-xl font-semibold">Start from an image</h2>
                    <div className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-default bg-input/80 px-6 py-10 text-center transition hover:border-accent-violet/50 hover:bg-surface">
                      <span className="text-3xl">⬆</span>
                      <p className="mt-2 text-sm text-text-secondary">Drop an image here or click to upload</p>
                      <p className="mt-1 text-xs text-text-muted">PNG, JPG up to 20MB</p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-text-secondary">
                        Animation direction
                      </label>
                      <textarea
                        value={animDirection}
                        onChange={(e) => setAnimDirection(e.target.value)}
                        placeholder="Pan left, subtle zoom, parallax depth…"
                        className="min-h-[100px] w-full resize-y rounded-xl border border-border-default bg-input px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue/40"
                      />
                    </div>
                  </div>
                )}

                {inputTab === 'template' && (
                  <div className="space-y-4">
                    <h2 className="font-heading text-xl font-semibold">Pick a template</h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {TEMPLATES.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setSelectedTemplate(name)}
                          className={`rounded-xl border px-4 py-8 text-center text-sm font-medium transition ${
                            selectedTemplate === name
                              ? 'border-accent-blue bg-accent-blue/10 text-text-primary ring-1 ring-accent-blue/40'
                              : 'border-border-default bg-surface text-text-secondary hover:border-border-default hover:bg-elevated'
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                <section>
                  <h2 className="mb-3 font-heading text-lg font-semibold">Aspect ratio</h2>
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {ASPECTS.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setSelectedAspect(a.id)}
                        className={`rounded-xl border px-3 py-4 text-left transition ${
                          selectedAspect === a.id
                            ? 'border-accent-blue bg-accent-blue/10 ring-1 ring-accent-blue/30'
                            : 'border-border-default bg-surface hover:bg-elevated'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <span>{a.icon}</span>
                          {a.label}
                        </div>
                        <p className="mt-1 text-xs text-text-tertiary">{a.sub}</p>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-heading text-lg font-semibold">Duration</h2>
                    <span className="rounded-md bg-elevated px-2 py-0.5 font-mono text-xs text-text-secondary">
                      {duration}s
                    </span>
                  </div>
                  <div className="rounded-xl border border-border-default bg-surface p-4">
                    <input
                      type="range"
                      min={5}
                      max={60}
                      step={1}
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full accent-accent-blue"
                    />
                    <div className="mt-2 flex justify-between px-1 font-mono text-[10px] text-text-muted">
                      {durationTicks.map((t) => (
                        <span key={t}>{t}s</span>
                      ))}
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="mb-3 font-heading text-lg font-semibold">Visual style</h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {STYLES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedStyle(s)}
                        className={`rounded-xl border px-3 py-4 text-sm font-medium transition ${
                          selectedStyle === s
                            ? 'border-accent-violet bg-accent-violet/10 ring-1 ring-accent-violet/30'
                            : 'border-border-default bg-surface hover:bg-elevated'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="mb-3 font-heading text-lg font-semibold">AI model</h2>
                  <div className="space-y-3">
                    {MODELS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedModel(m.id)}
                        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                          selectedModel === m.id
                            ? 'border-accent-blue bg-accent-blue/10 ring-1 ring-accent-blue/25'
                            : 'border-border-default bg-surface hover:bg-elevated'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{m.name}</div>
                          <div className="mt-1 flex gap-1">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <span
                                key={i}
                                className={`h-1.5 w-1.5 rounded-full ${
                                  i < m.speed ? 'bg-success' : 'bg-border-default'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="font-mono text-sm text-text-secondary">{m.credits} credit{m.credits > 1 ? 's' : ''}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-3 rounded-xl border border-border-default bg-panel p-4">
                  {[
                    { label: 'Voiceover', on: voiceover, set: setVoiceover },
                    { label: 'Background Music', on: bgMusic, set: setBgMusic },
                    { label: 'Auto Captions', on: autoCaptions, set: setAutoCaptions },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">{row.label}</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={row.on}
                        onClick={() => row.set(!row.on)}
                        className={`relative h-7 w-12 rounded-full transition-colors ${
                          row.on ? 'bg-accent-blue' : 'bg-elevated'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                            row.on ? 'translate-x-5' : ''
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </section>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8">
                <section>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h2 className="font-heading text-lg font-semibold">Video title</h2>
                    <button
                      type="button"
                      onClick={() =>
                        setVideoTitle(`Campaign ${Math.floor(Math.random() * 900 + 100)} — auto draft`)
                      }
                      className="rounded-lg border border-border-default bg-elevated px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:text-text-primary"
                    >
                      ↻ Regenerate
                    </button>
                  </div>
                  <input
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="w-full rounded-xl border border-border-default bg-input px-4 py-3 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue/40"
                  />
                </section>

                <section>
                  <h2 className="mb-2 font-heading text-lg font-semibold">Platform descriptions</h2>
                  <div className="mb-2 flex flex-wrap gap-2 border-b border-border pb-2">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPlatformTab(p)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                          platformTab === p
                            ? 'bg-elevated text-text-primary'
                            : 'text-text-tertiary hover:text-text-secondary'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={currentPlatformDesc}
                    onChange={(e) =>
                      setPlatformDesc((d) => ({
                        ...d,
                        [platformTab]: e.target.value.slice(0, platformCharMax),
                      }))
                    }
                    className="min-h-[120px] w-full resize-y rounded-xl border border-border-default bg-input px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue/40"
                    placeholder={`Hook + CTA tuned for ${platformTab}…`}
                  />
                  <p className="mt-1 text-right font-mono text-xs text-text-tertiary">
                    {currentPlatformDesc.length}/{platformCharMax}
                  </p>
                </section>

                <section>
                  <h2 className="mb-2 font-heading text-lg font-semibold">Tags</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-full border border-border-default bg-elevated px-3 py-1 text-xs text-text-secondary"
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => removeTag(t)}
                          className="text-text-muted hover:text-error"
                          aria-label={`Remove ${t}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <span className="inline-flex min-w-[160px] items-center rounded-full border border-dashed border-border-default bg-input/60 px-3 py-1">
                      <input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addTag()
                          }
                        }}
                        placeholder="+ Add tag"
                        aria-label="Add tag"
                        className="min-w-0 flex-1 bg-transparent py-0.5 text-xs text-text-secondary placeholder:text-text-muted focus:outline-none"
                      />
                    </span>
                  </div>
                </section>

                <section>
                  <h2 className="mb-2 font-heading text-lg font-semibold">Thumbnail</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1].map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setThumbChoice(i)}
                        className={`aspect-video rounded-xl border-2 bg-gradient-to-br from-accent-blue/40 to-accent-violet/40 transition ${
                          thumbChoice === i ? 'border-accent-blue ring-2 ring-accent-blue/30' : 'border-transparent ring-1 ring-border-default'
                        }`}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => setThumbChoice(2)}
                      className={`flex aspect-video items-center justify-center rounded-xl border-2 border-dashed text-2xl text-text-muted transition hover:text-text-secondary ${
                        thumbChoice === 2 ? 'border-accent-blue bg-accent-blue/5' : 'border-border-default bg-input'
                      }`}
                    >
                      +
                    </button>
                  </div>
                </section>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-border-default bg-panel p-6 shadow-xl">
                  <h2 className="mb-4 font-heading text-xl font-semibold">Review &amp; generate</h2>
                  <dl className="space-y-3">
                    {reviewRows.map((row) => (
                      <div
                        key={row.k}
                        className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border py-2 last:border-0"
                      >
                        <dt className="text-sm text-text-tertiary">{row.k}</dt>
                        <dd className="text-sm font-medium text-text-primary">{row.v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="rounded-2xl border border-border-default bg-surface p-6">
                  <h3 className="mb-3 text-sm font-semibold text-text-secondary">Cost breakdown</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between text-text-secondary">
                      <span>Video</span>
                      <span className="font-mono">{modelCredits} credits</span>
                    </li>
                    <li className="flex justify-between text-text-secondary">
                      <span>Captions</span>
                      <span className="font-mono">{autoCaptions ? '0.5' : '0'} credits</span>
                    </li>
                    <li className="flex justify-between text-text-secondary">
                      <span>Thumbnail</span>
                      <span className="font-mono">0.5 credits</span>
                    </li>
                    <li className="mt-3 flex justify-between border-t border-border pt-3 font-semibold text-text-primary">
                      <span>Total</span>
                      <span className="font-mono">{totalCredits} credits</span>
                    </li>
                  </ul>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-border-default bg-elevated px-3 py-1 text-xs font-medium text-text-secondary">
                      ~45 seconds
                    </span>
                    <p className="text-sm text-success">You have {creditsRemaining} credits</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <aside className="w-[300px] shrink-0 border-l border-border bg-panel p-6 overflow-y-auto">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-text-muted">
            Current settings
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-text-secondary">
            <li className="flex justify-between gap-2">
              <span className="text-text-tertiary">Mode</span>
              <span className="text-right text-text-primary">{INPUT_TABS.find((t) => t.id === inputTab)?.label}</span>
            </li>
            <li className="flex justify-between gap-2">
              <span className="text-text-tertiary">Ratio</span>
              <span className="text-text-primary">{selectedAspect}</span>
            </li>
            <li className="flex justify-between gap-2">
              <span className="text-text-tertiary">Duration</span>
              <span className="text-text-primary">{duration}s</span>
            </li>
            <li className="flex justify-between gap-2">
              <span className="text-text-tertiary">Style</span>
              <span className="text-text-primary">{selectedStyle}</span>
            </li>
            <li className="flex justify-between gap-2">
              <span className="text-text-tertiary">Model</span>
              <span className="text-right text-text-primary">{MODELS.find((m) => m.id === selectedModel)?.name}</span>
            </li>
            <li className="flex justify-between gap-2">
              <span className="text-text-tertiary">Music</span>
              <span className="text-text-primary">{bgMusic ? 'On' : 'Off'}</span>
            </li>
            <li className="flex justify-between gap-2">
              <span className="text-text-tertiary">Captions</span>
              <span className="text-text-primary">{autoCaptions ? 'On' : 'Off'}</span>
            </li>
          </ul>

          <div className="mt-8 rounded-xl border border-border-default bg-surface p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Cost estimate</p>
            <p className="mt-2 font-heading text-4xl font-bold gradient-text">{totalCredits}</p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-elevated">
              <div
                className="h-full gradient-bg transition-all"
                style={{ width: `${Math.min(100, (totalCredits / creditsRemaining) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-text-tertiary">
              <span className="font-mono text-text-secondary">{sidebarAfter}</span> credits remaining after
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-accent-violet/20 bg-accent-violet/5 p-4 text-xs text-text-secondary leading-relaxed">
            <p className="font-semibold text-text-primary">Tips</p>
            <p className="mt-2">
              Shorter prompts with one clear subject outperform long unstructured lists. Use Enhance with AI to tighten pacing and shot language.
            </p>
          </div>
        </aside>
      </div>

      <footer className="flex h-[68px] shrink-0 items-center justify-between gap-4 border-t border-border bg-panel px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span className="shrink-0 font-mono text-sm text-text-secondary">
            💎 <span className="font-semibold text-text-primary">{totalCredits}</span> credits
          </span>
          <button
            type="button"
            className="truncate text-sm text-text-tertiary underline-offset-2 hover:text-text-secondary"
          >
            Save as Draft
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              className="rounded-lg border border-border-default bg-elevated px-4 py-2 text-sm font-medium text-text-secondary transition hover:text-text-primary"
            >
              Back
            </button>
          )}
          {currentStep < 4 && (
            <button
              type="button"
              onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
              className="rounded-lg bg-accent-blue px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-blue/20 transition hover:bg-accent-blue/90"
            >
              Continue
            </button>
          )}
          {currentStep === 4 && (
            <button
              type="button"
              onClick={() => navigate('/progress')}
              className="rounded-lg bg-accent-violet px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-violet/30 transition hover:bg-accent-violet/90"
            >
              ✦ Generate Video
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}
