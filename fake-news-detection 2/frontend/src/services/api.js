import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, "") || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Attach the JWT to every outgoing request automatically, so individual
// service functions never have to remember to pass auth headers manually.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("veritas_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handling: if any request comes back unauthorized (expired
// or invalid token), clear the stale token and bounce to /login rather
// than leaving the app in a broken half-authenticated state.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("veritas_access_token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
