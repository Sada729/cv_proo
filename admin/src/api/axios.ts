import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

// Distinct storage key from the user site → the two sessions never collide,
// even in the same browser.
export const TOKEN_KEY = "cvpro_admin_token";

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
