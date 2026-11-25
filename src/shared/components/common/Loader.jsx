
function Loader({ size = "md", text = "Loading..." }) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-4",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6">
      <div
        className={`animate-spin rounded-full border-blue-600 border-t-transparent ${sizes[size]}`}
      />

      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}

export default Loader;
