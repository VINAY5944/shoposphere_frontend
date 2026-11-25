function TextArea({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  rows = 4,
  error,
  required = false,
  disabled = false,
  className = "",
  ...textareaProps
}) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <textarea
        {...textareaProps}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 disabled:bg-gray-100 ${
          error
            ? "border-red-500 focus:ring-red-100"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
        } ${className}`}
      />

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default TextArea;
