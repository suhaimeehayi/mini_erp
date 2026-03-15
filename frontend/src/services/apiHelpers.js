import api from "../api/axios";

export const getApiErrorMessage = (error, fallbackMessage) => {
  const data = error.response?.data;

  if (!data) {
    return fallbackMessage;
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (data.error) {
    return data.error;
  }

  const firstValue = Object.values(data)[0];
  if (Array.isArray(firstValue)) {
    return firstValue[0];
  }

  if (typeof firstValue === "string") {
    return firstValue;
  }

  return fallbackMessage;
};

export const fetchAllPages = async (path, params = {}) => {
  const results = [];
  let page = 1;
  let totalCount = null;

  while (true) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value);
      }
    });
    searchParams.set("page", page);

    const response = await api.get(`${path}?${searchParams.toString()}`);
    const data = response.data;

    if (Array.isArray(data)) {
      return data;
    }

    results.push(...(data.results || []));
    totalCount = data.count ?? results.length;

    if (!data.next || results.length >= totalCount) {
      break;
    }

    page += 1;
  }

  return results;
};