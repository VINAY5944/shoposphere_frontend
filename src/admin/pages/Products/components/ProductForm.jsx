
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import FileUploader from "../../../../shared/components/common/FileUploader";
import productService from "../services/productService";
import categoryService from "../../../../shared/services/categoryService";
import Input from "../../../../shared/components/ui/Input";
import SelectInput from "../../../../shared/components/ui/SelectInput";
import TextArea from "../../../../shared/components/ui/TextArea";
import Button from "../../../../shared/components/ui/Button";

const initialValues = {
  name: "",
  slug: "",
  sku: "",
  categoryId: "",
  description: "",
  price: "",
  compareAtPrice: "",
};

function ProductForm({ mode = "create", product = null }) {
  const navigate = useNavigate();

  const isEdit = mode === "edit";

  const [form, setForm] = useState(() => {
    if (!product || !isEdit) return initialValues;

    return {
      name: product.name || "",
      slug: product.slug || "",
      sku: product.sku || "",
      categoryId: String(product.categoryId || ""),
      description: product.description || "",
      price: product.price || "",
      compareAtPrice: product.compareAtPrice || "",
    };
  });
  const [image, setImage] = useState(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
      } catch (error) {
        if (controller.signal.aborted) return;
        toast.error("Failed to load categories.");
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

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Product name is required.";
    }

    if (!form.sku.trim()) {
      newErrors.sku = "SKU is required.";
    }

    if (!form.categoryId) {
      newErrors.categoryId = "Please select a category.";
    }

    if (form.price === "" || Number(form.price) <= 0) {
      newErrors.price = "Enter a valid price greater than zero.";
    }

    if (
      form.compareAtPrice !== "" &&
      Number(form.compareAtPrice) <= Number(form.price)
    ) {
      newErrors.compareAtPrice =
        "Compare-at price must be higher than the selling price.";
    }

    if (
      form.price !== "" &&
      !/^\d+(\.\d{1,2})?$/.test(form.price)
    ) {
      newErrors.price = "Price can have a maximum of 2 decimal places.";
    }

    if (
      form.compareAtPrice !== "" &&
      !/^\d+(\.\d{1,2})?$/.test(form.compareAtPrice)
    ) {
      newErrors.compareAtPrice =
        "Compare-at price can have a maximum of 2 decimal places.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", form.name.trim());
      formData.append("sku", form.sku.trim());
      formData.append("categoryId", form.categoryId);
      formData.append("price", form.price);

      if (form.slug.trim()) {
        formData.append("slug", form.slug.trim());
      }

      if (form.description.trim()) {
        formData.append("description", form.description.trim());
      }

      if (form.compareAtPrice !== "") {
        formData.append("compareAtPrice", form.compareAtPrice);
      }

      if (image) {
        formData.append("image", image);
      } else if (isEdit && removeExistingImage) {
        formData.append("removeImage", "true");
      }

      if (isEdit) {
        await productService.updateProduct(product.id, formData);
        toast.success("Product updated successfully.");
      } else {
        await productService.createProduct(formData);
        toast.success("Product created successfully.");
      }

      navigate("/admin/products");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} product.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Product information */}
        <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Product Information
          </h2>

          <Input
            label="Product Name *"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter product name"
            error={errors.name}
          />

          <Input
            label="SKU *"
            name="sku"
            value={form.sku}
            onChange={handleChange}
            placeholder="Example: SHIRT-001"
            error={errors.sku}
          />

          <Input
            label="Slug"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="cotton-shirt"
          />

          <SelectInput
            label="Category *"
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            placeholder="Select category"
            options={categories.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
            error={errors.categoryId}
          />

          <TextArea
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            placeholder="Describe your product..."
          />
        </div>

        {/* Pricing and image */}
        <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Pricing
          </h2>

          <Input
            label="Selling Price (INR) *"
            type="number"
            name="price"
            min="0.01"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            placeholder="1499.00"
            error={errors.price}
          />

          <div>
            <Input
              label="Compare-at Price (INR)"
              type="number"
              name="compareAtPrice"
              min="0.01"
              step="0.01"
              value={form.compareAtPrice}
              onChange={handleChange}
              placeholder="1799.00"
              error={errors.compareAtPrice}
            />
            <p className="mt-1 text-xs text-gray-500">
              Must be higher than the selling price.
            </p>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <FileUploader
              file={image}
              onFileChange={setImage}
              existingImageUrl={product?.imageUrl || ""}
              existingImageRemoved={removeExistingImage}
              onExistingImageRemove={() => setRemoveExistingImage(true)}
              label="Product Image"
              maxSizeMB={5}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          disabled={loading}
          onClick={() => navigate("/admin/products")}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="dark"
          loading={loading}
          loadingText="Saving..."
        >
          {isEdit ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}

export default ProductForm;
