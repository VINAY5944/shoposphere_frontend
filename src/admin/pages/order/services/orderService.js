import api from "../../../../shared/services/api";

const ORDER_ENDPOINT = import.meta.env.VITE_ADMIN_ORDERS_ENDPOINT;

// GET ALL ORDERS
const getOrders = async ({
  limit = 20,
  cursor = null,
  status = "",
  paymentStatus = "",
  signal,
} = {}) => {
  const params = { limit };

  if (cursor) {
    params.cursor = cursor;
  }

  if (status) {
    params.status = status;
  }

  if (paymentStatus) {
    params.paymentStatus = paymentStatus;
  }

  const response = await api.get(ORDER_ENDPOINT, {
    params,
    signal,
  });

  return response.data;
};

// GET SINGLE ORDER
const getOrderById = async (orderId, { signal } = {}) => {
  const response = await api.get(`${ORDER_ENDPOINT}/${orderId}`, {
    signal,
  });

  return response.data;
};

const orderService = {
  getOrders,
  getOrderById,
};

export default orderService;