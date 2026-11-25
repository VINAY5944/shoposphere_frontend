
import api from "../../../../shared/services/api";

const CART_ENDPOINT = import.meta.env.VITE_CART_ENDPOINT;

const addItems = async (items) => {
  const response = await api.post(`${CART_ENDPOINT}/items`, {
    items,
  });

  return response.data;
};

const getCart = async ({ signal } = {}) => {
  const response = await api.get(CART_ENDPOINT, { signal });

  return response.data;
};

const cartService = {
  addItems,
  getCart,
};

export default cartService;
