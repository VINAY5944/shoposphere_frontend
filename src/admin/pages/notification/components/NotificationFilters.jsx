import FilterBar from "../../../../shared/components/filters/FilterBar";
import SelectFilter from "../../../../shared/components/filters/SelectFilter";

const statusOptions = [
  { value: "QUEUED", label: "Queued" },
  { value: "RETRYING", label: "Retrying" },
  { value: "SENT", label: "Sent" },
  { value: "FAILED", label: "Failed" },
  { value: "QUEUE_FAILED", label: "Queue failed" },
];

function NotificationFilters({ status, onStatusChange }) {
  return (
    <FilterBar>
      <SelectFilter
        value={status}
        onChange={onStatusChange}
        options={statusOptions}
        placeholder="All statuses"
      />
    </FilterBar>
  );
}

export default NotificationFilters;
