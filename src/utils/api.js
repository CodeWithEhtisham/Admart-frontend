import axios from 'axios'
import { clearSession, getAccessToken, getRefreshToken, isTokenExpired } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000')

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Refresh tokens rotate and the old one is revoked, so a page load that fires several
// requests with an expired access token must share ONE refresh call. Otherwise the
// second refresh reuses the revoked token, gets 401 and logs the user out.
let refreshing = null

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token.')
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
      refresh: refreshToken,
      refreshToken,
    })
    const newAccessToken = response.data.access || response.data.accessToken
    window.localStorage.setItem('accessToken', newAccessToken)
    const newRefreshToken = response.data.refresh || response.data.refreshToken
    if (newRefreshToken) window.localStorage.setItem('refreshToken', newRefreshToken)
    return newAccessToken
  } catch (err) {
    // Another tab may have refreshed (and rotated the token) at the same time.
    if (getRefreshToken() !== refreshToken && getAccessToken()) return getAccessToken()
    throw err
  }
}

api.interceptors.request.use(
  async (config) => {
    let token = getAccessToken()
    if (token) {
      if (isTokenExpired(token)) {
        const refreshToken = getRefreshToken()
        if (refreshToken && !isTokenExpired(refreshToken)) {
          try {
            refreshing = refreshing || refreshAccessToken().finally(() => (refreshing = null))
            token = await refreshing
          } catch {
            /* refresh failed */
          }
        }
      }
      if (token && !isTokenExpired(token)) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/api/auth/refresh'
    ) {
      originalRequest._retry = true
      const refreshToken = getRefreshToken()
      if (!refreshToken || isTokenExpired(refreshToken)) {
        clearSession()
        return Promise.reject(error)
      }

      // Sent with an old token that has since been refreshed: just retry with the new one.
      const current = getAccessToken()
      if (current && originalRequest.headers.Authorization !== `Bearer ${current}` && !isTokenExpired(current)) {
        originalRequest.headers.Authorization = `Bearer ${current}`
        return api(originalRequest)
      }
      try {
        refreshing = refreshing || refreshAccessToken().finally(() => (refreshing = null))
        const newAccessToken = await refreshing
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        clearSession()
        const isPublic =
          ['/', '/templates', '/privacy', '/terms'].includes(window.location.pathname) ||
          window.location.pathname.startsWith('/auth')
        if (!isPublic) {
          window.location.href = '/auth'
        }
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  },
)

export default api
