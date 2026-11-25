import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import inventoryService from "./services/inventoryService";
import productService from "../Products/services/productService";
import Badge from "../../../shared/components/ui/Badge";
import Button from "../../../shared/components/ui/Button";
import Input from "../../../shared/components/ui/Input";
import Loader from "../../../shared/components/common/Loader";

function InventoryDetailsPage() {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const productFromState = location.state?.product || null;

  const [inventory, setInventory] = useState(null);
  const [product, setProduct] = useState(productFromState);
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(true);
  const [restocking, setRestocking] = useState(false);
  const [error, setError] = useState("");
  const [productError, setProductError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchInventory = async () => {
      try {
        setLoading(true);
        setError("");
        setProductError("");
        setProduct(productFromState);

        const response = await inventoryService.getInventoryByProductId(
          productId,
          { signal: controller.signal }
        );

        if (controller.signal.aborted) return;
        if (!response.data || typeof response.data !== "object") {
          throw new Error("The inventory response was invalid.");
        }
        setInventory(response.data);

        if (response.data.product) {
          setProduct(response.data.product);
        } else if (!productFromState) {
          try {
            const productResponse = await productService.getProductById(
              productId,
              { signal: controller.signal }
            );

            if (controller.signal.aborted) return;
            if (!productResponse.data) {
              throw new Error("The product response was invalid.");
            }
            setProduct(productResponse.data);
          } catch (productRequestError) {
            if (controller.signal.aborted) return;
            setProductError(
              productRequestError.response?.data?.message ||
                "Product details could not be loaded."
            );
          }
        }
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            "Failed to load product inventory."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchInventory();

    return () => {
      controller.abort();
    };
  }, [productFromState, productId, retryKey]);

  const handleRestock = async (event) => {
    event.preventDefault();

    const addedQuantity = Number(quantity);
    if (!Number.isSafeInteger(addedQuantity) || addedQuantity <= 0) {
      toast.error("Enter a positive whole-number quantity.");
      return;
    }

    try {
      setRestocking(true);
      const response = await inventoryService.restockProduct(
        productId,
        addedQuantity
      );

      if (!Number.isFinite(response.data?.availableQuantity)) {
        throw new Error("The restock response was invalid.");
      }

      setInventory((previous) => ({
        ...previous,
        quantity: response.data.availableQuantity,
      }));
      setQuantity("");
      toast.success(
        response.message || "Inventory restocked successfully."
      );
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          "Failed to restock inventory."
      );
    } finally {
      setRestocking(false);
    }
  };

  if (loading) {
    return <Loader text="Loading inventory..." />;
  }

  if (error || !inventory) {
    return (
      <div className="rounded-lg border border-red-200 bg-white p-6">
        <p className="text-red-600">
          {error || "Inventory record not found."}
        </p>
        <div className="mt-4 flex gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate("/admin/inventory")}
          >
            Back to Inventory
          </Button>
          {error && (
            <Button
              variant="dark"
              onClick={() => setRetryKey((previous) => previous + 1)}
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  const displayedProduct = inventory.product || product;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Inventory Details
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {displayedProduct?.name || `Product ${inventory.productId}`} · SKU{" "}
            {displayedProduct?.sku || "-"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate("/admin/inventory")}
          >
            Back to Inventory
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              navigate(`/admin/inventory/${productId}/history`, {
                state: displayedProduct ? { product: displayedProduct } : undefined,
              })
            }
          >
            View History
          </Button>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {displayedProduct?.name || `Product ${inventory.productId}`}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Product ID: {inventory.productId}
              </p>
            </div>
            <Badge
              variant={displayedProduct?.isActive ? "success" : "default"}
            >
              {displayedProduct
                ? displayedProduct.isActive
                  ? "Active"
                  : "Inactive"
                : "Status unavailable"}
            </Badge>
          </div>

          {productError && (
            <p className="mt-2 text-sm text-amber-700">{productError}</p>
          )}

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-gray-500">SKU</dt>
              <dd className="mt-1 font-medium text-gray-900">
                {displayedProduct?.sku || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Available Quantity</dt>
              <dd className="mt-1 text-2xl font-bold text-gray-900">
                {inventory.quantity}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Last Updated</dt>
              <dd className="mt-1 font-medium text-gray-900">
                {inventory.updatedAt
                  ? new Date(inventory.updatedAt).toLocaleString("en-IN")
                  : "-"}
              </dd>
            </div>
          </dl>
        </div>

        <form
          onSubmit={handleRestock}
          className="h-fit space-y-5 rounded-lg border border-gray-200 bg-white p-6"
        >
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Restock Product
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter the number of units to add to available inventory.
            </p>
          </div>

          <Input
            label="Quantity to add"
            name="quantity"
            type="number"
            min="1"
            step="1"
            required
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="Enter a whole number"
            disabled={restocking}
          />

          <Button
            type="submit"
            variant="dark"
            loading={restocking}
            loadingText="Restocking..."
          >
            Restock
          </Button>
        </form>
      </section>
    </div>
  );
}

export default InventoryDetailsPage;
