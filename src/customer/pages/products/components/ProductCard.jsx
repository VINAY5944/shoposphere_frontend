
import { useNavigate } from "react-router-dom";
import Badge from "../../../../shared/components/ui/Badge";
import Button from "../../../../shared/components/ui/Button";
import getAssetUrl from "../../../../shared/utils/getAssetUrl";

function ProductCard({ product }) {
  const navigate = useNavigate();

  const price = Number(product.price);
  const compareAtPrice = Number(product.compareAtPrice);

  const hasDiscount =
    compareAtPrice > price && compareAtPrice > 0;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((compareAtPrice - price) / compareAtPrice) * 100
      )
    : 0;

  const imageUrl = getAssetUrl(product.imageUrl);

  const handleViewDetails = () => {
    navigate(`/customer/products/${product.id}`);
  };

  return (
    <article
      onClick={handleViewDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleViewDetails();
        }
      }}
      role="link"
      tabIndex={0}
      className="cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative flex h-56 items-center justify-center bg-gray-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-contain p-4"
          />
        ) : (
          <span className="text-5xl" role="img" aria-label="Product">
            📦
          </span>
        )}

        {hasDiscount && (
          <div className="absolute left-3 top-3">
            <Badge variant="danger">
              {discountPercentage}% OFF
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
          {product.category?.name || "Uncategorized"}
        </p>

        <h3 className="mt-2 min-h-12 text-lg font-semibold text-gray-800">
          {product.name}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-10 text-sm text-gray-500">
          {product.description || "No description available"}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xl font-bold text-gray-900">
            ₹{price.toLocaleString("en-IN")}
          </span>

          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              ₹{compareAtPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        <Button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleViewDetails();
          }}
          className="mt-4 w-full"
        >
          View Details
        </Button>
      </div>
    </article>
  );
}

export default ProductCard;
