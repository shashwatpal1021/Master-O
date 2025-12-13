import axios from "axios";
import { logout } from "../redux/authSlice";
import { store } from "../redux/store";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // to send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    // Handle successful responses
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const { status, data } = error.response || {};

    // Handle network errors
    if (!status) {
      console.error('Network Error:', error.message);
      return Promise.reject({ message: 'Network error. Please check your connection.' });
    }

    // Handle 401 Unauthorized (token expired or invalid)
    if (status === 401) {
      // If we already tried to refresh the token, log the user out
      if (originalRequest._retry) {
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject({ message: 'Session expired. Please log in again.' });
      }

      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await api.post('/auth/refresh');
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed', refreshError);
        // If refresh fails, log the user out
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject({ message: 'Session expired. Please log in again.' });
      }
    }

    // Handle other error statuses
    const errorMessage = data?.message || `Request failed with status code ${status}`;
    console.error('API Error:', { status, message: errorMessage });

    return Promise.reject({
      status,
      message: errorMessage,
      ...(data?.errors && { errors: data.errors }), // Include validation errors if available
    });
  }
);

export default api;
