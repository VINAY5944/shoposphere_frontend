
import api from "../../../../shared/services/api";

const DASHBOARD_ENDPOINT = import.meta.env.VITE_ADMIN_DASHBOARD_ENDPOINT;

const getDashboard = async ({ signal } = {}) => {
  const response = await api.get(DASHBOARD_ENDPOINT, { signal });

  return response.data.data ?? response.data;
};

const dashboardService = {
  getDashboard,
};

export default dashboardService;
