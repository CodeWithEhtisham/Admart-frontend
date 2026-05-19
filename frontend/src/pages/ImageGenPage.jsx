import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import VidifySidebar from '../components/VidifySidebar.jsx'

const MODELS = [
  { id: 'sdxl', label: 'SDXL', desc: 'Fast · Great quality', cost: 0.5 },
  { id: 'flux', label: 'Flux Pro', desc: 'Best quality · Photorealistic', cost: 1 },
]

const SIZES = [
  { id: '1:1', label: '1:1', sub: 'Feed' },
  { id: '16:9', label: '16:9', sub: 'YouTube' },
  { id: '9:16', label: '9:16', sub: 'TikTok' },
  { id: '4:5', label: '4:5', sub: 'Instagram' },
  { id: 'custom', label: '⊡', sub: 'Custom' },
]

const STYLES = [
  'Photorealistic',
  'Cinematic',
  '3D Render',
  'Illustration',
  'Flat Design',
  'Minimalist',
  'Vintage',
  'Neon Glow',
]

const IMAGE_COUNTS = [1, 2, 3, 4]

const PLACEHOLDER_GRADIENTS = [
  'from-accent-blue/40 to-accent-violet/30',
  'from-accent-violet/40 to-pink-500/30',
  'from-tiktok/30 to-accent-blue/30',
  'from-success/30 to-accent-blue/30',
]

const HISTORY_GRADIENTS = [
  'from-accent-blue/50 to-accent-violet/40',
  'from-warning/40 to-error/30',
  'from-success/40 to-tiktok/30',
  'from-accent-violet/50 to-pink-500/40',
  'from-accent-blue/40 to-tiktok/30',
  'from-error/40 to-warning/30',
  'from-tiktok/40 to-success/30',
  'from-pink-500/40 to-accent-violet/30',
]

export default function ImageGenPage() {
  const navigate = useNavigate()

  const [prompt, setPrompt] = useState('')
  const [negPrompt, setNegPrompt] = useState('')
  const [showNegPrompt, setShowNegPrompt] = useState(false)
  const [selectedModel, setSelectedModel] = useState('flux')
  const [selectedSize, setSelectedSize] = useState('1:1')
  const [selectedStyle, setSelectedStyle] = useState('Photorealistic')
  const [imageCount, setImageCount] = useState(2)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasResults, setHasResults] = useState(false)
  const [results, setResults] = useState([])

  const modelCost = MODELS.find((m) => m.id === selectedModel)?.cost ?? 1
  const totalCredits = imageCount * modelCost

  const handleGenerate = useCallback(() => {
    if (!prompt.trim() || isGenerating) return
    setIsGenerating(true)
    setHasResults(false)
    setResults([])

    setTimeout(() => {
      const generated = Array.from({ length: imageCount }, (_, i) => ({
        id: Date.now() + i,
        prompt: prompt.slice(0, 80),
        gradient: PLACEHOLDER_GRADIENTS[i % PLACEHOLDER_GRADIENTS.length],
      }))
      setResults(generated)
      setHasResults(true)
      setIsGenerating(false)
    }, 2200)
  }, [prompt, imageCount, isGenerating])

  return (
    <div className="min-h-screen bg-base font-body text-text-primary">
      <VidifySidebar />

      <div className="ml-[260px] flex min-h-screen flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between gap-4 border-b border-border bg-panel/90 px-7 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-lg font-bold text-text-primary">AI Image Generator</h1>
            <span className="rounded-full border border-accent-violet/30 bg-accent-violet/15 px-2.5 py-0.5 text-xs font-semibold text-accent-violet">
              ✦ AI Powered
            </span>
          </div>
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold text-white gradient-bg"
            aria-hidden
          >
            E
          </div>
        </header>

        {/* Two-panel layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel */}
          <div className="flex w-[400px] shrink-0 flex-col border-r border-border bg-panel">
            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              {/* Prompt */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Prompt
                </label>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
                    placeholder="Describe the image you want to create... e.g. 'A minimalist product shot of a skincare bottle on white marble with soft golden lighting and bokeh background'"
                    className="min-h-[120px] w-full resize-y rounded-xl border border-border-default bg-input p-3 pb-7 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  />
                  <span className="pointer-events-none absolute bottom-2 right-3 font-mono text-xs text-text-muted">
                    {prompt.length} / 500
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNegPrompt(!showNegPrompt)}
                  className="mt-2 text-xs font-medium text-text-secondary transition hover:text-text-primary"
                >
                  {showNegPrompt ? '▾ Hide negative prompt' : '▸ Add negative prompt'}
                </button>

                {showNegPrompt && (
                  <textarea
                    value={negPrompt}
                    onChange={(e) => setNegPrompt(e.target.value)}
                    placeholder="Things to exclude from the image..."
                    className="mt-2 min-h-[72px] w-full resize-y rounded-xl border border-border-default bg-input p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  />
                )}
              </div>

              {/* Model */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Model
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {MODELS.map((m) => {
                    const active = selectedModel === m.id
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedModel(m.id)}
                        className={`rounded-xl border p-3 text-left transition ${
                          active
                            ? 'border-accent-blue bg-accent-blue/10'
                            : 'border-border-default bg-surface hover:border-white/10'
                        }`}
                      >
                        <p className="text-sm font-semibold text-text-primary">{m.label}</p>
                        <p className="mt-0.5 text-xs text-text-tertiary">{m.desc}</p>
                        <p className="mt-1.5 font-mono text-xs text-accent-blue">{m.cost} cr</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Size / Ratio */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Size / Ratio
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {SIZES.map((s) => {
                    const active = selectedSize === s.id
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedSize(s.id)}
                        className={`rounded-xl border px-2 py-2.5 text-center transition ${
                          active
                            ? 'border-accent-blue bg-accent-blue/10'
                            : 'border-border-default bg-surface hover:border-white/10'
                        }`}
                      >
                        <p className="text-sm font-semibold text-text-primary">{s.label}</p>
                        <p className="mt-0.5 text-[10px] text-text-tertiary">{s.sub}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Style Preset */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Style Preset
                </label>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map((s) => {
                    const active = selectedStyle === s
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedStyle(s)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          active
                            ? 'border-accent-violet/50 bg-accent-violet/15 text-accent-violet'
                            : 'border-border-default bg-surface text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Number of Images */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Number of Images
                </label>
                <div className="flex gap-2">
                  {IMAGE_COUNTS.map((n) => {
                    const active = imageCount === n
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setImageCount(n)}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold transition ${
                          active
                            ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
                            : 'border-border-default bg-surface text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {n}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Sticky bottom */}
            <div className="border-t border-border bg-panel p-4">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet px-5 py-3 text-sm font-bold text-white shadow-lg shadow-accent-violet/20 transition hover:opacity-90 disabled:opacity-50 disabled:shadow-none"
              >
                {isGenerating ? 'Generating...' : '✦ Generate Images'}
              </button>
              <p className="mt-2 text-center font-mono text-xs text-text-tertiary">
                {imageCount} image{imageCount > 1 ? 's' : ''} × {modelCost} credit
                {modelCost !== 1 ? 's' : ''} = {totalCredits} credit{totalCredits !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex flex-1 flex-col overflow-y-auto bg-base p-7">
            <div className="mb-6">
              <h2 className="font-heading text-lg font-semibold text-text-primary">Results</h2>
              <p className="text-sm text-text-tertiary">Enter a prompt and click generate</p>
            </div>

            {/* Empty state */}
            {!isGenerating && !hasResults && (
              <div className="flex flex-1 flex-col items-center justify-center pb-16">
                <div className="text-[64px] opacity-20">🖼️</div>
                <h3 className="mt-4 font-heading text-xl font-semibold text-text-secondary">No images yet</h3>
                <p className="mt-1 text-sm text-text-tertiary">Describe what you want to create...</p>
              </div>
            )}

            {/* Generating spinner placeholders */}
            {isGenerating && (
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: imageCount }).map((_, i) => (
                  <div
                    key={i}
                    className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-border-default bg-surface"
                  >
                    <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-accent-violet/20 border-t-accent-violet" />
                    <p className="mt-3 text-xs text-text-tertiary">Generating...</p>
                  </div>
                ))}
              </div>
            )}

            {/* Results grid */}
            {hasResults && results.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {results.map((img) => (
                    <div key={img.id} className="group relative overflow-hidden rounded-2xl border border-border-default bg-surface">
                      <div className={`aspect-square bg-gradient-to-br ${img.gradient}`} />
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
                        <button
                          type="button"
                          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                        >
                          ↓ Download
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/create')}
                          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                        >
                          → Use in Video
                        </button>
                        <button
                          type="button"
                          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                        >
                          🖼 Set Thumbnail
                        </button>
                      </div>
                      <div className="p-3">
                        <p className="truncate text-xs text-text-secondary">{img.prompt}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Generations */}
                <div className="mt-8">
                  <h3 className="mb-3 text-sm font-semibold text-text-secondary">Recent Generations</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {HISTORY_GRADIENTS.map((g, i) => (
                      <div
                        key={i}
                        className={`h-14 w-14 shrink-0 cursor-pointer rounded-lg bg-gradient-to-br ${g} transition hover:ring-2 hover:ring-accent-blue/50`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
