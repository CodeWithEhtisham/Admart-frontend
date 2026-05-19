import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import VidifySidebar from '../components/VidifySidebar.jsx'

const INITIAL_COLORS = [
  { hex: '#2563eb', role: 'Primary' },
  { hex: '#7c3aed', role: 'Secondary' },
  { hex: '#10b981', role: 'Accent' },
  { hex: '#f4f4f5', role: 'Light' },
  { hex: '#09090b', role: 'Dark' },
]

const HEADING_FONTS = ['Syne', 'Inter', 'DM Sans', 'Playfair', 'Montserrat']
const BODY_FONTS = ['DM Sans', 'Inter', 'Roboto', 'Nunito']

const TONE_PRESETS = [
  { id: 'professional', icon: '💼', label: 'Professional', text: 'Communicate with authority and expertise. Use clear, concise language that builds trust and credibility. Maintain a polished, industry-standard tone in every piece of content.' },
  { id: 'casual', icon: '😊', label: 'Casual & Friendly', text: 'Keep things relaxed and approachable! Use everyday language, contractions, and a warm conversational style that makes your audience feel like they\'re chatting with a friend.' },
  { id: 'bold', icon: '⚡', label: 'Bold & Direct', text: 'Get straight to the point. No fluff, no filler. Use punchy, confident language that commands attention and drives action immediately.' },
  { id: 'fun', icon: '🎉', label: 'Fun & Playful', text: 'Bring the energy! Use humor, wordplay, and an upbeat vibe. Make your audience smile while delivering your message with enthusiasm and creativity.' },
  { id: 'premium', icon: '✨', label: 'Premium & Luxury', text: 'Evoke exclusivity and sophistication. Use refined, elegant language that positions your brand as aspirational and high-end. Every word should feel curated.' },
  { id: 'custom', icon: '✏️', label: 'Custom' },
]

const ASPECT_OPTIONS = ['16:9', '9:16', '1:1', '4:5']
const STYLE_OPTIONS = ['Cinematic', 'Minimal', 'Bold', 'Neon']
const VOICE_OPTIONS = ['Auto', 'Neutral', 'Warm', 'Energetic']
const WATERMARK_OPTIONS = ['Bottom Right', 'Bottom Left', 'Top Right', 'None']

export default function BrandKitPage() {
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)
  const [selectedColor, setSelectedColor] = useState(0)
  const [colors, setColors] = useState(INITIAL_COLORS)
  const [headingFont, setHeadingFont] = useState('Syne')
  const [bodyFont, setBodyFont] = useState('DM Sans')
  const [selectedTone, setSelectedTone] = useState('professional')
  const [toneText, setToneText] = useState(TONE_PRESETS[0].text)
  const [genAspect, setGenAspect] = useState('16:9')
  const [genStyle, setGenStyle] = useState('Cinematic')
  const [genVoice, setGenVoice] = useState('Auto')
  const [genWatermark, setGenWatermark] = useState('Bottom Right')

  const showToast = useCallback((msg) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2400)
  }, [])

  const handleToneSelect = (preset) => {
    setSelectedTone(preset.id)
    if (preset.text) setToneText(preset.text)
  }

  const handleColorHexChange = (hex) => {
    setColors((prev) =>
      prev.map((c, i) => (i === selectedColor ? { ...c, hex } : c))
    )
  }

  const handleAddColor = () => {
    if (colors.length >= 8) return
    const newColor = { hex: '#6366f1', role: `Color ${colors.length + 1}` }
    setColors((prev) => [...prev, newColor])
    setSelectedColor(colors.length)
  }

  const handleSave = () => {
    showToast('✅ Brand Kit saved successfully!')
  }

  return (
    <div className="min-h-screen bg-base font-body text-text-primary">
      <VidifySidebar />
      <div className="ml-[260px] flex min-h-screen flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-[60px] shrink-0 items-center justify-between gap-4 border-b border-border bg-panel/90 px-7 backdrop-blur-md">
          <div>
            <h1 className="font-heading text-lg font-bold text-text-primary">Brand Kit</h1>
            <p className="text-xs text-text-tertiary">Auto-applied to every generated video</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-blue/20 hover:opacity-90"
            >
              Save Brand Kit
            </button>
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold text-white gradient-bg"
              aria-hidden
            >
              E
            </div>
          </div>
        </header>

        {toast && (
          <div
            role="status"
            className="animate-slide-up fixed bottom-8 right-8 z-[60] rounded-xl border border-border-default bg-elevated px-4 py-3 text-sm text-text-primary shadow-xl"
          >
            {toast}
          </div>
        )}

        {/* Split Layout */}
        <div className="flex min-h-0 flex-1">
          {/* Editor Area */}
          <div className="flex-1 overflow-y-auto p-7 space-y-6">

            {/* 1. Logo Assets */}
            <section className="rounded-2xl border border-border-default bg-surface p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-blue/15">
                  <span className="text-lg">🎨</span>
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-text-primary">Logo Assets</h2>
                  <p className="text-xs text-text-tertiary">Upload your brand logos for video overlays</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Slot 1: Filled */}
                <div className="group relative flex aspect-video items-center justify-center rounded-xl border border-accent-blue/30 bg-panel overflow-hidden">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent-blue to-accent-violet">
                      <span className="font-heading text-lg font-bold text-white">V</span>
                    </div>
                    <span className="font-heading text-lg font-bold text-text-primary">Vidify</span>
                  </div>
                  <button
                    type="button"
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-base/80 text-text-secondary opacity-0 transition group-hover:opacity-100 hover:text-error"
                  >
                    ×
                  </button>
                  <span className="absolute bottom-2 left-2 rounded-md bg-base/70 px-2 py-0.5 text-[10px] font-medium text-text-secondary backdrop-blur-sm">
                    Primary Logo
                  </span>
                </div>

                {/* Slot 2: Empty */}
                <div className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-default bg-panel transition hover:border-accent-blue/40">
                  <span className="text-2xl text-text-muted">+</span>
                  <span className="mt-1 text-xs font-medium text-text-secondary">Icon / Mark</span>
                  <span className="text-[10px] text-text-muted">Square format</span>
                </div>

                {/* Slot 3: Empty */}
                <div className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-default bg-panel transition hover:border-accent-blue/40">
                  <span className="text-2xl text-text-muted">+</span>
                  <span className="mt-1 text-xs font-medium text-text-secondary">Watermark</span>
                  <span className="text-[10px] text-text-muted">Transparent PNG</span>
                </div>
              </div>

              <p className="mt-3 text-xs text-text-muted">
                PNG, SVG, WebP · Max 5MB · Transparent background recommended
              </p>
            </section>

            {/* 2. Color Palette */}
            <section className="rounded-2xl border border-border-default bg-surface p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-violet/15">
                  <span className="text-lg">🎨</span>
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-text-primary">Color Palette</h2>
                  <p className="text-xs text-text-tertiary">Define your brand colors for consistent visuals</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {colors.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedColor(i)}
                    className="group flex flex-col items-center gap-1.5"
                  >
                    <div
                      className={`h-12 w-12 rounded-xl border-2 transition ${
                        selectedColor === i
                          ? 'border-white shadow-lg scale-110'
                          : 'border-transparent hover:border-white/20'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[10px] text-text-tertiary">{c.role}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-border-default text-text-muted transition hover:border-accent-blue/40 hover:text-text-secondary"
                >
                  +
                </button>
              </div>

              {/* Selected Color Editor */}
              <div className="mt-5 flex items-center gap-4 rounded-xl border border-border-default bg-panel p-4">
                <div
                  className="h-10 w-10 shrink-0 rounded-lg"
                  style={{ backgroundColor: colors[selectedColor].hex }}
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-muted">#</span>
                  <input
                    value={colors[selectedColor].hex.replace('#', '')}
                    onChange={(e) => handleColorHexChange(`#${e.target.value.replace('#', '')}`)}
                    maxLength={6}
                    className="w-24 rounded-lg border border-border-default bg-input px-2.5 py-1.5 font-mono text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  />
                </div>
                <span className="rounded-lg border border-border-default bg-elevated px-2.5 py-1.5 text-xs font-medium text-text-secondary">
                  {colors[selectedColor].role}
                </span>
              </div>
            </section>

            {/* 3. Typography */}
            <section className="rounded-2xl border border-border-default bg-surface p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/15">
                  <span className="text-lg font-bold text-success">Aa</span>
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-text-primary">Typography</h2>
                  <p className="text-xs text-text-tertiary">Choose fonts for headings and body text</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Heading Font */}
                <div className="rounded-xl border border-border-default bg-panel p-4">
                  <p
                    className="text-xl font-bold text-text-primary"
                    style={{ fontFamily: headingFont }}
                  >
                    The quick brown fox
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary">{headingFont} — Bold</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {HEADING_FONTS.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setHeadingFont(f)}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                          headingFont === f
                            ? 'bg-accent-blue text-white shadow-md shadow-accent-blue/20'
                            : 'border border-border-default bg-elevated text-text-secondary hover:text-text-primary'
                        }`}
                        style={{ fontFamily: f }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Body Font */}
                <div className="rounded-xl border border-border-default bg-panel p-4">
                  <p
                    className="text-sm text-text-primary"
                    style={{ fontFamily: bodyFont }}
                  >
                    Vidify makes AI video creation simple and powerful.
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary">{bodyFont} — Regular</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {BODY_FONTS.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setBodyFont(f)}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                          bodyFont === f
                            ? 'bg-accent-blue text-white shadow-md shadow-accent-blue/20'
                            : 'border border-border-default bg-elevated text-text-secondary hover:text-text-primary'
                        }`}
                        style={{ fontFamily: f }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Tone of Voice */}
            <section className="rounded-2xl border border-border-default bg-surface p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/15">
                  <span className="text-lg">💬</span>
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-text-primary">Tone of Voice</h2>
                  <p className="text-xs text-text-tertiary">Set the personality of AI-generated scripts</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {TONE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleToneSelect(p)}
                    className={`rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                      selectedTone === p.id
                        ? 'bg-accent-blue text-white shadow-md shadow-accent-blue/20'
                        : 'border border-border-default bg-elevated text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <label className="block text-sm">
                  <span className="text-text-tertiary">Brand Voice Description</span>
                  <textarea
                    rows={4}
                    value={toneText}
                    onChange={(e) => {
                      setToneText(e.target.value)
                      setSelectedTone('custom')
                    }}
                    className="mt-1.5 w-full resize-none rounded-xl border border-border-default bg-input px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  />
                </label>
                <p className="mt-1 text-xs text-text-muted">
                  This description is used by AI to match your brand's voice.
                </p>
              </div>
            </section>

            {/* 5. Default Generation Settings */}
            <section className="rounded-2xl border border-border-default bg-surface p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                  <span className="text-lg">⚙️</span>
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-text-primary">Default Generation Settings</h2>
                  <p className="text-xs text-text-tertiary">Pre-fill settings for new video projects</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-text-tertiary">Default Aspect Ratio</span>
                  <select
                    value={genAspect}
                    onChange={(e) => setGenAspect(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  >
                    {ASPECT_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="text-text-tertiary">Default Style</span>
                  <select
                    value={genStyle}
                    onChange={(e) => setGenStyle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  >
                    {STYLE_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="text-text-tertiary">Default Voiceover</span>
                  <select
                    value={genVoice}
                    onChange={(e) => setGenVoice(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  >
                    {VOICE_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="text-text-tertiary">Watermark Position</span>
                  <select
                    value={genWatermark}
                    onChange={(e) => setGenWatermark(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  >
                    {WATERMARK_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </label>
              </div>
            </section>
          </div>

          {/* Live Preview Panel */}
          <aside className="w-[340px] shrink-0 border-l border-border bg-panel overflow-y-auto">
            <div className="p-5 space-y-5">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-text-muted">Live Preview</h3>

              {/* Brand Score */}
              <div className="rounded-xl border border-success/30 bg-success/5 p-4">
                <div className="flex items-center gap-3">
                  <span className="font-heading text-4xl font-bold text-success">92</span>
                  <div>
                    <p className="font-heading text-sm font-bold text-text-primary">Brand Kit Score</p>
                    <p className="text-xs text-text-tertiary">Strong · 4/5 elements configured</p>
                  </div>
                </div>
              </div>

              {/* Color Preview */}
              <div className="rounded-xl border border-border-default bg-surface p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Colors</p>
                <div className="flex gap-1 overflow-hidden rounded-lg">
                  {colors.map((c, i) => (
                    <div
                      key={i}
                      className="h-8 flex-1"
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Sample Video Thumbnail */}
              <div className="rounded-xl border border-border-default bg-surface overflow-hidden">
                <div className="relative aspect-video bg-gradient-to-br from-accent-blue/30 via-accent-violet/20 to-base">
                  {/* Watermark */}
                  <div className="absolute right-2 bottom-8 flex items-center gap-1 opacity-70">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-accent-blue to-accent-violet">
                      <span className="text-[9px] font-bold text-white">V</span>
                    </div>
                    <span className="text-[9px] font-bold text-white/80">Vidify</span>
                  </div>
                  {/* Caption overlay */}
                  <div className="absolute bottom-2 left-2 right-2 rounded-md bg-base/70 px-2 py-1 backdrop-blur-sm">
                    <p
                      className="text-[10px] font-medium text-text-primary"
                      style={{ fontFamily: bodyFont }}
                    >
                      Summer Product Launch — AI Generated
                    </p>
                  </div>
                </div>
                <div className="p-3">
                  <p
                    className="text-sm font-bold text-text-primary"
                    style={{ fontFamily: headingFont }}
                  >
                    Summer Product Launch
                  </p>
                  <div className="mt-1 flex gap-1.5">
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-medium text-white"
                      style={{ backgroundColor: colors[0]?.hex }}
                    >
                      Brand
                    </span>
                    <span className="rounded-full bg-elevated px-2 py-0.5 text-[9px] text-text-muted">16:9</span>
                    <span className="rounded-full bg-elevated px-2 py-0.5 text-[9px] text-text-muted">Cinematic</span>
                  </div>
                </div>
              </div>

              {/* Typography Preview */}
              <div className="rounded-xl border border-border-default bg-surface p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Typography</p>
                <p
                  className="text-lg font-bold text-text-primary"
                  style={{ fontFamily: headingFont }}
                >
                  Heading Preview
                </p>
                <p
                  className="mt-1 text-sm text-text-secondary"
                  style={{ fontFamily: bodyFont }}
                >
                  Body text preview using your selected brand fonts for consistent visual identity.
                </p>
              </div>

              {/* Apply Button */}
              <button
                type="button"
                onClick={handleSave}
                className="w-full rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet py-3 text-sm font-semibold text-white shadow-lg shadow-accent-blue/20 transition hover:opacity-90"
              >
                ✅ Apply Brand Kit
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
