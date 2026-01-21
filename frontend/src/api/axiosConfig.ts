import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { cookieUtils } from '../utils/cookies'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = cookieUtils.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = cookieUtils.getRefreshToken()
      
      if (refreshToken) {
        try {
          // Attempt to refresh token
          const response = await axios.post(
            import.meta.env.VITE_API_URL + '/auth/refresh',
            { refreshToken }
          )
          
          const { token } = response.data
          cookieUtils.setToken(token)
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          cookieUtils.clearAuthCookies()
          // window.location.href = '/auth'
          return Promise.reject(refreshError)
        }
      } else {
        // No refresh token, clear cookies and redirect
        cookieUtils.clearAuthCookies()
        // window.location.href = '/auth'
      }
    }

    // Handle other errors
    if (error.response?.data?.error?.message) {
      error.message = error.response.data.error.message
    } else if (error.response?.data?.message) {
      error.message = error.response.data.message
    }

    return Promise.reject(error)
  }
)

export default api
