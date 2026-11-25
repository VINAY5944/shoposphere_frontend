
function FilterBar({ children }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        {children}
      </div>
    </div>
  );
}

export default FilterBar;
