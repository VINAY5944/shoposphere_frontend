function Button({
  children,
  type = "button",
  onClick,
  loading = false,
  loadingText = "Loading...",
  disabled = false,
  variant = "primary",
  className = "",
  ...buttonProps
}) {
  const variants = {
    primary:
      "rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700",
    secondary:
      "rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50",
    dark:
      "rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700",
    danger:
      "rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700",
    link:
      "rounded-none bg-transparent px-0 py-0 text-sm font-medium text-blue-600 hover:bg-transparent hover:underline",
    custom: "",
  };

  return (
    <button
      {...buttonProps}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant] ?? variants.primary} ${className}`}
    >
      {loading ? loadingText : children}
    </button>
  );
}

export default Button;