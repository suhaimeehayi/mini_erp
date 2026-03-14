import api from "../api/axios";

export const getSalesOrders = async () => {
  const response = await api.get("/sales-orders/");
  return response.data;
};

export const createSalesOrder = async (data) => {
  const response = await api.post("/sales-orders/", data);
  return response.data;
};

export const updateSalesOrder = async (id, data) => {
  const response = await api.put(`/sales-orders/${id}/`, data);
  return response.data;
};

export const deleteSalesOrder = async (id) => {
  const response = await api.delete(`/sales-orders/${id}/`);
  return response.data;
};