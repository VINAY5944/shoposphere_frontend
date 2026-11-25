import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import orderService from "./services/orderService";
import OrderFilters from "./components/OrderFilters";
import OrderStatusBadge from "./components/OrderStatusBadge";

import DataTable from "../../../shared/components/table/DataTable";
import Pagination from "../../../shared/components/table/Pagination";
import Button from "../../../shared/components/ui/Button";

function OrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);

  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const [cursor, setCursor] = useState(null);
  const [cursorHistory, setCursorHistory] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");

      const response = await orderService.getOrders({
        limit: 20,
        cursor,
        status,
        paymentStatus,
        signal,
      });

      if (signal?.aborted) return;
      setOrders(response.data || []);

      setHasNextPage(response.pagination?.hasNextPage || false);
      setNextCursor(response.pagination?.nextCursor || null);
    } catch (error) {
      if (signal?.aborted) return;
      setError(
        error.response?.data?.message || "Failed to load orders."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [cursor, status, paymentStatus]);

  useEffect(() => {
    const controller = new AbortController();
    fetchOrders(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchOrders]);

  // RESET PAGINATION WHEN FILTERS CHANGE
  const handleStatusChange = (value) => {
    setStatus(value);
    setCursor(null);
    setCursorHistory([]);
  };

  const handlePaymentStatusChange = (value) => {
    setPaymentStatus(value);
    setCursor(null);
    setCursorHistory([]);
  };

  // NEXT PAGE
  const handleNext = () => {
    if (!nextCursor || !hasNextPage) return;

    setCursorHistory((previous) => [...previous, cursor]);
    setCursor(nextCursor);
  };

  // PREVIOUS PAGE
  const handlePrevious = () => {
    if (cursorHistory.length === 0) return;

    const previousHistory = [...cursorHistory];
    const previousCursor = previousHistory.pop();

    setCursorHistory(previousHistory);
    setCursor(previousCursor);
  };

  // FORMAT CURRENCY
  const formatCurrency = (amount, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
    }).format(Number(amount || 0));
  };

  // FORMAT DATE
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // TABLE COLUMNS
  const columns = [
    {
      key: "orderNumber",
      header: "Order Number",
      render: (order) => (
        <span className="font-semibold text-gray-900">
          {order.orderNumber || order.id}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (order) => (
        <div>
          <p className="font-medium text-gray-900">
            {order.customer?.name || "-"}
          </p>
          <p className="text-xs text-gray-500">
            {order.customer?.email || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "totalAmount",
      header: "Total Amount",
      render: (order) =>
        formatCurrency(order.totalAmount, order.currency),
    },
    {
      key: "status",
      header: "Order Status",
      render: (order) => (
        <OrderStatusBadge status={order.status} />
      ),
    },
    {
      key: "paymentStatus",
      header: "Payment Status",
      render: (order) => (
        <OrderStatusBadge status={order.paymentStatus} />
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (order) => formatDate(order.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      render: (order) => (
        <Button
          type="button"
          variant="link"
          onClick={() =>
            navigate(`/admin/orders/${order.id}`)
          }
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Orders
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage and view customer orders.
        </p>
      </div>

      {/* FILTERS */}
      <OrderFilters
        status={status}
        paymentStatus={paymentStatus}
        onStatusChange={handleStatusChange}
        onPaymentStatusChange={handlePaymentStatusChange}
      />

      {/* ERROR */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>

          <Button
            type="button"
            variant="custom"
            onClick={() => fetchOrders()}
            className="mt-2 text-sm font-medium text-red-700 underline"
          >
            Try again
          </Button>
        </div>
      )}

      {/* ORDERS TABLE */}
      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        emptyMessage="No orders found."
      />

      {/* PAGINATION */}
      <Pagination
        hasNextPage={hasNextPage}
        hasPreviousPage={cursorHistory.length > 0}
        loading={loading}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </div>
  );
}

export default OrdersPage;