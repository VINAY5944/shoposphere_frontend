
import api from "../../../../shared/services/api";

const PRODUCT_ENDPOINT = import.meta.env.VITE_PRODUCTS_ENDPOINT;

const getProducts = async ({
  limit = 1,
  cursor = null,
  search = "",
  categoryId = "",
  signal,
} = {}) => {
  const params = {
    limit,
  };

  if (cursor) params.cursor = cursor;
  if (search.trim()) params.search = search.trim();
  if (categoryId) params.categoryId = categoryId;

  const response = await api.get(PRODUCT_ENDPOINT, { params, signal });

  return response.data;
};
const getProductById = async (productId, { signal } = {}) => {
  const response = await api.get(
    `${PRODUCT_ENDPOINT}/${productId}`,
    { signal }
  );

  return response.data;
};

const productService = {
  getProducts,
  getProductById,
};



export default productService;
