import { useState } from 'react'
import { SignIn, SignUp, useAuth } from '@clerk/react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'

const showcaseItems = [
  { title: 'Launch Hype', duration: '0:28', platform: 'TikTok', badge: 'bg-tiktok text-base' },
  { title: 'Tutorial Cut', duration: '3:05', platform: 'YouTube', badge: 'bg-youtube text-white' },
  { title: 'Drop Reel', duration: '0:42', platform: 'Instagram', badge: 'bg-instagram text-white' },
  { title: 'Community', duration: '1:11', platform: 'Facebook', badge: 'bg-facebook text-white' },
]

const clerkAppearance = {
  variables: {
    colorPrimary: '#2563eb',
    colorBackground: '#111113',
    colorInputBackground: '#0f0f12',
    colorInputText: '#f4f4f5',
    colorText: '#f4f4f5',
    colorTextSecondary: '#a1a1aa',
    colorNeutral: '#71717a',
    borderRadius: '0.75rem',
    fontFamily: 'DM Sans, sans-serif',
  },
  elements: {
    cardBox: 'w-full max-w-md border border-border-default bg-panel shadow-none',
    card: 'bg-panel shadow-none',
    formButtonPrimary: 'gradient-bg shadow-lg shadow-accent-blue/25 hover:opacity-95',
    footerActionLink: 'text-accent-blue hover:text-accent-violet',
    socialButtonsBlockButton: 'border-border-default bg-surface text-text-primary hover:bg-elevated',
    formFieldInput: 'border-border-default bg-input text-text-primary',
    dividerLine: 'bg-border-default',
    dividerText: 'text-text-muted',
  },
}

function LogoLink() {
  return (
    <Link to="/" className="mb-8 inline-flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl gradient-bg font-heading text-lg font-bold text-white shadow-lg shadow-accent-blue/25">
        A
      </span>
      <span className="font-heading text-xl font-semibold tracking-tight text-text-primary">
        Admart
      </span>
    </Link>
  )
}

function ShowcaseCard({ item, offset }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-border-default bg-surface shadow-xl ${offset ? 'mt-8 sm:mt-10' : ''}`}
    >
      <div className="absolute inset-0 gradient-bg opacity-35" />
      <div className="absolute inset-0 bg-linear-to-t from-base via-base/50 to-transparent" />
      <div className="relative flex aspect-[3/4] flex-col justify-between p-4">
        <div className="flex items-start justify-between">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition group-hover:bg-white/20"
            aria-hidden
          >
            <svg className="ml-0.5 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          </span>
          <span className="rounded-md bg-base/80 px-2 py-0.5 font-mono text-[10px] text-text-secondary backdrop-blur-sm">
            {item.duration}
          </span>
        </div>
        <div className="space-y-2">
          <p className="font-heading text-xs font-semibold text-text-primary">{item.title}</p>
          <span
            className={`inline-flex rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${item.badge}`}
          >
            {item.platform}
          </span>
        </div>
      </div>
    </div>
  )
}

function safeRedirect(value) {
  if (!value || typeof value !== 'string') return '/dashboard'
  if (!value.startsWith('/') || value.startsWith('//')) return '/dashboard'
  if (value.startsWith('/auth')) return '/dashboard'
  return value
}

export default function AuthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isLoaded, isSignedIn } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const isSignUp = searchParams.get('mode') === 'sign-up'
  const redirectUrl = safeRedirect(searchParams.get('redirect_url') || location.state?.from)

  const [authTab, setAuthTab] = useState('sso') // 'sso' or 'direct'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if ((isLoaded && isSignedIn) || localStorage.getItem('accessToken')) {
    return <Navigate to={redirectUrl} replace />
  }

  const setMode = (mode) => {
    const next = new URLSearchParams(searchParams)
    if (mode === 'sign-up') next.set('mode', 'sign-up')
    else next.delete('mode')
    setSearchParams(next, { replace: true })
    setError('')
  }

  const signInUrl = `/auth${redirectUrl ? `?redirect_url=${encodeURIComponent(redirectUrl)}` : ''}`
  const signUpUrl = `/auth?mode=sign-up${
    redirectUrl ? `&redirect_url=${encodeURIComponent(redirectUrl)}` : ''
  }`

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
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate('/onboarding', { replace: true })
      } else {
        const { data } = await api.post('/api/auth/login', {
          email: email.trim(),
          password,
        })
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate(redirectUrl, { replace: true })
      }
    } catch (err) {
      console.error(err)
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        (err.response?.data ? Object.values(err.response.data).flat().join(' ') : null) ||
        'Authentication failed. Please check your credentials.'
      setError(String(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base font-body text-text-primary">
      <div className="fixed left-1/2 top-6 z-[60] -translate-x-1/2 animate-slide-up">
        <div className="flex rounded-full border border-border-default bg-elevated p-1 shadow-xl shadow-black/40">
          <button
            type="button"
            onClick={() => setMode('sign-in')}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              !isSignUp ? 'gradient-bg text-white shadow-md' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('sign-up')}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              isSignUp ? 'gradient-bg text-white shadow-md' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Create Account
          </button>
        </div>
      </div>

      <div className="flex min-h-screen flex-col lg:flex-row lg:pt-0">
        <aside className="flex w-full shrink-0 flex-col justify-center border-b border-border bg-panel px-8 py-24 pt-28 sm:px-14 lg:w-[520px] lg:border-b-0 lg:border-r lg:border-border lg:py-20">
          <div className="mx-auto w-full max-w-md animate-fade-slide-down">
            <LogoLink />
            <h1 className="font-heading text-3xl font-bold text-text-primary">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              {isSignUp
                ? 'Create your workspace with 50 free starter credits.'
                : 'Sign in to continue creating and publishing with Admart.'}
            </p>

            <div className="mt-6 flex rounded-lg border border-border-default bg-surface p-1 text-xs font-medium text-text-secondary">
              <button
                type="button"
                onClick={() => { setAuthTab('sso'); setError(''); }}
                className={`flex-1 rounded-md py-1.5 transition ${
                  authTab === 'sso' ? 'bg-panel text-text-primary shadow-sm font-semibold' : 'hover:text-text-primary'
                }`}
              >
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab('direct'); setError(''); }}
                className={`flex-1 rounded-md py-1.5 transition ${
                  authTab === 'direct' ? 'bg-panel text-text-primary shadow-sm font-semibold' : 'hover:text-text-primary'
                }`}
              >
                Email & Password
              </button>
            </div>

            <div className="mt-6">
              {authTab === 'sso' ? (
                isSignUp ? (
                  <SignUp
                    appearance={clerkAppearance}
                    fallbackRedirectUrl="/onboarding"
                    forceRedirectUrl="/onboarding"
                    routing="hash"
                    signInUrl={signInUrl}
                  />
                ) : (
                  <SignIn
                    appearance={clerkAppearance}
                    fallbackRedirectUrl={redirectUrl}
                    forceRedirectUrl={redirectUrl}
                    routing="hash"
                    signUpUrl={signUpUrl}
                  />
                )
              ) : (
                <form onSubmit={handleDirectAuth} className="space-y-4 rounded-xl border border-border-default bg-surface p-5">
                  {error && (
                    <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-xs text-error">
                      {error}
                    </div>
                  )}

                  {isSignUp && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">First Name</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          className="w-full h-10 rounded-lg border border-border-default bg-input px-3 text-sm text-text-primary outline-none focus:border-accent-blue"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">Last Name</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe"
                          className="w-full h-10 rounded-lg border border-border-default bg-input px-3 text-sm text-text-primary outline-none focus:border-accent-blue"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Email address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full h-10 rounded-lg border border-border-default bg-input px-3 text-sm text-text-primary outline-none focus:border-accent-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 rounded-lg border border-border-default bg-input px-3 text-sm text-text-primary outline-none focus:border-accent-blue"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 rounded-lg gradient-bg text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 transition hover:opacity-95 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : isSignUp ? 'Create Account (50 Free Credits)' : 'Sign In'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </aside>

        <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-base px-6 py-16 lg:py-20">
          <div
            className="pointer-events-none absolute left-1/4 top-1/4 h-72 w-72 -translate-x-1/2 rounded-full bg-accent-blue/20 blur-[100px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-1/4 right-1/4 h-80 w-80 translate-x-1/3 rounded-full bg-accent-violet/25 blur-[110px]"
            aria-hidden
          />

          <div className="relative z-10 w-full max-w-lg">
            {isSignUp ? (
              <>
                <div className="pointer-events-none absolute left-[8%] top-[14%] hidden lg:block">
                  <div className="animate-float rounded-2xl border border-border-default bg-panel/90 px-4 py-3 text-sm font-semibold text-text-primary shadow-xl backdrop-blur-sm">
                    <span className="gradient-text">10,000+</span> Videos
                  </div>
                </div>
                <div
                  className="pointer-events-none absolute right-[8%] top-[26%] hidden lg:block"
                  style={{ animationDelay: '0.6s' }}
                >
                  <div className="animate-float rounded-2xl border border-border-default bg-panel/90 px-4 py-3 text-sm font-semibold text-text-primary shadow-xl backdrop-blur-sm">
                    <span className="text-accent-blue">4</span> Platforms
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="pointer-events-none absolute left-[8%] top-[12%] hidden lg:block">
                  <div className="animate-float rounded-2xl border border-border-default bg-panel/90 px-4 py-3 text-sm font-semibold text-text-primary shadow-xl backdrop-blur-sm">
                    <span className="gradient-text">1M+</span> Videos
                  </div>
                </div>
                <div
                  className="pointer-events-none absolute right-[6%] top-[28%] hidden lg:block"
                  style={{ animationDelay: '0.5s' }}
                >
                  <div className="animate-float rounded-2xl border border-border-default bg-panel/90 px-4 py-3 text-sm font-semibold text-text-primary shadow-xl backdrop-blur-sm">
                    <span className="text-success">50+</span> Countries
                  </div>
                </div>
              </>
            )}

            <div className="mx-auto grid max-w-md grid-cols-2 gap-3 sm:gap-4">
              {showcaseItems.map((item, index) => (
                <ShowcaseCard key={item.title} item={item} offset={index === 1 || index === 3} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
