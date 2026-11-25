import axios from "axios";
import { storage } from "../utils/storage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Attach JWT token to protected API requests
api.interceptors.request.use(
  (config) => {
    if (config.skipAuth) {
      delete config.headers.Authorization;
      delete config.skipAuth;
      return config;
    }

    const token = storage.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;