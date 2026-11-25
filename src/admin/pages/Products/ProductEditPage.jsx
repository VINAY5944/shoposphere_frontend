
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import productService from "./services/productService";
import ProductForm from "./components/ProductForm";

function ProductEditPage() {
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          err.response?.data?.message ||
            "Failed to load product."
        );
        toast.error("Failed to load product.");
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

  if (loading) {
    return <p className="p-6 text-gray-500">Loading product...</p>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!product) {
    return <p className="p-6 text-gray-500">Product not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Product
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update {product.name}.
        </p>
      </div>

      <ProductForm key={product.id} mode="edit" product={product} />
    </div>
  );
}

export default ProductEditPage;
