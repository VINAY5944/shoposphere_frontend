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

const updateCartItem = async (itemId, quantity) => {
  const response = await api.patch(
    `${CART_ENDPOINT}/items/${itemId}`,
    { quantity }
  );

  return response.data;
};

const removeCartItems = async (itemIds) => {
  const ids = Array.isArray(itemIds) ? itemIds : [itemIds];
  const response = await api.delete(`${CART_ENDPOINT}/items`, {
    data: {
      itemIds: ids,
    },
  });

  return response.data;
};

const removeCartItem = async (itemId) => {
  return removeCartItems([itemId]);
};

const cartService = {
  addItems,
  getCart,
  updateCartItem,
  removeCartItem,
  removeCartItems,
};

export default cartService;
