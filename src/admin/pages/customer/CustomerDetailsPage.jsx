import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import customerService from "./services/customerService";
import Badge from "../../../shared/components/ui/Badge";
import Button from "../../../shared/components/ui/Button";
import Loader from "../../../shared/components/common/Loader";

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleString("en-IN");
}

function CustomerDetailsPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCustomer = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await customerService.getCustomerById(
          customerId,
          { signal: controller.signal }
        );

        if (controller.signal.aborted) return;
        setCustomer(response.data);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setError(
          requestError.response?.data?.message ||
            "Failed to load customer details."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchCustomer();

    return () => {
      controller.abort();
    };
  }, [customerId, retryKey]);

  const handleStatusToggle = async () => {
    if (!customer) return;

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
      setUpdating(true);
      const response = await customerService.updateCustomerStatus(
        customer.id,
        nextIsActive
      );

      if (!response.data) {
        throw new Error("The server returned no updated customer.");
      }

      setCustomer(response.data);
      toast.success(`Customer ${action}d successfully.`);
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          requestError.message ||
          `Failed to ${action} customer.`
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <Loader text="Loading customer details..." />;
  }

  if (error || !customer) {
    return (
      <div className="rounded-lg border border-red-200 bg-white p-6">
        <p className="text-red-600">
          {error || "Customer not found."}
        </p>
        <div className="mt-4 flex gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate("/admin/customers")}
          >
            Back to Customers
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

  const roles = Array.isArray(customer.roles)
    ? customer.roles
        .map((role) => (typeof role === "string" ? role : role?.name))
        .filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Customer Details
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {customer.name || customer.email}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate("/admin/customers")}
          >
            Back to Customers
          </Button>
          <Button
            variant={customer.isActive ? "danger" : "dark"}
            loading={updating}
            loadingText="Updating..."
            onClick={handleStatusToggle}
          >
            {customer.isActive ? "Deactivate Account" : "Activate Account"}
          </Button>
        </div>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6 flex flex-wrap gap-2">
          <Badge variant={customer.isActive ? "success" : "danger"}>
            {customer.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge variant={customer.emailVerifiedAt ? "success" : "warning"}>
            {customer.emailVerifiedAt ? "Email verified" : "Email unverified"}
          </Badge>
        </div>

        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500">Name</dt>
            <dd className="mt-1 font-medium text-gray-900">
              {customer.name || "Not available"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Email</dt>
            <dd className="mt-1 break-all font-medium text-gray-900">
              {customer.email || "Not available"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Customer ID</dt>
            <dd className="mt-1 break-all font-medium text-gray-900">
              {customer.id}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Roles</dt>
            <dd className="mt-1 font-medium text-gray-900">
              {roles.length ? roles.join(", ") : "Customer"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Joined</dt>
            <dd className="mt-1 font-medium text-gray-900">
              {formatDate(customer.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Email Verified At</dt>
            <dd className="mt-1 font-medium text-gray-900">
              {formatDate(customer.emailVerifiedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Last Updated</dt>
            <dd className="mt-1 font-medium text-gray-900">
              {formatDate(customer.updatedAt)}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

export default CustomerDetailsPage;
