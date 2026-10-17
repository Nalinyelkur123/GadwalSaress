import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gadwal_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Attach guest session ID if unauthenticated
  let guestSessionId = localStorage.getItem('gadwal_guest_session');
  if (!guestSessionId) {
    guestSessionId = `guest_${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem('gadwal_guest_session', guestSessionId);
  }
  config.headers['x-guest-session-id'] = guestSessionId;

  return config;
});

// Response interceptor for session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('gadwal_token')) {
      // Clear token if expired
      localStorage.removeItem('gadwal_token');
      localStorage.removeItem('gadwal_user');
      window.dispatchEvent(new Event('auth_expired'));
    }
    return Promise.reject(error);
  }
);
