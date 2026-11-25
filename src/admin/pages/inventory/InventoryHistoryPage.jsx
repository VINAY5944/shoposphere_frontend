import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import inventoryService from "./services/inventoryService";
import DataTable from "../../../shared/components/table/DataTable";
import Pagination from "../../../shared/components/table/Pagination";
import Badge from "../../../shared/components/ui/Badge";
import Button from "../../../shared/components/ui/Button";

const PAGE_LIMIT = 20;

const movementVariants = {
  RESTOCK: "success",
  ORDER: "info",
};

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString("en-IN");
}

function InventoryHistoryPage() {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product || null;

  const [movements, setMovements] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [cursorHistory, setCursorHistory] = useState([]);
  const [pagination, setPagination] = useState({
    limit: PAGE_LIMIT,
    hasNextPage: false,
    nextCursor: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await inventoryService.getInventoryHistory(
          productId,
          {
            limit: PAGE_LIMIT,
            cursor,
            signal: controller.signal,
          }
        );

        if (controller.signal.aborted) return;
        if (!Array.isArray(response.data) || !response.pagination) {
          throw new Error("The inventory history response was invalid.");
        }

        setMovements(response.data);
        setPagination(response.pagination);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            "Failed to load inventory history."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      controller.abort();
    };
  }, [cursor, productId, retryKey]);

  const handlePreviousPage = () => {
    if (cursorHistory.length === 0) return;

    const previousHistory = [...cursorHistory];
    const previousCursor = previousHistory.pop();

    setCursorHistory(previousHistory);
    setCursor(previousCursor);
  };

  const handleNextPage = () => {
    if (!pagination.hasNextPage || !pagination.nextCursor) return;

    setCursorHistory((previous) => [...previous, cursor]);
    setCursor(pagination.nextCursor);
  };

  const columns = [
    {
      key: "type",
      header: "Movement",
      render: (movement) => (
        <Badge variant={movementVariants[movement.type] || "default"}>
          {movement.type || "Unknown"}
        </Badge>
      ),
    },
    {
      key: "quantityChange",
      header: "Quantity Change",
      render: (movement) => {
        const amount = Number(movement.quantityChange);
        const validAmount = Number.isFinite(amount);

        return (
          <span
            className={`font-semibold ${
              validAmount && amount > 0
                ? "text-green-700"
                : validAmount && amount < 0
                  ? "text-red-700"
                  : "text-gray-900"
            }`}
          >
            {validAmount && amount > 0 ? "+" : ""}
            {validAmount ? amount : movement.quantityChange ?? "-"}
          </span>
        );
      },
    },
    {
      key: "previousQuantity",
      header: "Previous Stock",
    },
    {
      key: "newQuantity",
      header: "New Stock",
    },
    {
      key: "reference",
      header: "Reference",
      render: (movement) => movement.reference || "-",
    },
    {
      key: "createdAt",
      header: "Date",
      render: (movement) => formatDate(movement.createdAt),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Inventory History
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {product?.name || `Product ${productId}`}
            {product?.sku ? ` · SKU ${product.sku}` : ""}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() =>
            navigate(`/admin/inventory/${productId}`, {
              state: product ? { product } : undefined,
            })
          }
        >
          Back to Inventory Details
        </Button>
      </div>

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
        <>
          <DataTable
            columns={columns}
            data={movements}
            loading={loading}
            emptyMessage="No inventory movements recorded for this product."
          />
          <Pagination
            hasNextPage={pagination.hasNextPage}
            hasPreviousPage={cursorHistory.length > 0}
            loading={loading}
            onNext={handleNextPage}
            onPrevious={handlePreviousPage}
            description={`${movements.length} movements on this page`}
          />
        </>
      )}
    </div>
  );
}

export default InventoryHistoryPage;
