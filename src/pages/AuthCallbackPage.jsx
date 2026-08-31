import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import {
  googleRedirectUri,
  isNoAccountError,
  persistSession,
  readGoogleOAuthState,
} from '../utils/auth'
import { postLoginPath } from '../utils/projects'

const EXCHANGED_CODE_PREFIX = 'admart.googleCode.'

function markCodeExchanged(code) {
  const key = `${EXCHANGED_CODE_PREFIX}${code}`
  if (window.sessionStorage.getItem(key)) return false
  window.sessionStorage.setItem(key, '1')
  return true
}

/**
 * Google OAuth redirect target.
 * Exchanges ?code= for Admart JWT, then leaves this page.
 * Sign-in does not create an account; sign-up does.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const googleError = searchParams.get('error')
    const code = searchParams.get('code')
    const state = readGoogleOAuthState(searchParams.get('state'))
    const isSignUp = Boolean(state.signup || state.intent === 'register')
    const intent = isSignUp ? 'register' : 'login'
    const intended = state.redirect || (isSignUp ? '/onboarding' : '/dashboard')

    if (googleError) {
      navigate('/auth?notice=google_denied', { replace: true })
      return
    }
    if (!code) {
      navigate('/auth?notice=google_failed', { replace: true })
      return
    }
    if (!markCodeExchanged(code)) {
      return
    }

    const redirectUri = googleRedirectUri()

    api
      .post('/api/auth/google', {
        code,
        redirectUri,
        redirect_uri: redirectUri,
        intent,
        createAccount: isSignUp,
      })
      .then(async ({ data }) => {
        persistSession(data)
        const next = await postLoginPath(data.user, intended)
        navigate(next, { replace: true })
      })
      .catch((err) => {
        console.error(err)
        if (!isSignUp && isNoAccountError(err)) {
          navigate('/auth?notice=no_account', { replace: true })
          return
        }
        navigate('/auth?notice=google_failed', { replace: true })
      })
  }, [navigate, searchParams])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-6 font-body text-text-primary">
      <div className="w-full max-w-md rounded-2xl border border-border-default bg-panel p-8 text-center shadow-xl">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-accent-violet border-t-transparent" />
        <h1 className="mt-6 font-heading text-xl font-bold">Completing sign-in...</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Please wait while we finish setting up your session.
        </p>
      </div>
    </div>
  )
}
