import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
export const TOKEN_KEY = "cvpro_token";

/**
 * Pre-configured Axios client. Every request carries the Sanctum bearer
 * token (when present) and asks Laravel for JSON responses.
 */
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
