import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CategoryForm from "./components/CategoryForm";
import categoryService from "./services/categoryService";

function CategoryEditPage() {
  const { categoryId } = useParams();

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await categoryService.getCategoryById(categoryId, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;
        setCategory(response.data);
      } catch (error) {
        if (controller.signal.aborted) return;
        setError(
          error.response?.data?.message || "Failed to load category."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchCategory();

    return () => {
      controller.abort();
    };
  }, [categoryId]);

  if (loading) {
    return <p className="text-gray-500">Loading category...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!category) {
    return <p className="text-gray-500">Category not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Category
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update the category details.
        </p>
      </div>

      <CategoryForm key={category.id} mode="edit" category={category} />
    </div>
  );
}

export default CategoryEditPage;