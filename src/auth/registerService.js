
import api from "../shared/services/api";

const registerCustomer = async (userData) => {
  const response = await api.post(
    import.meta.env.VITE_AUTH_CUSTOMER_REGISTER_ENDPOINT,
    userData,
    { skipAuth: true }
  );

  return response.data;
};

const registerService = {
  registerCustomer,
};

export default registerService;
