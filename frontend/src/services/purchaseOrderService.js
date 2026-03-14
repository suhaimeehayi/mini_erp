import api from "../api/axios";

export const getPurchaseOrders = async () => {
  const response = await api.get("/purchase-orders/");
  return response.data;
};

export const createPurchaseOrder = async (data) => {
  const response = await api.post("/purchase-orders/", data);
  return response.data;
};

export const updatePurchaseOrder = async (id, data) => {
  const response = await api.put(`/purchase-orders/${id}/`, data);
  return response.data;
};

export const deletePurchaseOrder = async (id) => {
  const response = await api.delete(`/purchase-orders/${id}/`);
  return response.data;
};