
import { useEffect, useState } from "react";
import DataTable from "../../../shared/components/table/DataTable";
import Button from "../../../shared/components/ui/Button";
import Badge from "../../../shared/components/ui/Badge";
import Loader from "../../../shared/components/common/Loader";
import DashboardStatCard from "./components/DashboardStatCard";
import dashboardService from "./Services/dashboardService";

const numberFormatter = new Intl.NumberFormat("en-IN");
const monthFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  year: "numeric",
});

const formatCurrency = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const statCardStyles = [
  {
    key: "totalOrders",
    label: "Total Orders",
    icon: "📦",
    color: "bg-blue-50 text-blue-600",
  },
  {
    key: "paidOrders",
    label: "Paid Orders",
    icon: "💳",
    color: "bg-green-50 text-green-600",
  },
  {
    key: "totalRevenue",
    label: "Total Revenue",
    icon: "💰",
    color: "bg-purple-50 text-purple-600",
  },
  {
    key: "totalCustomers",
    label: "Total Customers",
    icon: "👥",
    color: "bg-orange-50 text-orange-600",
  },
  {
    key: "activeProducts",
    label: "Active Products",
    icon: "🛍️",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    key: "lowStockCount",
    label: "Low Stock Items",
    icon: "⚠️",
    color: "bg-red-50 text-red-600",
  },
];

const recentOrderColumns = [
  {
    key: "orderNumber",
    header: "Order",
  },
  {
    key: "customer",
    header: "Customer",
    render: (order) => (
      <div>
        <p className="font-medium text-gray-800">
          {order.customer?.name || "Unknown"}
        </p>
        <p className="text-xs text-gray-500">{order.customer?.email || ""}</p>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
  },
  {
    key: "paymentStatus",
    header: "Payment",
  },
  {
    key: "totalAmount",
    header: "Total",
    render: (order) => formatCurrency(order.totalAmount, order.currency),
  },
  {
    key: "createdAt",
    header: "Date",
    render: (order) => new Date(order.createdAt).toLocaleDateString("en-IN"),
  },
];

function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await dashboardService.getDashboard({
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;
        setDashboard(response);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          err.response?.data?.message ||
            "Failed to load dashboard data. Please try again."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      controller.abort();
    };
  }, [retryCount]);

  if (loading) {
    return <Loader text="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="font-medium text-red-700">{error}</p>

        <Button
          onClick={() => setRetryCount((count) => count + 1)}
          variant="danger"
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  const overview = dashboard?.overview ?? {};
  const salesByMonth = dashboard?.salesByMonth ?? [];
  const recentOrders = dashboard?.recentOrders ?? [];
  const lowStockItems = dashboard?.lowStockItems ?? [];
  const maxMonthlyRevenue = Math.max(
    0,
    ...salesByMonth.map((month) => Number(month.revenue) || 0)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to ShopSphere administration.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {statCardStyles.map((card) => {
          const value =
            card.key === "totalRevenue"
              ? formatCurrency(
                  overview.totalRevenue?.amount,
                  overview.totalRevenue?.currency
                )
              : numberFormatter.format(Number(overview[card.key]) || 0);

          return (
            <DashboardStatCard
              key={card.key}
              label={card.label}
              value={value}
              icon={card.icon}
              color={card.color}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Sales by month
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Revenue for the latest reporting months
            </p>
          </div>

          {salesByMonth.length > 0 ? (
            <div className="space-y-4">
              {salesByMonth.map((month) => {
                const revenue = Number(month.revenue) || 0;
                const barWidth =
                  maxMonthlyRevenue > 0
                    ? `${(revenue / maxMonthlyRevenue) * 100}%`
                    : "0%";
                const [year, monthNumber] = month.month
                  .split("-")
                  .map(Number);
                const monthLabel = monthFormatter.format(
                  new Date(year, monthNumber - 1, 1)
                );

                return (
                  <div key={month.month}>
                    <div className="mb-1 flex items-center justify-between gap-4 text-sm">
                      <span className="text-gray-600">{monthLabel}</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(month.revenue, month.currency)}
                      </span>
                    </div>
                    <div
                      className="h-2 overflow-hidden rounded-full bg-gray-100"
                      role="img"
                      aria-label={`${monthLabel} revenue`}
                    >
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all"
                        style={{ width: barWidth }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-gray-500">
              No sales data available.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Low stock items
          </h2>

          {lowStockItems.length > 0 ? (
            <ul className="mt-4 divide-y divide-gray-100">
              {lowStockItems.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                  </div>
                  <Badge variant="danger" className="shrink-0">
                    {numberFormatter.format(Number(item.quantity) || 0)} left
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-lg bg-green-50 p-4 text-sm text-green-700">
              No low-stock items.
            </p>
          )}
        </section>
      </div>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent orders</h2>
          <p className="mt-1 text-sm text-gray-500">
            Latest orders placed by customers
          </p>
        </div>
        <DataTable
          columns={recentOrderColumns}
          data={recentOrders}
          rowKey="id"
          emptyMessage="No recent orders."
        />
      </section>

      <p className="text-xs text-gray-400">
        Last updated:{" "}
        {dashboard?.generatedAt
          ? new Date(dashboard.generatedAt).toLocaleString("en-IN")
          : "Unavailable"}
      </p>
    </div>
  );
}

export default DashboardPage;
