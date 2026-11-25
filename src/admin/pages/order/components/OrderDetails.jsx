import OrderStatusBadge from "./OrderStatusBadge";

function formatPrice(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleString("en-IN");
}

function OrderDetails({ order }) {
  const customerName =
    order.customer?.name ||
    [order.customer?.firstName, order.customer?.lastName]
      .filter(Boolean)
      .join(" ") ||
    "Not available";

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          Order Information
        </h2>
        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-gray-500">Order Number</dt>
            <dd className="mt-1 font-medium text-gray-900">
              {order.orderNumber || order.id}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Order Date</dt>
            <dd className="mt-1 font-medium text-gray-900">
              {formatDate(order.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Order Status</dt>
            <dd className="mt-2">
              <OrderStatusBadge status={order.status} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Payment Status</dt>
            <dd className="mt-2">
              <OrderStatusBadge status={order.paymentStatus} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Customer</dt>
            <dd className="mt-1 font-medium text-gray-900">
              {customerName}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Customer Email</dt>
            <dd className="mt-1 break-all font-medium text-gray-900">
              {order.customer?.email || "Not available"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Payment Reference</dt>
            <dd className="mt-1 break-all font-medium text-gray-900">
              {order.paymentReference || "Not available"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          Ordered Products
        </h2>
        {order.items?.length ? (
          <div className="divide-y">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {item.productName || item.product?.name || "Product"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    SKU: {item.sku || item.product?.sku || "Not available"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-sm text-gray-500">
                    Unit price: {formatPrice(item.unitPrice, order.currency)}
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {formatPrice(item.lineTotal, order.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No items found.</p>
        )}
      </section>

      <section className="flex items-center justify-between rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Total Amount</h2>
        <p className="text-xl font-bold text-gray-900">
          {formatPrice(order.totalAmount, order.currency)}
        </p>
      </section>
    </div>
  );
}

export default OrderDetails;