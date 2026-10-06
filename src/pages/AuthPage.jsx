import { useState, useRef } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import { isAuthenticated, persistSession, startGoogleAuth, formatAuthError, NO_ACCOUNT_MESSAGE } from '../utils/auth'
import { postLoginPath } from '../utils/projects'

// Showcase cards with real videos from public/leonardo-media
const showcaseItems = [
  {
    title: 'Cinematic 4K Promo',
    duration: '0:30',
    platform: 'YouTube',
    handle: '@admart.commercials',
    badgeClass: 'bg-red-500/20 text-red-300 border-red-500/30',
    icon: 'youtube',
    video: '/leonardo-media/Hero3.mp4',
    poster: '/leonardo-media/posters/Hero3.jpg',
    metric: '184K views',
    tag: '16:9 • 4K HD',
  },
  {
    title: 'Drop Reel & Viral Motion',
    duration: '0:15',
    platform: 'Instagram',
    handle: '@admart.reels',
    badgeClass: 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border-pink-500/30',
    icon: 'instagram',
    video: '/leonardo-media/SocialSeed3.mp4',
    poster: '/leonardo-media/posters/SocialSeed3.jpg',
    metric: '92K plays',
    tag: '9:16 Reel',
  },
  {
    title: 'E-Commerce Launch Ad',
    duration: '0:25',
    platform: 'Facebook',
    handle: '@admart.campaigns',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    icon: 'facebook',
    video: '/leonardo-media/SocialVeo2.mp4',
    poster: '/leonardo-media/posters/SocialVeo2.jpg',
    metric: '3.4x ROAS',
    tag: 'Feed & Story',
  },
  {
    title: 'Trending Hook Promo',
    duration: '0:22',
    platform: 'TikTok',
    handle: '@admart.trends',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    icon: 'tiktok',
    video: '/leonardo-media/AnimSeedance.mp4',
    poster: '/leonardo-media/posters/AnimSeedance.jpg',
    metric: '310K views',
    tag: 'Trending Sound',
  },
]

function YouTubeIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function InstagramIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

function FacebookIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function TikTokIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.54c0 2.45-.78 4.96-2.42 6.78-1.74 1.93-4.35 2.92-6.91 2.66-2.52-.26-4.83-1.65-6.23-3.76-1.44-2.16-1.64-5.02-.5-7.33 1.14-2.32 3.48-3.95 6.07-4.17.47-.04.94-.03 1.41.01v4.13c-.49-.1-1.02-.1-1.52.01-1.1.25-2.04.99-2.53 1.99-.49 1-.41 2.22.18 3.16.59.94 1.65 1.52 2.75 1.48 1.05-.04 2.05-.62 2.56-1.54.34-.62.48-1.34.48-2.05V.02h.64z" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.07.72-2.44 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.28a12 12 0 0 0 0 10.76l3.99-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l3.99 3.1C6.22 6.88 8.87 4.77 12 4.77z"
      />
    </svg>
  )
}

function SoundWave() {
  return (
    <div className="flex items-end gap-0.5 h-2.5">
      <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
      <span className="w-0.5 h-2.5 bg-emerald-400 rounded-full animate-pulse [animation-delay:150ms]" />
      <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse [animation-delay:300ms]" />
      <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-pulse [animation-delay:450ms]" />
    </div>
  )
}

function ShowcaseCard({ item, offset, isMuted, onToggleMute }) {
  const videoRef = useRef(null)

  const handleToggleSound = (e) => {
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
    onToggleMute()
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-panel/70 backdrop-blur-md shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-cyan-500/10 ${
        offset ? 'mt-4 sm:mt-8' : ''
      }`}
    >
      {/* Video Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/60">
        <video
          ref={videoRef}
          src={item.video}
          poster={item.poster}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="metadata"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Cinematic Vignette Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/60" />

        {/* Top Badges */}
        <div className="absolute left-2.5 right-2.5 top-2.5 flex items-center justify-between z-10">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide backdrop-blur-md border shadow-sm ${item.badgeClass}`}
          >
            {item.icon === 'youtube' && <YouTubeIcon />}
            {item.icon === 'instagram' && <InstagramIcon />}
            {item.icon === 'facebook' && <FacebookIcon />}
            {item.icon === 'tiktok' && <TikTokIcon />}
            <span>{item.platform}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleToggleSound}
              aria-label={isMuted ? `Unmute ${item.platform} preview` : `Mute ${item.platform} preview`}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white/80 backdrop-blur-md border border-white/10 transition hover:bg-black/90 hover:text-white"
            >
              {isMuted ? (
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg className="h-3 w-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              )}
            </button>
            <span className="rounded-full bg-black/60 px-2 py-0.5 font-mono text-[10px] text-white/90 backdrop-blur-md border border-white/10">
              {item.duration}
            </span>
          </div>
        </div>

        {/* Center Tag / Resolution badge */}
        <div className="absolute right-2.5 top-11 z-10">
          <div className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-medium text-emerald-400 backdrop-blur-md border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{item.tag}</span>
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10 space-y-1">
          <div className="flex items-center justify-between">
            <p className="font-heading text-xs font-semibold text-white tracking-tight line-clamp-1">
              {item.title}
            </p>
            <SoundWave />
          </div>
          <div className="flex items-center justify-between text-[10px] text-white/70">
            <span className="text-white/60 font-mono text-[9px] truncate max-w-[110px]">{item.handle}</span>
            <span className="font-semibold text-white/90 bg-white/15 px-1.5 py-0.5 rounded text-[9px]">
              {item.metric}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function LogoLink() {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5 group">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl gradient-bg font-heading text-lg font-bold text-white shadow-lg gradient-glow transition-transform duration-200 group-hover:scale-105">
        A
      </span>
      <div className="flex flex-col">
        <span className="font-heading text-xl font-bold tracking-tight text-text-primary">
          Admart
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-accent-blue -mt-1">
          Studio AI
        </span>
      </div>
    </Link>
  )
}

function safeRedirect(value) {
  if (!value || typeof value !== 'string') return '/dashboard'
  if (!value.startsWith('/') || value.startsWith('//')) return '/dashboard'
  if (value.startsWith('/auth')) return '/dashboard'
  return value
}

function noticeMessage(notice) {
  if (notice === 'no_account') return NO_ACCOUNT_MESSAGE
  if (notice === 'google_denied') return 'Google sign-in was cancelled or denied.'
  if (notice === 'google_failed') return 'Google sign-in failed. Please try again.'
  return ''
}

export default function AuthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const isSignUp = searchParams.get('mode') === 'sign-up'
  const redirectUrl = safeRedirect(searchParams.get('redirect_url') || location.state?.from)
  const notice = searchParams.get('notice')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mutedCardIndex, setMutedCardIndex] = useState(-1) // -1 means all muted
  const displayError = error || noticeMessage(notice)

  if (isAuthenticated()) {
    return <Navigate to={redirectUrl} replace />
  }

  const clearNotice = () => {
    if (!notice) return
    const next = new URLSearchParams(searchParams)
    next.delete('notice')
    setSearchParams(next, { replace: true })
  }

  const setMode = (mode) => {
    const next = new URLSearchParams(searchParams)
    if (mode === 'sign-up') next.set('mode', 'sign-up')
    else next.delete('mode')
    next.delete('notice')
    setSearchParams(next, { replace: true })
    setError('')
  }

  const handleGoogleAuth = () => {
    setError('')
    clearNotice()
    try {
      startGoogleAuth({
        redirectUrl: isSignUp ? '/onboarding' : redirectUrl,
        isSignUp,
      })
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not start Google sign-in. Please try again.')
    }
  }

  const handleDirectAuth = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        const { data } = await api.post('/api/auth/register', {
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        })
        persistSession(data)
        navigate('/onboarding', { replace: true })
      } else {
        const { data } = await api.post('/api/auth/login', {
          email: email.trim(),
          password,
        })
        persistSession(data)
        const next = await postLoginPath(data.user, redirectUrl)
        navigate(next, { replace: true })
      }
    } catch (err) {
      console.error(err)
      setError(formatAuthError(err, { isSignUp }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-[#0B0F19] font-body text-text-primary selection:bg-accent-blue/30 overflow-x-hidden">
      {/* ─── High-Resolution Cinematic Background Image ─────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/auth-media/auth-bg.jpg"
          alt=""
          className="h-full w-full object-cover object-center filter brightness-[0.32] contrast-[1.12] saturate-[1.25] scale-[1.02]"
        />
        {/* Layered Gradient Overlays for Maximum Contrast & Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/85 to-[#0B0F19]/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19]/95 via-[#0B0F19]/85 to-[#0B0F19]/60" />
        
        {/* Ambient Glowing Orbs */}
        <div
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-accent-blue/15 blur-[120px]"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-10 right-10 h-[450px] w-[450px] rounded-full bg-accent-violet/20 blur-[130px]"
          aria-hidden="true"
        />
        {/* Subtle Tech Grid Texture */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)] opacity-30"
          aria-hidden="true"
        />
      </div>

      {/* ─── Top Floating Header Bar ────────────────────────────────────────── */}
      <header className="relative z-40 border-b border-white/10 bg-[#0B0F19]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-8">
          <LogoLink />

          {/* Mode Switcher Pill */}
          <div className="flex items-center rounded-full border border-white/15 bg-panel/80 p-1 shadow-lg shadow-black/40 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setMode('sign-in')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                !isSignUp
                  ? 'gradient-bg text-white shadow-md'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('sign-up')}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                isSignUp
                  ? 'gradient-bg text-white shadow-md'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span>Create Account</span>
              <span className="hidden sm:inline-block rounded-full bg-emerald-400/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
                5 Free
              </span>
            </button>
          </div>

          <Link
            to="/"
            className="hidden items-center gap-1.5 text-xs font-medium text-text-secondary transition hover:text-text-primary sm:inline-flex"
          >
            <span>Back to Home</span>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </header>

      {/* ─── Main Content Split Layout ─────────────────────────────────────── */}
      <main className="relative z-20 mx-auto flex min-h-[calc(100vh-68px)] max-w-7xl flex-col items-center justify-center px-4 py-8 sm:px-6 lg:flex-row lg:gap-12 lg:py-12">
        
        {/* ─── LEFT: Premium Auth Form Card ───────────────────────────────── */}
        <div className="w-full max-w-md lg:w-[480px] lg:shrink-0 animate-fade-slide-down">
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#141C2E]/85 p-6 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
            {/* Top Specular Highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            {/* Form Title & Subtitle */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent-blue/30 bg-accent-blue/10 px-3 py-0.5 text-[11px] font-semibold text-accent-blue">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-blue animate-pulse" />
                <span>{isSignUp ? '🎁 5 Free Starter Credits' : '⚡ AI Marketing Cloud'}</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white text-balance">
                {isSignUp ? 'Create your workspace' : 'Welcome back'}
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary text-pretty">
                {isSignUp
                  ? 'Start generating high-converting videos and image ads for YouTube, Instagram, Facebook & more.'
                  : 'Sign in to access your studio, scheduled posts, and media library.'}
              </p>
            </div>

            {/* Error or Notice Alert */}
            {displayError && (
              <div className="mt-5 rounded-xl border border-error/40 bg-error/15 p-3.5 text-xs text-error backdrop-blur-md">
                <div className="flex items-start gap-2.5">
                  <svg className="h-4 w-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-medium leading-relaxed">{displayError}</p>
                    {displayError === NO_ACCOUNT_MESSAGE && (
                      <button
                        type="button"
                        onClick={() => setMode('sign-up')}
                        className="mt-2 inline-flex items-center gap-1 font-bold underline underline-offset-2 text-white hover:text-emerald-300"
                      >
                        Create an account first →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Google OAuth Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="group flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[0.04] px-4 text-xs sm:text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-white/30 hover:bg-white/[0.08] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Or Divider */}
            <div className="my-5 flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-white/10" />
              <span className="font-heading text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                or continue with email
              </span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleDirectAuth} className="space-y-4">
              {isSignUp && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-text-secondary">
                      First Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Sarah"
                        className="h-10 w-full rounded-xl border border-white/15 bg-[#0B0F19]/80 pl-9 pr-3 text-xs sm:text-sm text-text-primary placeholder:text-text-muted outline-none transition-all focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/30"
                      />
                      <svg
                        className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-text-muted"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-text-secondary">
                      Last Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Connor"
                        className="h-10 w-full rounded-xl border border-white/15 bg-[#0B0F19]/80 pl-9 pr-3 text-xs sm:text-sm text-text-primary placeholder:text-text-muted outline-none transition-all focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/30"
                      />
                      <svg
                        className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-text-muted"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-semibold text-text-secondary">
                  Email address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="creator@brand.com"
                    autoComplete="email"
                    className="h-10 w-full rounded-xl border border-white/15 bg-[#0B0F19]/80 pl-9 pr-3 text-xs sm:text-sm text-text-primary placeholder:text-text-muted outline-none transition-all focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/30"
                  />
                  <svg
                    className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-text-muted"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-secondary">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    className="h-10 w-full rounded-xl border border-white/15 bg-[#0B0F19]/80 pl-9 pr-10 text-xs sm:text-sm text-text-primary placeholder:text-text-muted outline-none transition-all focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/30 font-mono"
                  />
                  <svg
                    className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-text-muted"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-2 flex h-6 w-6 items-center justify-center rounded-lg text-text-muted hover:text-text-primary transition"
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl gradient-bg font-heading text-xs sm:text-sm font-semibold text-white shadow-lg gradient-glow transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Authenticating...</span>
                  </>
                ) : isSignUp ? (
                  <>
                    <span>Claim 5 Free Credits & Sign Up</span>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Sign In to Studio</span>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Bottom Quick Switch Link */}
            <div className="mt-5 border-t border-white/10 pt-4 text-center">
              <p className="text-xs text-text-secondary">
                {isSignUp ? (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('sign-in')}
                      className="font-semibold text-accent-blue hover:text-accent-blue/80 underline underline-offset-2 transition"
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    New to Admart?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('sign-up')}
                      className="font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition"
                    >
                      Create account (5 free credits)
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Multi-Platform Video Showcase ───────────────────────── */}
        <div className="relative mt-10 w-full max-w-xl flex-1 lg:mt-0">
          
          {/* Showcase Banner Header */}
          <div className="mb-6 space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-blue/30 bg-accent-blue/15 px-3 py-1 text-xs font-semibold text-accent-blue backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE MULTI-PLATFORM PREVIEWS</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white text-balance">
              Generate Studio Ads for <span className="gradient-text">YouTube</span>, <span className="text-pink-400">Instagram</span>, <span className="text-blue-400">Facebook</span> & More
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary text-pretty max-w-lg">
              Admart creates high-converting videos and marketing images tailored specifically for every social feed algorithm in seconds.
            </p>
          </div>

          {/* Floating Metric Badge */}
          <div
            className="pointer-events-none absolute -right-4 top-48 z-20 hidden xl:block"
            style={{ animationDelay: '0.8s' }}
          >
            <div className="animate-float rounded-2xl border border-white/15 bg-[#141C2E]/90 px-3.5 py-2.5 text-xs font-bold text-white shadow-2xl backdrop-blur-md">
              <span className="text-emerald-400 text-sm">4.9 / 5.0</span>
              <span className="block text-[10px] font-medium text-text-secondary">Creator Satisfaction</span>
            </div>
          </div>

          {/* 2x2 Staggered Video Cards Grid */}
          <div className="grid grid-cols-2 gap-3.5 sm:gap-5">
            {showcaseItems.map((item, index) => (
              <ShowcaseCard
                key={item.title}
                item={item}
                offset={index === 1 || index === 3}
                isMuted={mutedCardIndex !== index}
                onToggleMute={() => {
                  setMutedCardIndex(mutedCardIndex === index ? -1 : index)
                }}
              />
            ))}
          </div>

          {/* Social Proof Strip */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-panel/40 px-4 py-3 backdrop-blur-md text-xs text-text-secondary">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                <span className="inline-block h-6 w-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 ring-2 ring-panel text-center text-[10px] font-bold text-white leading-6">S</span>
                <span className="inline-block h-6 w-6 rounded-full bg-gradient-to-tr from-pink-600 to-rose-500 ring-2 ring-panel text-center text-[10px] font-bold text-white leading-6">M</span>
                <span className="inline-block h-6 w-6 rounded-full bg-gradient-to-tr from-purple-600 to-amber-500 ring-2 ring-panel text-center text-[10px] font-bold text-white leading-6">A</span>
              </div>
              <span className="font-semibold text-white">Join 12,500+ creators</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Instant AI Deployment</span>
            </div>
          </div>

        </div>

      </main>
    </div>
  )
}
