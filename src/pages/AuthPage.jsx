import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const showcaseItems = [
  { title: 'Launch Hype', duration: '0:28', platform: 'TikTok', badge: 'bg-tiktok text-base' },
  { title: 'Tutorial Cut', duration: '3:05', platform: 'YouTube', badge: 'bg-youtube text-white' },
  { title: 'Drop Reel', duration: '0:42', platform: 'Instagram', badge: 'bg-instagram text-white' },
  { title: 'Community', duration: '1:11', platform: 'Facebook', badge: 'bg-facebook text-white' },
]

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function LogoLink() {
  return (
    <Link to="/" className="mb-10 inline-flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl gradient-bg font-heading text-lg font-bold text-white shadow-lg shadow-accent-blue/25">
        V
      </span>
      <span className="font-heading text-xl font-semibold tracking-tight text-text-primary">
        Vidify
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
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition group-hover:bg-white/20"
            aria-label="Play preview"
          >
            <svg className="ml-0.5 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          </button>
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

function getPasswordChecks(password) {
  return [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
}

function strengthMeta(score) {
  if (score <= 1) return { label: 'Weak', bar: 'bg-error' }
  if (score <= 3) return { label: 'Medium', bar: 'bg-warning' }
  return { label: 'Strong', bar: 'bg-success' }
}

export default function AuthPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('signin')

  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)

  const checks = useMemo(() => getPasswordChecks(signUpPassword), [signUpPassword])
  const score = checks.filter(Boolean).length
  const strength = strengthMeta(score)

  return (
    <div className="min-h-screen bg-base font-body text-text-primary">
      <div className="fixed left-1/2 top-6 z-[60] -translate-x-1/2 animate-slide-up">
        <div className="flex rounded-full border border-border-default bg-elevated p-1 shadow-xl shadow-black/40">
          <button
            type="button"
            onClick={() => setTab('signin')}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              tab === 'signin'
                ? 'gradient-bg text-white shadow-md'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('signup')}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              tab === 'signup'
                ? 'gradient-bg text-white shadow-md'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Create Account
          </button>
        </div>
      </div>

      <div className="flex min-h-screen flex-col lg:flex-row lg:pt-0">
        <aside className="flex w-full shrink-0 flex-col justify-center border-b border-border bg-panel px-8 py-24 pt-28 sm:px-14 lg:w-[520px] lg:border-b-0 lg:border-r lg:border-border lg:py-20">
          {tab === 'signin' ? (
            <div className="mx-auto w-full max-w-md animate-fade-slide-down">
              <LogoLink />
              <h1 className="font-heading text-3xl font-bold text-text-primary">Welcome back</h1>
              <p className="mt-2 text-sm text-text-secondary">
                Sign in to continue creating and publishing with Vidify.
              </p>

              <button
                type="button"
                className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border-default bg-white text-sm font-semibold text-neutral-800 transition hover:bg-neutral-100"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="my-8 flex items-center gap-4">
                <span className="h-px flex-1 bg-border-default" />
                <span className="text-xs text-text-muted">or continue with email</span>
                <span className="h-px flex-1 bg-border-default" />
              </div>

              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  navigate('/onboarding')
                }}
              >
                <div>
                  <label htmlFor="signin-email" className="mb-1.5 block text-xs font-medium text-text-tertiary">
                    Email
                  </label>
                  <input
                    id="signin-email"
                    type="email"
                    autoComplete="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="h-11 w-full rounded-xl border border-border-default bg-input px-4 text-sm text-text-primary outline-none ring-accent-blue/30 transition placeholder:text-text-muted focus:border-accent-blue/50 focus:ring-2"
                    placeholder="you@studio.com"
                  />
                </div>
                <div>
                  <label htmlFor="signin-password" className="mb-1.5 block text-xs font-medium text-text-tertiary">
                    Password
                  </label>
                  <input
                    id="signin-password"
                    type="password"
                    autoComplete="current-password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="h-11 w-full rounded-xl border border-border-default bg-input px-4 text-sm text-text-primary outline-none ring-accent-blue/30 transition placeholder:text-text-muted focus:border-accent-blue/50 focus:ring-2"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <label className="flex cursor-pointer items-center gap-2 text-text-secondary">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-border-default bg-input text-accent-blue focus:ring-accent-blue/40"
                    />
                    Remember me
                  </label>
                  <button type="button" className="text-sm font-medium text-accent-blue hover:underline">
                    Forgot password?
                  </button>
                </div>
                <button
                  type="submit"
                  className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl gradient-bg text-sm font-semibold text-white shadow-lg shadow-accent-violet/25 transition hover:opacity-95"
                >
                  Sign In
                  <span aria-hidden>→</span>
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-text-tertiary">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('signup')}
                  className="font-semibold text-accent-violet hover:underline"
                >
                  Sign up free
                </button>
              </p>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-md animate-fade-slide-down">
              <LogoLink />
              <h1 className="font-heading text-3xl font-bold text-text-primary">Create your account</h1>
              <p className="mt-2 text-sm text-text-secondary">
                Get 5 free credits and start publishing AI videos in minutes.
              </p>

              <button
                type="button"
                className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border-default bg-white text-sm font-semibold text-neutral-800 transition hover:bg-neutral-100"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="my-8 flex items-center gap-4">
                <span className="h-px flex-1 bg-border-default" />
                <span className="text-xs text-text-muted">or continue with email</span>
                <span className="h-px flex-1 bg-border-default" />
              </div>

              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  navigate('/onboarding')
                }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="first-name" className="mb-1.5 block text-xs font-medium text-text-tertiary">
                      First name
                    </label>
                    <input
                      id="first-name"
                      type="text"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-11 w-full rounded-xl border border-border-default bg-input px-3 text-sm text-text-primary outline-none ring-accent-blue/30 transition placeholder:text-text-muted focus:border-accent-blue/50 focus:ring-2"
                      placeholder="Alex"
                    />
                  </div>
                  <div>
                    <label htmlFor="last-name" className="mb-1.5 block text-xs font-medium text-text-tertiary">
                      Last name
                    </label>
                    <input
                      id="last-name"
                      type="text"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-11 w-full rounded-xl border border-border-default bg-input px-3 text-sm text-text-primary outline-none ring-accent-blue/30 transition placeholder:text-text-muted focus:border-accent-blue/50 focus:ring-2"
                      placeholder="Rivera"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="signup-email" className="mb-1.5 block text-xs font-medium text-text-tertiary">
                    Email
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="h-11 w-full rounded-xl border border-border-default bg-input px-4 text-sm text-text-primary outline-none ring-accent-blue/30 transition placeholder:text-text-muted focus:border-accent-blue/50 focus:ring-2"
                    placeholder="you@studio.com"
                  />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="signup-password" className="text-xs font-medium text-text-tertiary">
                      Password
                    </label>
                    <span className={`min-h-[1rem] text-xs font-medium ${score <= 1 ? 'text-error' : score <= 3 ? 'text-warning' : 'text-success'}`}>
                      {signUpPassword ? strength.label : ''}
                    </span>
                  </div>
                  <input
                    id="signup-password"
                    type="password"
                    autoComplete="new-password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="h-11 w-full rounded-xl border border-border-default bg-input px-4 text-sm text-text-primary outline-none ring-accent-blue/30 transition placeholder:text-text-muted focus:border-accent-blue/50 focus:ring-2"
                    placeholder="Create a strong password"
                  />
                  <div className="mt-2 flex gap-1.5">
                    {checks.map((ok, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition ${
                          ok ? strength.bar : 'bg-elevated'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1.5 text-[11px] text-text-muted">
                    Use 8+ characters with uppercase, numbers, and a special character.
                  </p>
                </div>
                <label className="flex cursor-pointer items-start gap-2 text-sm text-text-secondary">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-border-default bg-input text-accent-blue focus:ring-accent-blue/40"
                  />
                  <span>
                    I agree to the{' '}
                    <button type="button" className="text-accent-blue hover:underline">
                      Terms
                    </button>{' '}
                    and{' '}
                    <button type="button" className="text-accent-blue hover:underline">
                      Privacy Policy
                    </button>
                    .
                  </span>
                </label>
                <button
                  type="submit"
                  className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl gradient-bg text-sm font-semibold text-white shadow-lg shadow-accent-blue/30 transition hover:opacity-95"
                >
                  Create Account
                  <span aria-hidden>→</span>
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-text-tertiary">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('signin')}
                  className="font-semibold text-accent-violet hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
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
            {tab === 'signin' ? (
              <>
                <div className="pointer-events-none absolute left-[8%] top-[12%] hidden lg:block">
                  <div className="animate-float rounded-2xl border border-border-default bg-panel/90 px-4 py-3 text-sm font-semibold text-text-primary shadow-xl backdrop-blur-sm">
                    <span className="gradient-text">1M+</span> Videos
                  </div>
                </div>
                <div className="pointer-events-none absolute right-[6%] top-[28%] hidden lg:block" style={{ animationDelay: '0.5s' }}>
                  <div className="animate-float rounded-2xl border border-border-default bg-panel/90 px-4 py-3 text-sm font-semibold text-text-primary shadow-xl backdrop-blur-sm">
                    <span className="text-success">50+</span> Countries
                  </div>
                </div>
              </>
            ) : (
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
            )}

            <div className="mx-auto grid max-w-md grid-cols-2 gap-3 sm:gap-4">
              {showcaseItems.map((item, i) => (
                <ShowcaseCard key={item.title} item={item} offset={i === 1 || i === 3} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
