import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import orderService from "./services/orderService";
import OrderDetails from "./components/OrderDetails";
import Button from "../../../shared/components/ui/Button";
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
            "Failed to load order details."
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

  if (loading) {
    return <Loader text="Loading order details..." />;
  }

  if (error || !order) {
    return (
      <div className="rounded-lg border border-red-200 bg-white p-6">
        <p className="text-sm text-red-600">
          {error || "Order not found."}
        </p>

        <Button
          type="button"
          variant="link"
          onClick={() => navigate("/admin/orders")}
          className="mt-4"
        >
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order Details
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Order #{order.orderNumber || order.id}
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate("/admin/orders")}
        >
          Back to Orders
        </Button>
      </div>

      {/* ORDER DETAILS */}
      <OrderDetails order={order} />
    </div>
  );
}

export default OrderDetailsPage;