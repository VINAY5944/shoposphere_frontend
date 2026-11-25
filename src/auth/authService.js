
import api from "../shared/services/api";

const authService = {
  loginCustomer: async (credentials) => {
    const response = await api.post(
      import.meta.env.VITE_AUTH_CUSTOMER_LOGIN_ENDPOINT,
      credentials
    );

    return response.data.data ?? response.data;
  },

  loginAdmin: async (credentials) => {
    const response = await api.post(
      import.meta.env.VITE_AUTH_ADMIN_LOGIN_ENDPOINT,
      credentials
    );

    return response.data.data ?? response.data;
  },

  getCurrentUser: async ({ signal } = {}) => {
    const response = await api.get(
      import.meta.env.VITE_AUTH_ME_ENDPOINT,
      { signal }
    );

    return response.data.data ?? response.data;
  },
};

export default authService;
