
import api from "./api";

const CATEGORY_ENDPOINT = import.meta.env.VITE_CATEGORIES_ENDPOINT;

const getCategories = async ({
  limit = 100,
  cursor = null,
  search = "",
  signal,
} = {}) => {
  const params = { limit };

  if (cursor) params.cursor = cursor;
  if (search.trim()) params.search = search.trim();

  const response = await api.get(CATEGORY_ENDPOINT, { params, signal });

  return response.data;
};

const categoryService = {
  getCategories,
};

export default categoryService;
