
function SelectFilter({
  id,
  ariaLabel,
  value,
  onChange,
  options = [],
  placeholder = "All",
}) {
  return (
    <select
      id={id}
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    >
      <option value="">{placeholder}</option>

      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default SelectFilter;
