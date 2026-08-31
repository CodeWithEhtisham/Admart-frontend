/**
 * Admart session — backend JWT only (no Clerk / Firebase).
 */

const ACCESS_KEY = 'accessToken'
const REFRESH_KEY = 'refreshToken'
const USER_KEY = 'user'
const GOOGLE_STATE_KEY = 'admart.googleOAuthState'

export const AUTH_CHANGE_EVENT = 'admart:auth-change'

function notifyAuthChanged() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT))
}

export function getAccessToken() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(REFRESH_KEY)
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return Boolean(getAccessToken())
}

export function persistSession(data) {
  if (!data) throw new Error('No auth payload returned.')
  const access = data.accessToken || data.access
  const refresh = data.refreshToken || data.refresh
  if (!access) throw new Error('No access token returned.')

  window.localStorage.setItem(ACCESS_KEY, access)
  if (refresh) window.localStorage.setItem(REFRESH_KEY, refresh)
  if (data.user) window.localStorage.setItem(USER_KEY, JSON.stringify(data.user))
  notifyAuthChanged()
}

export function clearSession() {
  window.localStorage.removeItem(ACCESS_KEY)
  window.localStorage.removeItem(REFRESH_KEY)
  window.localStorage.removeItem(USER_KEY)
  notifyAuthChanged()
}

export function googleRedirectUri() {
  return `${window.location.origin}/auth-callback`
}

export function googleClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
}

/**
 * Redirect the browser to Google's authorize URL.
 * Callback lands on /auth-callback with ?code=
 */
export function startGoogleAuth({ redirectUrl = '/dashboard', isSignUp = false } = {}) {
  const clientId = googleClientId()
  if (!clientId) {
    throw new Error('Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID to the frontend env.')
  }

  const redirectUri = googleRedirectUri()
  const state = JSON.stringify({
    redirect: redirectUrl,
    signup: Boolean(isSignUp),
    nonce: `${Date.now()}`,
  })
  window.sessionStorage.setItem(GOOGLE_STATE_KEY, state)

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state,
  })

  window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
}

export function readGoogleOAuthState(rawState) {
  try {
    const parsed = JSON.parse(rawState || window.sessionStorage.getItem(GOOGLE_STATE_KEY) || '{}')
    window.sessionStorage.removeItem(GOOGLE_STATE_KEY)
    return parsed
  } catch {
    window.sessionStorage.removeItem(GOOGLE_STATE_KEY)
    return {}
  }
}
