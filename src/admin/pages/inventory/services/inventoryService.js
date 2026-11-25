import api from "../../../../shared/services/api";

const INVENTORY_ENDPOINT = import.meta.env.VITE_ADMIN_INVENTORY_ENDPOINT;
const INVENTORY_PRODUCT_ENDPOINT =
  import.meta.env.VITE_ADMIN_INVENTORY_PRODUCT_ENDPOINT;
const INVENTORY_RESTOCK_ENDPOINT =
  import.meta.env.VITE_ADMIN_INVENTORY_RESTOCK_ENDPOINT;
const INVENTORY_HISTORY_ENDPOINT =
  import.meta.env.VITE_ADMIN_INVENTORY_HISTORY_ENDPOINT;

const withProductId = (endpoint, productId) =>
  endpoint.replace(":productId", encodeURIComponent(productId));

const getInventory = async ({ signal } = {}) => {
  const response = await api.get(INVENTORY_ENDPOINT, { signal });
  return response.data;
};

const getInventoryByProductId = async (productId, { signal } = {}) => {
  const response = await api.get(
    withProductId(INVENTORY_PRODUCT_ENDPOINT, productId),
    {
      signal,
    }
  );
  return response.data;
};

const restockProduct = async (productId, quantity) => {
  const response = await api.patch(
    withProductId(INVENTORY_RESTOCK_ENDPOINT, productId),
    { quantity }
  );
  return response.data;
};

const getInventoryHistory = async (
  productId,
  { limit = 20, cursor = null, signal } = {}
) => {
  const params = { limit };
  if (cursor) params.cursor = cursor;

  const response = await api.get(
    withProductId(INVENTORY_HISTORY_ENDPOINT, productId),
    {
      params,
      signal,
    }
  );
  return response.data;
};

const inventoryService = {
  getInventory,
  getInventoryByProductId,
  restockProduct,
  getInventoryHistory,
};

export default inventoryService;
