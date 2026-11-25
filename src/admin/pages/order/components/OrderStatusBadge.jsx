import Badge from "../../../../shared/components/ui/Badge";

function OrderStatusBadge({ status }) {
  const statusVariants = {
    PENDING: "warning",
    CONFIRMED: "info",
    PROCESSING: "indigo",
    SHIPPED: "purple",
    DELIVERED: "success",
    CANCELLED: "danger",
    FAILED: "danger",
    SUCCESS: "success",
    PAID: "success",
    REFUNDED: "default",
  };

  const normalizedStatus = status?.toUpperCase() || "UNKNOWN";
  const formattedStatus = normalizedStatus.replaceAll("_", " ");

  return (
    <Badge variant={statusVariants[normalizedStatus] || "default"}>
      {formattedStatus}
    </Badge>
  );
}

export default OrderStatusBadge;