import api from "../api/axios";
import { fetchAllPages } from "./apiHelpers";

export const getCurrentUser = async () => {
  const response = await api.get("/accounts/users/me/");
  return response.data;
};

export const getUsers = async () => fetchAllPages("/accounts/users/");

export const createUser = async (data) => {
  const response = await api.post("/accounts/users/", data);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/accounts/users/${id}/`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/accounts/users/${id}/`);
  return response.data;
};

export const changeUserPassword = async (id, data) => {
  const response = await api.post(`/accounts/users/${id}/change_password/`, data);
  return response.data;
};

export const getRoles = async () => fetchAllPages("/accounts/roles/");

export const createRole = async (data) => {
  const response = await api.post("/accounts/roles/", data);
  return response.data;
};

export const updateRole = async (id, data) => {
  const response = await api.put(`/accounts/roles/${id}/`, data);
  return response.data;
};

export const deleteRole = async (id) => {
  const response = await api.delete(`/accounts/roles/${id}/`);
  return response.data;
};

export const getPermissions = async () => fetchAllPages("/accounts/permissions/");

export const getActivityLogs = async () => fetchAllPages("/accounts/activity-logs/");