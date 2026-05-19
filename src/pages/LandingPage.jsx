import { useState } from 'react'
import { Link } from 'react-router-dom'

const showcaseVideos = [
  {
    title: 'Summer Drop Teaser',
    duration: '0:32',
    platform: 'TikTok',
    platformClass: 'bg-tiktok text-base',
  },
  {
    title: 'Product Walkthrough',
    duration: '2:14',
    platform: 'YouTube',
    platformClass: 'bg-youtube text-white',
  },
  {
    title: 'Brand Story',
    duration: '0:45',
    platform: 'Instagram',
    platformClass: 'bg-instagram text-white',
  },
  {
    title: 'Launch Announcement',
    duration: '1:02',
    platform: 'Facebook',
    platformClass: 'bg-facebook text-white',
  },
]

function LogoMark({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg gradient-bg font-heading text-lg font-bold text-white shadow-lg shadow-accent-blue/20">
        V
      </span>
      <span className="font-heading text-xl font-semibold tracking-tight text-text-primary">
        Vidify
      </span>
    </Link>
  )
}

function VideoCard({ item, className = '' }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-border-default bg-surface shadow-xl ${className}`}
    >
      <div className="absolute inset-0 gradient-bg opacity-40" />
      <div className="absolute inset-0 bg-linear-to-t from-base via-base/40 to-transparent" />
      <div className="relative flex aspect-video flex-col justify-between p-4">
        <div className="flex items-start justify-between">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition group-hover:bg-white/20"
            aria-label="Play preview"
          >
            <svg className="ml-0.5 h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          </button>
          <span className="rounded-md bg-base/80 px-2 py-1 font-mono text-xs text-text-secondary backdrop-blur-sm">
            {item.duration}
          </span>
        </div>
        <div className="space-y-2">
          <p className="font-heading text-sm font-semibold text-text-primary">{item.title}</p>
          <span
            className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${item.platformClass}`}
          >
            {item.platform}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [heroEmail, setHeroEmail] = useState('')

  return (
    <div className="min-h-screen bg-base font-body text-text-primary">
      <header className="sticky top-0 z-50 h-16 border-b border-border bg-panel/85 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-16">
          <LogoMark />
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/#product"
              className="text-sm text-text-secondary transition hover:text-text-primary"
            >
              Product
            </Link>
            <Link
              to="/#pricing"
              className="text-sm text-text-secondary transition hover:text-text-primary"
            >
              Pricing
            </Link>
            <Link
              to="/#examples"
              className="text-sm text-text-secondary transition hover:text-text-primary"
            >
              Examples
            </Link>
            <Link
              to="/#docs"
              className="text-sm text-text-secondary transition hover:text-text-primary"
            >
              Docs
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="hidden rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-border-default hover:bg-elevated hover:text-text-primary sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center rounded-lg gradient-bg px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-violet/25 transition hover:opacity-95"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <section
        id="product"
        className="relative flex min-h-screen flex-col gap-16 overflow-hidden px-6 py-16 lg:flex-row lg:items-center lg:gap-20 lg:px-16 lg:py-20"
      >
        <div
          className="pointer-events-none absolute -left-32 top-20 h-[480px] w-[480px] rounded-full bg-accent-blue/20 blur-[120px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 bottom-10 h-[420px] w-[420px] rounded-full bg-accent-violet/25 blur-[100px]"
          aria-hidden
        />

        <div className="relative z-10 max-w-xl flex-1 animate-fade-slide-down">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-default bg-elevated/80 px-3 py-1.5 text-xs font-medium text-text-secondary backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-accent-violet opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-violet" />
            </span>
            AI-Powered Video Creation Platform
          </div>
          <h1 className="font-heading text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
            Create AI Videos.
            <br />
            <span className="gradient-text">Publish Everywhere.</span>
            <br />
            Instantly.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-text-secondary">
            Turn ideas into platform-ready clips with AI generation, smart captions, and one-click
            publishing across TikTok, YouTube, Instagram, and Facebook.
          </p>
          <form
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <input
              type="email"
              value={heroEmail}
              onChange={(e) => setHeroEmail(e.target.value)}
              placeholder="you@studio.com"
              className="h-12 w-full rounded-xl border border-border-default bg-input px-4 text-sm text-text-primary placeholder:text-text-muted outline-none ring-accent-blue/40 transition focus:border-accent-blue/50 focus:ring-2 sm:max-w-xs"
            />
            <Link
              to="/auth"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl gradient-bg px-6 text-sm font-semibold text-white shadow-lg shadow-accent-blue/30 transition hover:opacity-95"
            >
              Start for Free
              <span aria-hidden>→</span>
            </Link>
          </form>
          <p className="mt-4 text-sm text-text-tertiary">
            No credit card · 5 free credits · Cancel anytime
          </p>
        </div>

        <div className="relative z-10 grid flex-1 grid-cols-2 gap-4 animate-fade-slide-left sm:gap-5">
          {showcaseVideos.map((item, i) => (
            <VideoCard
              key={item.title}
              item={item}
              className={i === 1 || i === 3 ? 'mt-8 sm:mt-10' : ''}
            />
          ))}
        </div>
      </section>

      <section
        id="examples"
        className="border-y border-border bg-panel py-10"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap justify-around gap-8 px-6 text-center lg:px-16">
          {[
            '10,000+ Videos Created',
            '500+ Active Creators',
            '4 Platforms Supported',
            '99.9% Uptime',
          ].map((line) => (
            <div key={line} className="min-w-[160px] max-w-[220px]">
              <p className="font-heading text-base font-bold leading-snug text-text-primary sm:text-lg">
                {line}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
              How it works
            </h2>
            <p className="mt-3 text-text-secondary">Three steps from prompt to published.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                n: '01',
                ring: 'from-accent-blue to-accent-blue/60',
                title: 'Type Your Idea',
                desc: 'Describe your hook, audience, and tone. Vidify structures a shot plan automatically.',
              },
              {
                n: '02',
                ring: 'from-accent-violet to-accent-violet/60',
                title: 'AI Generates',
                desc: 'Clips, captions, voiceover, and platform variants are produced in parallel.',
              },
              {
                n: '03',
                ring: 'from-success to-success/60',
                title: 'Auto-Publish',
                desc: 'Schedule or push live to every connected channel with one review flow.',
              },
            ].map((step) => (
              <div
                key={step.n}
                className="group relative overflow-hidden rounded-2xl border border-border-default bg-surface p-8 transition hover:border-border-default"
              >
                <div className="absolute inset-x-0 top-0 h-0.5 scale-x-0 bg-linear-to-r opacity-0 transition group-hover:scale-x-100 group-hover:opacity-100 from-accent-blue via-accent-violet to-success" />
                <div
                  className={`mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br ${step.ring} font-mono text-sm font-semibold text-white`}
                >
                  {step.n}
                </div>
                <h3 className="font-heading text-xl font-semibold text-text-primary">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-panel px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
              Everything you need
            </h2>
            <p className="mt-3 text-text-secondary">Built for speed, consistency, and scale.</p>
          </div>
          <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: '🎬',
                title: 'Text to Video',
                desc: 'Prompt-to-timeline generation with scene-aware pacing.',
              },
              {
                icon: '🖼️',
                title: 'Image to Video',
                desc: 'Animate stills and product shots with motion presets.',
              },
              {
                icon: '🎙️',
                title: 'AI Voiceover',
                desc: 'Natural voices, SSML control, and loudness-normalized masters.',
              },
              {
                icon: '📝',
                title: 'Smart Captions',
                desc: 'Word-level timing, emoji emphasis, and safe-area layouts.',
              },
              {
                icon: '🏷️',
                title: 'Auto SEO Tags',
                desc: 'Titles, descriptions, and hashtags tuned per platform.',
              },
              {
                icon: '🚀',
                title: 'Cross-Platform Publish',
                desc: 'One asset graph → TikTok, YouTube, Instagram, and Facebook.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="border border-border-default bg-base p-6 transition hover:bg-surface lg:p-8"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-elevated text-xl">
                  {f.icon}
                </div>
                <h3 className="font-heading text-lg font-semibold text-text-primary">{f.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="px-6 py-20 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
              Simple pricing
            </h2>
            <p className="mt-3 text-text-secondary">Start free, upgrade when you scale.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                name: 'Free',
                price: '$0',
                credits: '5 credits / month',
                featured: false,
                features: ['Text to video', '720p exports', '1 connected account', 'Community support'],
              },
              {
                name: 'Starter',
                price: '$19',
                credits: '50 credits / month',
                featured: false,
                features: ['1080p exports', '3 connected accounts', 'AI voiceover', 'Email support'],
              },
              {
                name: 'Pro',
                price: '$49',
                credits: '200 credits / month',
                featured: true,
                features: [
                  '4K exports',
                  'Unlimited accounts',
                  'Priority queue',
                  'Smart captions + SEO',
                  'Dedicated success manager',
                ],
              },
              {
                name: 'Agency',
                price: '$99',
                credits: '500 credits / month',
                featured: false,
                features: ['Team workspaces', 'SSO', 'API access', 'SLA + onboarding'],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-8 ${
                  plan.featured
                    ? 'border-accent-violet/50 bg-linear-to-b from-accent-violet/10 to-surface shadow-xl shadow-accent-violet/10'
                    : 'border-border-default bg-surface'
                }`}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-bg px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}
                <h3 className="font-heading text-xl font-semibold text-text-primary">{plan.name}</h3>
                <p className="mt-4 flex items-baseline gap-1">
                  <span className="font-heading text-4xl font-bold text-text-primary">{plan.price}</span>
                  <span className="text-sm text-text-tertiary">/mo</span>
                </p>
                <p className="mt-1 text-sm text-text-secondary">{plan.credits}</p>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-text-secondary">
                  {plan.features.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="text-success">✓</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth"
                  className={`mt-8 inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold transition ${
                    plan.featured
                      ? 'gradient-bg text-white shadow-lg shadow-accent-blue/25 hover:opacity-95'
                      : 'border border-border-default bg-elevated text-text-primary hover:border-border-default'
                  }`}
                >
                  {plan.name === 'Free' ? 'Start free' : 'Choose plan'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 lg:px-16">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border-default bg-linear-to-br from-accent-blue/15 to-accent-violet/15 px-8 py-14 text-center sm:px-16">
          <h2 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
            Start creating for free today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-text-secondary">
            Join creators shipping weekly without a production crew. Bring your ideas — Vidify handles
            the rest.
          </p>
          <Link
            to="/auth"
            className="mt-8 inline-flex h-14 items-center justify-center rounded-xl gradient-bg px-10 text-base font-semibold text-white shadow-xl shadow-accent-violet/30 transition hover:opacity-95"
          >
            Get Started Free →
          </Link>
        </div>
      </section>

      <footer id="docs" className="border-t border-border bg-panel px-6 py-16 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <LogoMark />
            <p className="mt-4 text-sm leading-relaxed text-text-tertiary">
              Vidify helps teams produce and distribute short-form video with AI — fast, on-brand,
              everywhere your audience watches.
            </p>
          </div>
          <div>
            <p className="font-heading text-sm font-semibold text-text-primary">Product</p>
            <ul className="mt-4 space-y-2 text-sm text-text-tertiary">
              <li>
                <Link to="/#how-it-works" className="transition hover:text-text-secondary">
                  How it works
                </Link>
              </li>
              <li>
                <Link to="/#pricing" className="transition hover:text-text-secondary">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/library" className="transition hover:text-text-secondary">
                  Library
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-heading text-sm font-semibold text-text-primary">Resources</p>
            <ul className="mt-4 space-y-2 text-sm text-text-tertiary">
              <li>
                <Link to="/#docs" className="transition hover:text-text-secondary">
                  Docs
                </Link>
              </li>
              <li>
                <Link to="/#examples" className="transition hover:text-text-secondary">
                  Examples
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="transition hover:text-text-secondary">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-heading text-sm font-semibold text-text-primary">Company</p>
            <ul className="mt-4 space-y-2 text-sm text-text-tertiary">
              <li>
                <Link to="/#how-it-works" className="transition hover:text-text-secondary">
                  About
                </Link>
              </li>
              <li>
                <Link to="/auth" className="transition hover:text-text-secondary">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/settings" className="transition hover:text-text-secondary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-heading text-sm font-semibold text-text-primary">Legal</p>
            <ul className="mt-4 space-y-2 text-sm text-text-tertiary">
              <li>
                <Link to="/settings" className="transition hover:text-text-secondary">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/settings" className="transition hover:text-text-secondary">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/settings" className="transition hover:text-text-secondary">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-border pt-8 text-center text-sm text-text-muted sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} Vidify. All rights reserved.</p>
          <p className="text-text-tertiary">Built with ♥ for creators worldwide</p>
        </div>
      </footer>
    </div>
  )
}
