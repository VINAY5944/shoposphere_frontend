
import { useEffect, useRef, useState } from "react";
import Button from "../ui/Button";

function FileUploader({
  file,
  onFileChange,
  existingImageUrl = "",
  existingImageRemoved = false,
  onExistingImageRemove,
  label = "Upload Image",
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMB = 5,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  // Generate a preview for the selected file.
  useEffect(() => {
    if (!file) {
      setPreviewUrl(existingImageRemoved ? "" : existingImageUrl);
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    setPreviewUrl(objectUrl);

    // Clean up the temporary URL when the file changes.
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file, existingImageUrl, existingImageRemoved]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const allowedTypes = accept.split(",");

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only JPEG, PNG and WebP images are allowed.");
      event.target.value = "";
      return;
    }

    const maxSizeInBytes = maxSizeMB * 1024 * 1024;

    if (selectedFile.size > maxSizeInBytes) {
      setError(`Image size must not exceed ${maxSizeMB} MB.`);
      event.target.value = "";
      return;
    }

    setError("");
    onFileChange(selectedFile);
  };

  const handleRemove = () => {
    if (file) {
      onFileChange(null);
    } else if (existingImageUrl && !existingImageRemoved) {
      onExistingImageRemove?.();
    }

    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="rounded-xl border-2 border-dashed border-gray-300 p-4">
        {previewUrl ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <img
                src={previewUrl}
                alt="Image preview"
                className="h-48 w-full rounded-lg object-contain"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-sm text-gray-500">
                {file ? file.name : "Current image"}
              </span>

              <Button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                variant="custom"
                className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-3xl">📁</p>

            <p className="mt-3 text-sm font-medium text-gray-700">
              Choose an image to upload
            </p>

            <p className="mt-1 text-xs text-gray-500">
              JPEG, PNG or WebP · Maximum {maxSizeMB} MB
            </p>
          </div>
        )}

        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            variant="dark"
            className="px-4 py-2"
          >
            {previewUrl ? "Change Image" : "Select Image"}
          </Button>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default FileUploader;

