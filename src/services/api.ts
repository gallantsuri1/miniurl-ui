import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import config from '../config';
import { ApiResponse } from '../types';

/**
 * Create axios instance with default config
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * Request interceptor - adds JWT token to requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handles common error cases
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    // Handle network errors or server unavailable (503, 502, 500)
    if (!error.response || [502, 503, 504].includes(error.response?.status || 0)) {
      console.error('API unavailable, redirecting to maintenance page');
      // Store flag to trigger maintenance mode
      sessionStorage.setItem('apiUnavailable', 'true');
      // Dispatch custom event for components to listen
      window.dispatchEvent(new CustomEvent('api-unavailable'));
    }
    
    // Handle 401 Unauthorized - token expired or invalid
    // Only redirect if user actually has a token stored (authenticated session)
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      if (token) {
        // Authenticated session got 401 - token is invalid/expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      // No token stored - just pass the error through (public pages like forgot-password)
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
