import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import {
  googleRedirectUri,
  persistSession,
  readGoogleOAuthState,
} from '../utils/auth'

function safeRedirect(value) {
  if (!value || typeof value !== 'string') return '/dashboard'
  if (!value.startsWith('/') || value.startsWith('//')) return '/dashboard'
  if (value.startsWith('/auth')) return '/dashboard'
  return value
}

/**
 * Google OAuth redirect target.
 * Exchanges ?code= for Admart JWT via POST /api/auth/google.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    const googleError = searchParams.get('error')
    const code = searchParams.get('code')
    const state = readGoogleOAuthState(searchParams.get('state'))
    const next = safeRedirect(state.redirect || (state.signup ? '/onboarding' : '/dashboard'))

    if (googleError) {
      setError('Google sign-in was cancelled or denied.')
      return
    }
    if (!code) {
      setError('Missing authorization code from Google.')
      return
    }

    let cancelled = false
    const redirectUri = googleRedirectUri()

    api
      .post('/api/auth/google', {
        code,
        redirectUri,
        redirect_uri: redirectUri,
      })
      .then(({ data }) => {
        if (cancelled) return
        persistSession(data)
        navigate(next, { replace: true })
      })
      .catch((err) => {
        if (cancelled) return
        console.error(err)
        const msg =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          'Google sign-in failed. Please try again.'
        setError(String(msg))
      })

    return () => {
      cancelled = true
    }
  }, [navigate, searchParams])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-6 font-body text-text-primary">
      <div className="w-full max-w-md rounded-2xl border border-border-default bg-panel p-8 text-center shadow-xl">
        {error ? (
          <>
            <h1 className="font-heading text-xl font-bold">Sign-in failed</h1>
            <p className="mt-2 text-sm text-error">{error}</p>
            <Link
              to="/auth"
              className="mt-6 inline-flex rounded-lg gradient-bg px-4 py-2 text-sm font-semibold text-white"
            >
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-accent-violet border-t-transparent" />
            <h1 className="mt-6 font-heading text-xl font-bold">Completing sign-in...</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Please wait while we finish setting up your session.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
