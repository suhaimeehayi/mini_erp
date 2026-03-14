import api from "../api/axios";

export const getProducts = async () => {
  const response = await api.get("/products/");
  return response.data;
};

export const createProduct = async (data) => {
  const response = await api.post("/products/", data);
  return response.data;
};