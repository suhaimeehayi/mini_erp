import axios from "axios";

import { API_BASE_URL } from "../api/config";

const authClient = axios.create({
  baseURL: API_BASE_URL,
});

export const login = async (username, password) => {
  const response = await authClient.post("/auth/login/", {
    username,
    password,
  });
  return response.data;
};

export const refreshToken = async () => {
  const refresh = localStorage.getItem("refresh");

  if (!refresh) {
    throw new Error("No refresh token available");
  }

  const response = await authClient.post("/auth/refresh/", {
    refresh,
  });

  return response.data;
};

export const refreshAccessTokenService = async () => {
  const tokens = await refreshToken();
  localStorage.setItem("access", tokens.access);
  if (tokens.refresh) {
    localStorage.setItem("refresh", tokens.refresh);
  }
  return tokens;
};