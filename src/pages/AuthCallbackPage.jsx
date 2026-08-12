import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import { postAuthDestination } from '../utils/templates'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState(null)

  useEffect(() => {
    const code = searchParams.get('code')

    if (!code) {
      navigate('/auth')
      return
    }

    const exchangeCode = async () => {
      try {
        const response = await api.post('/api/auth/google', { code })
        const { accessToken, refreshToken, user } = response.data

        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('user', JSON.stringify(user))

        navigate(postAuthDestination(user))
      } catch (err) {
        console.error('OAuth exchange error:', err)
        setError(err.response?.data?.detail || 'Failed to authenticate with Google.')
      }
    }

    exchangeCode()
  }, [searchParams, navigate])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-6 font-body text-text-primary">
      <div className="w-full max-w-md rounded-2xl border border-border-default bg-panel p-8 text-center shadow-xl">
        {error ? (
          <div className="space-y-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-error">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="font-heading text-xl font-bold">Authentication Failed</h1>
            <p className="text-sm text-text-secondary">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="w-full rounded-xl bg-accent-blue py-3 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 transition hover:bg-blue-600"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-accent-violet border-t-transparent" />
            <h1 className="font-heading text-xl font-bold">Signing you in...</h1>
            <p className="text-sm text-text-secondary">Please wait while we complete the authentication process.</p>
          </div>
        )}
      </div>
    </div>
  )
}
