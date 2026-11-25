
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import categoryService from "./services/categoryService";
import DataTable from "../../../shared/components/table/DataTable";
import Pagination from "../../../shared/components/table/Pagination";
import FilterBar from "../../../shared/components/filters/FilterBar";
import SearchFilter from "../../../shared/components/filters/SearchFilter";
import Button from "../../../shared/components/ui/Button";
import Badge from "../../../shared/components/ui/Badge";
import useDebounce from "../../../shared/hooks/useDebounce";

function CategoriesPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const [cursor, setCursor] = useState(null);
  const [cursorHistory, setCursorHistory] = useState([]);

  const [pagination, setPagination] = useState({
    hasNextPage: false,
    nextCursor: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCategories = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");

      const response = await categoryService.getCategories({
        limit: 10,
        cursor,
        search: debouncedSearch,
        signal,
      });

      if (signal?.aborted) return;
      setCategories(response.data || []);

      setPagination(
        response.pagination || {
          hasNextPage: false,
          nextCursor: null,
        }
      );
    } catch (err) {
      if (signal?.aborted) return;
      setError(
        err.response?.data?.message ||
          "Failed to load categories."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [cursor, debouncedSearch]);

  useEffect(() => {
    const controller = new AbortController();
    fetchCategories(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchCategories]);

  const handleSearch = useCallback((value) => {
    setSearch(value);
    setCursor(null);
    setCursorHistory([]);
  }, []);

  const handleNextPage = () => {
    if (!pagination.hasNextPage || !pagination.nextCursor) {
      return;
    }

    setCursorHistory((previous) => [...previous, cursor]);
    setCursor(pagination.nextCursor);
  };

  const handlePreviousPage = () => {
    if (cursorHistory.length === 0) return;

    const previousCursor =
      cursorHistory[cursorHistory.length - 1];

    setCursorHistory((previous) => previous.slice(0, -1));
    setCursor(previousCursor);
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      await categoryService.deleteCategory(category.id);

      toast.success("Category deleted successfully.");

      fetchCategories();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to delete category."
      );
    }
  };

  const columns = [
    {
      key: "name",
      header: "Category",
      render: (category) => (
        <div>
          <p className="font-medium text-gray-900">{category.name}</p>
          <p className="text-xs text-gray-500">ID: {category.id}</p>
        </div>
      ),
    },
    {
      key: "slug",
      header: "Slug",
      render: (category) => category.slug || "-",
    },
    {
      key: "parent",
      header: "Parent Category",
      render: (category) => category.parent?.name || "-",
    },
    {
      key: "status",
      header: "Status",
      render: (category) => (
          <Badge variant={category.isActive ? "success" : "danger"}>
          {category.isActive ? "Active" : "Inactive"}
          </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (category) => (
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="link"
            onClick={() =>
              navigate(`/admin/categories/${category.id}/edit`)
            }
          >
            Edit
          </Button>
          <Button
            variant="custom"
            type="button"
            onClick={() => handleDelete(category)}
            className="text-sm font-medium text-red-600 hover:text-red-800"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Categories
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Organize and manage your product categories.
          </p>
        </div>

        <Button
          variant="dark"
          onClick={() => navigate("/admin/categories/new")}
        >
          + Add Category
        </Button>
      </div>

      <FilterBar>
        <SearchFilter
          value={search}
          onChange={handleSearch}
          placeholder="Search categories..."
        />
      </FilterBar>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-white p-6 text-center">
          <p className="text-red-600">{error}</p>
          <Button
            type="button"
            variant="dark"
            onClick={() => fetchCategories()}
            className="mt-3"
          >
            Retry
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={categories}
          loading={loading}
          emptyMessage="No categories found."
        />
      )}

      <Pagination
        hasNextPage={pagination.hasNextPage}
        hasPreviousPage={cursorHistory.length > 0}
        loading={loading}
        onNext={handleNextPage}
        onPrevious={handlePreviousPage}
        description={`${categories.length} categories on this page`}
      />
    </div>
  );
}

export default CategoriesPage;
