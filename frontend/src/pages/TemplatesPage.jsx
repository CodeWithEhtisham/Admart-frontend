import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const CATEGORIES = [
  { id: 'all', label: 'All Templates', count: 48 },
  { id: 'product', label: 'Product Ads', count: 12 },
  { id: 'social', label: 'Social Stories', count: 8 },
  { id: 'testimonials', label: 'Testimonials', count: 6 },
  { id: 'promos', label: 'Promos', count: 7 },
  { id: 'announcements', label: 'Announcements', count: 5 },
  { id: 'education', label: 'Education', count: 6 },
  { id: 'ecommerce', label: 'E-commerce', count: 4 },
]

const TEMPLATES = [
  {
    id: 't1',
    name: 'Neon Product Reveal',
    category: 'product',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
    icon: '◆',
    uses: 12400,
    rating: 4.9,
    premium: true,
    platforms: ['T', 'Y', 'I', 'F'],
    description:
      'High-impact vertical reveal with kinetic typography and bold product hero shots. Ideal for drops and launches.',
    aspectRatios: '9:16, 1:1, 16:9',
    duration: '15–30s',
    voiceover: 'AI + custom upload',
    music: 'Royalty-free library',
    creditCost: 12,
  },
  {
    id: 't2',
    name: 'Story Stack — Minimal',
    category: 'social',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
    icon: '◇',
    uses: 9800,
    rating: 4.7,
    premium: false,
    platforms: ['T', 'I'],
    description: 'Clean three-beat story layout with swipe-friendly pacing for daily social updates.',
    aspectRatios: '9:16',
    duration: '10–20s',
    voiceover: 'AI only',
    music: 'Lo-fi pack',
    creditCost: 8,
  },
  {
    id: 't3',
    name: 'Customer Love — Quote',
    category: 'testimonials',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    icon: '♥',
    uses: 7600,
    rating: 4.8,
    premium: true,
    platforms: ['Y', 'F', 'I'],
    description: 'Testimonial cards with quote highlights and subtle face-cam framing.',
    aspectRatios: '16:9, 1:1',
    duration: '20–45s',
    voiceover: 'Upload',
    music: 'Cinematic',
    creditCost: 14,
  },
  {
    id: 't4',
    name: 'Flash Sale Countdown',
    category: 'promos',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
    icon: '⏱',
    uses: 15200,
    rating: 4.6,
    premium: false,
    platforms: ['T', 'Y'],
    description: 'Urgency-forward promo with ticking timer overlays and bold price callouts.',
    aspectRatios: '9:16, 4:5',
    duration: '12–24s',
    voiceover: 'AI',
    music: 'EDM hooks',
    creditCost: 9,
  },
  {
    id: 't5',
    name: 'Company Update — CEO',
    category: 'announcements',
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #2563eb 100%)',
    icon: '▸',
    uses: 4100,
    rating: 4.5,
    premium: false,
    platforms: ['Y', 'F', 'I'],
    description: 'Professional podium-style announcement with lower-thirds and brand-safe pacing.',
    aspectRatios: '16:9',
    duration: '30–90s',
    voiceover: 'Upload + AI polish',
    music: 'Corporate',
    creditCost: 10,
  },
  {
    id: 't6',
    name: 'How It Works — 3 Steps',
    category: 'education',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%)',
    icon: '☰',
    uses: 8900,
    rating: 4.8,
    premium: false,
    platforms: ['Y', 'T'],
    description: 'Step-by-step explainer with numbered scenes and icon callouts.',
    aspectRatios: '16:9, 9:16',
    duration: '45–120s',
    voiceover: 'AI',
    music: 'Ambient',
    creditCost: 11,
  },
  {
    id: 't7',
    name: 'Shop the Look — Carousel',
    category: 'ecommerce',
    gradient: 'linear-gradient(135deg, #f97316 0%, #eab308 100%)',
    icon: '▤',
    uses: 6300,
    rating: 4.4,
    premium: true,
    platforms: ['I', 'F', 'T'],
    description: 'Product carousel with SKU tags, price pills, and swipe cues for catalogs.',
    aspectRatios: '4:5, 1:1',
    duration: '15–40s',
    voiceover: 'AI',
    music: 'Pop beats',
    creditCost: 13,
  },
  {
    id: 't8',
    name: 'UGC Selfie — Authentic',
    category: 'social',
    gradient: 'linear-gradient(135deg, #64748b 0%, #1e293b 100%)',
    icon: '◎',
    uses: 11200,
    rating: 4.7,
    premium: false,
    platforms: ['T', 'I'],
    description: 'Handheld energy with jump cuts and native captions for organic reach.',
    aspectRatios: '9:16',
    duration: '12–30s',
    voiceover: 'Upload',
    music: 'Indie',
    creditCost: 7,
  },
  {
    id: 't9',
    name: 'SaaS Demo Walkthrough',
    category: 'product',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    icon: '⊞',
    uses: 5400,
    rating: 4.9,
    premium: true,
    platforms: ['Y', 'F'],
    description: 'Screen-led demo with zoom regions and feature callouts for B2B funnels.',
    aspectRatios: '16:9',
    duration: '60–180s',
    voiceover: 'AI + screen audio',
    music: 'Minimal',
    creditCost: 16,
  },
  {
    id: 't10',
    name: 'Holiday Greeting — Warm',
    category: 'announcements',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #b45309 100%)',
    icon: '✶',
    uses: 3200,
    rating: 4.6,
    premium: false,
    platforms: ['F', 'I', 'Y'],
    description: 'Seasonal greeting template with snowfall/light leaks and family-friendly tone.',
    aspectRatios: '1:1, 16:9',
    duration: '20–40s',
    voiceover: 'AI',
    music: 'Holiday',
    creditCost: 8,
  },
  {
    id: 't11',
    name: 'Before / After Split',
    category: 'testimonials',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    icon: '‖',
    uses: 4700,
    rating: 4.5,
    premium: false,
    platforms: ['T', 'I'],
    description: 'Split-screen transformation stories with draggable reveal interaction hints.',
    aspectRatios: '9:16',
    duration: '15–25s',
    voiceover: 'Upload',
    music: 'Inspirational',
    creditCost: 9,
  },
  {
    id: 't12',
    name: 'Micro-Lesson — Tip',
    category: 'education',
    gradient: 'linear-gradient(135deg, #0d9488 0%, #4f46e5 100%)',
    icon: '✎',
    uses: 6900,
    rating: 4.8,
    premium: true,
    platforms: ['Y', 'T', 'F'],
    description: 'Short lesson format with chapter markers and recap lower-third.',
    aspectRatios: '16:9, 9:16',
    duration: '30–60s',
    voiceover: 'AI',
    music: 'Focus',
    creditCost: 12,
  },
]

const CATEGORY_LABELS = {
  product: 'Product Ads',
  social: 'Social Stories',
  testimonials: 'Testimonials',
  promos: 'Promos',
  announcements: 'Announcements',
  education: 'Education',
  ecommerce: 'E-commerce',
}

function PlatformDots({ letters }) {
  const colors = { T: 'bg-tiktok', Y: 'bg-youtube', I: 'bg-instagram', F: 'bg-facebook' }
  return (
    <div className="flex gap-1">
      {letters.map((L) => (
        <span
          key={L}
          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${colors[L]}`}
        >
          {L}
        </span>
      ))}
    </div>
  )
}

function Stars({ rating }) {
  const n = Math.min(5, Math.max(0, Math.round(rating)))
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < n ? 'text-warning' : 'text-text-muted'}>
          {i < n ? '★' : '☆'}
        </span>
      ))}
    </span>
  )
}

function Sidebar() {
  const location = useLocation()
  const navCls = (path) => {
    const active = location.pathname === path
    return `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      active ? 'bg-accent-blue/15 text-accent-blue' : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
    }`
  }

  return (
    <aside className="fixed bottom-0 left-0 top-0 z-40 flex w-[260px] flex-col border-r border-border bg-panel">
      <div className="flex h-[60px] items-center border-b border-border px-4">
        <Link to="/" className="font-heading text-lg font-bold">
          <span className="gradient-text">V</span>
          <span className="text-text-primary">idify</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Main</p>
          <div className="space-y-1">
            <Link to="/dashboard" className={navCls('/dashboard')} title="Dashboard">
              <span className="text-lg" aria-hidden>
                ◎
              </span>
              <span>Dashboard</span>
            </Link>
            <Link to="/create" className={navCls('/create')} title="Create New">
              <span className="text-lg" aria-hidden>
                ✦
              </span>
              <span>Create New</span>
            </Link>
            <Link to="/library" className={`${navCls('/library')} justify-between`} title="My Videos">
              <span className="flex items-center gap-3">
                <span className="text-lg" aria-hidden>
                  ▤
                </span>
                <span>My Videos</span>
              </span>
              <span className="rounded-full bg-accent-blue/20 px-2 py-0.5 text-xs font-semibold text-accent-blue">18</span>
            </Link>
            <Link to="/templates" className={navCls('/templates')} title="Templates">
              <span className="text-lg" aria-hidden>
                ⧉
              </span>
              <span>Templates</span>
            </Link>
          </div>
        </div>
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Publish</p>
          <div className="space-y-1">
            <Link to="/calendar" className={navCls('/calendar')} title="Calendar">
              <span className="text-lg" aria-hidden>
                ⌁
              </span>
              <span>Calendar</span>
            </Link>
            <Link to="/social" className={navCls('/social')} title="Social Accounts">
              <span className="text-lg" aria-hidden>
                ⚡
              </span>
              <span>Social Accounts</span>
            </Link>
          </div>
        </div>
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Analyze</p>
          <div className="space-y-1">
            <Link to="/analytics" className={navCls('/analytics')} title="Analytics">
              <span className="text-lg" aria-hidden>
                📈
              </span>
              <span>Analytics</span>
            </Link>
          </div>
        </div>
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Settings</p>
          <div className="space-y-1">
            <Link to="/settings" className={navCls('/settings')} title="Brand Kit">
              <span className="text-lg" aria-hidden>
                ◇
              </span>
              <span>Brand Kit</span>
            </Link>
            <Link to="/billing" className={navCls('/billing')} title="Billing">
              <span className="text-lg" aria-hidden>
                ◫
              </span>
              <span>Billing</span>
            </Link>
            <Link to="/settings" className={navCls('/settings')} title="Settings">
              <span className="text-lg" aria-hidden>
                ⚙
              </span>
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </nav>
      <div className="mt-auto border-t border-border p-3">
        <div className="rounded-xl border border-border-default bg-surface p-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-text-secondary">Credits</span>
            <span className="font-mono font-semibold text-text-primary">42</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
            <div className="h-full w-[21%] rounded-full bg-gradient-to-r from-accent-blue to-accent-violet" />
          </div>
          <p className="mt-1 text-xs text-text-tertiary">42 / 200</p>
        </div>
      </div>
    </aside>
  )
}

export default function TemplatesPage() {
  const navigate = useNavigate()
  const [activeCat, setActiveCat] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [sortBy, setSortBy] = useState('popular')

  const filteredTemplates = useMemo(() => {
    let list = [...TEMPLATES]
    if (activeCat !== 'all') {
      list = list.filter((t) => t.category === activeCat)
    }
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (CATEGORY_LABELS[t.category] && CATEGORY_LABELS[t.category].toLowerCase().includes(q))
      )
    }
    if (sortBy === 'popular') list.sort((a, b) => b.uses - a.uses)
    if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating)
    if (sortBy === 'newest') list.sort((a, b) => a.id.localeCompare(b.id))
    return list
  }, [activeCat, searchQuery, sortBy])

  return (
    <div className="min-h-screen bg-base font-body text-text-primary">
      <Sidebar />

      <div className="ml-[260px] min-h-screen">
        <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between gap-4 border-b border-border bg-panel/90 px-7 backdrop-blur-md">
          <h1 className="font-heading text-lg font-bold text-text-primary">Templates Gallery</h1>
          <div className="mx-auto max-w-md flex-1 px-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full rounded-xl border border-border-default bg-input px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
            />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              to="/create"
              className="inline-flex items-center gap-2 rounded-xl gradient-bg px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-blue/20"
            >
              <span aria-hidden>✦</span> New Video
            </Link>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full font-heading text-sm font-bold text-white gradient-bg"
              aria-hidden
            >
              E
            </div>
          </div>
        </header>

        <div className="border-b border-border bg-panel px-7 py-0">
          <div className="-mb-px flex gap-1 overflow-x-auto pb-0">
            {CATEGORIES.map((c) => {
              const active = activeCat === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCat(c.id)}
                  className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${
                    active
                      ? 'border-accent-blue text-text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {c.label}{' '}
                  <span className="text-text-tertiary">({c.count})</span>
                </button>
              )
            })}
          </div>
        </div>

        <main className="space-y-6 p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-text-secondary">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} shown
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort-templates" className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Sort
              </label>
              <select
                id="sort-templates"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-border-default bg-input px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
              >
                <option value="popular">Most popular</option>
                <option value="rating">Highest rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTemplates.map((t) => (
              <article
                key={t.id}
                className="group overflow-hidden rounded-2xl border border-border-default bg-surface transition hover:border-accent-blue/30"
              >
                <div className="relative w-full text-left">
                  <div className="relative aspect-[16/10] overflow-hidden group/thumb" style={{ background: t.gradient }}>
                    <button
                      type="button"
                      className="absolute inset-0 z-0 cursor-pointer"
                      onClick={() => setSelectedTemplate(t)}
                      aria-label={`View details for ${t.name}`}
                    />
                    <span className="pointer-events-none absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 font-heading text-4xl text-white/90">
                      {t.icon}
                    </span>
                    <span className="pointer-events-none absolute left-3 top-3 z-[1] rounded-full border border-white/20 bg-black/40 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
                      {CATEGORY_LABELS[t.category]}
                    </span>
                    {t.premium && (
                      <span className="pointer-events-none absolute right-3 top-3 z-[1] rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black shadow">
                        PRO
                      </span>
                    )}
                    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/0 opacity-0 transition group-hover/thumb:bg-black/40 group-hover/thumb:opacity-100">
                      <Link
                        to="/create"
                        className="pointer-events-none inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-base opacity-0 shadow-lg transition group-hover/thumb:pointer-events-auto group-hover/thumb:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        ✦ Use Template
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  <h3 className="font-heading font-semibold leading-tight">{t.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-tertiary">
                    <span>{t.uses.toLocaleString()} uses</span>
                    <Stars rating={t.rating} />
                  </div>
                  <PlatformDots letters={t.platforms} />
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>

      {selectedTemplate && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="template-modal-title"
        >
          <div className="animate-slide-up flex max-h-[90vh] w-full max-w-[780px] flex-col overflow-hidden rounded-2xl border border-border-default bg-panel shadow-2xl md:flex-row">
            <div className="flex min-h-[280px] flex-1 flex-col border-b border-border-default p-6 md:border-b-0 md:border-r">
              <div
                className="relative flex flex-1 flex-col items-center justify-center rounded-xl p-8"
                style={{ background: selectedTemplate.gradient }}
              >
                <button
                  type="button"
                  className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/20 text-3xl text-white backdrop-blur transition hover:bg-white/30"
                  aria-label="Play preview"
                >
                  ▶
                </button>
                <p className="mt-6 font-heading text-2xl font-bold text-white">{selectedTemplate.icon}</p>
              </div>
              <div className="mt-4 flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-14 flex-1 rounded-lg border border-border-default"
                    style={{
                      background: selectedTemplate.gradient,
                      opacity: 1 - i * 0.15,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex w-full shrink-0 flex-col md:w-[300px]">
              <div className="flex-1 space-y-4 overflow-y-auto p-6">
                <div className="flex items-start justify-between gap-2">
                  <h2 id="template-modal-title" className="font-heading text-xl font-bold leading-tight">
                    {selectedTemplate.name}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setSelectedTemplate(null)}
                    className="rounded-lg p-1 text-text-muted hover:bg-elevated hover:text-text-primary"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                <span className="inline-block rounded-full border border-border-default bg-surface px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                  {CATEGORY_LABELS[selectedTemplate.category]}
                </span>
                <p className="text-sm text-text-secondary">{selectedTemplate.description}</p>
                <dl className="space-y-2 rounded-xl border border-border-default bg-surface p-4 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-text-tertiary">Aspect Ratios</dt>
                    <dd className="text-right font-medium text-text-primary">{selectedTemplate.aspectRatios}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-text-tertiary">Duration</dt>
                    <dd className="text-right font-medium text-text-primary">{selectedTemplate.duration}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-text-tertiary">Voiceover</dt>
                    <dd className="text-right font-medium text-text-primary">{selectedTemplate.voiceover}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-text-tertiary">Music</dt>
                    <dd className="text-right font-medium text-text-primary">{selectedTemplate.music}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-text-tertiary">Credit Cost</dt>
                    <dd className="text-right font-mono font-semibold text-accent-blue">{selectedTemplate.creditCost} cr</dd>
                  </div>
                </dl>
              </div>
              <div className="space-y-2 border-t border-border-default p-6">
                <Link
                  to="/create"
                  onClick={() => setSelectedTemplate(null)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl gradient-bg py-3 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25"
                >
                  ✦ Use This Template
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTemplate(null)
                    navigate('/progress')
                  }}
                  className="w-full rounded-xl border border-border-default bg-elevated py-3 text-sm font-semibold text-text-primary transition hover:border-accent-blue/40"
                >
                  Preview Full Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
