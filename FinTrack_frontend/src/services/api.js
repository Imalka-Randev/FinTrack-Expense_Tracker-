import axios from 'axios';

const TOKEN_KEY = 'fintrack_auth_token';

export const getStoredToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  } catch (err) {
    return null;
  }
};

export const setStoredToken = (token, remember = true) => {
  try {
    if (!token) {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
      return;
    }
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  } catch (err) {
    console.error('Failed to save auth token:', err);
  }
};

export const clearStoredToken = () => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.error('Failed to clear auth token:', err);
  }
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors and 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if token has expired or is unauthorized
    if (error.response && error.response.status === 401) {
      // Discard invalid token
      clearStoredToken();
      // Dispatch a custom event so UI or AuthContext can immediately trigger logout state
      window.dispatchEvent(new CustomEvent('fintrack:unauthorized'));
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    const enhancedError = new Error(message);
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;
    enhancedError.originalError = error;

    return Promise.reject(enhancedError);
  }
);

export default api;
