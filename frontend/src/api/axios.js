import axios from "axios";
import { refreshToken } from "../services/authService";
import { API_BASE_URL } from "./config";

const isAuthRoute = (url = "") => {
  return url.includes("/auth/login/") || url.includes("/auth/refresh/");
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || isAuthRoute(originalRequest.url)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = await refreshToken();
        localStorage.setItem("access", tokens.access);
        originalRequest.headers.Authorization = `Bearer ${tokens.access}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        if (window.location.pathname !== "/login") {
          window.location.replace("/login");
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;