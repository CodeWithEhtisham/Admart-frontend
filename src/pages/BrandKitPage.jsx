import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Topbar from '../components/Topbar'
import { Glyphs } from '../components/glyphs'
import { Icon } from '../components/icons'
import { uploadImage } from '../utils/imageGeneration'
import { getCachedActiveProject, getProject, PROJECT_CHANGE_EVENT, updateProject } from '../utils/projects'

const INITIAL_COLORS = [
  { hex: '#5b7cfa', role: 'Primary' },
  { hex: '#8b5cf6', role: 'Secondary' },
  { hex: '#10b981', role: 'Accent' },
  { hex: '#f6f7fb', role: 'Light' },
  { hex: '#0a0b10', role: 'Dark' },
]

const HEADING_FONTS = ['Space Grotesk', 'Inter', 'DM Sans', 'Playfair', 'Montserrat']
const BODY_FONTS = ['Inter', 'DM Sans', 'Roboto', 'Nunito']

const TONE_PRESETS = [
  { id: 'professional', icon: Glyphs.briefcase, label: 'Professional', text: 'Communicate with authority and expertise. Use clear, concise language that builds trust and credibility. Maintain a polished, industry-standard tone in every piece of content.' },
  { id: 'casual', icon: Glyphs.smile, label: 'Casual & Friendly', text: 'Keep things relaxed and approachable! Use everyday language, contractions, and a warm conversational style that makes your audience feel like they\'re chatting with a friend.' },
  { id: 'bold', icon: Glyphs.bolt, label: 'Bold & Direct', text: 'Get straight to the point. No fluff, no filler. Use punchy, confident language that commands attention and drives action immediately.' },
  { id: 'fun', icon: Glyphs.sparkles, label: 'Fun & Playful', text: 'Bring the energy! Use humor, wordplay, and an upbeat vibe. Make your audience smile while delivering your message with enthusiasm and creativity.' },
  { id: 'premium', icon: Glyphs.sparkles, label: 'Premium & Luxury', text: 'Evoke exclusivity and sophistication. Use refined, elegant language that positions your brand as aspirational and high-end. Every word should feel curated.' },
  { id: 'custom', icon: Glyphs.pencil, label: 'Custom' },
]

const ASPECT_OPTIONS = ['16:9', '9:16', '1:1', '4:5']
const STYLE_OPTIONS = ['Cinematic', 'Minimal', 'Bold', 'Neon']
const VOICE_OPTIONS = ['Auto', 'Neutral', 'Warm', 'Energetic']
const WATERMARK_OPTIONS = ['Bottom Right', 'Bottom Left', 'Top Right', 'None']
const WATERMARK_POSITION = {
  'Bottom Right': 'right-2 bottom-8',
  'Bottom Left': 'left-2 bottom-8',
  'Top Right': 'right-2 top-2',
}

const HEX = /^#[0-9a-f]{6}$/i
const MAX_LOGO_BYTES = 5 * 1024 * 1024

/** Black or white, whichever reads better on the given #RRGGBB background. */
function textOn(hex) {
  if (!HEX.test(hex || '')) return '#ffffff'
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
  return luminance > 0.179 ? '#000000' : '#ffffff'
}

const DEFAULT_KIT = {
  brandName: '',
  industry: '',
  logoUrl: '',
  iconUrl: '',
  watermarkUrl: '',
  colors: INITIAL_COLORS,
  headingFont: 'Space Grotesk',
  bodyFont: 'Inter',
  tone: 'professional',
  toneText: TONE_PRESETS[0].text,
  defaults: { aspect: '16:9', style: 'Cinematic', voice: 'Auto', watermark: 'Bottom Right' },
}

/** The project's saved brand kit, with page defaults for anything never saved. */
function kitFromProject(project) {
  const k = project?.brandKit || {}
  return {
    ...DEFAULT_KIT,
    brandName: k.brandName || '',
    industry: k.industry || '',
    logoUrl: k.logoUrl || '',
    iconUrl: k.iconUrl || '',
    watermarkUrl: k.watermarkUrl || '',
    colors: k.colors?.length ? k.colors : DEFAULT_KIT.colors,
    headingFont: k.headingFont || DEFAULT_KIT.headingFont,
    bodyFont: k.bodyFont || DEFAULT_KIT.bodyFont,
    tone: k.tone || DEFAULT_KIT.tone,
    toneText: k.toneText ?? DEFAULT_KIT.toneText,
    defaults: { ...DEFAULT_KIT.defaults, ...(k.defaults || {}) },
  }
}

function LogoSlot({ label, hint, url, busy, onPick, onRemove }) {
  const inputRef = useRef(null)
  return (
    <div className="group relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-border-default bg-panel">
      {url ? (
        <>
          <img src={url} alt={label} className="max-h-[70%] max-w-[80%] object-contain" />
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${label}`}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-base/80 text-text-secondary hover:text-danger"
          >
            ×
          </button>
          <span className="absolute bottom-2 left-2 rounded-md bg-base/70 px-2 py-0.5 text-[11px] font-medium text-text-secondary backdrop-blur-sm">
            {label}
          </span>
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex h-full w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-default transition hover:border-accent-blue/40 disabled:opacity-60"
        >
          <span className="text-2xl text-text-tertiary">+</span>
          <span className="mt-1 text-xs font-medium text-text-secondary">{busy ? 'Uploading…' : label}</span>
          <span className="text-[11px] text-text-tertiary">{hint}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) onPick(file)
        }}
      />
    </div>
  )
}

export default function BrandKitPage() {
  const [project, setProject] = useState(() => getCachedActiveProject())
  const [kit, setKit] = useState(DEFAULT_KIT)
  const [savedJson, setSavedJson] = useState(JSON.stringify(DEFAULT_KIT))
  const [loading, setLoading] = useState(Boolean(getCachedActiveProject()))
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState('')
  const [selectedColor, setSelectedColor] = useState(0)

  const set = (patch) => setKit((prev) => ({ ...prev, ...patch }))
  const setDefault = (key, value) => setKit((prev) => ({ ...prev, defaults: { ...prev.defaults, [key]: value } }))

  const load = useCallback(async () => {
    const active = getCachedActiveProject()
    setProject(active)
    setStatus('')
    setError('')
    if (!active?.id) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const fresh = await getProject(active.id)
      const next = kitFromProject(fresh)
      setProject(fresh)
      setKit(next)
      setSavedJson(JSON.stringify(next))
      setSelectedColor(0)
    } catch {
      setError('Could not load the brand kit. Refresh to try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    window.addEventListener(PROJECT_CHANGE_EVENT, load)
    return () => window.removeEventListener(PROJECT_CHANGE_EVENT, load)
  }, [load])

  const dirty = JSON.stringify(kit) !== savedJson
  const badHex = kit.colors.some((c) => !HEX.test(c.hex))

  const save = async () => {
    if (!project?.id || badHex) return
    setSaving(true)
    setError('')
    setStatus('')
    try {
      const { logoUrl, iconUrl, watermarkUrl, colors, headingFont, bodyFont, tone, toneText, defaults } = kit
      await updateProject(project.id, {
        brand_name: kit.brandName.trim(),
        brand_industry: kit.industry.trim(),
        brand_color_hex: colors[0].hex,
        brand_logo_url: logoUrl || null,
        brand_settings: { colors, headingFont, bodyFont, tone, toneText, defaults, iconUrl, watermarkUrl },
      })
      setSavedJson(JSON.stringify(kit))
      setStatus('Saved')
    } catch (err) {
      const data = err.response?.data
      const detail = data && typeof data === 'object' ? Object.values(data).flat()[0] : ''
      setError(typeof detail === 'string' && detail ? detail : 'Could not save the brand kit.')
    } finally {
      setSaving(false)
    }
  }

  const uploadLogo = async (key, file) => {
    if (!project?.id) return
    if (file.size > MAX_LOGO_BYTES) {
      setError('Logos must be PNG, JPG or WebP under 5 MB.')
      return
    }
    setUploading(key)
    setError('')
    try {
      const { url } = await uploadImage(project.id, file)
      set({ [key]: url })
    } catch (err) {
      setError(err.response?.data?.message || 'Could not upload the image.')
    } finally {
      setUploading('')
    }
  }

  const handleToneSelect = (preset) => {
    set(preset.text ? { tone: preset.id, toneText: preset.text } : { tone: preset.id })
  }

  const handleColorHexChange = (hex) => {
    set({ colors: kit.colors.map((c, i) => (i === selectedColor ? { ...c, hex } : c)) })
  }

  const handleAddColor = () => {
    if (kit.colors.length >= 8) return
    set({ colors: [...kit.colors, { hex: '#6366f1', role: `Color ${kit.colors.length + 1}` }] })
    setSelectedColor(kit.colors.length)
  }

  const handleRemoveColor = () => {
    if (kit.colors.length <= 1) return
    set({ colors: kit.colors.filter((_, i) => i !== selectedColor) })
    setSelectedColor(0)
  }

  const checks = [
    Boolean(kit.brandName.trim()),
    Boolean(kit.logoUrl),
    kit.colors.length >= 2,
    Boolean(kit.toneText.trim()),
    Boolean(kit.watermarkUrl || kit.iconUrl),
  ]
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100)
  const scoreLabel = score >= 80 ? 'Strong' : score >= 60 ? 'Good' : 'Needs work'
  const watermarkSrc = kit.watermarkUrl || kit.logoUrl
  const current = kit.colors[selectedColor] || kit.colors[0]

  if (!loading && !project?.id) {
    return (
      <AppLayout>
        <div className="flex min-h-screen flex-col">
          <Topbar title="Brand Kit" />
          <div id="main-content" role="main" tabIndex={-1} className="p-7">
            <p className="text-sm text-text-secondary">
              A brand kit belongs to a project.{' '}
              <Link to="/onboarding" className="font-medium text-link hover:underline">
                Create a project
              </Link>{' '}
              first.
            </p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex min-h-screen flex-col">
        {/* Topbar */}
        <Topbar title="Brand Kit" />

        {/* Split Layout */}
        <div id="main-content" role="main" tabIndex={-1} className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* Editor Area */}
          <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-7">
            <div className="sticky top-0 z-10 -mx-4 -mt-4 flex flex-wrap items-center gap-3 border-b border-border bg-base/95 px-4 py-3 backdrop-blur sm:-mx-7 sm:-mt-7 sm:px-7">
              <p className="min-w-0 flex-1 text-sm text-text-secondary">
                Brand kit for <span className="font-semibold text-text-primary">{project?.name || '…'}</span>
                <span className="ml-2" role="status">
                  {loading ? 'Loading…' : dirty ? 'Unsaved changes' : status ? '✓ Saved' : ''}
                </span>
              </p>
              <button
                type="button"
                onClick={save}
                disabled={loading || saving || !dirty || badHex}
                className="rounded-xl gradient-bg px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save brand kit'}
              </button>
            </div>

            {error ? (
              <p role="alert" className="rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-danger">
                {error}
              </p>
            ) : null}

            {/* 1. Brand & Logo Assets */}
            <section className="rounded-2xl border border-border-default bg-surface p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-blue/15">
                  <Icon className="h-5 w-5 text-link">{Glyphs.palette}</Icon>
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-text-primary">Brand &amp; Logos</h2>
                  <p className="text-xs text-text-tertiary">Your brand name and logos for video overlays</p>
                </div>
              </div>

              <div className="mb-5 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-text-tertiary">Brand name</span>
                  <input
                    value={kit.brandName}
                    maxLength={255}
                    onChange={(e) => set({ brandName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-text-tertiary">Industry</span>
                  <input
                    value={kit.industry}
                    maxLength={100}
                    onChange={(e) => set({ industry: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[
                  ['logoUrl', 'Primary Logo', 'Wide format'],
                  ['iconUrl', 'Icon / Mark', 'Square format'],
                  ['watermarkUrl', 'Watermark', 'Transparent PNG'],
                ].map(([key, label, hint]) => (
                  <LogoSlot
                    key={key}
                    label={label}
                    hint={hint}
                    url={kit[key]}
                    busy={uploading === key}
                    onPick={(file) => uploadLogo(key, file)}
                    onRemove={() => set({ [key]: '' })}
                  />
                ))}
              </div>

              <p className="mt-3 text-xs text-text-tertiary">
                PNG, JPG or WebP · Max 5 MB · Transparent background recommended
              </p>
            </section>

            {/* 2. Color Palette */}
            <section className="rounded-2xl border border-border-default bg-surface p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-violet/15">
                  <Icon className="h-5 w-5 text-link">{Glyphs.palette}</Icon>
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-text-primary">Color Palette</h2>
                  <p className="text-xs text-text-tertiary">Define your brand colors for consistent visuals</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {kit.colors.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedColor(i)}
                    aria-label={`${c.role} ${c.hex}`}
                    aria-pressed={selectedColor === i}
                    className="group flex flex-col items-center gap-1.5"
                  >
                    <div
                      className={`h-12 w-12 rounded-xl border-2 transition ${
                        selectedColor === i
                          ? 'border-white shadow-lg scale-110'
                          : 'border-transparent hover:border-white/20'
                      }`}
                      style={{ backgroundColor: HEX.test(c.hex) ? c.hex : 'transparent' }}
                    />
                    <span className="text-[11px] text-text-tertiary">{c.role}</span>
                  </button>
                ))}
                {kit.colors.length < 8 ? (
                  <button
                    type="button"
                    onClick={handleAddColor}
                    aria-label="Add color"
                    className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-border-default text-text-tertiary transition hover:border-accent-blue/40 hover:text-text-secondary"
                  >
                    +
                  </button>
                ) : null}
              </div>

              {/* Selected Color Editor */}
              <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl border border-border-default bg-panel p-4">
                <input
                  type="color"
                  aria-label="Pick color"
                  value={HEX.test(current.hex) ? current.hex : '#000000'}
                  onChange={(e) => handleColorHexChange(e.target.value)}
                  className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-tertiary">#</span>
                  <input
                    aria-label="Hex color"
                    value={current.hex.replace('#', '')}
                    onChange={(e) => handleColorHexChange(`#${e.target.value.replace('#', '')}`)}
                    maxLength={6}
                    className="w-24 rounded-lg border border-border-default bg-input px-2.5 py-1.5 font-mono text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  />
                </div>
                <input
                  aria-label="Color name"
                  value={current.role}
                  maxLength={40}
                  onChange={(e) =>
                    set({ colors: kit.colors.map((c, i) => (i === selectedColor ? { ...c, role: e.target.value } : c)) })
                  }
                  className="w-32 rounded-lg border border-border-default bg-input px-2.5 py-1.5 text-xs font-medium text-text-secondary focus:border-accent-blue focus:outline-none"
                />
                {kit.colors.length > 1 ? (
                  <button
                    type="button"
                    onClick={handleRemoveColor}
                    className="ml-auto text-xs font-medium text-danger hover:underline"
                  >
                    Remove color
                  </button>
                ) : null}
              </div>
              {badHex ? (
                <p className="mt-2 text-xs text-danger">Each color needs a 6-digit hex code, like 5b7cfa.</p>
              ) : null}
            </section>

            {/* 3. Typography */}
            <section className="rounded-2xl border border-border-default bg-surface p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/15">
                  <span className="text-lg font-bold text-success-text">Aa</span>
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
                    style={{ fontFamily: kit.headingFont }}
                  >
                    The quick brown fox
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary">{kit.headingFont} — Bold</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {HEADING_FONTS.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => set({ headingFont: f })}
                        aria-pressed={kit.headingFont === f}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                          kit.headingFont === f
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
                    style={{ fontFamily: kit.bodyFont }}
                  >
                    Admart makes AI video creation simple and powerful.
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary">{kit.bodyFont} — Regular</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {BODY_FONTS.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => set({ bodyFont: f })}
                        aria-pressed={kit.bodyFont === f}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                          kit.bodyFont === f
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
                  <Icon className="h-5 w-5 text-link">{Glyphs.message}</Icon>
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
                    aria-pressed={kit.tone === p.id}
                    className={`rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                      kit.tone === p.id
                        ? 'bg-accent-blue text-white shadow-md shadow-accent-blue/20'
                        : 'border border-border-default bg-elevated text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon className="inline-block -mt-0.5 h-4 w-4">{p.icon}</Icon> {p.label}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <label className="block text-sm">
                  <span className="text-text-tertiary">Brand Voice Description</span>
                  <textarea
                    rows={4}
                    maxLength={2000}
                    value={kit.toneText}
                    onChange={(e) => set({ toneText: e.target.value, tone: 'custom' })}
                    className="mt-1.5 w-full resize-none rounded-xl border border-border-default bg-input px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  />
                </label>
                <p className="mt-1 text-xs text-text-tertiary">
                  This description is used by AI to match your brand's voice.
                </p>
              </div>
            </section>

            {/* 5. Default Generation Settings */}
            <section className="rounded-2xl border border-border-default bg-surface p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                  <Icon className="h-5 w-5 text-link">{Glyphs.gear}</Icon>
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-text-primary">Default Generation Settings</h2>
                  <p className="text-xs text-text-tertiary">Pre-fill settings for new video projects</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ['aspect', 'Default Aspect Ratio', ASPECT_OPTIONS],
                  ['style', 'Default Style', STYLE_OPTIONS],
                  ['voice', 'Default Voiceover', VOICE_OPTIONS],
                  ['watermark', 'Watermark Position', WATERMARK_OPTIONS],
                ].map(([key, label, options]) => (
                  <label key={key} className="block text-sm">
                    <span className="text-text-tertiary">{label}</span>
                    <select
                      value={kit.defaults[key]}
                      onChange={(e) => setDefault(key, e.target.value)}
                      className="mt-1 w-full rounded-xl border border-border-default bg-input px-3 py-2.5 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                    >
                      {options.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Live Preview Panel */}
          <aside className="w-full shrink-0 overflow-y-auto border-t border-border bg-panel lg:w-[340px] lg:border-l lg:border-t-0">
            <div className="p-5 space-y-5">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-text-tertiary">Live Preview</h3>

              {/* Brand Score */}
              <div className="rounded-xl border border-success/30 bg-success/5 p-4">
                <div className="flex items-center gap-3">
                  <span className="font-heading text-4xl font-bold text-success-text">{score}</span>
                  <div>
                    <p className="font-heading text-sm font-bold text-text-primary">Brand Kit Score</p>
                    <p className="text-xs text-text-tertiary">
                      {scoreLabel} · {checks.filter(Boolean).length}/{checks.length} elements configured
                    </p>
                  </div>
                </div>
              </div>

              {/* Color Preview */}
              <div className="rounded-xl border border-border-default bg-surface p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Colors</p>
                <div className="flex gap-1 overflow-hidden rounded-lg">
                  {kit.colors.map((c, i) => (
                    <div
                      key={i}
                      className="h-8 flex-1"
                      style={{ backgroundColor: HEX.test(c.hex) ? c.hex : 'transparent' }}
                    />
                  ))}
                </div>
              </div>

              {/* Sample Video Thumbnail */}
              <div className="rounded-xl border border-border-default bg-surface overflow-hidden">
                <div className="relative aspect-video bg-gradient-to-br from-accent-blue/30 via-accent-violet/20 to-base">
                  {/* Watermark */}
                  {kit.defaults.watermark !== 'None' ? (
                    <div className={`absolute flex items-center gap-1 opacity-80 ${WATERMARK_POSITION[kit.defaults.watermark]}`}>
                      {watermarkSrc ? (
                        <img src={watermarkSrc} alt="" className="h-5 max-w-[60px] object-contain" />
                      ) : (
                        <span className="text-[10px] font-bold text-white/90">{kit.brandName || 'Your brand'}</span>
                      )}
                    </div>
                  ) : null}
                  {/* Caption overlay */}
                  <div className="absolute bottom-2 left-2 right-2 rounded-md bg-base/70 px-2 py-1 backdrop-blur-sm">
                    <p
                      className="text-[10px] font-medium text-text-primary"
                      style={{ fontFamily: kit.bodyFont }}
                    >
                      Summer Product Launch — AI Generated
                    </p>
                  </div>
                </div>
                <div className="p-3">
                  <p
                    className="text-sm font-bold text-text-primary"
                    style={{ fontFamily: kit.headingFont }}
                  >
                    Summer Product Launch
                  </p>
                  <div className="mt-1 flex gap-1.5">
                    <span
                      className="rounded-full bg-accent-blue px-2 py-0.5 text-[10px] font-medium"
                      style={
                        HEX.test(kit.colors[0]?.hex)
                          ? { backgroundColor: kit.colors[0].hex, color: textOn(kit.colors[0].hex) }
                          : { color: '#ffffff' }
                      }
                    >
                      {kit.brandName || 'Brand'}
                    </span>
                    <span className="rounded-full bg-elevated px-2 py-0.5 text-[10px] text-text-secondary">{kit.defaults.aspect}</span>
                    <span className="rounded-full bg-elevated px-2 py-0.5 text-[10px] text-text-secondary">{kit.defaults.style}</span>
                  </div>
                </div>
              </div>

              {/* Typography Preview */}
              <div className="rounded-xl border border-border-default bg-surface p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Typography</p>
                <p
                  className="text-lg font-bold text-text-primary"
                  style={{ fontFamily: kit.headingFont }}
                >
                  Heading Preview
                </p>
                <p
                  className="mt-1 text-sm text-text-secondary"
                  style={{ fontFamily: kit.bodyFont }}
                >
                  Body text preview using your selected brand fonts for consistent visual identity.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  )
}
