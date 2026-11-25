
import api from "../../../../shared/services/api";

const ORDER_ENDPOINT = import.meta.env.VITE_ORDERS_ENDPOINT;

const getMyOrders = async ({
  limit = 10,
  cursor = null,
  signal,
} = {}) => {
  const params = { limit };

  if (cursor) {
    params.cursor = cursor;
  }

  const response = await api.get(ORDER_ENDPOINT, { params, signal });

  return response.data;
};
const getOrderById = async (orderId, { signal } = {}) => {
  const response = await api.get(`${ORDER_ENDPOINT}/${orderId}`, {
    signal,
  });
  return response.data;
};

const orderService = {
  getMyOrders,
  getOrderById,
};

export default orderService;
