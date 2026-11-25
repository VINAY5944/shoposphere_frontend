import FilterBar from "../../../../shared/components/filters/FilterBar";
import SelectFilter from "../../../../shared/components/filters/SelectFilter";

const orderStatusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const paymentStatusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "SUCCESS", label: "Success" },
  { value: "FAILED", label: "Failed" },
];

function OrderFilters({
  status,
  paymentStatus,
  onStatusChange,
  onPaymentStatusChange,
}) {
  return (
    <FilterBar>
      <div className="flex-1">
        <label
          htmlFor="orderStatus"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Order Status
        </label>
        <SelectFilter
          id="orderStatus"
          ariaLabel="Order status"
          value={status}
          onChange={onStatusChange}
          options={orderStatusOptions}
          placeholder="All Order Statuses"
        />
      </div>

      <div className="flex-1">
        <label
          htmlFor="paymentStatus"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Payment Status
        </label>
        <SelectFilter
          id="paymentStatus"
          ariaLabel="Payment status"
          value={paymentStatus}
          onChange={onPaymentStatusChange}
          options={paymentStatusOptions}
          placeholder="All Payment Statuses"
        />
      </div>
    </FilterBar>
  );
}

export default OrderFilters;