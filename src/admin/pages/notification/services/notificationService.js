import api from "../../../../shared/services/api";

const NOTIFICATION_ENDPOINT =
  import.meta.env.VITE_ADMIN_NOTIFICATIONS_ENDPOINT;
const FAILED_NOTIFICATIONS_ENDPOINT =
  import.meta.env.VITE_ADMIN_FAILED_NOTIFICATIONS_ENDPOINT;

const getNotifications = async ({
  limit = 20,
  offset = 0,
  status = "",
  signal,
} = {}) => {
  const params = { limit, offset };

  if (status) {
    params.status = status;
  }

  const response = await api.get(NOTIFICATION_ENDPOINT, {
    params,
    signal,
  });

  return response.data;
};

const getFailedNotifications = async ({ limit = 20, offset = 0, signal } = {}) => {
  const response = await api.get(FAILED_NOTIFICATIONS_ENDPOINT, {
    params: { limit, offset },
    signal,
  });

  return response.data;
};

const notificationService = {
  getNotifications,
  getFailedNotifications,
};

export default notificationService;
