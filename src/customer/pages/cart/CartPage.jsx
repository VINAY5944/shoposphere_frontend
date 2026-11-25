import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import cartService from "./services/cartService";

import Button from "../../../shared/components/ui/Button";
import Checkbox from "../../../shared/components/ui/Checkbox";
import Loader from "../../../shared/components/common/Loader";

import getAssetUrl from "../../../shared/utils/getAssetUrl";

import { toast } from "sonner";

const CartPage = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Items stay unselected initially
  const [selectedItems, setSelectedItems] = useState([]);

  // Quantity editing states
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState("");
  const [updatingItemId, setUpdatingItemId] = useState(null);

  // Deletion states
  const [removingItemId, setRemovingItemId] = useState(null);
  const [removingMultiple, setRemovingMultiple] = useState(false);

  const formatPrice = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Fetch cart
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await cartService.getCart();

      const cartData =
        response?.data?.items ? response.data : response?.data || response || {};

      setCart(cartData);

      const fetchedItems = cartData?.items || [];

      // Only retain currently selected items that still exist in the updated cart
      setSelectedItems((previousSelectedItems) =>
        previousSelectedItems.filter((id) =>
          fetchedItems.some((item) => String(item.id) === String(id))
        )
      );
    } catch (err) {
      console.error("Fetch cart error:", err);

      setError(
        err.response?.data?.message || "Unable to load your cart."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const items = useMemo(() => cart?.items || [], [cart]);

  // Selected subtotal
  const selectedSubtotal = useMemo(() => {
    return items
      .filter((item) =>
        selectedItems.some((id) => String(id) === String(item.id))
      )
      .reduce((total, item) => {
        const price = Number(
          item.unitPrice ?? item.price ?? item.product?.price ?? 0
        );
        const qty = Number(item.quantity || 0);
        return total + price * qty;
      }, 0);
  }, [items, selectedItems]);

  // Select / deselect one item
  const handleSelectItem = (itemId, checkedOrEvent) => {
    const isChecked =
      typeof checkedOrEvent === "boolean"
        ? checkedOrEvent
        : Boolean(checkedOrEvent?.target?.checked);

    setSelectedItems((previous) => {
      if (isChecked) {
        return previous.some((id) => String(id) === String(itemId))
          ? previous
          : [...previous, itemId];
      }

      return previous.filter((id) => String(id) !== String(itemId));
    });
  };

  // Select / deselect all items
  const handleSelectAll = (checkedOrEvent) => {
    const isChecked =
      typeof checkedOrEvent === "boolean"
        ? checkedOrEvent
        : Boolean(checkedOrEvent?.target?.checked);

    if (isChecked) {
      setSelectedItems(items.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const isAllSelected =
    items.length > 0 &&
    items.every((item) =>
      selectedItems.some((id) => String(id) === String(item.id))
    );

  // Quick increment / decrement quantity
  const handleQuickQuantityChange = async (item, delta) => {
    const currentQty = Number(item.quantity);
    const newQty = currentQty + delta;

    if (newQty < 1) {
      handleRemoveItem(item.id);
      return;
    }

    const maxStock = item.stockQuantity ?? item.product?.stockQuantity;
    if (
      maxStock !== undefined &&
      maxStock !== null &&
      newQty > Number(maxStock)
    ) {
      toast.error(`Only ${maxStock} available in stock.`);
      return;
    }

    try {
      setUpdatingItemId(item.id);
      await cartService.updateCartItem(item.id, newQty);
      await fetchCart();
    } catch (err) {
      console.error("Quick quantity update error:", err);
      toast.error(
        err.response?.data?.message || "Unable to update cart quantity."
      );
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Start editing quantity
  const handleEditQuantity = (item) => {
    setEditingItemId(item.id);
    setEditingQuantity(String(item.quantity));
  };

  // Cancel quantity editing
  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingQuantity("");
  };

  // Save updated quantity
  const handleSaveQuantity = async (itemId) => {
    const quantity = Number(editingQuantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      toast.error("Please enter a valid quantity of at least 1.");
      return;
    }

    const currentItem = items.find(
      (item) => String(item.id) === String(itemId)
    );

    if (!currentItem) {
      toast.error("Cart item not found.");
      return;
    }

    const maxStock =
      currentItem.stockQuantity ?? currentItem.product?.stockQuantity;
    if (
      maxStock !== undefined &&
      maxStock !== null &&
      quantity > Number(maxStock)
    ) {
      toast.error(`Only ${maxStock} available in stock.`);
      return;
    }

    if (quantity === Number(currentItem.quantity)) {
      handleCancelEdit();
      return;
    }

    try {
      setUpdatingItemId(itemId);

      await cartService.updateCartItem(itemId, quantity);

      toast.success("Cart quantity updated.");

      handleCancelEdit();

      await fetchCart();
    } catch (err) {
      console.error("Update cart quantity error:", err);

      toast.error(
        err.response?.data?.message ||
          "Unable to update cart quantity."
      );
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Remove one cart item
  const handleRemoveItem = async (itemId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this item from your cart?"
    );

    if (!confirmed) return;

    try {
      setRemovingItemId(itemId);

      await cartService.removeCartItem(itemId);

      // Remove deleted item from selected items immediately
      setSelectedItems((previous) =>
        previous.filter((id) => String(id) !== String(itemId))
      );

      // Close quantity editor if this item was being edited
      if (String(editingItemId) === String(itemId)) {
        handleCancelEdit();
      }

      toast.success("Item removed from cart.");

      await fetchCart();
    } catch (err) {
      console.error("Remove cart item error:", err);

      toast.error(
        err.response?.data?.message ||
          "Unable to remove item from cart."
      );
    } finally {
      setRemovingItemId(null);
    }
  };

  // Remove all selected items
  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to remove ${selectedItems.length} selected item${
        selectedItems.length > 1 ? "s" : ""
      } from your cart?`
    );

    if (!confirmed) return;

    try {
      setRemovingMultiple(true);

      await cartService.removeCartItems(selectedItems);

      setSelectedItems([]);

      if (editingItemId && selectedItems.some((id) => String(id) === String(editingItemId))) {
        handleCancelEdit();
      }

      toast.success("Selected items removed from cart.");

      await fetchCart();
    } catch (err) {
      console.error("Remove selected items error:", err);

      toast.error(
        err.response?.data?.message ||
          "Unable to remove selected items."
      );
    } finally {
      setRemovingMultiple(false);
    }
  };

  // Checkout selected items
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to proceed to checkout.");
      return;
    }

    const selectedCartItems = items.filter((item) =>
      selectedItems.some((id) => String(id) === String(item.id))
    );

    // Check if any selected item is unavailable or exceeds available stock
    const unavailableItem = selectedCartItems.find(
      (item) => item.available === false
    );
    if (unavailableItem) {
      const name = unavailableItem.name || unavailableItem.product?.name || "An item";
      toast.error(`"${name}" is currently unavailable.`);
      return;
    }

    const outOfStockItem = selectedCartItems.find((item) => {
      const stock = item.stockQuantity ?? item.product?.stockQuantity;
      return (
        stock !== undefined &&
        stock !== null &&
        Number(stock) < Number(item.quantity)
      );
    });

    if (outOfStockItem) {
      const stock = outOfStockItem.stockQuantity ?? outOfStockItem.product?.stockQuantity ?? 0;
      const name = outOfStockItem.name || outOfStockItem.product?.name || "An item";
      toast.error(
        stock > 0
          ? `"${name}" exceeds available stock (${stock} available).`
          : `"${name}" is currently out of stock.`
      );
      return;
    }

    navigate("/customer/checkout/confirm", {
      state: {
        checkoutType: "cart",
        cartItemIds: selectedItems,
        items: selectedCartItems.map((item) => ({
          productId: item.productId || item.product?.id || item.id,
          quantity: item.quantity,
        })),
        products: selectedCartItems.map((item) => {
          const pId = item.productId || item.product?.id || item.id;
          const pName = item.name || item.product?.name || "Product";
          const pPrice = Number(
            item.unitPrice ?? item.price ?? item.product?.price ?? 0
          );
          const pImg =
            item.imageUrl || item.product?.imageUrl || item.product?.image || "";

          return {
            ...(item.product || {}),
            id: pId,
            productId: pId,
            name: pName,
            price: pPrice,
            unitPrice: pPrice,
            imageUrl: pImg,
            quantity: item.quantity,
          };
        }),
      },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader text="Loading your cart..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center">
        <p className="mb-4 text-red-500">{error}</p>

        <Button onClick={fetchCart}>
          Retry
        </Button>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <div className="mb-4 text-6xl">🛒</div>

        <h2 className="mb-3 text-2xl font-semibold text-gray-900">
          Your cart is empty
        </h2>

        <p className="mb-6 text-gray-500">
          Add some products to your cart to get started.
        </p>

        <Button variant="primary" onClick={() => navigate("/customer")}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  const isGlobalBusy =
    updatingItemId !== null || removingItemId !== null || removingMultiple;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Back button */}
      <Button
        variant="link"
        onClick={() => navigate("/customer")}
        className="mb-6 -ml-2 text-indigo-600 hover:text-indigo-800"
      >
        ← Continue Shopping
      </Button>

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Shopping Cart
        </h1>

        <span className="text-sm text-gray-500">
          {items.length} {items.length === 1 ? "item" : "items"} in cart
        </span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* Cart Items List */}
        <div className="space-y-5 lg:col-span-2">

          {/* Select All Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4 shadow-sm">
            <Checkbox
              checked={isAllSelected}
              disabled={isGlobalBusy}
              onChange={(e) => handleSelectAll(e.target.checked)}
              label="Select all items"
            />

            <div className="flex items-center gap-4">
              {selectedItems.length > 0 && (
                <Button
                  variant="custom"
                  disabled={isGlobalBusy}
                  onClick={handleRemoveSelected}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 disabled:opacity-50"
                >
                  {removingMultiple
                    ? "Removing..."
                    : `Remove selected (${selectedItems.length})`}
                </Button>
              )}

              <span className="text-sm font-medium text-gray-600">
                {selectedItems.length} of {items.length} selected
              </span>
            </div>
          </div>

          {/* Individual Cart Items */}
          {items.map((item) => {
            const isSelected = selectedItems.some(
              (id) => String(id) === String(item.id)
            );

            const isEditing =
              String(editingItemId) === String(item.id);

            const isUpdating =
              String(updatingItemId) === String(item.id);

            const isRemoving =
              String(removingItemId) === String(item.id);

            const isBusy = isUpdating || isRemoving || removingMultiple;

            const productId = item.productId || item.product?.id || item.id;
            const productName = item.name || item.product?.name || "Product";
            const imageUrl = getAssetUrl(
              item.imageUrl || item.product?.imageUrl || item.product?.image
            );
            const unitPrice = Number(
              item.unitPrice ?? item.price ?? item.product?.price ?? 0
            );
            const itemTotal = Number(
              item.subtotal ?? (unitPrice * Number(item.quantity || 1))
            );
            const isAvailable = item.available !== false;
            const stockQuantity =
              item.stockQuantity ?? item.product?.stockQuantity;
            const isOutOfStock =
              !isAvailable ||
              (stockQuantity !== undefined && stockQuantity !== null && stockQuantity <= 0);

            return (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm sm:flex-row"
              >
                {/* Checkbox */}
                <div className="flex items-start pt-1">
                  <Checkbox
                    checked={isSelected}
                    disabled={isBusy}
                    onChange={(e) =>
                      handleSelectItem(item.id, e.target.checked)
                    }
                  />
                </div>

                {/* Product Image */}
                <div
                  className="flex h-28 w-28 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-gray-50 border"
                  onClick={() => productId && navigate(`/customer/products/${productId}`)}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={productName}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-4xl" role="img" aria-label="Product">
                      📦
                    </span>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex flex-1 flex-col justify-between gap-3">
                  <div>
                    <h3
                      className="cursor-pointer font-semibold text-gray-900 hover:text-indigo-600"
                      onClick={() => productId && navigate(`/customer/products/${productId}`)}
                    >
                      {productName}
                    </h3>

                    {item.sku && (
                      <p className="mt-0.5 text-xs text-gray-400">
                        SKU: {item.sku}
                      </p>
                    )}

                    <p className="mt-1 text-sm text-gray-500">
                      Price: {formatPrice(unitPrice)}
                    </p>

                    {isOutOfStock ? (
                      <p className="mt-1 text-xs font-semibold text-rose-600">
                        {!isAvailable ? "Unavailable" : "Out of stock"}
                      </p>
                    ) : stockQuantity !== undefined && stockQuantity !== null ? (
                      <p className="mt-1 text-xs text-gray-500">
                        Stock available: {stockQuantity}
                      </p>
                    ) : null}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-wrap items-center gap-3">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max={stockQuantity ?? undefined}
                          value={editingQuantity}
                          disabled={isUpdating}
                          onChange={(e) =>
                            setEditingQuantity(e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSaveQuantity(item.id);
                            } else if (e.key === "Escape") {
                              handleCancelEdit();
                            }
                          }}
                          className="w-20 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                          autoFocus
                        />

                        <Button
                          disabled={isUpdating}
                          onClick={() =>
                            handleSaveQuantity(item.id)
                          }
                          className="px-3 py-1.5 text-xs"
                        >
                          {isUpdating ? "Saving..." : "Save"}
                        </Button>

                        <Button
                          variant="secondary"
                          disabled={isUpdating}
                          onClick={handleCancelEdit}
                          className="px-3 py-1.5 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          Qty:
                        </span>

                        <div className="flex items-center rounded-lg border border-gray-200">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleQuickQuantityChange(item, -1)}
                            className="flex h-8 w-8 items-center justify-center rounded-l text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>

                          <span className="min-w-8 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            disabled={
                              isBusy ||
                              (stockQuantity !== undefined &&
                                stockQuantity !== null &&
                                Number(item.quantity) >= Number(stockQuantity))
                            }
                            onClick={() => handleQuickQuantityChange(item, 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-r text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <Button
                          variant="secondary"
                          disabled={isGlobalBusy}
                          onClick={() =>
                            handleEditQuantity(item)
                          }
                          className="px-2.5 py-1 text-xs"
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Item Subtotal */}
                  <p className="font-semibold text-gray-900">
                    Subtotal: {formatPrice(itemTotal)}
                  </p>
                </div>

                {/* Remove Item */}
                <div className="flex items-start sm:justify-end">
                  <Button
                    variant="danger"
                    disabled={isGlobalBusy}
                    onClick={() => handleRemoveItem(item.id)}
                    className="px-3 py-1.5 text-xs"
                  >
                    {isRemoving ? "Removing..." : "Remove"}
                  </Button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="h-fit rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-gray-900">
            Order Summary
          </h2>

          <div className="mb-4 flex justify-between text-sm text-gray-600">
            <span>Selected Items</span>
            <span className="font-medium text-gray-900">
              {selectedItems.length}
            </span>
          </div>

          <div className="mb-4 flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium text-gray-900">
              {formatPrice(selectedSubtotal)}
            </span>
          </div>

          <div className="mb-6 flex justify-between border-t border-gray-100 pt-4">
            <span className="font-semibold text-gray-900">
              Total
            </span>
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(selectedSubtotal)}
            </span>
          </div>

          <Button
            variant="primary"
            onClick={handleCheckout}
            disabled={selectedItems.length === 0 || isGlobalBusy}
            className="w-full"
          >
            Proceed to Checkout ({selectedItems.length})
          </Button>

          {selectedItems.length === 0 && (
            <p className="mt-3 text-center text-xs text-gray-400">
              Select at least one item to proceed
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default CartPage;
