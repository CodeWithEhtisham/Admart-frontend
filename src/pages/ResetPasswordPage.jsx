import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../utils/api'

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

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const checks = useMemo(() => getPasswordChecks(newPassword), [newPassword])
  const score = checks.filter(Boolean).length
  const strength = strengthMeta(score)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!token) {
      setError('Invalid or missing password reset token.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (score < 4) {
      setError('Please make sure your password meets all strength requirements.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await api.post('/api/auth/reset-password', {
        token,
        newPassword,
      })
      setSuccess(true)
    } catch (err) {
      console.error('Password reset error:', err)
      const fieldErrors = err.response?.data
      if (fieldErrors?.non_field_errors) {
        setError(fieldErrors.non_field_errors[0])
      } else if (fieldErrors?.newPassword) {
        setError(fieldErrors.newPassword[0])
      } else {
        setError(err.response?.data?.detail || 'Failed to reset password. The link may have expired.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-6 font-body text-text-primary">
      <div className="relative w-full max-w-md rounded-2xl border border-border-default bg-panel p-8 shadow-xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl gradient-bg font-heading text-lg font-bold text-white shadow-lg">
            V
          </span>
          <span className="font-heading text-xl font-semibold tracking-tight text-text-primary">
            Vidify
          </span>
        </Link>

        {success ? (
          <div className="space-y-6 text-center animate-fade-slide-down">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h1 className="font-heading text-2xl font-bold">Password Reset Successful</h1>
            <p className="text-sm text-text-secondary">
              Your password has been successfully reset. You can now sign in with your new credentials.
            </p>
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="w-full rounded-xl bg-accent-blue py-3 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 transition hover:bg-blue-600"
            >
              Sign In
            </button>
          </div>
        ) : (
          <div className="animate-fade-slide-down">
            <h1 className="font-heading text-2xl font-bold">Reset Password</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Please choose a new, strong password for your account.
            </p>

            {error && (
              <div className="mt-4 rounded-xl border border-error/30 bg-error/10 p-3.5 text-xs font-medium text-error">
                {error}
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="new-password" className="text-xs font-medium text-text-tertiary">
                    New Password
                  </label>
                  <span className={`min-h-[1rem] text-xs font-medium ${score <= 1 ? 'text-error' : score <= 3 ? 'text-warning' : 'text-success'}`}>
                    {newPassword ? strength.label : ''}
                  </span>
                </div>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border-default bg-input px-4 text-sm text-text-primary outline-none ring-accent-blue/30 transition placeholder:text-text-muted focus:border-accent-blue/50 focus:ring-2"
                  placeholder="Enter new password"
                  required
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

              <div>
                <label htmlFor="confirm-password" className="mb-1.5 block text-xs font-medium text-text-tertiary">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border-default bg-input px-4 text-sm text-text-primary outline-none ring-accent-blue/30 transition placeholder:text-text-muted focus:border-accent-blue/50 focus:ring-2"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl gradient-bg text-sm font-semibold text-white shadow-lg shadow-accent-blue/30 transition hover:opacity-95 disabled:opacity-50"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-text-tertiary">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="font-semibold text-accent-violet hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
