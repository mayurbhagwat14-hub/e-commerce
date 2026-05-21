import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Sends cookies back and forth automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle token expiry / unauthorized access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error status is 401 (Unauthorized) and redirect if necessary
    if (error.response && error.response.status === 401) {
      console.warn('Session expired or unauthorized. Clearing user auth state...');
      // Dispatch or trigger local logout event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
