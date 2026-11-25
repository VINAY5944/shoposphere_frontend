import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import customerService from "./services/customerService";
import CustomerFilters from "./components/CustomerFilters";
import DataTable from "../../../shared/components/table/DataTable";
import Pagination from "../../../shared/components/table/Pagination";
import Badge from "../../../shared/components/ui/Badge";
import Button from "../../../shared/components/ui/Button";
import useDebounce from "../../../shared/hooks/useDebounce";

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

function CustomersPage() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [isActive, setIsActive] = useState("");
  const [cursor, setCursor] = useState(null);
  const [cursorHistory, setCursorHistory] = useState([]);
  const [pagination, setPagination] = useState({
    hasNextPage: false,
    nextCursor: null,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatingCustomerId, setUpdatingCustomerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCustomers = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");

      const response = await customerService.getCustomers({
        limit: 20,
        cursor,
        search: debouncedSearch,
        isActive,
        signal,
      });

      if (signal.aborted) return;
      setCustomers(response.data || []);
      setPagination({
        hasNextPage: response.pagination?.hasNextPage || false,
        nextCursor: response.pagination?.nextCursor || null,
      });
    } catch (requestError) {
      if (signal.aborted) return;
      setError(
        requestError.response?.data?.message ||
          "Failed to load customers."
      );
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [cursor, isActive, debouncedSearch]);

  useEffect(() => {
    const controller = new AbortController();
    fetchCustomers(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchCustomers, refreshKey]);

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    setCursor(null);
    setCursorHistory([]);
  }, []);

  const handleStatusChange = (value) => {
    setIsActive(value);
    setCursor(null);
    setCursorHistory([]);
  };

  const handleNextPage = () => {
    if (!pagination.hasNextPage || !pagination.nextCursor) return;

    setCursorHistory((previous) => [...previous, cursor]);
    setCursor(pagination.nextCursor);
  };

  const handlePreviousPage = () => {
    if (cursorHistory.length === 0) return;

    const previousHistory = [...cursorHistory];
    const previousCursor = previousHistory.pop();

    setCursorHistory(previousHistory);
    setCursor(previousCursor);
  };

  const handleStatusToggle = async (customer) => {
    const nextIsActive = !customer.isActive;
    const action = nextIsActive ? "activate" : "deactivate";

    if (
      !window.confirm(
        `Are you sure you want to ${action} ${customer.name || "this customer"}?`
      )
    ) {
      return;
    }

    try {
      setUpdatingCustomerId(customer.id);
      await customerService.updateCustomerStatus(
        customer.id,
        nextIsActive
      );
      toast.success(`Customer ${action}d successfully.`);
      setRefreshKey((previous) => previous + 1);
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          `Failed to ${action} customer.`
      );
    } finally {
      setUpdatingCustomerId(null);
    }
  };

  const columns = [
    {
      key: "customer",
      header: "Customer",
      render: (customer) => (
        <div>
          <p className="font-medium text-gray-900">
            {customer.name || "-"}
          </p>
          <p className="text-xs text-gray-500">{customer.email}</p>
        </div>
      ),
    },
    {
      key: "emailVerifiedAt",
      header: "Email",
      render: (customer) => (
        <Badge variant={customer.emailVerifiedAt ? "success" : "warning"}>
          {customer.emailVerifiedAt ? "Verified" : "Unverified"}
        </Badge>
      ),
    },
    {
      key: "isActive",
      header: "Account",
      render: (customer) => (
        <Badge variant={customer.isActive ? "success" : "danger"}>
          {customer.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (customer) => formatDate(customer.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      render: (customer) => {
        const isUpdating = updatingCustomerId === customer.id;

        return (
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="link"
              onClick={() =>
                navigate(`/admin/customers/${customer.id}`)
              }
            >
              View
            </Button>
            <Button
              variant="custom"
              className={`text-sm font-medium ${
                customer.isActive
                  ? "text-red-600 hover:text-red-800"
                  : "text-green-700 hover:text-green-900"
              }`}
              loading={isUpdating}
              loadingText="Updating..."
              disabled={updatingCustomerId !== null && !isUpdating}
              onClick={() => handleStatusToggle(customer)}
            >
              {customer.isActive ? "Deactivate" : "Activate"}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="mt-1 text-sm text-gray-500">
          Search customer accounts and manage their status.
        </p>
      </div>

      <CustomerFilters
        search={search}
        isActive={isActive}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-white p-6 text-center">
          <p className="text-red-600">{error}</p>
          <Button
            variant="dark"
            className="mt-3"
            onClick={() => setRefreshKey((previous) => previous + 1)}
          >
            Retry
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={customers}
          loading={loading}
          emptyMessage="No customers found."
        />
      )}

      <Pagination
        hasNextPage={pagination.hasNextPage}
        hasPreviousPage={cursorHistory.length > 0}
        loading={loading || updatingCustomerId !== null}
        onNext={handleNextPage}
        onPrevious={handlePreviousPage}
        description={`${customers.length} customers on this page`}
      />
    </div>
  );
}

export default CustomersPage;
