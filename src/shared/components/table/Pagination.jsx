
import Button from "../ui/Button";

function Pagination({
  hasNextPage = false,
  hasPreviousPage = false,
  loading = false,
  description = "Navigate through records",
  onNext,
  onPrevious,
}) {
  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-5 py-4">
      <p className="text-sm text-gray-500">
        {description}
      </p>

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={onPrevious}
          disabled={!hasPreviousPage || loading}
          variant="custom"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={!hasNextPage || loading}
          variant="custom"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default Pagination;
