
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import productService from "./services/productService";
import cartService from "../cart/services/cartService";

import Button from "../../../shared/components/ui/Button";
import Loader from "../../../shared/components/common/Loader";
import { toast } from "sonner";

const getAvailableQuantity = (stockQuantity) => {
  const parsedQuantity = Number(stockQuantity);

  return Number.isFinite(parsedQuantity)
    ? Math.max(0, Math.floor(parsedQuantity))
    : 0;
};

function ProductDetailsPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const availableQuantity = product
    ? getAvailableQuantity(product.stockQuantity)
    : 0;

  // Fetch product details
  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await productService.getProductById(productId, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;
        setProduct(response.data);
        setQuantity(
          Math.min(1, getAvailableQuantity(response.data.stockQuantity))
        );
      } catch (error) {
        if (controller.signal.aborted) return;

        setError(
          error.response?.data?.message ||
            "Unable to load product details."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      controller.abort();
    };
  }, [productId]);

  const increaseQuantity = () => {
    setQuantity((previous) =>
      Math.min(availableQuantity, previous + 1)
    );
  };

  const decreaseQuantity = () => {
    setQuantity((previous) =>
      Math.max(availableQuantity > 0 ? 1 : 0, previous - 1)
    );
  };

  // Add product to cart
 const handleAddToCart = async () => {
  if (quantity < 1 || quantity > availableQuantity) {
    toast.error(
      availableQuantity > 0
        ? `Only ${availableQuantity} available.`
        : "This product is out of stock."
    );
    return;
  }

  try {
    setAddingToCart(true);
    setError("");
    setSuccess("");

    const response = await cartService.addItems([
      {
        productId: product.id,
        quantity,
      },
    ]);

    toast.success(
      response.message || "Product added to cart successfully!"
    );

  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Unable to add product to cart.";

    toast.error(message);
    setError(message);
  } finally {
    setAddingToCart(false);
  }
};

  // Buy Now - skips the cart
  const handleBuyNow = () => {
    if (quantity < 1 || quantity > availableQuantity) {
      toast.error(
        availableQuantity > 0
          ? `Only ${availableQuantity} available.`
          : "This product is out of stock."
      );
      return;
    }

    navigate("/customer/checkout/confirm", {
      state: {
        items: [
          {
            productId: product.id,
            quantity,
          },
        ],
        products: [
          {
            ...product,
            quantity,
          },
        ],
      },
    });
  };

  if (loading) {
    return <Loader text="Loading product details..." />;
  }

  if (error && !product) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">{error}</p>

        <Button
          variant="secondary"
          onClick={() => navigate("/customer")}
          className="mt-4"
        >
          Back to products
        </Button>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const price = Number(product.price);
  const compareAtPrice = Number(product.compareAtPrice);

  const hasDiscount =
    product.compareAtPrice &&
    compareAtPrice > price;

  const imageUrl = product.imageUrl
    ? `${import.meta.env.VITE_ASSET_BASE_URL}${product.imageUrl}`
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Button
        variant="link"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        ← Back
      </Button>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="grid gap-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:grid-cols-2">
        {/* Product image */}
        <div className="flex min-h-80 items-center justify-center rounded-xl bg-gray-50 p-6">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="max-h-96 w-full object-contain"
            />
          ) : (
            <span className="text-8xl" role="img" aria-label="Product">
              📦
            </span>
          )}
        </div>

        {/* Product information */}
        <div className="flex flex-col">
          <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
            {product.category?.name || "Uncategorized"}
          </p>

          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            {product.name}
          </h1>

          <p className="mt-4 leading-7 text-gray-600">
            {product.description || "No description available."}
          </p>

          {/* Price */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">
              ₹{price.toLocaleString("en-IN")}
            </span>

            {hasDiscount && (
              <span className="text-lg text-gray-400 line-through">
                ₹{compareAtPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <p className="mt-3 text-sm text-gray-500">
            SKU: {product.sku}
          </p>

          <p
            className={`mt-2 text-sm font-medium ${
              availableQuantity > 0 ? "text-green-700" : "text-red-600"
            }`}
          >
            {availableQuantity > 0
              ? `Available quantity: ${availableQuantity}`
              : "Out of stock"}
          </p>

          {/* Quantity selector */}
          <div className="mt-8">
            <p className="mb-3 text-sm font-semibold text-gray-700">
              Quantity
            </p>

            <div className="flex items-center gap-4">
              <Button
                type="button"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                variant="custom"
                className="h-10 w-10 rounded-lg border border-gray-300 text-xl disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                −
              </Button>

              <span className="min-w-8 text-center text-lg font-semibold">
                {quantity}
              </span>

              <Button
                type="button"
                onClick={increaseQuantity}
                disabled={quantity >= availableQuantity}
                variant="custom"
                className="h-10 w-10 rounded-lg border border-gray-300 text-xl disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Increase quantity"
              >
                +
              </Button>
            </div>
          </div>

          {/* Total */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">
                Total
              </span>

              <span className="text-xl font-bold text-gray-900">
                ₹{(price * quantity).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="secondary"
              onClick={handleAddToCart}
              loading={addingToCart}
              disabled={
                addingToCart ||
                quantity < 1 ||
                quantity > availableQuantity
              }
            >
              Add to Cart
            </Button>

            <Button
              variant="primary"
              onClick={handleBuyNow}
              disabled={
                quantity < 1 || quantity > availableQuantity
              }
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsPage;
