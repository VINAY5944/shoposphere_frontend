import CategoryForm from "./components/CategoryForm";

function CategoryCreatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Create Category
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Add a new category to your store.
        </p>
      </div>

      <CategoryForm mode="create" />
    </div>
  );
}

export default CategoryCreatePage;