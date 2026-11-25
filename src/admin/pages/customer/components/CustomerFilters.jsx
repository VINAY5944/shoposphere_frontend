import FilterBar from "../../../../shared/components/filters/FilterBar";
import SearchFilter from "../../../../shared/components/filters/SearchFilter";
import SelectFilter from "../../../../shared/components/filters/SelectFilter";

const statusOptions = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

function CustomerFilters({
  search,
  isActive,
  onSearchChange,
  onStatusChange,
}) {
  return (
    <FilterBar>
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        <SearchFilter
          value={search}
          onChange={onSearchChange}
          placeholder="Search customers..."
        />
        <SelectFilter
          value={isActive}
          onChange={onStatusChange}
          options={statusOptions}
          placeholder="All account statuses"
        />
      </div>
    </FilterBar>
  );
}

export default CustomerFilters;
