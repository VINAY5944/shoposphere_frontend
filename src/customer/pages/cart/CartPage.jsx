
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import cartService from "./services/cartService";
import Button from "../../../shared/components/ui/Button";
import Checkbox from "../../../shared/components/ui/Checkbox";
import Loader from "../../../shared/components/common/Loader";
import getAssetUrl from "../../../shared/utils/getAssetUrl";
import { toast } from "sonner";

function CartPage() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch cart from backend
  useEffect(() => {
    const controller = new AbortController();

    const fetchCart = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await cartService.getCart({
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;
        setCart(response.data);
      } catch (error) {
        if (controller.signal.aborted) return;

        setError(
          error.response?.data?.message || "Unable to load your cart."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchCart();

    return () => {
      controller.abort();
    };
  }, []);

  const items = cart?.items || [];

  // Calculate selected items total
  const selectedProducts = useMemo(() => {
    return items.filter((item) =>
      selectedItems.includes(item.id)
    );
  }, [items, selectedItems]);

  const selectedTotal = useMemo(() => {
    return selectedProducts.reduce(
      (total, item) => total + Number(item.subtotal),
      0
    );
  }, [selectedProducts]);

  // Select or deselect one product
  const toggleItem = (itemId) => {
    setSelectedItems((previous) =>
      previous.includes(itemId)
        ? previous.filter((id) => id !== itemId)
        : [...previous, itemId]
    );
  };

  // Select or deselect all products
  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item.id));
    }
  };

  const isAllSelected =
    items.length > 0 && selectedItems.length === items.length;

  const formatPrice = (amount) =>
    `₹${Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const handleCheckout = () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product.");
      return;
    }

    if (selectedProducts.some((item) => !item.available)) {
      toast.error("One or more selected products are unavailable.");
      return;
    }

    navigate("/customer/checkout/confirm", {
      state: {
        checkoutType: "cart",
        cartItemIds: selectedProducts.map((item) => item.id),
        items: selectedProducts.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        products: selectedProducts.map((item) => ({
          ...item,
          price: item.unitPrice,
        })),
      },
    });
  };

  if (loading) {
    return <Loader text="Loading your cart..." />;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">{error}</p>
        <Button
          variant="secondary"
          onClick={() => navigate("/customer")}
          className="mt-4"
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Shopping Cart
        </h1>
        <p className="mt-2 text-gray-500">
          {cart?.totalItems || 0} item(s) in your cart
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <div className="mb-4 text-6xl">🛒</div>
          <h2 className="text-xl font-semibold">
            Your cart is empty
          </h2>
          <p className="mt-2 text-gray-500">
            Add some products to get started.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate("/customer")}
            className="mt-6"
          >
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart products */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between rounded-lg border bg-white p-4">
              <Checkbox
                label="Select All"
                checked={isAllSelected}
                onChange={toggleSelectAll}
                className="gap-3 font-medium"
              />

              <span className="text-sm text-gray-500">
                {selectedItems.length} selected
              </span>
            </div>

            {items.map((item) => {
              const imageUrl = getAssetUrl(item.imageUrl);

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-xl border bg-white p-4 sm:flex-row sm:items-center"
                >
                  <Checkbox
                    aria-label={`Select ${item.name}`}
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                  />

                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="h-full w-full rounded-lg object-contain"
                      />
                    ) : (
                      <span className="text-4xl">📦</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      SKU: {item.sku}
                    </p>

                    <p className="mt-2 font-medium text-gray-800">
                      {formatPrice(item.unitPrice)}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>

                    {!item.available && (
                      <p className="mt-2 text-sm text-red-600">
                        Currently unavailable
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      Subtotal
                    </p>
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order summary */}
          <div className="h-fit rounded-xl border bg-white p-6">
            <h2 className="text-xl font-bold text-gray-900">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Selected products</span>
                <span>{selectedProducts.length}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Selected quantity</span>
                <span>
                  {selectedProducts.reduce(
                    (total, item) => total + Number(item.quantity),
                    0
                  )}
                </span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold">
                    {formatPrice(selectedTotal)}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleCheckout}
              disabled={selectedProducts.length === 0}
              className="mt-6 w-full"
            >
              Checkout ({selectedProducts.length})
            </Button>

            <Button
              variant="secondary"
              onClick={() => navigate("/customer")}
              className="mt-3 w-full"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
