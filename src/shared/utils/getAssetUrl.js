const ASSET_BASE_URL = import.meta.env.VITE_ASSET_BASE_URL;

function getAssetUrl(path) {
  if (typeof path !== "string" || !path.trim()) {
    return null;
  }

  const assetPath = path.trim();
  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath;
  }

  return `${ASSET_BASE_URL.replace(/\/+$/, "")}/${assetPath.replace(/^\/+/, "")}`;
}

export default getAssetUrl;
