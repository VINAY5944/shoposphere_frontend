import { useCallback, useEffect, useState } from "react";

import notificationService from "./services/notificationService";
import NotificationFilters from "./components/NotificationFilters";
import DataTable from "../../../shared/components/table/DataTable";
import Pagination from "../../../shared/components/table/Pagination";
import Badge from "../../../shared/components/ui/Badge";
import Button from "../../../shared/components/ui/Button";

const statusVariants = {
  QUEUED: "info",
  RETRYING: "warning",
  SENT: "success",
  FAILED: "danger",
  QUEUE_FAILED: "danger",
  RESOLVED: "success",
};

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString("en-IN");
}

function formatStatus(status) {
  return status
    ? status.toLowerCase().replaceAll("_", " ")
    : "Unknown";
}

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [view, setView] = useState("history");
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0,
  });
  const [retryKey, setRetryKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");

      const response = view === "failed"
        ? await notificationService.getFailedNotifications({
            limit: 20,
            offset,
            signal,
          })
        : await notificationService.getNotifications({
            limit: 20,
            offset,
            status,
            signal,
          });

      if (signal.aborted) return;
      if (!Array.isArray(response.data) || !response.pagination) {
        throw new Error("The notifications response was invalid.");
      }

      setNotifications(response.data);
      setPagination(response.pagination);
    } catch (requestError) {
      if (signal.aborted) return;
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Failed to load notifications."
      );
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [offset, status, view]);

  useEffect(() => {
    const controller = new AbortController();
    fetchNotifications(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchNotifications, retryKey]);

  const handleStatusChange = (value) => {
    setStatus(value);
    setOffset(0);
  };

  const handleViewChange = (nextView) => {
    setView(nextView);
    setOffset(0);
    setError("");
  };

  const handlePreviousPage = () => {
    setOffset((currentOffset) =>
      Math.max(0, currentOffset - pagination.limit)
    );
  };

  const handleNextPage = () => {
    if (offset + pagination.limit >= pagination.total) return;
    setOffset((currentOffset) => currentOffset + pagination.limit);
  };

  const firstItem = pagination.total === 0 ? 0 : offset + 1;
  const lastItem = Math.min(offset + notifications.length, pagination.total);

  const historyColumns = [
    {
      key: "jobName",
      header: "Notification",
      render: (notification) => (
        <div>
          <p className="font-medium text-gray-900">
            {notification.jobName || "-"}
          </p>
          <p className="text-xs text-gray-500">
            {notification.originalJobId || notification.id}
          </p>
        </div>
      ),
    },
    {
      key: "recipient",
      header: "Recipient",
      render: (notification) => notification.recipient || "-",
    },
    {
      key: "orderNumber",
      header: "Order",
      render: (notification) => notification.orderNumber || "-",
    },
    {
      key: "status",
      header: "Status",
      render: (notification) => (
        <Badge variant={statusVariants[notification.status] || "default"}>
          {formatStatus(notification.status)}
        </Badge>
      ),
    },
    {
      key: "attemptsMade",
      header: "Attempts",
      render: (notification) => (
        <div>
          <p>{notification.attemptsMade ?? 0}</p>
          <p className="text-xs text-gray-500">
            Retries: {notification.retryCount ?? 0}
          </p>
        </div>
      ),
    },
    {
      key: "queuedAt",
      header: "Queued",
      render: (notification) => formatDate(notification.queuedAt),
    },
    {
      key: "activity",
      header: "Last Activity",
      render: (notification) =>
        formatDate(
          notification.sentAt ||
            notification.failedAt ||
            notification.lastRetriedAt ||
            notification.updatedAt
        ),
    },
    {
      key: "errorMessage",
      header: "Error",
      render: (notification) =>
        notification.errorMessage ? (
          <span
            className="block max-w-xs truncate text-red-700"
            title={notification.errorMessage}
          >
            {notification.errorMessage}
          </span>
        ) : (
          "-"
        ),
    },
  ];

  const failedColumns = [
    {
      key: "jobName",
      header: "Notification",
      render: (notification) => (
        <div>
          <p className="font-medium text-gray-900">
            {notification.jobName || "-"}
          </p>
          <p className="text-xs text-gray-500">{notification.id}</p>
        </div>
      ),
    },
    {
      key: "recipient",
      header: "Recipient",
      render: (notification) => notification.recipient || "-",
    },
    {
      key: "orderNumber",
      header: "Order",
      render: (notification) => notification.orderNumber || "-",
    },
    {
      key: "status",
      header: "Status",
      render: (notification) => (
        <Badge variant={statusVariants[notification.status] || "default"}>
          {formatStatus(notification.status)}
        </Badge>
      ),
    },
    {
      key: "attemptsMade",
      header: "Attempts",
      render: (notification) => (
        <div>
          <p>{notification.attemptsMade ?? 0}</p>
          <p className="text-xs text-gray-500">
            Retries: {notification.retryCount ?? 0}
          </p>
        </div>
      ),
    },
    {
      key: "errorMessage",
      header: "Error",
      render: (notification) =>
        notification.errorMessage ? (
          <span
            className="block max-w-xs truncate text-red-700"
            title={notification.errorMessage}
          >
            {notification.errorMessage}
          </span>
        ) : (
          "-"
        ),
    },
    {
      key: "updatedAt",
      header: "Last Activity",
      render: (notification) =>
        formatDate(notification.updatedAt || notification.createdAt),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review email delivery history and notification status.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Notification views">
        <Button
          type="button"
          variant={view === "history" ? "dark" : "secondary"}
          aria-pressed={view === "history"}
          onClick={() => handleViewChange("history")}
        >
          Delivery history
        </Button>
        <Button
          type="button"
          variant={view === "failed" ? "dark" : "secondary"}
          aria-pressed={view === "failed"}
          onClick={() => handleViewChange("failed")}
        >
          Failed notifications
        </Button>
      </div>

      {view === "history" && (
        <NotificationFilters
          status={status}
          onStatusChange={handleStatusChange}
        />
      )}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-white p-6 text-center">
          <p className="text-red-600">{error}</p>
          <Button
            variant="dark"
            className="mt-3"
            onClick={() => setRetryKey((previous) => previous + 1)}
          >
            Retry
          </Button>
        </div>
      ) : (
        <DataTable
          columns={view === "failed" ? failedColumns : historyColumns}
          data={notifications}
          loading={loading}
          emptyMessage={
            view === "failed"
              ? "No failed notifications found."
              : "No notifications found."
          }
        />
      )}

      {!error && (
        <Pagination
          hasNextPage={offset + pagination.limit < pagination.total}
          hasPreviousPage={offset > 0}
          loading={loading}
          onNext={handleNextPage}
          onPrevious={handlePreviousPage}
          description={`Showing ${firstItem}-${lastItem} of ${pagination.total} ${
            view === "failed" ? "failed notifications" : "notifications"
          }`}
        />
      )}
    </div>
  );
}

export default NotificationsPage;
