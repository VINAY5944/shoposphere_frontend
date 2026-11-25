import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import inventoryService from "./services/inventoryService";
import DataTable from "../../../shared/components/table/DataTable";
import FilterBar from "../../../shared/components/filters/FilterBar";
import SearchFilter from "../../../shared/components/filters/SearchFilter";
import Badge from "../../../shared/components/ui/Badge";
import Button from "../../../shared/components/ui/Button";

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function InventoryPage() {
  const navigate = useNavigate();

  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchInventory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await inventoryService.getInventory({
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;
        if (!Array.isArray(response.data)) {
          throw new Error("The inventory response was invalid.");
        }
        setInventory(response.data);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            "Failed to load inventory."
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
  }, [retryKey]);

  const handleSearch = useCallback((value) => {
    setSearch(value);
  }, []);

  const filteredInventory = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return inventory;

    return inventory.filter(({ product }) =>
      [product?.name, product?.sku]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [inventory, search]);

  const columns = [
    {
      key: "product",
      header: "Product",
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900">
            {item.product?.name || "Unknown product"}
          </p>
          <p className="text-xs text-gray-500">
            ID: {item.productId}
          </p>
        </div>
      ),
    },
    {
      key: "sku",
      header: "SKU",
      render: (item) => item.product?.sku || "-",
    },
    {
      key: "quantity",
      header: "Available Quantity",
      render: (item) => (
        <span className="font-semibold text-gray-900">
          {item.quantity}
        </span>
      ),
    },
    {
      key: "status",
      header: "Product Status",
      render: (item) => (
        <Badge variant={item.product?.isActive ? "success" : "default"}>
          {item.product?.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "updatedAt",
      header: "Last Updated",
      render: (item) => formatDate(item.updatedAt),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <Button
          variant="link"
          onClick={() =>
            navigate(`/admin/inventory/${item.productId}`, {
              state: { product: item.product },
            })
          }
        >
          Manage
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review stock levels and restock products.
        </p>
      </div>

      <FilterBar>
        <SearchFilter
          value={search}
          onChange={handleSearch}
          placeholder="Search by product or SKU..."
        />
      </FilterBar>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-white p-6 text-center">
          <p className="text-red-600">{error}</p>
          <Button
            variant="dark"
            className="mt-3"
            onClick={() => setRetryKey((previous) => previous + 1)}
          >
            Retry
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredInventory}
          loading={loading}
          emptyMessage={
            search ? "No inventory matched your search." : "No inventory found."
          }
        />
      )}
    </div>
  );
}

export default InventoryPage;
