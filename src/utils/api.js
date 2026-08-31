import axios from 'axios'
import { clearSession, getAccessToken, getRefreshToken } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refresh: refreshToken,
            refreshToken,
          })

          const newAccessToken = response.data.access || response.data.accessToken
          window.localStorage.setItem('accessToken', newAccessToken)
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return api(originalRequest)
        } catch (refreshError) {
          clearSession()
          window.location.href = '/auth'
          return Promise.reject(refreshError)
        }
      }
    }
    return Promise.reject(error)
  },
)

export default api
