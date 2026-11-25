
import api from "../../../../shared/services/api";

const CATEGORY_ENDPOINT = import.meta.env.VITE_CATEGORIES_ENDPOINT;
const ADMIN_CATEGORY_ENDPOINT =
  import.meta.env.VITE_ADMIN_CATEGORIES_ENDPOINT;

// Get categories with cursor pagination and search.
const getCategories = async ({
  limit = 100,
  cursor = null,
  search = "",
  signal,
} = {}) => {
  const params = { limit };

  if (cursor) params.cursor = cursor;
  if (search.trim()) params.search = search.trim();

  const response = await api.get(CATEGORY_ENDPOINT, {
    params,
    signal,
  });

  return response.data;
};

const getCategoryById = async (categoryId, { signal } = {}) => {
  const response = await api.get(
    `${ADMIN_CATEGORY_ENDPOINT}/${categoryId}`,
    { signal }
  );

  return response.data;
};

// Create category.
const createCategory = async (formData) => {
  const response = await api.post(
    ADMIN_CATEGORY_ENDPOINT,
    formData
  );

  return response.data;
};

// Update category.
const updateCategory = async (categoryId, formData) => {
  const response = await api.patch(
    `${ADMIN_CATEGORY_ENDPOINT}/${categoryId}`,
    formData
  );

  return response.data;
};

// Delete category.
const deleteCategory = async (categoryId) => {
  const response = await api.delete(
    `${ADMIN_CATEGORY_ENDPOINT}/${categoryId}`
  );

  return response.data;
};

const categoryService = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default categoryService;
