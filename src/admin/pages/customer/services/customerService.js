import api from "../../../../shared/services/api";

const CUSTOMER_ENDPOINT = import.meta.env.VITE_ADMIN_CUSTOMERS_ENDPOINT;

const getCustomers = async ({
  limit = 20,
  cursor = null,
  search = "",
  isActive = "",
  signal,
} = {}) => {
  const params = { limit };

  if (cursor) params.cursor = cursor;
  if (search) params.search = search;
  if (isActive) params.isActive = isActive;

  const response = await api.get(CUSTOMER_ENDPOINT, {
    params,
    signal,
  });

  return response.data;
};

const getCustomerById = async (customerId, { signal } = {}) => {
  const response = await api.get(`${CUSTOMER_ENDPOINT}/${customerId}`, {
    signal,
  });

  return response.data;
};

const updateCustomerStatus = async (customerId, isActive) => {
  const response = await api.patch(
    `${CUSTOMER_ENDPOINT}/${customerId}/status`,
    { isActive }
  );

  return response.data;
};

const customerService = {
  getCustomers,
  getCustomerById,
  updateCustomerStatus,
};

export default customerService;
