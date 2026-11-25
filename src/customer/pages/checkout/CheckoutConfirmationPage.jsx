
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import checkoutService from "./services/checkoutService";
import Button from "../../../shared/components/ui/Button";
import Input from "../../../shared/components/ui/Input";
import getAssetUrl from "../../../shared/utils/getAssetUrl";

function CheckoutConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const checkoutData = location.state;

  const [paymentPassword, setPaymentPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);

  // Redirect if checkout data is missing
  if (!checkoutData) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <h2 className="text-xl font-bold">Checkout session not found</h2>
        <p className="mt-2 text-gray-500">
          Please select your products again.
        </p>
        <Button
          variant="primary"
          onClick={() => navigate("/customer")}
          className="mt-5"
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  const { items = [], products = [], cartItemIds = [] } = checkoutData;

  const isCartCheckout =
    checkoutData.checkoutType === "cart" || cartItemIds.length > 0;

  const formatPrice = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Display total from product information.
  // Backend recalculates the actual payable amount.
  const totalAmount = products.reduce(
    (total, product) =>
      total + Number(product.price ?? product.unitPrice ?? 0) *
        Number(product.quantity || 1),
    0
  );

  const handleConfirmOrder = async (event) => {
    event.preventDefault();

    if (!paymentPassword.trim()) {
      toast.error("Please enter your payment password.");
      return;
    }

    if (items.length === 0) {
      toast.error("No products available for checkout.");
      return;
    }

    try {
      setLoading(true);

      let response;

      if (isCartCheckout) {
        if (cartItemIds.length === 0) {
          toast.error("No cart items selected.");
          return;
        }

        response = await checkoutService.checkoutCart(
          cartItemIds,
          paymentPassword
        );
      } else {
        response = await checkoutService.buyNow(
          items,
          paymentPassword
        );
      }

      if (!response.success) {
        toast.error(response.message || "Payment failed.");
        return;
      }

      setOrder(response.data || response);
      setPaymentPassword("");

      toast.success(
        response.message || "Order placed successfully!"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to complete your order."
      );
    } finally {
      setLoading(false);
    }
  };

  // Successful order screen
  if (order) {
    const orderData = order.order || order;

    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
          <div className="text-6xl">✅</div>

          <h1 className="mt-5 text-2xl font-bold text-green-700">
            Order placed successfully!
          </h1>

          <p className="mt-3 text-gray-600">
            Your payment was successful and your order has been confirmed.
          </p>

          {orderData.orderNumber && (
            <div className="mt-6 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="mt-1 text-lg font-bold">
                {orderData.orderNumber}
              </p>
            </div>
          )}

          {orderData.totalAmount !== undefined && (
            <p className="mt-4 font-semibold">
              Total: {formatPrice(orderData.totalAmount)}
            </p>
          )}

          <Button
            variant="primary"
            onClick={() => navigate("/customer")}
            className="mt-8 w-full"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">
        Confirm Your Order
      </h1>

      <p className="mb-8 text-gray-500">
        Review your products and complete your payment.
      </p>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Product summary */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-5 text-xl font-semibold">
              Order Summary
            </h2>

            {products.map((product) => (
              <div
                key={product.id || product.productId}
                className="flex items-center gap-4 border-b py-4 last:border-0"
              >
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                  {getAssetUrl(product.imageUrl) ? (
                    <img
                      src={getAssetUrl(product.imageUrl)}
                      alt={product.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-3xl">📦</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">
                    {product.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Quantity: {product.quantity}
                  </p>

                  <p className="mt-1 font-medium">
                    {formatPrice(product.price ?? product.unitPrice)}
                  </p>
                </div>

                <p className="font-semibold">
                  {formatPrice(
                    Number(product.price ?? product.unitPrice ?? 0) *
                      Number(product.quantity || 1)
                  )}
                </p>
              </div>
            ))}

            <div className="mt-4 flex justify-between border-t pt-4">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment form */}
        <div className="h-fit rounded-xl border bg-white p-6">
          <h2 className="text-xl font-semibold">
            Payment Details
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Enter your dummy payment password to confirm the order.
          </p>

          <form onSubmit={handleConfirmOrder}>
            <div className="mt-6">
              <Input
                label="Payment Password"
                name="paymentPassword"
                type="password"
                value={paymentPassword}
                onChange={(event) =>
                  setPaymentPassword(event.target.value)
                }
                placeholder="Enter payment password"
                autoComplete="off"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading || !paymentPassword.trim()}
              className="mt-6 w-full"
            >
              {loading ? "Processing Payment..." : "Confirm & Pay"}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            This is a simulated payment for demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CheckoutConfirmationPage;
