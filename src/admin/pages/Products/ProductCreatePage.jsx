
import ProductForm from "./components/ProductForm";

function ProductCreatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Create Product
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Add a new product to your store.
        </p>
      </div>

      <ProductForm mode="create" />
    </div>
  );
}

export default ProductCreatePage;
