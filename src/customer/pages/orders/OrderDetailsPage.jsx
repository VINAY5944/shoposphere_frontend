
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import orderService from "./services/orderService";
import Button from "../../../shared/components/ui/Button";
import Badge from "../../../shared/components/ui/Badge";
import Loader from "../../../shared/components/common/Loader";

function OrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await orderService.getOrderById(orderId, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;
        setOrder(response.data);
      } catch (error) {
        if (controller.signal.aborted) return;

        setError(
          error.response?.data?.message ||
            "Unable to load order details."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      controller.abort();
    };
  }, [orderId]);

  const formatPrice = (amount, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
    return <Loader text="Loading order details..." />;
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-red-600">
          {error || "Order not found."}
        </p>

        <Button
          variant="secondary"
          onClick={() => navigate("/customer/orders")}
          className="mt-4"
        >
          Back to My Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Order Details
          </h1>

          <p className="mt-2 text-gray-500">
            Order #{order.orderNumber}
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => navigate("/customer/orders")}
        >
          Back to My Orders
        </Button>
      </div>

      {/* Order Information */}
      <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          Order Information
        </h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Order Number</p>
            <p className="mt-1 font-semibold text-gray-900">
              {order.orderNumber}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Order Date</p>
            <p className="mt-1 font-semibold text-gray-900">
              {formatDate(order.createdAt)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Order Status</p>
            <Badge variant={getStatusVariant(order.status)} className="mt-2">
              {order.status}
            </Badge>
          </div>

          <div>
            <p className="text-sm text-gray-500">Payment Status</p>
            <Badge
              variant={getStatusVariant(order.paymentStatus)}
              className="mt-2"
            >
              {order.paymentStatus}
            </Badge>
          </div>

          <div>
            <p className="text-sm text-gray-500">Payment Reference</p>
            <p className="mt-1 break-all font-semibold text-gray-900">
              {order.paymentReference || "Not available"}
            </p>
          </div>
        </div>
      </div>

      {/* Ordered Products */}
      <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          Ordered Products
        </h2>

        <div className="space-y-5">
          {order.items?.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between gap-3 border-b pb-5 last:border-b-0 last:pb-0 sm:flex-row sm:items-center"
            >
              <div>
                <h3 className="font-semibold text-gray-900">
                  {item.productName}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  SKU: {item.sku}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-sm text-gray-500">
                  Unit Price: {formatPrice(item.unitPrice, order.currency)}
                </p>

                <p className="mt-1 font-bold text-gray-900">
                  {formatPrice(item.lineTotal, order.currency)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Total */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Total Amount
          </h2>

          <p className="text-2xl font-bold text-gray-900">
            {formatPrice(order.totalAmount, order.currency)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsPage;
