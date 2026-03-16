import axios from 'axios';
import envConfig from '../config/env';
import { handleAxiosError } from '../shared/utils/errorHandler';

const apiClient = axios.create({
  baseURL: envConfig.apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // Ensure cookies are sent with requests if needed for session auth
  withCredentials: true,
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for centralized error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Transform error using our generic handler
    try {
      handleAxiosError(error, `API Request to ${error.config?.url}`);
    } catch (transformedError) {
      return Promise.reject(transformedError);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
