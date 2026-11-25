
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import orderService from "./services/orderService";
import Button from "../../../shared/components/ui/Button";
import Badge from "../../../shared/components/ui/Badge";
import Loader from "../../../shared/components/common/Loader";
import Pagination from "../../../shared/components/table/Pagination";

function MyOrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    limit: 10,
    hasNextPage: false,
    nextCursor: null,
  });

  const [cursorHistory, setCursorHistory] = useState([]);
  const [currentCursor, setCurrentCursor] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async (cursor = null, signal) => {
    try {
      const response = await orderService.getMyOrders({
        limit: 10,
        cursor,
        signal,
      });

      if (signal?.aborted) return;

      setOrders(response.data || []);
      setPagination(response.pagination);
    } catch (error) {
      if (signal?.aborted) return;

      setError(
        error.response?.data?.message || "Unable to load your orders."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchOrders(currentCursor, controller.signal);

    return () => {
      controller.abort();
    };
  }, [currentCursor, fetchOrders]);

  const handleNextPage = () => {
    if (!pagination?.hasNextPage || !pagination.nextCursor) return;

    setLoading(true);
    setError("");
    setCursorHistory((previous) => [
      ...previous,
      currentCursor,
    ]);

    setCurrentCursor(pagination.nextCursor);
  };

  const handlePreviousPage = () => {
    if (cursorHistory.length === 0) return;

    const previousCursor = cursorHistory[cursorHistory.length - 1];

    setLoading(true);
    setError("");
    setCursorHistory((previous) => previous.slice(0, -1));
    setCurrentCursor(previousCursor);
  };

  const formatPrice = (amount, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusVariant = (status) => {
    const variants = {
      PENDING: "warning",
      CONFIRMED: "info",
      PROCESSING: "indigo",
      SHIPPED: "purple",
      DELIVERED: "success",
      CANCELLED: "danger",
      FAILED: "danger",
      SUCCESS: "success",
    };

    return variants[status] || "default";
  };

  if (loading) {
    return <Loader text="Loading your orders..." />;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">{error}</p>

        <Button
          variant="secondary"
          onClick={() => fetchOrders(currentCursor)}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          My Orders
        </h1>

        <p className="mt-2 text-gray-500">
          View and manage your previous purchases.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <div className="mb-4 text-6xl">📦</div>

          <h2 className="text-xl font-semibold text-gray-900">
            No orders yet
          </h2>

          <p className="mt-2 text-gray-500">
            You haven't purchased anything yet.
          </p>

          <Button
            variant="primary"
            onClick={() => navigate("/customer")}
            className="mt-6"
          >
            Start Shopping
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Order Number
                    </p>

                    <h2 className="mt-1 font-bold text-gray-900">
                      {order.orderNumber}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant={getStatusVariant(order.status)}>
                      {order.status}
                    </Badge>

                    <Badge variant={getStatusVariant(order.paymentStatus)}>
                      Payment: {order.paymentStatus}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-4 pt-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm text-gray-500">
                      Total Amount
                    </p>

                    <p className="mt-1 text-xl font-bold text-gray-900">
                      {formatPrice(order.totalAmount, order.currency)}
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    onClick={() =>
                      navigate(`/customer/orders/${order.id}`)
                    }
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Cursor pagination */}
          <div className="mt-8">
            <Pagination
              hasNextPage={pagination?.hasNextPage}
              hasPreviousPage={cursorHistory.length > 0}
              loading={loading}
              onNext={handleNextPage}
              onPrevious={handlePreviousPage}
              description={`Page ${cursorHistory.length + 1}`}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default MyOrdersPage;
