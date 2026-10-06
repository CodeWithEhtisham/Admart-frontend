import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import BrandGlyph from '../components/BrandGlyph'

/** Request a password-reset email. Same answer whether or not the email exists. */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/api/auth/forgot-password', { email: email.trim() })
      setSent(true)
    } catch (err) {
      const data = err?.response?.data
      setError(
        err?.response?.status === 429
          ? 'Too many attempts. Please wait a minute and try again.'
          : data?.email?.[0] || data?.message || 'Could not send the reset email. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-6 font-body text-text-primary">
      <main className="relative w-full max-w-md rounded-2xl border border-border-default bg-panel p-8 shadow-xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2.5" aria-label="Admart home">
          <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-xl gradient-bg font-heading text-lg font-bold text-white shadow-lg">
            <BrandGlyph />
          </span>
          <span aria-hidden className="font-heading text-xl font-semibold tracking-tight text-text-primary">
            Admart
          </span>
        </Link>

        {sent ? (
          <div role="status" className="space-y-4">
            <h1 className="font-heading text-2xl font-bold">Check your email</h1>
            <p className="text-sm text-text-secondary">
              If an account exists for <span className="font-semibold text-text-primary">{email.trim()}</span>, we&apos;ve
              sent a link to reset your password. It works once and expires in one hour.
            </p>
            <Link to="/auth" className="inline-block text-sm font-semibold text-link hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-heading text-2xl font-bold">Forgot your password?</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Enter the email you sign in with and we&apos;ll send you a reset link.
            </p>

            {error && (
              <div role="alert" className="mt-4 rounded-xl border border-error/30 bg-error/10 p-3.5 text-xs font-medium text-danger">
                {error}
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="forgot-email" className="mb-1.5 block text-xs font-medium text-text-tertiary">
                  Email address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border-default bg-input px-4 text-sm text-text-primary outline-none ring-accent-blue/30 transition placeholder:text-text-muted focus:border-accent-blue/50 focus:ring-2"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-xl gradient-bg text-sm font-semibold text-white shadow-lg shadow-accent-blue/30 transition hover:opacity-95 disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-text-tertiary">
              Remember it?{' '}
              <Link to="/auth" className="font-semibold text-link hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </main>
    </div>
  )
}
