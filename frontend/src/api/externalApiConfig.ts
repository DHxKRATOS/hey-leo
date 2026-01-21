import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { cookieUtils } from "../utils/cookies";

// Create axios instance for external API calls (AI/ML services)
const externalApi = axios.create({
  baseURL: (import.meta as any).env.VITE_AI_API_URL,
  timeout: 30000, // Longer timeout for AI processing
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
externalApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
externalApi.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
    }

    // Handle other errors
    if (error.response?.data?.error?.message) {
      error.message = error.response.data.error.message;
    } else if (error.response?.data?.message) {
      error.message = error.response.data.message;
    } else if (error.response?.data?.detail) {
      error.message = error.response.data.detail;
    }

    return Promise.reject(error);
  }
);

export default externalApi;
