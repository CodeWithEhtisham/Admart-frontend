import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const PLATFORMS = [
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Short-form vertical video',
    colorClass: 'bg-tiktok',
    icon: (
      <path d="M12.5 2h2.2c.2 1.8 1.4 3.2 3.2 3.4V8c-1.1 0-2.1-.4-2.8-1v5.5c0 2.5-2 4.5-4.5 4.5S6 14.9 6 12.4s2-4.5 4.5-4.5c.4 0 .8 0 1.2.1V2z" />
    ),
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Long-form and Shorts',
    colorClass: 'bg-youtube',
    icon: (
      <path d="M10 7.5v5l4-2.5-4-2.5zm9.5-.5c0-1.5-.2-2.4-.4-3.1-.3-.9-1-1.6-1.9-1.9C15.5 2 12 2 12 2s-3.5 0-4.6.2c-.9.3-1.6 1-1.9 1.9-.2.7-.4 1.6-.4 3.1v1c0 1.5.2 2.4.4 3.1.3.9 1 1.6 1.9 1.9 1.1.2 4.6.2 4.6.2s3.5 0 4.6-.2c.9-.3 1.6-1 1.9-1.9.2-.7.4-1.6.4-3.1v-1z" />
    ),
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Reels & Stories',
    colorClass: 'bg-instagram',
    icon: (
      <path d="M8 3h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V5a2 2 0 012-2zm0 1.5a.5.5 0 00-.5.5v8c0 .3.2.5.5.5h8c.3 0 .5-.2.5-.5V5c0-.3-.2-.5-.5-.5H8zm4 1.8A3.2 3.2 0 1015.2 12 3.2 3.2 0 0012 6.3zm0 1.5a1.7 1.7 0 110 3.4 1.7 1.7 0 010-3.4zm3.5-2.2a.8.8 0 11-.8.8.8.8 0 01.8-.8z" />
    ),
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Feed & Watch',
    colorClass: 'bg-facebook',
    icon: (
      <path d="M13.5 8V6.2c0-.6.1-.9 1-.9h1.5V3h-2c-2.4 0-3.5 1.1-3.5 3.2V8H8v2.6h2.5V21H13V10.6h2.3l.3-2.6H13z" />
    ),
  },
]

const INDUSTRIES = [
  'E-commerce',
  'Digital Agency',
  'Content Creator',
  'Education',
  'SaaS',
  'Real Estate',
  'Food',
  'Other',
]

const PRESET_COLORS = ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

const TEMPLATES = [
  { id: 'product', label: 'Product Ad', chipClass: 'border-accent-blue/40 bg-accent-blue/10 text-accent-blue' },
  { id: 'social', label: 'Social Story', chipClass: 'border-accent-violet/40 bg-accent-violet/10 text-accent-violet' },
  { id: 'tutorial', label: 'Tutorial', chipClass: 'border-success/40 bg-success/10 text-success' },
  { id: 'testimonial', label: 'Testimonial', chipClass: 'border-warning/40 bg-warning/10 text-warning' },
]

function StepCircle({ state, index }) {
  const base =
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300'

  if (state === 'done') {
    return (
      <div
        className={`${base} bg-accent-blue text-white shadow-[0_0_20px_rgba(37,99,235,0.35)]`}
        aria-label={`Step ${index} completed`}
      >
        ✓
      </div>
    )
  }

  if (state === 'active') {
    return (
      <div
        className={`${base} gradient-bg text-white shadow-[0_0_24px_rgba(124,58,237,0.45)] ring-2 ring-accent-violet/60 ring-offset-2 ring-offset-base`}
        aria-current="step"
      >
        {index}
      </div>
    )
  }

  return (
    <div
      className={`${base} bg-elevated text-text-muted`}
      aria-label={`Step ${index} not started`}
    >
      {index}
    </div>
  )
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [connected, setConnected] = useState({
    tiktok: false,
    youtube: false,
    instagram: false,
    facebook: false,
  })
  const [brandName, setBrandName] = useState('')
  const [industry, setIndustry] = useState('')
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [prompt, setPrompt] = useState('')

  const togglePlatform = (id) => {
    setConnected((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const stepState = (n) => {
    if (n < currentStep) return 'done'
    if (n === currentStep) return 'active'
    return 'future'
  }

  const goNext = () => setCurrentStep((s) => Math.min(3, s + 1))
  const goBack = () => setCurrentStep((s) => Math.max(1, s - 1))
  const skip = () => goNext()

  const handleGenerate = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-base font-body text-text-primary">
      <header className="fixed left-0 right-0 top-0 z-50 flex h-[60px] items-center justify-between border-b border-border bg-panel/85 px-6 backdrop-blur-md">
        <Link
          to="/"
          className="font-heading text-lg font-bold tracking-tight text-text-primary"
        >
          <span className="gradient-text animate-float inline-block">Vidify</span>
        </Link>
        <span className="font-mono text-sm text-text-secondary">
          Step {currentStep} of 3
        </span>
      </header>

      <main className="flex min-h-screen flex-col items-center justify-center px-4 pb-16 pt-24">
        <div className="mb-10 flex items-center gap-0">
          {[1, 2, 3].map((n, i) => (
            <div key={n} className="flex items-center">
              <StepCircle state={stepState(n)} index={n} />
              {i < 2 && (
                <div
                  className={`mx-1 h-0.5 w-[80px] rounded-full ${
                    n < currentStep ? 'bg-accent-blue' : 'bg-elevated'
                  }`}
                  aria-hidden
                />
              )}
            </div>
          ))}
        </div>

        <div className="w-full max-w-[640px] animate-slide-up rounded-[20px] border border-border-default bg-panel p-10 shadow-xl shadow-black/20">
          {currentStep === 1 && (
            <div className="space-y-8">
              <div>
                <h1 className="font-heading text-2xl font-bold text-text-primary">
                  Where do you publish?
                </h1>
                <p className="mt-2 text-text-secondary">
                  Connect the platforms you use. You can change this anytime.
                </p>
              </div>

              <ul className="space-y-3">
                {PLATFORMS.map((p) => {
                  const isOn = connected[p.id]
                  return (
                    <li
                      key={p.id}
                      className="flex flex-wrap items-center gap-4 rounded-2xl border border-border-default bg-surface/50 p-4 transition-colors hover:border-border-default/80"
                    >
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${p.colorClass} text-white [&>svg]:h-6 [&>svg]:w-6`}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          {p.icon}
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-heading font-semibold text-text-primary">{p.name}</p>
                        <p className="text-sm text-text-tertiary">{p.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => togglePlatform(p.id)}
                        className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                          isOn
                            ? 'border border-success/30 bg-success/15 text-success'
                            : 'border border-border-default bg-elevated text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {isOn ? '✓ Connected' : 'Connect'}
                      </button>
                    </li>
                  )
                })}
              </ul>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={skip}
                  className="rounded-xl px-5 py-2.5 text-sm font-medium text-text-tertiary hover:text-text-secondary"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-xl bg-accent-blue px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 transition hover:bg-blue-600"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              <div>
                <h1 className="font-heading text-2xl font-bold text-text-primary">
                  Tell us about your brand
                </h1>
                <p className="mt-2 text-text-secondary">
                  We will use this to match tone, pacing, and visuals.
                </p>
              </div>

              <div className="flex justify-center">
                <label className="flex h-36 w-36 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-border-default bg-input transition hover:border-accent-blue/50">
                  <span className="text-2xl text-text-muted">+</span>
                  <span className="mt-1 text-center text-xs text-text-tertiary">Logo upload</span>
                  <input type="file" accept="image/*" className="sr-only" />
                </label>
              </div>

              <div className="space-y-2">
                <label htmlFor="brand-name" className="text-sm font-medium text-text-secondary">
                  Brand name
                </label>
                <input
                  id="brand-name"
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Acme Co."
                  className="w-full rounded-xl border border-border-default bg-input px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="industry" className="text-sm font-medium text-text-secondary">
                  Industry
                </label>
                <select
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-border-default bg-input bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat px-4 py-3 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  }}
                >
                  <option value="">Select industry</option>
                  {INDUSTRIES.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-text-secondary">Brand color</p>
                <div className="flex flex-wrap items-center gap-3">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`h-9 w-9 rounded-full border-2 transition ${
                        selectedColor === c
                          ? 'border-white shadow-lg ring-2 ring-accent-blue/50'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                  <label className="flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-border-default bg-elevated hover:border-accent-violet/50">
                    <span className="sr-only">Custom color</span>
                    <input
                      type="color"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="h-12 w-12 cursor-pointer border-0 bg-transparent p-0"
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-xl border border-border-default bg-elevated px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary"
                >
                  Back
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={skip}
                    className="rounded-xl px-5 py-2.5 text-sm font-medium text-text-tertiary hover:text-text-secondary"
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="rounded-xl bg-accent-blue px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 transition hover:bg-blue-600"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
              <div>
                <h1 className="font-heading text-2xl font-bold text-text-primary">
                  Let&apos;s make something amazing
                </h1>
                <p className="mt-2 text-text-secondary">
                  Describe your first video or pick a template to get started.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="prompt" className="text-sm font-medium text-text-secondary">
                  Prompt
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={5}
                  placeholder="e.g. 15s product showcase for our new sneaker drop..."
                  className="w-full resize-none rounded-xl border border-border-default bg-input px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-violet focus:outline-none focus:ring-1 focus:ring-accent-violet"
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-text-secondary">Templates</p>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        t.chipClass
                      } ${
                        selectedTemplate === t.id
                          ? 'ring-2 ring-white/30'
                          : 'opacity-90 hover:opacity-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                className="gradient-bg relative w-full overflow-hidden rounded-2xl py-4 text-center font-heading text-lg font-bold text-white shadow-[0_0_40px_rgba(37,99,235,0.35)] transition hover:brightness-110"
              >
                ✦ Generate My First Video
              </button>

              <p className="text-center text-sm text-text-tertiary">
                Uses 2 credits · You have 5 free credits remaining
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-xl border border-border-default bg-elevated px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
