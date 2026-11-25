
import api from "../../../../shared/services/api";

const PRODUCT_ENDPOINT = import.meta.env.VITE_PRODUCTS_ENDPOINT;
const ADMIN_PRODUCT_ENDPOINT = import.meta.env.VITE_ADMIN_PRODUCTS_ENDPOINT;

// Get products with cursor pagination and filters.
const getProducts = async ({
  limit = 10,
  cursor = null,
  search = "",
  categoryId = "",
  signal,
} = {}) => {
  const params = {
    limit,
    ...(cursor && { cursor }),
    ...(search.trim() && { search: search.trim() }),
    ...(categoryId && { categoryId }),
  };

  const response = await api.get(PRODUCT_ENDPOINT, { params, signal });

  return response.data;
};

// Get one product.
const getProductById = async (productId, { signal } = {}) => {
  const response = await api.get(
    `${PRODUCT_ENDPOINT}/${productId}`,
    { signal }
  );

  return response.data;
};

// Create a product.
const createProduct = async (formData) => {
  const response = await api.post(
    ADMIN_PRODUCT_ENDPOINT,
    formData
  );

  return response.data;
};

// Update a product.
const updateProduct = async (productId, formData) => {
  const response = await api.patch(
    `${ADMIN_PRODUCT_ENDPOINT}/${productId}`,
    formData
  );

  return response.data;
};

// Soft-delete a product.
const deleteProduct = async (productId) => {
  const response = await api.delete(
    `${ADMIN_PRODUCT_ENDPOINT}/${productId}`
  );

  return response.data;
};

const productService = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

export default productService;
