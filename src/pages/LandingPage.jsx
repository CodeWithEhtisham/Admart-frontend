import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@clerk/react'
import { Link } from 'react-router-dom'
import { activatePlan, formatCredits, getPlans } from '../utils/credits'

const lm = (file) => `/leonardo-media/${file}`
const posterOf = (video) =>
  (video || '').replace('/leonardo-media/', '/leonardo-media/posters/').replace('.mp4', '.jpg')

const media = {
  hero1: { video: lm('Hero1.mp4') },
  hero2: { video: lm('Hero2.mp4') },
  hero3: { video: lm('Hero3.mp4') },
  hero4: { video: lm('Hero4.mp4') },
  why: { video: lm('WhyChoose.mp4') },
  animate: { video: lm('InstantAnimate.mp4') },
  spin: { video: lm('ProductSpin.mp4') },
  zoom: { video: lm('ZoomOut.mp4') },
  createT2V: { video: lm('CreateT2V.mp4') },
  createI2V: { video: lm('CreateI2V.mp4') },
  createAnim: { video: lm('CreateAnim.mp4') },
  refineStart: { video: lm('RefineStart.mp4') },
  refineEnd: { video: lm('RefineEnd.mp4') },
  refinePrompt: { video: lm('RefinePrompt.mp4') },
  scaleModel: { video: lm('ScaleModel.mp4') },
  animSeedance: { video: lm('AnimSeedance.mp4') },
  socialVeo1: { video: lm('SocialVeo1.mp4') },
  socialSeed1: { video: lm('SocialSeed1.mp4') },
  socialSeed2: { video: lm('SocialSeed2.mp4') },
  socialVeo2: { video: lm('SocialVeo2.mp4') },
  socialSeed3: { video: lm('SocialSeed3.mp4') },
  socialSeed4: { video: lm('SocialSeed4.mp4') },
  storyKling1: { video: lm('StoryKling1.mp4') },
  storyKling2: { video: lm('StoryKling2.mp4') },
  storyHailuo: { video: lm('StoryHailuo.mp4') },
  storyVeo1: { video: lm('StoryVeo1.mp4') },
  storyVeo2: { video: lm('StoryVeo2.mp4') },
  storyVeo3: { video: lm('StoryVeo3.mp4') },
  cinematicVeo: { video: lm('CinematicVeo.mp4') },
}

const modelShowcase = [
  {
    name: 'Flux Dev',
    vendor: 'Black Forest Labs',
    kind: 'Image',
    accent: '#3B82F6',
    media: media.createT2V,
    desc: 'Open-weights 12B flow transformer — near-pro photorealism with LoRA & ControlNet support.',
  },
  {
    name: 'Nano Banana 2',
    vendor: 'Google DeepMind',
    kind: 'Image',
    accent: '#22C55E',
    media: media.createI2V,
    desc: 'Gemini 3.1 Flash Image — reasoning-guided, native 4K, 14 reference images, 5–10s generations.',
  },
  {
    name: 'GPT Image 2',
    vendor: 'OpenAI',
    kind: 'Image',
    accent: '#0ea5e9',
    media: media.createAnim,
    desc: 'Reasoning-driven quality tiers, multi-image editing, up to 3840px output with streaming.',
  },
  {
    name: 'Seedance 2.0',
    vendor: 'ByteDance',
    kind: 'Video',
    accent: '#22C55E',
    media: media.refineEnd,
    desc: 'High-motion text & image-to-video with realistic physics and fast generation.',
  },
  {
    name: 'Veo 3.1',
    vendor: 'Google',
    kind: 'Video',
    accent: '#3B82F6',
    media: media.refinePrompt,
    desc: 'Cinematic video generation with first-last frame control and native audio.',
  },
  {
    name: 'Kling 2.5 Turbo Pro',
    vendor: 'Kuaishou',
    kind: 'Video',
    accent: '#8B5CF6',
    media: media.scaleModel,
    desc: 'Turbo-fast video synthesis with high-fidelity motion and scene consistency.',
  },
]

const publishPlatforms = [
  {
    name: 'Facebook',
    bg: '#1877f2',
    glyph: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="#fff" aria-hidden>
        <path d="M13.4 21v-7.4h2.5l.4-2.9h-2.9V8.8c0-.8.2-1.4 1.4-1.4h1.6V4.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.1H7.8v2.9h2.5V21h3.1z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    bg: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #bc1888 100%)',
    glyph: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="#fff" strokeWidth="2" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.3" cy="6.7" r="0.7" fill="#fff" stroke="none" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    bg: '#ff0000',
    glyph: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="#fff" strokeWidth="2" aria-hidden>
        <rect x="2.5" y="6" width="19" height="12.5" rx="3.5" />
        <path d="M10.2 9.4l4.7 2.8-4.7 2.8z" fill="#fff" stroke="none" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    bg: '#111111',
    glyph: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="#fff" aria-hidden>
        <path d="M16.8 3c.4 2.1 1.8 3.7 3.9 4v3c-1.5 0-2.9-.5-3.9-1.3v5.7a5.2 5.2 0 1 1-5.2-5.2c.3 0 .6 0 .9.1v3.1a2.2 2.2 0 1 0 1.5 2.1V3h2.8z" />
      </svg>
    ),
  },
  {
    name: 'X',
    bg: '#000000',
    glyph: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#fff" aria-hidden>
        <path d="M17.8 4h2.7l-6 6.8L21.5 20h-5.6l-4.3-5.6L6.6 20H3.9l6.4-7.3L3.5 4h5.7l3.9 5.1L17.8 4zm-1 14.4h1.5L8.6 5.5H7l9.8 12.9z" />
      </svg>
    ),
  },
  {
    name: 'Pinterest',
    bg: '#e60023',
    glyph: <span className="font-heading text-2xl font-bold leading-none text-white">P</span>,
  },
  {
    name: 'LinkedIn',
    bg: '#0a66c2',
    glyph: <span className="font-heading text-xl font-bold leading-none text-white">in</span>,
  },
  {
    name: 'Threads',
    bg: '#000000',
    glyph: <span className="font-heading text-2xl font-bold leading-none text-white">@</span>,
  },
]

const showcaseItems = [
  { prompt: 'A summer drop teaser with fast cuts and neon product shots', model: 'Seedance 2.0', media: media.socialSeed3 },
  { prompt: 'Cinematic brand story for a coffee studio, warm tones', model: 'Veo 3.1', media: media.socialSeed4 },
  { prompt: 'Product walkthrough for a SaaS onboarding flow', model: 'Kling 2.5 Turbo Pro', media: media.storyKling1 },
  { prompt: 'Countdown hype reel for an app launch event', model: 'Wan 2.6', media: media.storyKling2 },
  { prompt: 'Founder story short — talking head with kinetic captions', model: 'GPT Image 2', media: media.storyHailuo },
  { prompt: 'Feature teaser with bold typography and pop transitions', model: 'PixVerse V5', media: media.storyVeo1 },
  { prompt: 'Before/after clothing try-on comparison for e-commerce', model: 'Nano Banana 2', media: media.storyVeo2 },
  { prompt: 'Award certificate reveal post with 3D motion', model: 'Flux Dev', media: media.storyVeo3 },
  { prompt: 'Menu board animation for a restaurant promotion', model: 'Hailuo 02', media: media.cinematicVeo },
]

const faqs = [
  {
    q: 'How do credits work?',
    a: 'One credit generates one AI image or video. Unused credits roll over on annual plans, and you can upgrade or downgrade anytime — changes apply immediately.',
  },
  {
    q: 'Can I really publish wherever and whenever?',
    a: 'Yes. Push finished images and videos to TikTok, YouTube, Instagram and Facebook with one click, or schedule them for later — Admart even suggests the best posting time per platform.',
  },
  {
    q: 'Can I use my own brand assets?',
    a: 'Absolutely. The Brand Kit stores your logos, colors, fonts, intros and outros, and every generated image or video applies them automatically.',
  },
  {
    q: 'Do I need editing experience?',
    a: 'No. Describe your idea, review the generated images and clips, tweak captions or music, then publish. Advanced controls exist but are never required.',
  },
  {
    q: 'Is there an API for developers?',
    a: 'Pro plans include full API access with webhooks for generation and publishing events, plus SDKs for JavaScript and Python.',
  },
]

const testimonials = [
  {
    quote:
      'Admart is literally our social media department — it generates the images, the videos, the captions, and posts everything for us.',
    name: 'Sarah Chen',
    role: 'Content Director',
    initials: 'SC',
  },
  {
    quote:
      'I went from zero content to posting every single day. The AI images alone are stunning, and the videos look professionally edited.',
    name: 'Marcus Rivera',
    role: 'Creator, 1.2M followers',
    initials: 'MR',
  },
  {
    quote:
      'We schedule a full month of content across four platforms in one afternoon. Wherever and whenever means exactly that.',
    name: 'Priya Nair',
    role: 'Agency Founder',
    initials: 'PN',
  },
  {
    quote:
      'Our 40+ client accounts run on Admart. Brand kit, bulk generation, publishing — it handles the whole pipeline without breaking a sweat.',
    name: 'Daniel Osei',
    role: 'Growth Lead, Osei Media',
    initials: 'DO',
  },
]

const heroMarquee = [
  { ...media.socialVeo1, caption: 'Neon product teaser for TikTok' },
  { ...media.storyKling1, caption: 'SaaS walkthrough, clean UI motion' },
  { ...media.hero1, caption: 'Studio fashion drop, bold color' },
  { ...media.socialSeed4, caption: 'Coffee brand story, warm tones' },
  { ...media.storyVeo1, caption: 'Feature teaser, kinetic type' },
  { ...media.cinematicVeo, caption: 'Cinematic brand film, 24fps look' },
]

function LogoMark({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg gradient-bg font-heading text-lg font-bold text-white shadow-lg gradient-glow">
        A
      </span>
      <span className="font-heading text-xl font-semibold tracking-tight text-white">
        Admart
      </span>
    </Link>
  )
}

function PillButton({ children, variant = 'primary', className = '', ...props }) {
  if (variant === 'ring') {
    return (
      <span className={`inline-flex w-fit transition-transform duration-300 ease-out active:scale-95 ${className}`}>
        <a
          {...props}
          className="relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-3 text-sm font-semibold text-white transition-colors duration-300"
        >
          <span
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background:
                'conic-gradient(from 140deg at 50% 50%, rgba(255,255,255,0.35) 0deg, rgba(255,255,255,0.05) 90deg, rgba(255,255,255,0.35) 180deg, rgba(255,255,255,0.05) 270deg, rgba(255,255,255,0.35) 360deg)',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              WebkitMaskComposite: 'xor',
              padding: '2px',
            }}
            aria-hidden
          />
          <span className="relative z-10">{children}</span>
        </a>
      </span>
    )
  }
  return (
    <span className={`inline-flex w-fit transition-transform duration-300 ease-out active:scale-95 ${className}`}>
      <a
        {...props}
        className="inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition-colors duration-300 hover:bg-[#ededed]"
      >
        {children}
      </a>
    </span>
  )
}

function SectionHead({ eyebrow, children, sub }) {
  return (
    <div className="rv rv-up mb-8 flex flex-col items-center px-3 text-center sm:mb-12">
      {eyebrow && (
        <p className="mb-3 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-white/70 backdrop-blur-sm">
          {eyebrow}
        </p>
      )}
      <h2 className="max-w-[20em] font-heading font-bold uppercase leading-[1.05] tracking-tight text-white text-[clamp(1.6rem,4.5vw,4.2rem)]">
        {children}
      </h2>
      {sub && (
        <p className="mt-4 max-w-[64ch] text-balance text-base font-medium text-white sm:text-lg">
          {sub}
        </p>
      )}
    </div>
  )
}

function LazyVideo({ src, className = '' }) {
  const ref = useRef(null)
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  return (
    <>
      <video
        ref={ref}
        data-rv-video
        src={src}
        poster={posterOf(src)}
        preload="none"
        muted
        loop
        playsInline
        className={className}
      />
      {reduced && (
        <button
          type="button"
          aria-label="Play video"
          onClick={() => {
            if (ref.current) ref.current.play().catch(() => {})
          }}
          className="absolute left-1/2 top-1/2 z-20 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-md transition hover:bg-white/40"
        >
          <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}
    </>
  )
}

function ShowcaseCard({ item }) {
  return (
    <div className="group">
      <div className="relative aspect-[0.8] w-full overflow-hidden rounded-lg bg-black">
        {item.media.image && (
          <img
            src={item.media.image}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {item.media.video && (
          <LazyVideo
            src={item.media.video}
            className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 group-hover:scale-110"
          />
        )}
        <span
          className="absolute bottom-3 left-3 z-10 rounded-full px-3 py-1 text-xs font-semibold text-black"
          style={{ backgroundColor: '#22C55E' }}
        >
          {item.model}
        </span>
      </div>
      <p className="mt-3 text-xs text-white/90 sm:text-sm">{item.prompt}</p>
    </div>
  )
}

function FaqItem({ item, open, onToggle }) {
  return (
    <div className="border-b border-white/30">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 py-6 text-left"
      >
        <span className="text-base font-medium text-white sm:text-lg">{item.q}</span>
        <span
          className={`relative flex h-6 w-6 shrink-0 items-center justify-center transition-transform duration-500 ${open ? 'rotate-45' : ''}`}
          aria-hidden
        >
          <span className="absolute h-0.5 w-4 rounded-full transition-transform duration-500 hover:rotate-180" style={{ backgroundColor: '#3B82F6' }} />
          <span className="absolute h-4 w-0.5 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-500 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <p className="pb-6 text-sm leading-relaxed text-white/70">{item.a}</p>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState('product')
  const [billing, setBilling] = useState('monthly')
  const [openFaq, setOpenFaq] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [plans, setPlans] = useState([])
  const [planError, setPlanError] = useState('')
  const [activatingPlan, setActivatingPlan] = useState(null)
  const [planToast, setPlanToast] = useState(null)
  const { isLoaded, isSignedIn } = useAuth()
  const hasDirectToken = Boolean(localStorage.getItem('accessToken'))
  const isAuthenticated = (isLoaded && isSignedIn) || hasDirectToken

  const navSections = [
    { id: 'product', label: 'Product' },
    { id: 'features', label: 'Features' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'showcase', label: 'Showcase' },
    { id: 'faq', label: 'FAQ' },
  ]

  useEffect(() => {
    const sections = navSections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let mounted = true
    getPlans()
      .then((data) => {
        if (mounted) {
          const items = data?.items ?? (Array.isArray(data) ? data : [])
          setPlans(items.filter((p) => p.id !== 'free'))
          setPlanError('')
        }
      })
      .catch((err) => {
        if (mounted) setPlanError(err?.response?.data?.message || err?.message || 'Plans unavailable.')
      })
    return () => {
      mounted = false
    }
  }, [])

  const handleActivatePlan = async (planId) => {
    setActivatingPlan(planId)
    setPlanError('')
    try {
      const result = await activatePlan(planId)
      setPlanToast(result?.message || 'Plan activated for testing.')
      window.setTimeout(() => setPlanToast(null), 3000)
    } catch (err) {
      setPlanError(err?.response?.data?.message || err?.message || 'Could not activate plan.')
    } finally {
      setActivatingPlan(null)
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.rv')).filter(
      (el) => !el.classList.contains('visible')
    )
    if (!els.length) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((el) => {
        el.classList.add('visible')
        el.style.willChange = 'auto'
      })
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videos = entry.target.matches('video[data-rv-video]')
            ? [entry.target]
            : Array.from(entry.target.querySelectorAll('video[data-rv-video]'))
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            entry.target.style.willChange = 'auto'
            videos.forEach((v) => v.play().catch(() => {}))
            if (!videos.length) io.unobserve(entry.target)
          } else if (videos.length) {
            videos.forEach((v) => v.pause())
          }
        })
      },
      { threshold: 0.15 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [plans])

  const authPath = isAuthenticated ? '/dashboard' : '/auth'

  return (
    <div className="min-h-screen overflow-x-hidden bg-black font-body text-white">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ${
          scrolled ? 'bg-black/70 backdrop-blur-xl' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-3 sm:px-6 xl:px-10">
          <LogoMark />
          <nav className="hidden items-center gap-8 xl:flex">
            {navSections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                aria-current={activeSection === s.id ? 'true' : undefined}
                className={`text-sm transition duration-300 ${
                  activeSection === s.id
                    ? 'font-semibold text-[#3B82F6] [text-shadow:0_0_14px_rgba(59,130,246,0.75)]'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <PillButton href="/dashboard" variant="ring">
                Go to Dashboard
              </PillButton>
            ) : (
              <>
                <PillButton href="/auth" variant="ring" className="hidden sm:inline-flex">
                  Log in
                </PillButton>
                <PillButton href="/auth">Get Started Free</PillButton>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero ────────────────────────────────────────────────── */}
      <section
        id="product"
        className="relative flex flex-col items-center overflow-hidden px-3 pb-10 pt-32 text-center sm:pt-36"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(169.74deg, #0a0a0a 0%, rgba(37,37,37,0.65) 100%)',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full blur-[140px]"
          style={{ background: 'rgba(59,130,246,0.12)' }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[720px] -translate-x-1/2 rounded-full blur-[160px]"
          style={{ background: 'rgba(139,92,246,0.10)' }}
          aria-hidden
        />

        <div className="relative z-10 flex w-full flex-col items-center">
          <p className="rv rv-up mb-6 flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
            <span
              className="animate-pulse-dot h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: '#22C55E' }}
              aria-hidden
            />
            36 AI models · images, videos, captions & publishing in one dashboard
          </p>
          <h1 className="rv rv-up max-w-[16em] font-heading font-bold uppercase leading-[1.02] tracking-tight text-white text-[clamp(2rem,5.5vw,4.8rem)]">
            Your AI social media <span className="gradient-text">handler</span>
          </h1>
          <p
            className="rv rv-up mx-auto mt-5 max-w-[52em] text-base font-medium text-white/75 sm:text-lg"
            style={{ transitionDelay: '100ms' }}
          >
            Describe your idea — Admart generates professional AI images and videos, then publishes
            them wherever and whenever you want across TikTok, YouTube, Instagram and Facebook.
          </p>

          <div
            className="rv rv-up mt-8 flex flex-col items-center gap-3"
            style={{ transitionDelay: '250ms' }}
          >
            <PillButton href={authPath} className="!px-8 !py-4 text-base">
              Start creating free
            </PillButton>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="flex gap-0.5 opacity-40">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <svg key={s} className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="#22C55E" aria-hidden>
                      <path d="M12 2 15 9h6l-5 5 2 8-6-4-6 4 2-8-5-5h6l3-7z" />
                    </svg>
                  ))}
                </div>
                <div
                  className="absolute inset-0 flex gap-0.5 overflow-hidden"
                  style={{ clipPath: 'inset(0 6% 0 0)' }}
                >
                  {[0, 1, 2, 3, 4].map((s) => (
                    <svg key={s} className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="#22C55E" aria-hidden>
                      <path d="M12 2 15 9h6l-5 5 2 8-6-4-6 4 2-8-5-5h6l3-7z" />
                    </svg>
                  ))}
                </div>
              </div>
              <span className="text-xs font-medium text-white">4.7</span>
              <span className="text-white/30">·</span>
              <span className="text-xs text-white/60">based on 104K ratings</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Hero video marquee ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-black pb-24 pt-10">
        <div
          className="flex flex-col gap-4"
          style={{
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0, #000 8rem, #000 calc(100% - 8rem), transparent 100%)',
            maskImage:
              'linear-gradient(to right, transparent 0, #000 8rem, #000 calc(100% - 8rem), transparent 100%)',
          }}
        >
          <div className="animate-marquee flex w-max" style={{ animationDuration: '40s' }}>
            {[...heroMarquee, ...heroMarquee].map((item, i) => (
              <figure
                key={i}
                className="group relative mr-4 w-72 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black sm:w-96"
              >
                <div className="aspect-video w-full">
                  {item.video && (
                    <video
                      src={item.video}
                      poster={posterOf(item.video)}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-2 pt-8 text-left text-[11px] font-medium text-white/85">
                  {item.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why Admart + models ─────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-[1600px] scroll-mt-20 px-2.5 py-24 sm:px-8">
        <SectionHead
          eyebrow="Why Admart"
          sub="Create professional AI images & videos powered by 36 top models — text to image, text to video, editing, upscaling and background removal — your entire social pipeline handled by one AI."
        >
          More than a video tool. <strong>Your social media handler</strong>
        </SectionHead>
        <div className="grid gap-4 lg:grid-cols-4">
          {[
            { label: 'Professional AI images', color: '#3B82F6', media: media.why, tag: 'Flux · Nano Banana · GPT Image' },
            { label: 'Cinematic AI videos', color: '#8B5CF6', media: media.animate, tag: 'Veo · Seedance · Kling' },
            { label: 'Publish anywhere', color: '#22C55E', media: media.spin, tag: 'TikTok · YouTube · Instagram · Facebook' },
            { label: 'Schedule anytime', color: '#0ea5e9', media: media.zoom, tag: 'Plan a month of content in minutes' },
          ].map((b, i) => (
            <div
              key={b.label}
              className="rv rv-up group relative flex min-h-[220px] items-end overflow-hidden rounded-lg p-4 transition-transform duration-300 hover:-translate-y-1"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
                {b.media.image && (
                  <img
                    src={b.media.image}
                    alt={b.label}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                {b.media.video && (
                  <LazyVideo
                    src={b.media.video}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
                <div
                  className="absolute inset-0 opacity-60 transition-opacity duration-300 group-hover:opacity-40"
                  style={{ background: `linear-gradient(180deg, transparent 0%, ${b.color} 120%)` }}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="relative z-10">
                  <p className="font-heading text-lg font-bold text-white">{b.label}</p>
                  <p className="mt-1 text-xs text-white/80">{b.tag}</p>
                </div>
              </div>
            ))}
        </div>

        <div className="mx-auto mt-16 grid max-w-[1600px] gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {modelShowcase.map((m, mi) => (
            <div
              key={m.name}
              className="rv rv-up group relative rounded-xl p-[1px] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.35)]"
              style={{
                transitionDelay: `${(mi % 3) * 100}ms`,
                background:
                  'conic-gradient(from 140deg at 50% 50%, rgba(255,255,255,0.2) 0deg, rgba(255,255,255,0.04) 90deg, rgba(255,255,255,0.2) 180deg, rgba(255,255,255,0.04) 270deg, rgba(255,255,255,0.2) 360deg)',
              }}
            >
                <div className="rounded-[calc(1rem-1px)] bg-[#0a0a0a] p-3">
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                    {m.media.image && (
                      <img
                        src={m.media.image}
                        alt={m.name}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )}
                    {m.media.video && (
                      <LazyVideo
                        src={m.media.video}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span
                      className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: m.accent }}
                    >
                      {m.kind}
                    </span>
                  </div>
                  <p className="mt-3 font-heading text-sm font-semibold text-white">
                    {m.name}
                  </p>
                  <p className="text-xs text-white/50">{m.vendor}</p>
                  <p className="mt-2 text-xs leading-relaxed text-white/60">{m.desc}</p>
                </div>
              </div>
            ))}
        </div>
        <div className="rv rv-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row" style={{ transitionDelay: '150ms' }}>
          <span
            className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 font-mono text-xs text-white/70"
          >
            36 models · image · video · edit · upscale · rembg
          </span>
          <PillButton href="#showcase" variant="ring">
            View all models →
          </PillButton>
        </div>
      </section>

      {/* ─── Publish ─────────────────────────────────────────────── */}
      <section className="relative scroll-mt-20 overflow-hidden bg-black px-3 py-16 sm:px-6 xl:px-8">
        <div className="rv rv-left" aria-hidden>
          <div style={{ perspective: '15vw' }}>
            <h3
              className="pointer-events-none relative w-full font-heading font-bold uppercase leading-none tracking-tight opacity-25"
              style={{
                color: '#8B5CF6',
                transform: 'translateX(-26vw) rotateY(-11deg) skewY(-5.6deg)',
                fontSize: 'clamp(5rem, 20vw, 15rem)',
                transformStyle: 'preserve-3d',
              }}
            >
              PUBLISH
            </h3>
          </div>
        </div>
        <h2 className="rv rv-up mx-auto max-w-[18em] text-center font-heading text-3xl font-bold uppercase tracking-tight text-white sm:text-5xl">
          Publish wherever &amp; whenever
        </h2>
        <p
          className="rv rv-up mx-auto mt-4 max-w-[64ch] text-center text-sm font-medium text-white/80 sm:text-base"
          style={{ transitionDelay: '100ms' }}
        >
          One-click publishing and smart scheduling across every platform — or let Admart pick the
          best time to post for you.
        </p>

        <div className="mx-auto mt-12 grid max-w-[1400px] grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {publishPlatforms.map((p, pi) => (
            <div
              key={p.name}
              className="rv rv-up"
              style={{ transitionDelay: `${(pi % 8) * 60}ms` }}
            >
              <div className="group flex h-full flex-col items-center gap-3 rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-white/25">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110"
                  style={{ background: p.bg }}
                >
                  {p.glyph}
                </span>
                <span className="text-xs font-semibold text-white/80">{p.name}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="rv rv-up mt-10 text-center text-sm font-medium uppercase tracking-widest text-white/50">
          Trusted by teams publishing everywhere
        </p>
      </section>

      {/* ─── Pricing ─────────────────────────────────────────────── */}
      <section id="pricing" className="scroll-mt-20 bg-black px-3 py-24 sm:px-6 xl:px-8">
        <SectionHead eyebrow="Pricing" sub="Start free, upgrade when your channel grows. Cancel anytime.">
          Simple plans that <strong>scale with you</strong>
        </SectionHead>
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm ${billing === 'monthly' ? 'text-white' : 'text-white/50'}`}>
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={billing === 'yearly'}
            aria-label="Toggle yearly billing"
            onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
            className="relative h-7 w-12 rounded-full border border-white/20 bg-white/10 transition-colors duration-300"
          >
            <span
              className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full transition-all duration-300 ${
                billing === 'yearly' ? 'left-6 bg-[#3B82F6]' : 'left-1 bg-white/60'
              }`}
            />
          </button>
          <span className={`text-sm ${billing === 'yearly' ? 'text-white' : 'text-white/50'}`}>
            Yearly
          </span>
          <span
            className="rounded-full px-2.5 py-1 text-xs font-semibold text-black"
            style={{ backgroundColor: '#22C55E' }}
          >
            Save 17%
          </span>
        </div>
        <div className="mx-auto mt-12 grid max-w-[1600px] gap-6 lg:grid-cols-3">
          {plans.map((p, i) => {
            const popular = p.id === 'plus'
            const price = Number(p.priceUsd)
            return (
              <div key={p.id} className="rv rv-up h-full" style={{ transitionDelay: `${i * 100}ms` }}>
                <div
                  className={`relative flex h-full flex-col rounded-2xl p-[1px]`}
                  style={{
                    background: popular
                      ? 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
                      : 'conic-gradient(from 140deg at 50% 50%, rgba(255,255,255,0.2) 0deg, rgba(255,255,255,0.04) 90deg, rgba(255,255,255,0.2) 180deg, rgba(255,255,255,0.04) 270deg, rgba(255,255,255,0.2) 360deg)',
                  }}
                >
                  {popular && (
                    <span
                      className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold text-white shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
                    >
                      MOST POPULAR
                    </span>
                  )}
                  <div className="flex h-full flex-col rounded-[calc(1rem-1px)] bg-[#0a0a0a] p-6">
                    <h3 className="font-heading text-lg font-bold uppercase text-white">{p.name}</h3>
                    <p className="mt-1 text-sm text-white/60">
                      {formatCredits(p.monthlyCredits)} credits / month
                    </p>
                    {p.description && (
                      <p className="mt-2 text-sm leading-relaxed text-white/70">{p.description}</p>
                    )}
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="font-heading text-4xl font-bold text-white">
                        ${billing === 'monthly' ? price : price * 10}
                      </span>
                      <span className="text-sm text-white/50">/month</span>
                    </div>
                    <ul className="mt-6 flex-1 space-y-3">
                      {(p.features || []).map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-white/80">
                          <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    {isAuthenticated ? (
                      <button
                        type="button"
                        onClick={() => handleActivatePlan(p.id)}
                        disabled={Boolean(activatingPlan)}
                        className={`mt-8 w-full rounded-full py-3 text-sm font-semibold transition duration-300 ${
                          popular
                            ? 'gradient-bg text-white shadow-lg gradient-glow hover:opacity-95'
                            : 'border border-white/25 text-white hover:bg-white/10'
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {activatingPlan === p.id ? 'Activating…' : 'Activate plan'}
                      </button>
                    ) : (
                      <PillButton
                        href={authPath}
                        variant={popular ? 'primary' : 'ring'}
                        className="mt-8 w-full justify-center"
                      >
                        Start creating free
                      </PillButton>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {planError && (
          <p className="mt-8 text-center text-sm text-[#EF4444]">{planError}</p>
        )}
        {!plans.length && !planError && (
          <p className="mt-12 text-center text-sm text-white/60">Loading plans…</p>
        )}
        {planToast && (
          <div
            role="status"
            className="animate-slide-up fixed bottom-8 right-8 z-50 rounded-xl border border-border-default bg-elevated px-4 py-3 text-sm text-text-primary shadow-xl"
          >
            {planToast}
          </div>
        )}
      </section>

      {/* ─── Showcase ────────────────────────────────────────────── */}
      <section id="showcase" className="scroll-mt-20 bg-black px-3 py-24 sm:px-6 xl:px-8">
        <SectionHead eyebrow="Model Showcase" sub="Every piece below is tagged with the exact model that made it — explore all 36 models and see which one fits your style.">
          See what's possible with <strong>AI content</strong>
        </SectionHead>
        <div className="mx-auto grid max-w-[1600px] gap-x-4 gap-y-16 sm:grid-cols-2 xl:grid-cols-3">
          {showcaseItems.map((item, i) => (
            <div key={i} className="rv rv-up" style={{ transitionDelay: `${(i % 3) * 100}ms` }}>
              <ShowcaseCard item={item} />
            </div>
          ))}
        </div>
      </section>

      {/* ─── Testimonials ────────────────────────────────────────── */}
      <section className="bg-black px-3 py-24 sm:px-6 xl:px-8">
        <SectionHead eyebrow="Testimonials" sub="Creators and teams trust Admart to run their entire social presence.">
          They let Admart <strong>handle their socials</strong>
        </SectionHead>
        <div className="mx-auto grid max-w-[1600px] gap-5 md:grid-cols-2 xl:grid-cols-4">
          {testimonials.map((t, i) => (
            <figure
              key={t.name}
              className="rv rv-up relative flex h-full flex-col rounded-2xl p-[1px] transition-transform duration-300 hover:-translate-y-1"
              style={{
                transitionDelay: `${(i % 4) * 100}ms`,
                background:
                  'conic-gradient(from 140deg at 50% 50%, rgba(255,255,255,0.2) 0deg, rgba(255,255,255,0.04) 90deg, rgba(255,255,255,0.2) 180deg, rgba(255,255,255,0.04) 270deg, rgba(255,255,255,0.2) 360deg)',
              }}
            >
                <div className="flex h-full flex-col rounded-[calc(1rem-1px)] bg-[#0a0a0a] p-6">
                  <div className="mb-4 flex gap-1" aria-label="5 out of 5 stars">
                    {[0, 1, 2, 3, 4].map((s) => (
                      <svg key={s} className="h-4 w-4" viewBox="0 0 24 24" fill="#22C55E" aria-hidden>
                        <path d="M12 2 15 9h6l-5 5 2 8-6-4-6 4 2-8-5-5h6l3-7z" />
                      </svg>
                    ))}
                  </div>
                  <blockquote className="flex-1 text-sm leading-relaxed text-white/90">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full gradient-bg font-heading text-xs font-bold text-white">
                      {t.initials}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">{t.name}</span>
                      <span className="block text-xs text-white/50">{t.role}</span>
                    </span>
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
        </section>

        {/* ─── FAQ ─────────────────────────────────────────────────── */}
        <section id="faq" className="mx-auto max-w-4xl scroll-mt-20 px-3 py-24 sm:px-5">
          <SectionHead eyebrow="FAQ" sub="Everything you need to know before getting started.">
            Frequently asked <strong>questions</strong>
          </SectionHead>
          <div className="rv rv-up">
            {faqs.map((f, i) => (
              <FaqItem
                key={f.q}
                item={f}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
              />
            ))}
          </div>
        </section>

      {/* ─── Final CTA ───────────────────────────────────────────── */}
      <section className="relative flex min-h-[46vw] flex-col items-center justify-center overflow-hidden px-3 py-24 text-center sm:px-6">
        <div className="rv absolute inset-0">
          <video
            src={lm('TurnIdeas.mp4')}
            poster={posterOf(lm('TurnIdeas.mp4'))}
            preload="none"
            data-rv-video
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black" />
        <div className="rv rv-up relative z-10 mx-auto max-w-4xl">
          <h2 className="font-heading font-bold uppercase leading-[0.9] tracking-tight text-white text-[clamp(2.5rem,8vw,7rem)]">
            Your content. <span className="gradient-text">Everywhere.</span>
          </h2>
          <p className="rv rv-up mx-auto mt-6 max-w-[40em] text-sm font-medium text-white/80 sm:text-base" style={{ transitionDelay: '100ms' }}>
            Generate professional AI images and videos, then publish them wherever and whenever you
            want. Join thousands of creators and teams letting Admart handle their socials.
          </p>
          <div className="rv rv-up mt-10 flex flex-wrap items-center justify-center gap-4" style={{ transitionDelay: '200ms' }}>
            <PillButton href={authPath} className="!px-8 !py-4 text-base">
              Start creating free
            </PillButton>
            <PillButton href="#pricing" variant="ring" className="!px-8 !py-4 text-base">
              See pricing
            </PillButton>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-black px-3 pb-4 pt-8 text-white sm:px-6 xl:px-10">
        <div className="mx-auto grid max-w-[1600px] gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <LogoMark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Your AI social media handler — professional AI images and videos, published wherever
              and whenever you want.
            </p>
          </div>
          {[
            { heading: 'Product', links: ['Features', 'Pricing', 'Examples', 'API', 'Changelog'] },
            { heading: 'Resources', links: ['Docs', 'Help Center', 'Tutorials', 'Community', 'Status'] },
            { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Contact', 'Press'] },
          ].map((col) => (
            <div key={col.heading}>
              <h3 className="font-heading text-sm font-bold uppercase text-white">{col.heading}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#product" className="text-sm text-white/60 transition hover:text-white">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-12 flex max-w-[1600px] flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/40">© 2026 Admart. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Cookies'].map((l) => (
              <a key={l} href="#product" className="text-xs text-white/40 transition hover:text-white/70">
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}