import axios, { AxiosResponse } from 'axios'

// Create axios instance for public API calls using API tokens
const publicApi = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add API token
publicApi.interceptors.request.use(
  (config) => {
    const apiToken = (import.meta as any).env.VITE_STRAPI_API_TOKEN
    if (apiToken) {
      config.headers.Authorization = `Bearer ${apiToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
publicApi.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    // Handle errors for public API calls
    if (error.response?.data?.error?.message) {
      error.message = error.response.data.error.message
    } else if (error.response?.data?.message) {
      error.message = error.response.data.message
    }

    return Promise.reject(error)
  }
)

export default publicApi
