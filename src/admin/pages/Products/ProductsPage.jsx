
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import productService from "./services/productService";
import categoryService from "../../../shared/services/categoryService";
import DataTable from "../../../shared/components/table/DataTable";
import Pagination from "../../../shared/components/table/Pagination";
import FilterBar from "../../../shared/components/filters/FilterBar";
import SearchFilter from "../../../shared/components/filters/SearchFilter";
import SelectFilter from "../../../shared/components/filters/SelectFilter";
import Button from "../../../shared/components/ui/Button";
import Badge from "../../../shared/components/ui/Badge";
import useDebounce from "../../../shared/hooks/useDebounce";

const ASSET_BASE_URL = import.meta.env.VITE_ASSET_BASE_URL;

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  return `${ASSET_BASE_URL}${imageUrl}`;
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

function ProductsPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const debouncedSearch = useDebounce(search);

  const [cursor, setCursor] = useState(null);
  const [cursorHistory, setCursorHistory] = useState([]);

  const [pagination, setPagination] = useState({
    limit: 10,
    hasNextPage: false,
    nextCursor: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");

      const response = await productService.getProducts({
        limit: 10,
        cursor,
        search: debouncedSearch,
        categoryId,
        signal,
      });

      if (signal?.aborted) return;
      setProducts(response.data || []);

      setPagination(
        response.pagination || {
          limit: 10,
          hasNextPage: false,
          nextCursor: null,
        }
      );
    } catch (err) {
      if (signal?.aborted) return;
      setError(
        err.response?.data?.message ||
          "Failed to load products."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [cursor, debouncedSearch, categoryId]);

  // Fetch products whenever filters or cursor change.
  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchProducts]);

  // Load categories for the filter.
  useEffect(() => {
    const controller = new AbortController();

    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories({
          limit: 100,
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;
        setCategories(response.data || []);
      } catch (err) {
        if (controller.signal.aborted) return;
        toast.error(
          err.response?.data?.message ||
            "Failed to load categories."
        );
      }
    };

    fetchCategories();

    return () => {
      controller.abort();
    };
  }, []);

  const handleSearch = useCallback((value) => {
    setSearch(value);
    setCursor(null);
    setCursorHistory([]);
  }, []);

  const handleCategoryChange = useCallback((value) => {
    setCategoryId(value);
    setCursor(null);
    setCursorHistory([]);
  }, []);

  const handleNextPage = () => {
    if (!pagination.hasNextPage || !pagination.nextCursor) {
      return;
    }

    setCursorHistory((previous) => [
      ...previous,
      cursor,
    ]);

    setCursor(pagination.nextCursor);
  };

  const handlePreviousPage = () => {
    if (cursorHistory.length === 0) return;

    const previousCursor = cursorHistory[cursorHistory.length - 1];

    setCursorHistory((previous) => previous.slice(0, -1));
    setCursor(previousCursor);
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      await productService.deleteProduct(product.id);

      toast.success("Product deactivated successfully.");

      // Refresh the current page.
      fetchProducts();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to deactivate product."
      );
    }
  };

  const columns = [
    {
      key: "product",
      header: "Product",
      render: (product) => (
        <div className="flex items-center gap-3">
          {product.imageUrl ? (
            <img
              src={getImageUrl(product.imageUrl)}
              alt={product.name}
              className="h-12 w-12 rounded-lg border object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xl">
              📦
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{product.name}</p>
            <p className="text-xs text-gray-500">ID: {product.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "sku",
      header: "SKU",
      render: (product) => product.sku,
    },
    {
      key: "category",
      header: "Category",
      render: (product) => product.category?.name || "-",
    },
    {
      key: "price",
      header: "Price",
      render: (product) => (
        <span className="font-medium text-gray-900">
          {formatCurrency(product.price)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (product) => (
        <Badge variant={product.isActive ? "success" : "danger"}>
          {product.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (product) => (
        <div className="flex justify-end gap-3">
          <Button
            variant="link"
            onClick={() =>
              navigate(`/admin/products/${product.id}/edit`)
            }
          >
            Edit
          </Button>
          {product.isActive && (
            <Button
              variant="custom"
              className="text-sm font-medium text-red-600 hover:text-red-800"
              onClick={() => handleDelete(product)}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Products
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your store products.
          </p>
        </div>

        <Button
          variant="dark"
          onClick={() => navigate("/admin/products/new")}
        >
          + Add Product
        </Button>
      </div>

      {/* Search and filters */}
      <FilterBar>
        <SearchFilter
          value={search}
          onChange={handleSearch}
          placeholder="Search products..."
        />
        <SelectFilter
          value={categoryId}
          onChange={handleCategoryChange}
          placeholder="All Categories"
          options={categories.map((category) => ({
            value: category.id,
            label: category.name,
          }))}
        />
      </FilterBar>

      {/* Products table */}
      {error ? (
        <div className="rounded-lg border border-red-200 bg-white p-6 text-center">
          <p className="text-red-600">{error}</p>
          <Button
            variant="dark"
            onClick={() => fetchProducts()}
            className="mt-3"
          >
            Retry
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          emptyMessage="No products found."
          tableClassName="min-w-[850px]"
        />
      )}

      {/* Cursor pagination */}
      <Pagination
        hasNextPage={pagination.hasNextPage}
        hasPreviousPage={cursorHistory.length > 0}
        loading={loading}
        onNext={handleNextPage}
        onPrevious={handlePreviousPage}
        description={`${products.length} products on this page`}
      />
    </div>
  );
}

export default ProductsPage;
