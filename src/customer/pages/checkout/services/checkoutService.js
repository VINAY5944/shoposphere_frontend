
import api from "../../../../shared/services/api";

const BUY_NOW_ENDPOINT = import.meta.env.VITE_CHECKOUT_BUY_NOW_ENDPOINT;
const CART_CHECKOUT_ENDPOINT = import.meta.env.VITE_CHECKOUT_CART_ENDPOINT;

const checkoutService = {
  // Buy Now - products do not need to be in the cart
  buyNow: async (items, paymentPassword) => {
    const response = await api.post(BUY_NOW_ENDPOINT, {
      items,
      paymentPassword,
    });

    return response.data;
  },

  // Cart checkout - only selected cart items
  checkoutCart: async (cartItemIds, paymentPassword) => {
    const response = await api.post(CART_CHECKOUT_ENDPOINT, {
      cartItemIds,
      paymentPassword,
    });

    return response.data;
  },
};

export default checkoutService;
