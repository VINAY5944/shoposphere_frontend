
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import categoryService from "../services/categoryService";
import Input from "../../../../shared/components/ui/Input";
import SelectInput from "../../../../shared/components/ui/SelectInput";
import TextArea from "../../../../shared/components/ui/TextArea";
import Button from "../../../../shared/components/ui/Button";

const initialValues = {
  name: "",
  slug: "",
  description: "",
  parentId: "",
};

function CategoryForm({ mode = "create", category = null }) {
  const navigate = useNavigate();

  const isEdit = mode === "edit";

  const [form, setForm] = useState(() => {
    if (!category || !isEdit) return initialValues;

    return {
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      parentId: category.parentId ? String(category.parentId) : "",
    };
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories({
          limit: 100,
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;
        setCategories(response.data || []);
      } catch (err) {
        if (controller.signal.aborted) return;
        toast.error("Failed to load parent categories.");
      } finally {
        if (!controller.signal.aborted) {
          setCategoriesLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      controller.abort();
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Category name is required.");
      return;
    }

    if (
      form.parentId &&
      String(form.parentId) === String(category?.id)
    ) {
      setError("A category cannot be its own parent.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      parentId: form.parentId || null,
    };

    if (form.slug.trim()) {
      payload.slug = form.slug.trim();
    }

    try {
      setLoading(true);
      setError("");

      if (isEdit) {
        await categoryService.updateCategory(category.id, payload);
        toast.success("Category updated successfully.");
      } else {
        await categoryService.createCategory(payload);
        toast.success("Category created successfully.");
      }

      navigate("/admin/categories");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        `Failed to ${isEdit ? "update" : "create"} category.`;

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl space-y-6 rounded-xl border border-gray-200 bg-white p-6"
    >
      <Input
        label="Category Name"
        required
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Example: Electronics"
      />

      <div>
        <Input
          label="Slug"
          name="slug"
          value={form.slug}
          onChange={handleChange}
          placeholder="electronics"
        />

        <p className="mt-1 text-xs text-gray-500">
          Leave empty if your backend generates the slug automatically.
        </p>
      </div>

      <SelectInput
        label="Parent Category"
        name="parentId"
        value={form.parentId}
        onChange={handleChange}
        disabled={categoriesLoading}
        placeholder={
          categoriesLoading
            ? "Loading categories..."
            : "No parent category"
        }
        options={categories
          .filter(
            (item) => String(item.id) !== String(category?.id)
          )
          .map((item) => ({
            value: item.id,
            label: item.name,
          }))}
      />

      <TextArea
        label="Description"
        name="description"
        value={form.description}
        onChange={handleChange}
        rows={4}
        placeholder="Describe this category..."
      />

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
        <Button
          type="button"
          variant="secondary"
          disabled={loading}
          onClick={() => navigate("/admin/categories")}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="dark"
          loading={loading}
          loadingText="Saving..."
          disabled={categoriesLoading}
        >
          {isEdit ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>
  );
}

export default CategoryForm;
