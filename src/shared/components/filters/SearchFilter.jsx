
function SearchFilter({
  value,
  onChange,
  placeholder = "Search...",
}) {
  return (
    <div className="relative w-full max-w-sm">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        🔍
      </span>

      <input
        type="text"
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

export default SearchFilter;
