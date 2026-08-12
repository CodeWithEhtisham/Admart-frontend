import { useState } from 'react'
import { useAuth } from '@clerk/react'
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
        A
      </span>
      <span className="font-heading text-xl font-semibold tracking-tight text-text-primary">
        Admart
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
  const { isLoaded, isSignedIn } = useAuth()
  const hasDirectToken = Boolean(localStorage.getItem('accessToken'))
  const isAuthenticated = (isLoaded && isSignedIn) || hasDirectToken

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
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center rounded-lg gradient-bg px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-violet/25 transition hover:opacity-95"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
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
              </>
            )}
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
              to={isAuthenticated ? "/dashboard" : "/auth"}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl gradient-bg px-6 text-sm font-semibold text-white shadow-lg shadow-accent-blue/30 transition hover:opacity-95"
            >
              {isAuthenticated ? "Go to Dashboard" : "Start for Free"}
              <span aria-hidden>→</span>
            </Link>
          </form>
          <p className="mt-4 text-sm text-text-tertiary">
            No credit card · Basic, Plus, and Pro plans available
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
    </div>
  )
}
